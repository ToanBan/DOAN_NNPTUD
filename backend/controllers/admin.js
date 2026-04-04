const User = require('../schemas/users');
const Post = require('../schemas/post');
const Forum = require('../schemas/forum');
const Notification = require('../schemas/notification');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const totalPosts = await Post.countDocuments({ isDeleted: false });
    const totalForums = await Forum.countDocuments({ isDeleted: false });
    
    // total interactions could be likes + comments + shares across all posts?
    // for now we'll just sum them up or mock it if complex
    const postsWithStats = await Post.aggregate([
        { $match: { isDeleted: false } },
        { $group: { 
            _id: null, 
            totalInteractions: { $sum: { $add: ["$likeCount", "$commentCount", "$shareCount"] } }
        }}
    ]);
    const totalInteractions = postsWithStats.length > 0 ? postsWithStats[0].totalInteractions : 0;
    const avgInteractionsPerPost = totalPosts > 0 ? (totalInteractions / totalPosts).toFixed(1) : 0;

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
