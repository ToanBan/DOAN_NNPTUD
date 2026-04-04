const fs = require("fs");
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
const Post = require("../schemas/post");
const PostFile = require("../schemas/post_file");
const Comment = require("../schemas/comment");
const Like = require("../schemas/like");
const Notification = require("../schemas/notification");
const Follow = require("../schemas/follow");
const socketUtil = require("../utils/socket");

const uploadDir = path.join(__dirname, "../public/uploads/posts");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const uploadPostFile = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

const getFileType = (mimetype = "") => {
  if (mimetype.startsWith("image/")) {
    return "image";
  }

  if (mimetype.startsWith("video/")) {
    return "video";
  }

  return "file";
};

const mapCommentToResponse = (commentDoc, currentUserId) => {
  const comment = commentDoc.toObject ? commentDoc.toObject() : commentDoc;
  const user = comment.user || {};

  return {
    commentId: comment._id,
    content: comment.content,
    userId: user._id || null,
    username: user.username || "Unknown",
    avatar: user.avatarUrl || "",
    parentComment: comment.parentComment || null,
    isOwner: String(user._id || "") === String(currentUserId || ""),
    createdAt: comment.createdAt,
  };
};

const emitCommentToPostRoom = (postId, comment) => {
  try {
    const io = socketUtil.getIO();
    io.to(`post:${String(postId)}`).emit("post_comment_created", {
      postId: String(postId),
      comment,
    });
  } catch (_error) {
    // Keep the main request successful even if websocket delivery fails.
  }
};

