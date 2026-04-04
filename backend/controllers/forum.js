const Forum = require("../schemas/forum");
const ForumMember = require("../schemas/forum_member");
const createUploader = require("../middleware/upload");
const Post = require("../schemas/post");
const uploadForumPostFiles = createUploader("forum_posts");

const getForums = async (req, res, next) => {
  try {
    const forums = await Forum.find({ isDeleted: false })
      .populate("createdBy", "username avatarUrl")
      .sort({ createdAt: -1 })
      .lean();

    const result = await Promise.all(
      forums.map(async (forum) => {
        const memberCount = await ForumMember.countDocuments({
          forum: forum._id,
          status: "active",
        });

        return {
          forumId: forum._id,
          name: forum.name,
          description: forum.description,
          createdBy: {
            userId: forum.createdBy?._id,
            username: forum.createdBy?.username || "Unknown",
            avatar: forum.createdBy?.avatarUrl || "",
          },
          memberCount,
          createdAt: forum.createdAt,
        };
      }),
    );

    return res.json({ message: "Get forums success", forums: result });
  } catch (error) {
    next(error);
  }
};

const getMyForums = async (req, res, next) => {
  try {
    const userId = req.query.userId || req.user.id;

    const memberships = await ForumMember.find({
      user: userId,
      status: "active",
    }).select("forum");

    const forumIds = memberships.map((m) => m.forum);

    const forums = await Forum.find({
      _id: { $in: forumIds },
      isDeleted: false,
    })
      .populate("createdBy", "username avatarUrl")
      .lean();

    const members = await ForumMember.find({
      forum: { $in: forumIds },
      status: "active",
    }).select("forum");

    const memberCountMap = members.reduce((acc, m) => {
      const id = String(m.forum);
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    const result = forums.map((forum) => ({
      forumId: forum._id,
      name: forum.name,
      description: forum.description,
      createdBy: {
        userId: forum.createdBy?._id,
        username: forum.createdBy?.username || "Unknown",
        avatar: forum.createdBy?.avatarUrl || "",
      },
      memberCount: memberCountMap[String(forum._id)] || 0,
      createdAt: forum.createdAt,
    }));

    res.json({ message: "Get my forums success", forums: result });
  } catch (error) {
    next(error);
  }
};

const getMyCreatedForums = async (req, res, next) => {
  try {
    const userId = req.query.userId || req.user.id;

    const forums = await Forum.find({
      createdBy: userId,
      isDeleted: false,
    })
      .populate("createdBy", "username avatarUrl")
      .lean();

    const result = forums.map((forum) => ({
      forumId: forum._id,
      name: forum.name,
      description: forum.description,
      createdBy: {
        userId: forum.createdBy?._id,
        username: forum.createdBy?.username || "Unknown",
        avatar: forum.createdBy?.avatarUrl || "",
      },
      createdAt: forum.createdAt,
    }));

    res.json({ message: "Get my created forums success", forums: result });
  } catch (error) {
    next(error);
  }
};

const getForumById = async (req, res, next) => {
  try {
    const { forumId } = req.params;


    const forum = await Forum.findOne({ _id: forumId, isDeleted: false })
      .populate("createdBy", "username avatarUrl")
      .lean();

    if (!forum) {
      return res.status(404).json({ message: "Diễn đàn không tồn tại" });
    }

    const memberCount = await ForumMember.countDocuments({
      forum: forumId,
      status: "active",
    });

    // Kiểm tra xem người dùng hiện tại đã tham gia chưa
    const membership = await ForumMember.findOne({
      user: req.user._id,
      forum: forumId,
    }).lean();

    return res.json({
      message: "Lấy thông tin diễn đàn thành công",
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
    next(error); // Express sẽ bắt lỗi CastError ở đây nếu ID sai định dạng
  }
};

const createForum = async (req, res, next) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const description =
      typeof req.body.description === "string"
        ? req.body.description.trim()
        : "";

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

const updateForum = async (req, res, next) => {
  try {
    const { forumId } = req.params;

    const forum = await Forum.findOne({ _id: forumId, isDeleted: false });
    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    if (String(forum.createdBy) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only the forum owner can update this forum" });
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

const deleteForum = async (req, res, next) => {
  try {
    const { forumId } = req.params;

    const forum = await Forum.findOne({ _id: forumId, isDeleted: false });
    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    if (String(forum.createdBy) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only the forum owner can delete this forum" });
    }

    forum.isDeleted = true;
    await forum.save();

    return res.json({ message: "Delete forum success" });
  } catch (error) {
    next(error);
  }
};

const joinForum = async (req, res, next) => {
  try {
    const { forumId } = req.params;

    const forum = await Forum.findOne({ _id: forumId, isDeleted: false });
    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    const existing = await ForumMember.findOne({
      user: req.user._id,
      forum: forumId,
    });
    if (existing) {
      if (existing.status === "banned") {
        return res
          .status(403)
          .json({ message: "You are banned from this forum" });
      }
      return res
        .status(400)
        .json({ message: "You are already a member of this forum" });
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

const leaveForum = async (req, res, next) => {
  try {
    const { forumId } = req.params;

    const forum = await Forum.findOne({ _id: forumId, isDeleted: false });
    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    if (String(forum.createdBy) === String(req.user._id)) {
      return res
        .status(400)
        .json({ message: "Forum owner cannot leave the forum" });
    }

    const member = await ForumMember.findOneAndDelete({
      user: req.user._id,
      forum: forumId,
    });

    if (!member) {
      return res
        .status(404)
        .json({ message: "You are not a member of this forum" });
    }

    return res.json({ message: "Left forum successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getForums,
  getForumById,
  createForum,
  updateForum,
  deleteForum,
  joinForum,
  leaveForum,
  getMyForums,
  getMyCreatedForums,
};
