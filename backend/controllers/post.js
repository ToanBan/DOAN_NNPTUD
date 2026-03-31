const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Post = require("../schemas/post");
const PostFile = require("../schemas/post_file");

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
    fileSize: 10 * 1024 * 1024,
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

const mapPostToResponse = (postDoc, fileMap, currentUserId) => {
  const post = postDoc.toObject ? postDoc.toObject() : postDoc;
  const user = post.user || {};
  const postFile = fileMap.get(String(post._id));
  const shared = post.sharedPost || null;
  const sharedUser = shared?.user || {};
  const sharedFile = shared?._id ? fileMap.get(String(shared._id)) : null;

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
    likedByCurrentUser: false,
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

const createPost = async (req, res, next) => {
  try {
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
    const privacy = typeof req.body.privacy === "string" ? req.body.privacy : "public";

    if (!content && !req.file) {
      return res.status(400).json({ message: "Post content or file is required" });
    }

    const newPost = await Post.create({
      user: req.user._id,
      content,
      privacy,
      fileCount: req.file ? 1 : 0,
      sharedPost: null,
    });

    let postFile = null;
    if (req.file) {
      postFile = await PostFile.create({
        post: newPost._id,
        fileUrl: `uploads/posts/${req.file.filename}`,
        fileType: getFileType(req.file.mimetype),
        fileName: req.file.originalname,
        fileSize: req.file.size,
      });
    }

    const populatedPost = await Post.findById(newPost._id)
      .populate("user", "username avatarUrl")
      .populate({
        path: "sharedPost",
        populate: {
          path: "user",
          select: "username avatarUrl",
        },
      })
      .lean();

    const fileMap = new Map();
    if (postFile) {
      fileMap.set(String(newPost._id), postFile);
    }

    return res.status(201).json({
      message: "Create post success",
      post: mapPostToResponse(populatedPost, fileMap, req.user._id),
    });
  } catch (error) {
    next(error);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({
      isDeleted: false,
      privacy: "public",
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

    return res.json({
      message: "Get posts success",
      posts: posts.map((post) => mapPostToResponse(post, postFileMap, req.user._id)),
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

    return res.json({
      message: "Get my posts success",
      posts: posts.map((post) => mapPostToResponse(post, postFileMap, req.user._id)),
    });
  } catch (error) {
    next(error);
  }
};

const sharePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const rawCaption =
      typeof req.body.caption === "string" ? req.body.caption : req.body.content;
    const shareContent =
      typeof rawCaption === "string" && rawCaption.trim() ? rawCaption.trim() : "";

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

    return res.status(201).json({
      message: "Share post success",
      post: mapPostToResponse(populatedSharedPost, postFileMap, req.user._id),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadPostFile,
  createPost,
  getPosts,
  getMyPosts,
  sharePost,
};
