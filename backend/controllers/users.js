const User = require('../schemas/users');
const Follow = require('../schemas/follow');
const mongoose = require('mongoose');
const Notification = require('../schemas/notification');
const socketUtil = require('../utils/socket');
const Forum = require('../schemas/forum');

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(200).json({ users: [], forums: [] });
    }

    const regex = new RegExp(query, 'i');

    const users = await User.find({
      $or: [{ username: regex }, { fullName: regex }],
    }).select('username fullName avatarUrl _id').lean();

    const forums = await Forum.find({
      isDeleted: false,
      name: regex,
    }).select('name description createdBy').populate('createdBy', 'username').lean();

    res.status(200).json({ users, forums });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Lỗi server khi tìm kiếm." });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

    const targetUser = await User.findById(targetUserId).select('-password -resetOtp -resetToken -resetExpire');
    
    if (!targetUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Đếm số lượng follower và following
    const followersCount = await Follow.countDocuments({ following: targetUserId });
    const followingCount = await Follow.countDocuments({ follower: targetUserId });

    let relationship = "None"; // Các trạng thái: None, Following, Follower, Friend

    // Nếu không tự xem profile của chính mình thì kiểm tra trạng thái quan hệ
    if (targetUserId.toString() !== currentUserId.toString()) {
      const isFollowing = await Follow.exists({ follower: currentUserId, following: targetUserId });
      const isFollower = await Follow.exists({ follower: targetUserId, following: currentUserId });

      if (isFollowing && isFollower) {
        relationship = "Friend";
      } else if (isFollowing) {
        relationship = "Following"; // Mình đang theo dõi họ
      } else if (isFollower) {
        relationship = "Follower"; // Họ đang theo dõi mình
      }
    } else {
      relationship = "Self";
    }

    res.status(200).json({
      user: targetUser,
      stats: {
        followers: followersCount,
        following: followingCount,
        posts: 0 // Placeholder cho số lượng post sau này
      },
      relationship: relationship
    });

  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy thông tin." });
  }
};

exports.toggleFollow = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "ID người dùng không hợp lệ." });
    }

    if (targetUserId.toString() === currentUserId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Không thể tự theo dõi chính mình." });
    }

    const targetUser = await User.findById(targetUserId).select('_id username avatarUrl').session(session);
    if (!targetUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Không tìm thấy người dùng mục tiêu." });
    }

    const existingFollow = await Follow.findOne({ follower: currentUserId, following: targetUserId }).session(session);
    const isTargetFollowingMe = await Follow.exists({ follower: targetUserId, following: currentUserId }).session(session);
    let isFollowingTargetNow = false;
    let message = "";

    if (existingFollow) {
      await existingFollow.deleteOne({ session });
      isFollowingTargetNow = false;
      message = "Hủy theo dõi thành công";
    } else {
      await Follow.create([{ follower: currentUserId, following: targetUserId }], { session });
      isFollowingTargetNow = true;
      message = "Theo dõi thành công";

      const notification = await Notification.create([{
        sender: currentUserId,
        receiver: targetUserId,
        type: 'follow',
        isRead: false
      }], { session });

      await session.commitTransaction();
      session.endSession();

      try {
        const io = socketUtil.getIO();
        io.to(targetUserId.toString()).emit('new_notification', {
          _id: notification[0]._id,
          type: 'follow',
          sender: {
            _id: req.user._id,
            username: req.user.username,
            avatarUrl: req.user.avatarUrl
          },
          createdAt: notification[0].createdAt,
          isRead: notification[0].isRead
        });
      } catch (err) {
        console.error("Socket emit error:", err);
      }

      const followersCountAfter = await Follow.countDocuments({ following: targetUserId });
      const followingCountAfter = await Follow.countDocuments({ follower: targetUserId });

      let relationship = "None";
      if (isFollowingTargetNow && isTargetFollowingMe) {
        relationship = "Friend";
      } else if (isFollowingTargetNow) {
        relationship = "Following";
      } else if (isTargetFollowingMe) {
        relationship = "Follower";
      }

      return res.status(200).json({
        message,
        relationship,
        stats: {
          followers: followersCountAfter,
          following: followingCountAfter
        }
      });
    }

    const followersCount = await Follow.countDocuments({ following: targetUserId }).session(session);
    const followingCount = await Follow.countDocuments({ follower: targetUserId }).session(session);

    let relationship = "None";
    if (isFollowingTargetNow && isTargetFollowingMe) {
      relationship = "Friend";
    } else if (isFollowingTargetNow) {
      relationship = "Following";
    } else if (isTargetFollowingMe) {
      relationship = "Follower";
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message,
      relationship,
      stats: {
        followers: followersCount,
        following: followingCount
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Toggle Follow Error:", error);
    res.status(500).json({ message: "Lỗi server khi thao tác follow." });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all users the current user is following
    const following = await Follow.find({ follower: currentUserId });
    const followingIds = following.map(f => f.following);

    // From those, find ones who also follow the current user
    const mutualFollows = await Follow.find({
      follower: { $in: followingIds },
      following: currentUserId
    });
    const mutualFollowIds = mutualFollows.map(f => f.follower);

    // Get the User objects for these mutual follows
    const friends = await User.find({ _id: { $in: mutualFollowIds } })
      .select('username fullName avatarUrl _id');

    // format it like the frontend's Friends interface: { id, username, avatar }
    const formattedFriends = friends.map(f => ({
      id: f._id,
      username: f.username,
      avatar: f.avatarUrl
    }));

    res.status(200).json({ friends: formattedFriends });
  } catch (error) {
    console.error("Get Friends Error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách bạn bè." });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user._id })
      .populate('sender', 'username fullName avatarUrl')
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({ receiver: req.user._id, isRead: false });

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy thông báo." });
  }
};

exports.markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { receiver: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "Đã đánh dấu đọc." });
  } catch (error) {
    console.error("Mark Read Error:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật." });
  }
};
