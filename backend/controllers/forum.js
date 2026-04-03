const Forum = require("../schemas/forum");
const ForumMember = require("../schemas/forum_member");
const ForumPost = require("../schemas/forum_post");
const createUploader = require("../middleware/upload");

const uploadForumPostFiles = createUploader("forum_posts");


const getForums = async (req, res, next) => {
  try {
    const forums = await Forum.find({ isDeleted: false })
      .populate("createdBy", "username avatarUrl")
      .sort({ createdAt: -1 })
      .lean();

    const forumIds = forums.map((f) => f._id);
    const memberCounts = await ForumMember.aggregate([
      { $match: { forum: { $in: forumIds }, status: "active" } },
      { $group: { _id: "$forum", count: { $sum: 1 } } },
    ]);
    const memberCountMap = new Map(memberCounts.map((m) => [String(m._id), m.count]));

    const result = forums.map((forum) => ({
      forumId: forum._id,
      name: forum.name,
      description: forum.description,
      createdBy: {
        userId: forum.createdBy?._id,
        username: forum.createdBy?.username || "Unknown",
        avatar: forum.createdBy?.avatarUrl || "",
      },
      memberCount: memberCountMap.get(String(forum._id)) || 0,
      createdAt: forum.createdAt,
    }));

    return res.json({ message: "Get forums success", forums: result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/forums/:forumId
 * Lấy chi tiết một forum
 */
const getForumById = async (req, res, next) => {
  try {
    const { forumId } = req.params;

    const forum = await Forum.findOne({ _id: forumId, isDeleted: false })
      .populate("createdBy", "username avatarUrl")
      .lean();

    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    const memberCount = await ForumMember.countDocuments({ forum: forumId, status: "active" });

    // Kiểm tra người dùng hiện tại có là thành viên không
    const membership = await ForumMember.findOne({ user: req.user._id, forum: forumId }).lean();

    return res.json({
      message: "Get forum success",
      forum: {
        forumId: forum._id,
        name: forum.name,
        description: forum.description,
        createdBy: {
          userId: forum.createdBy?._id,
          username: forum.createdBy?.username || "Unknown",
          avatar: forum.createdBy?.avatarUrl || "",
        },
        memberCount,
        membership: membership
          ? { status: membership.status, joinedAt: membership.joinedAt }
          : null,
        isOwner: String(forum.createdBy?._id) === String(req.user._id),
        createdAt: forum.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/forums
 * Tạo forum mới (người tạo tự động trở thành thành viên active)
 */
const createForum = async (req, res, next) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const description =
      typeof req.body.description === "string" ? req.body.description.trim() : "";

    if (!name) {
      return res.status(400).json({ message: "Forum name is required" });
    }

    const newForum = await Forum.create({
      name,
      description,
      createdBy: req.user._id,
    });

    // Người tạo tự động trở thành thành viên
    await ForumMember.create({
      user: req.user._id,
      forum: newForum._id,
      status: "active",
    });

    const populated = await Forum.findById(newForum._id)
      .populate("createdBy", "username avatarUrl")
      .lean();

    return res.status(201).json({
      message: "Create forum success",
      forum: {
        forumId: populated._id,
        name: populated.name,
        description: populated.description,
        createdBy: {
          userId: populated.createdBy?._id,
          username: populated.createdBy?.username || "Unknown",
          avatar: populated.createdBy?.avatarUrl || "",
        },
        memberCount: 1,
        createdAt: populated.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/forums/:forumId
 * Cập nhật forum (chỉ người tạo mới được sửa)
 */
const updateForum = async (req, res, next) => {
  try {
    const { forumId } = req.params;

    const forum = await Forum.findOne({ _id: forumId, isDeleted: false });
    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    if (String(forum.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the forum owner can update this forum" });
    }

    const name =
      typeof req.body.name === "string" && req.body.name.trim()
        ? req.body.name.trim()
        : forum.name;
    const description =
      typeof req.body.description === "string"
        ? req.body.description.trim()
        : forum.description;

    forum.name = name;
    forum.description = description;
    await forum.save();

    return res.json({
      message: "Update forum success",
      forum: {
        forumId: forum._id,
        name: forum.name,
        description: forum.description,
        updatedAt: forum.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/forums/:forumId
 * Xóa mềm forum (chỉ người tạo mới được xóa)
 */
const deleteForum = async (req, res, next) => {
  try {
    const { forumId } = req.params;

    const forum = await Forum.findOne({ _id: forumId, isDeleted: false });
    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    if (String(forum.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the forum owner can delete this forum" });
    }

    forum.isDeleted = true;
    await forum.save();

    return res.json({ message: "Delete forum success" });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
//  FORUM MEMBER – CRUD
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/forums/:forumId/members
 * Lấy danh sách thành viên của forum
 */
const getForumMembers = async (req, res, next) => {
  try {
    const { forumId } = req.params;
    const { status = "active" } = req.query;

    const forum = await Forum.findOne({ _id: forumId, isDeleted: false }).lean();
    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    const members = await ForumMember.find({ forum: forumId, status })
      .populate("user", "username avatarUrl email")
      .sort({ joinedAt: 1 })
      .lean();

    return res.json({
      message: "Get forum members success",
      members: members.map((m) => ({
        memberId: m._id,
        userId: m.user?._id,
        username: m.user?.username || "Unknown",
        avatar: m.user?.avatarUrl || "",
        email: m.user?.email || "",
        status: m.status,
        joinedAt: m.joinedAt,
        isOwner: String(m.user?._id) === String(forum.createdBy),
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/forums/:forumId/join
 * Tham gia forum
 */
const joinForum = async (req, res, next) => {
  try {
    const { forumId } = req.params;

    const forum = await Forum.findOne({ _id: forumId, isDeleted: false });
    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    const existing = await ForumMember.findOne({ user: req.user._id, forum: forumId });
    if (existing) {
      if (existing.status === "banned") {
        return res.status(403).json({ message: "You are banned from this forum" });
      }
      return res.status(400).json({ message: "You are already a member of this forum" });
    }

    const member = await ForumMember.create({
      user: req.user._id,
      forum: forumId,
      status: "active",
    });

    return res.status(201).json({
      message: "Joined forum successfully",
      membership: { status: member.status, joinedAt: member.joinedAt },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/forums/:forumId/leave
 * Rời khỏi forum (chủ forum không thể rời)
 */
const leaveForum = async (req, res, next) => {
  try {
    const { forumId } = req.params;

    const forum = await Forum.findOne({ _id: forumId, isDeleted: false });
    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    if (String(forum.createdBy) === String(req.user._id)) {
      return res.status(400).json({ message: "Forum owner cannot leave the forum" });
    }

    const member = await ForumMember.findOneAndDelete({
      user: req.user._id,
      forum: forumId,
    });

    if (!member) {
      return res.status(404).json({ message: "You are not a member of this forum" });
    }

    return res.json({ message: "Left forum successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/forums/:forumId/members/:userId/status
 * Cập nhật trạng thái thành viên – active / banned / pending
 * (Chỉ chủ forum mới được dùng)
 */
const updateMemberStatus = async (req, res, next) => {
  try {
    const { forumId, userId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["active", "banned", "pending"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const forum = await Forum.findOne({ _id: forumId, isDeleted: false });
    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    if (String(forum.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the forum owner can update member status" });
    }

    const member = await ForumMember.findOneAndUpdate(
      { user: userId, forum: forumId },
      { status },
      { new: true }
    ).populate("user", "username avatarUrl");

    if (!member) {
      return res.status(404).json({ message: "Member not found in this forum" });
    }

    return res.json({
      message: "Update member status success",
      member: {
        userId: member.user?._id,
        username: member.user?.username || "Unknown",
        status: member.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
//  FORUM POST – CRUD
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/forums/:forumId/posts
 * Lấy danh sách bài đăng trong forum
 */
const getForumPosts = async (req, res, next) => {
  try {
    const { forumId } = req.params;

    const forum = await Forum.findOne({ _id: forumId, isDeleted: false });
    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    const posts = await ForumPost.find({ forum: forumId, isDeleted: false })
      .populate("author", "username avatarUrl")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      message: "Get forum posts success",
      posts: posts.map((post) => ({
        postId: post._id,
        content: post.content,
        images: post.images || [],
        videos: post.videos || [],
        author: {
          userId: post.author?._id,
          username: post.author?.username || "Unknown",
          avatar: post.author?.avatarUrl || "",
        },
        isOwner: String(post.author?._id) === String(req.user._id),
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/forums/:forumId/posts/:postId
 * Lấy chi tiết một bài đăng trong forum
 */
const getForumPostById = async (req, res, next) => {
  try {
    const { forumId, postId } = req.params;

    const post = await ForumPost.findOne({ _id: postId, forum: forumId, isDeleted: false })
      .populate("author", "username avatarUrl")
      .lean();

    if (!post) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    return res.json({
      message: "Get forum post success",
      post: {
        postId: post._id,
        content: post.content,
        images: post.images || [],
        videos: post.videos || [],
        author: {
          userId: post.author?._id,
          username: post.author?.username || "Unknown",
          avatar: post.author?.avatarUrl || "",
        },
        isOwner: String(post.author?._id) === String(req.user._id),
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/forums/:forumId/posts
 * Tạo bài đăng mới trong forum
 * Chỉ thành viên active mới được đăng
 * Supports: multipart/form-data với field "files" (ảnh/video)
 */
const createForumPost = async (req, res, next) => {
  try {
    const { forumId } = req.params;
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";

    const forum = await Forum.findOne({ _id: forumId, isDeleted: false });
    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    // Kiểm tra thành viên
    const membership = await ForumMember.findOne({ user: req.user._id, forum: forumId });
    if (!membership || membership.status !== "active") {
      return res.status(403).json({ message: "You must be an active member to post in this forum" });
    }

    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: "Post content or files are required" });
    }

    // Phân loại file ảnh / video
    const images = [];
    const videos = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const url = `uploads/forum_posts/${file.filename}`;
        if (file.mimetype.startsWith("image/")) {
          images.push(url);
        } else if (file.mimetype.startsWith("video/")) {
          videos.push(url);
        }
      });
    }

    const newPost = await ForumPost.create({
      forum: forumId,
      author: req.user._id,
      content,
      images,
      videos,
    });

    const populated = await ForumPost.findById(newPost._id)
      .populate("author", "username avatarUrl")
      .lean();

    return res.status(201).json({
      message: "Create forum post success",
      post: {
        postId: populated._id,
        content: populated.content,
        images: populated.images || [],
        videos: populated.videos || [],
        author: {
          userId: populated.author?._id,
          username: populated.author?.username || "Unknown",
          avatar: populated.author?.avatarUrl || "",
        },
        isOwner: true,
        createdAt: populated.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/forums/:forumId/posts/:postId
 * Cập nhật bài đăng trong forum (chỉ tác giả mới được sửa)
 */
const updateForumPost = async (req, res, next) => {
  try {
    const { forumId, postId } = req.params;
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";

    const post = await ForumPost.findOne({ _id: postId, forum: forumId, isDeleted: false });
    if (!post) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the post author can update this post" });
    }

    if (content) post.content = content;

    // Nếu có upload file mới thì thêm vào
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const url = `uploads/forum_posts/${file.filename}`;
        if (file.mimetype.startsWith("image/")) {
          post.images.push(url);
        } else if (file.mimetype.startsWith("video/")) {
          post.videos.push(url);
        }
      });
    }

    await post.save();

    return res.json({
      message: "Update forum post success",
      post: {
        postId: post._id,
        content: post.content,
        images: post.images,
        videos: post.videos,
        updatedAt: post.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/forums/:forumId/posts/:postId
 * Xóa mềm bài đăng (tác giả hoặc chủ forum)
 */
const deleteForumPost = async (req, res, next) => {
  try {
    const { forumId, postId } = req.params;

    const forum = await Forum.findOne({ _id: forumId, isDeleted: false });
    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    const post = await ForumPost.findOne({ _id: postId, forum: forumId, isDeleted: false });
    if (!post) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    const isAuthor = String(post.author) === String(req.user._id);
    const isForumOwner = String(forum.createdBy) === String(req.user._id);

    if (!isAuthor && !isForumOwner) {
      return res
        .status(403)
        .json({ message: "Only the post author or forum owner can delete this post" });
    }

    post.isDeleted = true;
    await post.save();

    return res.json({ message: "Delete forum post success" });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════════════════════════
module.exports = {
  uploadForumPostFiles,
  // Forum
  getForums,
  getForumById,
  createForum,
  updateForum,
  deleteForum,
  // Forum Members
  getForumMembers,
  joinForum,
  leaveForum,
  updateMemberStatus,
  // Forum Posts
  getForumPosts,
  getForumPostById,
  createForumPost,
  updateForumPost,
  deleteForumPost,
};
