const User = require('../schemas/users');
const Post = require('../schemas/post');
const Forum = require('../schemas/forum');
const Notification = require('../schemas/notification');
const PostFile = require('../schemas/post_file');

// ================= DASHBOARD =================
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const totalPosts = await Post.countDocuments({ isDeleted: false });
    const totalForums = await Forum.countDocuments({ isDeleted: false });

    // ❌ Bỏ aggregate -> ✅ dùng find + loop
    const posts = await Post.find({ isDeleted: false })
      .select("likeCount commentCount shareCount")
      .lean();

    let totalInteractions = 0;
    posts.forEach(p => {
      totalInteractions += (p.likeCount || 0)
        + (p.commentCount || 0)
        + (p.shareCount || 0);
    });

    const avgInteractionsPerPost =
      totalPosts > 0 ? (totalInteractions / totalPosts).toFixed(1) : 0;

    const newestUsers = await User.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('username fullName email avatarUrl createdAt role')
      .lean();

    const newestPosts = await Post.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('user', 'username avatarUrl')
      .lean();

    return res.status(200).json({
      stats: {
        totalUsers,
        totalPosts,
        totalForums,
        totalInteractions,
        avgInteractionsPerPost
      },
      newestUsers,
      newestPosts
    });
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy thống kê dashboard." });
  }
};

// ================= USERS =================
exports.getUsersList = async (req, res, next) => {
  try {
    const users = await User.find({ isDeleted: false })
      .populate("role")
      .lean();

    // ❌ Bỏ aggregate -> ✅ lấy post rồi đếm
    const posts = await Post.find({ isDeleted: false })
      .select("user")
      .lean();

    const postCountsMap = new Map();

    posts.forEach(p => {
      const userId = p.user.toString();
      if (!postCountsMap.has(userId)) {
        postCountsMap.set(userId, 1);
      } else {
        postCountsMap.set(userId, postCountsMap.get(userId) + 1);
      }
    });

    const formattedUsers = users.map(u => {
      const postsCount = postCountsMap.get(u._id.toString()) || 0;

      return {
        id: u._id.toString(),
        name: u.fullName || u.username,
        email: u.email,
        handle: `@${u.username}`,
        avatar: u.avatarUrl,
        role: u.role ? (u.role.name === 'admin' ? 'Admin' : 'User') : 'User',
        status: u.status ? 'active' : 'suspended',
        lastActive: 'Vừa xong',
        postsCount,
        reputation: 100, // mock
        joinedDate: u.createdAt ? u.createdAt.toISOString() : null
      };
    });

    const totalUsers = formattedUsers.length;

    let usersHasPosts = 0;
    let usersNoPosts = 0;

    formattedUsers.forEach(u => {
      if (u.postsCount > 0) usersHasPosts++;
      else usersNoPosts++;
    });

    return res.status(200).json({
      users: formattedUsers,
      stats: {
        totalUsers,
        usersHasPosts,
        usersNoPosts
      }
    });
  } catch (error) {
    console.error("Get Users List Error:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách người dùng.",
      err: error.toString()
    });
  }
};

// ================= TOGGLE USER =================
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    user.status = !user.status;
    await user.save();

    return res.status(200).json({
      message: `Tài khoản đã được ${user.status ? 'mở khóa' : 'vô hiệu hóa'}`,
      status: user.status ? 'active' : 'suspended'
    });
  } catch (error) {
    console.error("Toggle User Status Error:", error);
    res.status(500).json({
      message: "Lỗi server khi đổi trạng thái người dùng."
    });
  }
};

// ================= POSTS =================
exports.getPostsList = async (req, res, next) => {
  try {
    const posts = await Post.find({ isDeleted: false })
      .populate("user", "username avatarUrl")
      .sort({ createdAt: -1 })
      .lean();

    const postIds = posts.map(p => p._id);

    const files = await PostFile.find({
      post: { $in: postIds },
      isDeleted: false
    }).lean();

    const fileMap = new Map();
    files.forEach(f => {
      fileMap.set(f.post.toString(), f);
    });

    const formattedPosts = posts.map(p => {
      const file = fileMap.get(p._id.toString());

      return {
        id: p._id.toString(),
        fileUrl: file ? file.fileUrl : null,
        content: p.content,
        createdAt: p.createdAt ? p.createdAt.toISOString() : null,
        type: file ? "FILE" : "TEXT",
        user: {
          id: p.user ? p.user._id.toString() : "",
          avatar: p.user ? p.user.avatarUrl : "",
          username: p.user ? p.user.username : ""
        }
      };
    });

    return res.status(200).json({
      posts: formattedPosts
    });
  } catch (error) {
    console.error("Get Posts List Error:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách bài viết.",
      err: error.toString(),
      stack: error.stack
    });
  }
};