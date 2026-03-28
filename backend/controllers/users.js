const User = require('../schemas/users');
const Follow = require('../schemas/follow');
const mongoose = require('mongoose');

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(200).json({ users: [] });
    }
    
    // Tìm kiếm username hoặc fullName có chứa chuỗi tìm kiếm (không phân biệt chữ hoa chữ thường)
    const regex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [{ username: regex }, { fullName: regex }]
    }).select('username fullName avatarUrl _id');

    // Retrieve relationship per user
    const currentUserId = req.user._id;

    const usersWithRelationship = await Promise.all(users.map(async (u) => {
      let relationship = 'None';
      if (u._id.toString() !== currentUserId.toString()) {
        const isFollowing = await Follow.exists({ follower: currentUserId, following: u._id });
        const isFollower = await Follow.exists({ follower: u._id, following: currentUserId });

        if (isFollowing && isFollower) {
          relationship = 'Friend';
        } else if (isFollowing) {
          relationship = 'Following';
        } else if (isFollower) {
          relationship = 'Follower';
        }
      } else {
        relationship = 'Self';
      }

      return {
        ...u.toObject(),
        relationship
      };
    }));

    res.status(200).json({ users: usersWithRelationship });
  } catch (error) {
    console.error("Search Users Error:", error);
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
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({ message: "Không thể tự theo dõi chính mình." });
    }

    // Kiểm tra xem đã theo dõi chưa
    const existingFollow = await Follow.findOne({ follower: currentUserId, following: targetUserId });

    let isFollowingTargetNow = false;

    if (existingFollow) {
      // Đã theo dõi => Hủy theo dõi
      await Follow.deleteOne({ _id: existingFollow._id });
      isFollowingTargetNow = false;
    } else {
      // Chưa theo dõi => Thêm theo dõi
      const newFollow = new Follow({ follower: currentUserId, following: targetUserId });
      await newFollow.save();
      isFollowingTargetNow = true;
    }

    // Tính lại trạng thái theo dõi 
    // Xem người kia có đang theo dõi lại mình không để cập nhật thành BẠN BÈ
    const isTargetFollowingMe = await Follow.exists({ follower: targetUserId, following: currentUserId });
    
    let relationship = "None";
    if (isFollowingTargetNow && isTargetFollowingMe) {
      relationship = "Friend";
    } else if (isFollowingTargetNow) {
      relationship = "Following";
    } else if (isTargetFollowingMe) {
        relationship = "Follower";
    }

    // Đếm lại tổng follower/following để update lên UI
    const followersCount = await Follow.countDocuments({ following: targetUserId });
    const followingCount = await Follow.countDocuments({ follower: targetUserId });

    res.status(200).json({
      message: isFollowingTargetNow ? "Theo dõi thành công" : "Hủy theo dõi thành công",
      relationship,
      stats: {
        followers: followersCount,
        following: followingCount
      }
    });

  } catch (error) {
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