const getEngagementData = async (posts, currentUserId) => {
  const postIds = posts.map((post) => post._id);

  if (!postIds.length) {
    return {
      likedPostIds: new Set(),
      commentsByPostId: new Map(),
    };
  }

  const [likes, comments] = await Promise.all([
    Like.find({ post: { $in: postIds } }).lean(),
    Comment.find({
      post: { $in: postIds },
      isDeleted: false,
    })
      .populate("user", "username avatarUrl")
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  const likedPostIds = new Set(
    likes
      .filter((like) => String(like.user) === String(currentUserId))
      .map((like) => String(like.post)),
  );

  const commentsByPostId = new Map();
  comments.forEach((comment) => {
    const key = String(comment.post);
    const mappedComment = mapCommentToResponse(comment, currentUserId);
    const existingComments = commentsByPostId.get(key) || [];
    existingComments.push(mappedComment);
    commentsByPostId.set(key, existingComments);
  });

  return {
    likedPostIds,
    commentsByPostId,
  };
};

const mapPostToResponse = (
  postDoc,
  fileMap,
  currentUserId,
  likedPostIds = new Set(),
  commentsByPostId = new Map(),
) => {
  const post = postDoc.toObject ? postDoc.toObject() : postDoc;
  const user = post.user || {};
  const postFile = fileMap.get(String(post._id));
  const shared = post.sharedPost || null;
  const sharedUser = shared?.user || {};
  const sharedFile = shared?._id ? fileMap.get(String(shared._id)) : null;
  const comments = commentsByPostId.get(String(post._id)) || [];

  return {
    postId: post._id,
    content: post.content,
    privacy: post.privacy,
    username: user.username || "Unknown",
    avatar: user.avatarUrl || "",
    userId: user._id || null,
    fileUrl: postFile?.fileUrl || "",
    fileType: postFile?.fileType || null,
    likeCount: post.likeCount || 0,
    commentCount: post.commentCount || 0,
    shareCount: post.shareCount || 0,
    isShared: Boolean(shared),
    isOwner: String(user._id || "") === String(currentUserId || ""),
    comments,
    sharedPost: shared
      ? {
          postId: shared._id,
          content: shared.content,
          username: sharedUser.username || "Unknown",
          avatar: sharedUser.avatarUrl || "",
          userId: sharedUser._id || null,
          fileUrl: sharedFile?.fileUrl || "",
          fileType: sharedFile?.fileType || null,
          createdAt: shared.createdAt,
        }
      : null,
    likedByCurrentUser: likedPostIds.has(String(post._id)),
    createdAt: post.createdAt,
  };
};

const getPostFileMap = async (posts) => {
  const postIds = [];

  posts.forEach((post) => {
    postIds.push(post._id);
    if (post.sharedPost && post.sharedPost._id) {
      postIds.push(post.sharedPost._id);
    }
  });

  if (!postIds.length) {
    return new Map();
  }

  const postFiles = await PostFile.find({
    post: { $in: postIds },
    isDeleted: false,
  })
    .sort({ createdAt: 1 })
    .lean();

  return new Map(postFiles.map((file) => [String(file.post), file]));
};

const ALLOWED_PRIVACY = new Set(["public", "private", "friends"]);

const getFriendIds = async (userId) => {
  const following = await Follow.find({ follower: userId })
    .select("following")
    .lean();
  const followingIds = following.map((item) => item.following);

  if (!followingIds.length) {
    return [];
  }

  const mutualFollows = await Follow.find({
    follower: { $in: followingIds },
    following: userId,
  })
    .select("follower")
    .lean();

  return mutualFollows.map((item) => item.follower);
};

const canViewPost = (post, currentUserId, friendIdsSet = new Set()) => {
  const ownerId = String(post.user?._id || post.user || "");
  const requesterId = String(currentUserId || "");

  if (ownerId === requesterId) {
    return true;
  }

  if (post.privacy === "public") {
    return true;
  }

  if (post.privacy === "friends") {
    return friendIdsSet.has(ownerId);
  }

  return false;
};

const createPost = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const content =
      typeof req.body.content === "string" ? req.body.content.trim() : "";

    const privacy =
      typeof req.body.privacy === "string" ? req.body.privacy : "public";

    const forum = typeof req.body.forum === "string" ? req.body.forum : null;

    if (!ALLOWED_PRIVACY.has(privacy)) {
      return res.status(400).json({ message: "Invalid privacy" });
    }

    const files = req.files || (req.file ? [req.file] : []);

    if (!content && files.length === 0) {
      return res.status(400).json({
        message: "Post content or file is required",
      });
    }

    const [newPost] = await Post.create(
      [
        {
          user: req.user._id,
          content,
          privacy,
          fileCount: files.length,
          sharedPost: null,
          forum: forum || null,
        },
      ],
      { session },
    );

    let postFiles = [];

    if (files.length > 0) {
      const fileDocs = files.map((file) => ({
        post: newPost._id,
        fileUrl: `uploads/posts/${file.filename}`,
        fileType: getFileType(file.mimetype),
        fileName: file.originalname,
        fileSize: file.size,
      }));

      postFiles = await PostFile.insertMany(fileDocs, { session });
    }

    await session.commitTransaction();
    session.endSession();

    const populatedPost = await Post.findById(newPost._id)
      .populate("user", "username avatarUrl")
      .lean();

    const fileMap = new Map();
    if (postFiles.length > 0) {
      fileMap.set(String(newPost._id), postFiles[0]);
    }

    const engagementData = await getEngagementData(
      [populatedPost],
      req.user._id,
    );

    return res.status(201).json({
      message: "Create post success",
      post: mapPostToResponse(
        populatedPost,
        fileMap,
        req.user._id,
        engagementData.likedPostIds,
        engagementData.commentsByPostId,
      ),
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const files = req.files || (req.file ? [req.file] : []);
    files.forEach((file) => {
      if (file?.path) {
        fs.unlink(file.path, () => {});
      }
    });

    next(error);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const friendIds = await getFriendIds(req.user._id);
    const posts = await Post.find({
      isDeleted: false,
      isHidden: false,
      forum: null,
      $or: [
        { privacy: "public" },
        { user: req.user._id },
        { privacy: "friends", user: { $in: friendIds } },
      ],
    })
      .populate("user", "username avatarUrl")
      .populate({
        path: "sharedPost",
        match: { isDeleted: false, isHidden: false },
        populate: {
          path: "user",
          select: "username avatarUrl",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    const postFileMap = await getPostFileMap(posts);
    const engagementData = await getEngagementData(posts, req.user._id);

    return res.json({
      message: "Get posts success",
      posts: posts.map((post) =>
        mapPostToResponse(
          post,
          postFileMap,
          req.user._id,
          engagementData.likedPostIds,
          engagementData.commentsByPostId,
        ),
      ),
    });
  } catch (error) {
    next(error);
  }
};

const getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({
      isDeleted: false,
      user: req.user._id,
    })
      .populate("user", "username avatarUrl")
      .populate({
        path: "sharedPost",
        match: { isDeleted: false },
        populate: {
          path: "user",
          select: "username avatarUrl",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    const postFileMap = await getPostFileMap(posts);
    const engagementData = await getEngagementData(posts, req.user._id);

    return res.json({
      message: "Get my posts success",
      posts: posts.map((post) =>
        mapPostToResponse(
          post,
          postFileMap,
          req.user._id,
          engagementData.likedPostIds,
          engagementData.commentsByPostId,
        ),
      ),
    });
  } catch (error) {
    next(error);
  }
};

const sharePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const rawCaption =
      typeof req.body.caption === "string"
        ? req.body.caption
        : req.body.content;
    const shareContent =
      typeof rawCaption === "string" && rawCaption.trim()
        ? rawCaption.trim()
        : "";

    const sourcePost = await Post.findOne({
      _id: postId,
      isDeleted: false,
    }).populate("user", "username avatarUrl");

    if (!sourcePost) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isOwner = String(sourcePost.user?._id) === String(req.user._id);
    if (sourcePost.privacy !== "public" && !isOwner) {
      return res.status(403).json({ message: "You cannot share this post" });
    }

    const sharedPost = await Post.create({
      user: req.user._id,
      content: shareContent,
      privacy: "public",
      sharedPost: sourcePost._id,
      fileCount: 0,
    });

    sourcePost.shareCount = (sourcePost.shareCount || 0) + 1;
    await sourcePost.save();

    const populatedSharedPost = await Post.findById(sharedPost._id)
      .populate("user", "username avatarUrl")
      .populate({
        path: "sharedPost",
        populate: {
          path: "user",
          select: "username avatarUrl",
        },
      })
      .lean();

    const postFileMap = await getPostFileMap([populatedSharedPost]);
    const engagementData = await getEngagementData(
      [populatedSharedPost],
      req.user._id,
    );

    return res.status(201).json({
      message: "Share post success",
      post: mapPostToResponse(
        populatedSharedPost,
        postFileMap,
        req.user._id,
        engagementData.likedPostIds,
        engagementData.commentsByPostId,
      ),
    });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const content =
      typeof req.body.content === "string" ? req.body.content.trim() : "";
    const privacy =
      typeof req.body.privacy === "string" ? req.body.privacy : undefined;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await Post.findOne({
      _id: postId,
      isDeleted: false,
      user: req.user._id,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!content && post.fileCount <= 0) {
      return res.status(400).json({ message: "Post content is required" });
    }

    if (privacy && !ALLOWED_PRIVACY.has(privacy)) {
      return res.status(400).json({ message: "Invalid privacy" });
    }

    post.content = content;
    if (privacy) {
      post.privacy = privacy;
    }

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("user", "username avatarUrl")
      .populate({
        path: "sharedPost",
        populate: {
          path: "user",
          select: "username avatarUrl",
        },
      })
      .lean();

    const postFileMap = await getPostFileMap([populatedPost]);
    const engagementData = await getEngagementData(
      [populatedPost],
      req.user._id,
    );

    return res.json({
      message: "Update post success",
      post: mapPostToResponse(
        populatedPost,
        postFileMap,
        req.user._id,
        engagementData.likedPostIds,
        engagementData.commentsByPostId,
      ),
    });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await Post.findOne({
      _id: postId,
      isDeleted: false,
      user: req.user._id,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.isDeleted = true;
    await post.save();

    await Promise.all([
      PostFile.updateMany(
        { post: post._id, isDeleted: false },
        { $set: { isDeleted: true } },
      ),
      Comment.updateMany(
        { post: post._id, isDeleted: false },
        { $set: { isDeleted: true } },
      ),
      Like.deleteMany({ post: post._id }),
      Notification.deleteMany({ post: post._id }),
    ]);

    return res.json({
      message: "Delete post success",
      postId: String(post._id),
    });
  } catch (error) {
    next(error);
  }
};

const emitNotification = async (
  notification,
  actor,
  receiverId,
  post = null,
) => {
  if (!notification || !receiverId) {
    return;
  }

  try {
    const io = socketUtil.getIO();
    io.to(String(receiverId)).emit("new_notification", {
      _id: notification._id,
      type: notification.type,
      post: post
        ? {
            _id: post._id,
            content: post.content || "",
          }
        : notification.post || null,
      sender: {
        _id: actor._id,
        username: actor.username,
        avatarUrl: actor.avatarUrl,
      },
      createdAt: notification.createdAt,
      isRead: notification.isRead,
    });
  } catch (_error) {
    // Keep the main request successful even if websocket delivery fails.
  }
};

const toggleLikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await Post.findOne({ _id: postId, isDeleted: false }).populate(
      "user",
      "username avatarUrl",
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const friendIds = await getFriendIds(req.user._id);
    if (
      !canViewPost(
        post,
        req.user._id,
        new Set(friendIds.map((id) => String(id))),
      )
    ) {
      return res.status(403).json({ message: "You cannot access this post" });
    }

    const existingLike = await Like.findOne({
      post: postId,
      user: req.user._id,
    });

    let likedByCurrentUser = false;

    if (existingLike) {
      await existingLike.deleteOne();
      post.likeCount = Math.max((post.likeCount || 0) - 1, 0);
    } else {
      await Like.create({
        post: postId,
        user: req.user._id,
      });
      post.likeCount = (post.likeCount || 0) + 1;
      likedByCurrentUser = true;

      if (String(post.user?._id) !== String(req.user._id)) {
        const notification = await Notification.create({
          sender: req.user._id,
          receiver: post.user._id,
          type: "like",
          post: post._id,
          isRead: false,
        });

        await emitNotification(notification, req.user, post.user._id, post);
      }
    }

    await post.save();

    return res.json({
      message: likedByCurrentUser ? "Like post success" : "Unlike post success",
      likeCount: post.likeCount || 0,
      likedByCurrentUser,
    });
  } catch (error) {
    next(error);
  }
};

const getPostComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await Post.findOne({ _id: postId, isDeleted: false });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const friendIds = await getFriendIds(req.user._id);
    if (
      !canViewPost(
        post,
        req.user._id,
        new Set(friendIds.map((id) => String(id))),
      )
    ) {
      return res.status(403).json({ message: "You cannot access this post" });
    }

    const comments = await Comment.find({
      post: postId,
      isDeleted: false,
    })
      .populate("user", "username avatarUrl")
      .sort({ createdAt: 1 })
      .lean();

    return res.json({
      message: "Get comments success",
      comments: comments.map((comment) =>
        mapCommentToResponse(comment, req.user._id),
      ),
    });
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const content =
      typeof req.body.content === "string" ? req.body.content.trim() : "";
    const parentComment =
      typeof req.body.parentComment === "string" &&
      req.body.parentComment.trim()
        ? req.body.parentComment.trim()
        : null;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await Post.findOne({ _id: postId, isDeleted: false }).populate(
      "user",
      "username avatarUrl",
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const friendIds = await getFriendIds(req.user._id);
    if (
      !canViewPost(
        post,
        req.user._id,
        new Set(friendIds.map((id) => String(id))),
      )
    ) {
      return res.status(403).json({ message: "You cannot access this post" });
    }

    if (parentComment) {
      if (!mongoose.Types.ObjectId.isValid(parentComment)) {
        return res.status(400).json({ message: "Invalid parent comment id" });
      }

      const existingParentComment = await Comment.findOne({
        _id: parentComment,
        post: postId,
        isDeleted: false,
      });

      if (!existingParentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
    }

    const newComment = await Comment.create({
      post: postId,
      user: req.user._id,
      content,
      parentComment,
    });

    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    const populatedComment = await Comment.findById(newComment._id)
      .populate("user", "username avatarUrl")
      .lean();

    const mappedComment = mapCommentToResponse(populatedComment, req.user._id);

    if (String(post.user?._id) !== String(req.user._id)) {
      const notification = await Notification.create({
        sender: req.user._id,
        receiver: post.user._id,
        type: "comment",
        post: post._id,
        isRead: false,
      });

      await emitNotification(notification, req.user, post.user._id, post);
    }

    emitCommentToPostRoom(post._id, mappedComment);

    return res.status(201).json({
      message: "Create comment success",
      comment: mappedComment,
      commentCount: post.commentCount || 0,
    });
  } catch (error) {
    next(error);
  }
};

const hidePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;

    if (!postId || !reason) {
      return res.status(400).json({
        message: "postId and reason are required",
      });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        isHidden: true,
        hiddenReason: reason,
        hiddenBy: req.user._id,
      },
      { new: true },
    )
      .populate("user", "username email")
      .populate("hiddenBy", "username");

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json({
      message: "Post hidden successfully",
      post,
    });
  } catch (error) {
    next(error);
  }
};

const adminDeletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;

    if (!postId || !reason) {
      return res.status(400).json({
        message: "postId and reason are required",
      });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        isDeleted: true,
        hiddenReason: reason,
        hiddenBy: req.user._id,
      },
      { new: true },
    )
      .populate("user", "username email")
      .populate("hiddenBy", "username");

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json({
      message: "Post deleted successfully",
      post,
    });
  } catch (error) {
    next(error);
  }
};

const restorePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({
        message: "postId is required",
      });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        isDeleted: false,
        isHidden: false,
        hiddenReason: null,
        hiddenBy: null,
      },
      { new: true },
    ).populate("user", "username email");

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json({
      message: "Post restored successfully",
      post,
    });
  } catch (error) {
    next(error);
  }
};

// Get hidden/deleted posts (admin only)
const getHiddenPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      $or: [{ isHidden: true }, { isDeleted: true }],
    })
      .populate("user", "username avatarUrl email")
      .populate("hiddenBy", "username")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Post.countDocuments({
      $or: [{ isHidden: true }, { isDeleted: true }],
    });

    const postFileMap = await getPostFileMap(posts);

    return res.status(200).json({
      posts: posts.map((post) =>
        mapPostToResponse(post, postFileMap, req.user._id),
      ),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getForumPosts = async (req, res, next) => {
  try {
    const { forumId } = req.params;

    const forum = await Forum.findOne({
      _id: forumId,
      isDeleted: false,
    });

    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    const posts = await Post.find({
      forum: forumId,
      isDeleted: false,
      isHidden: false,
    })
      .populate("user", "username avatarUrl")
      .sort({ createdAt: -1 })
      .lean();

    const postFileMap = await getPostFileMap(posts);
    const engagementData = await getEngagementData(posts, req.user._id);

    return res.json({
      message: "Get forum posts success",
      posts: posts.map((post) =>
        mapPostToResponse(
          post,
          postFileMap,
          req.user._id,
          engagementData.likedPostIds,
          engagementData.commentsByPostId,
        ),
      ),
    });
  } catch (error) {
    next(error);
  }
};



module.exports = {
  uploadPostFile,
  createPost,
  updatePost,
  deletePost,
  getPosts,
  getMyPosts,
  sharePost,
  hidePost,
  adminDeletePost,
  restorePost,
  getHiddenPosts,
  toggleLikePost,
  getPostComments,
  createComment,
  getForumPosts,
};
