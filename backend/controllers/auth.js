const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const User = require("../schemas/users");
const Role = require("../schemas/roles");
const sendMail = require("../config/mail");

const privateKey = fs.readFileSync(
  path.join(__dirname, "../keys/private.pem"),
  "utf8",
);

const publicKey = fs.readFileSync(
  path.join(__dirname, "../keys/public.pem"),
  "utf8",
);

const register = async (req, res, next) => {
  try {
    const { username, fullName, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email or username already exists",
      });
    }

    const userRole = await Role.findOne({ name: "user" });

    if (!userRole) {
      return res.status(500).json({
        message: "Role user not found, please seed database",
      });
    }

    const newUser = new User({
      username,
      email,
      password,
      fullName,
      role: userRole._id,
      status: true,
    });

    await newUser.save();

    return res.status(201).json({
      message: "Register success",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: "user",
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email, isDeleted: false }).populate(
      "role",
    );

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Wrong password",
      });
    }

    if (!user.status) {
      return res.status(403).json({
        message: "Account is not activated",
      });
    }

    const payload = {
      userId: user._id,
      username: user.username,
      role: user.role.name,
    };

    const accessToken = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1d",
    });

    const refreshToken = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7d",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    user.loginCount += 1;
    await user.save();

    return res.json({
      message: "Login success",
      success: true,
      accessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        address: user.address,
        phone: user.phone,
        description: user.description,
        avatar:user.avatarUrl
      },
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) return res.status(404).json({ message: "User not found" });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    user.resetOtp = otp;
    user.resetToken = tokenHash;
    user.resetExpire = Date.now() + 10 * 60 * 1000;
    await user.save();
    const subject = "OTP for Password Reset";
    const text = `Your OTP is: ${otp}.\nClick to verify: http://localhost:5173/verify-otp?token=${token}`;
    await sendMail(user.email, subject, text);
    return res.json({ message: "OTP sent to your email", success: true });
  } catch (err) {
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { token, otps } = req.body;

    if (!token || !otps || !Array.isArray(otps))
      return res.status(400).json({ message: "Token and OTP required" });

    const otpString = otps.join("");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: tokenHash,
      resetExpire: { $gt: Date.now() },
      isDeleted: false,
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    if (user.resetOtp !== otpString)
      return res.status(400).json({ message: "Invalid OTP" });

    user.resetOtp = null;
    await user.save();

    return res.json({
      message: "OTP verified successfully",
      token,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword, confirmNewPassword } = req.body;
    if (!token || !newPassword || !confirmNewPassword)
      return res.status(400).json({ message: "Token and passwords required" });

    if (newPassword !== confirmNewPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: tokenHash,
      resetExpire: { $gt: Date.now() },
      isDeleted: false,
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = newPassword;
    user.resetToken = null;
    user.resetExpire = null;
    await user.save();

    res.json({
      message: "Password has been reset successfully",
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const user = req.user;

    const payload = {
      userId: user._id,
      username: user.username,
      role: user.role.name,
    };

    const newAccessToken = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "15m",
    });

    const newRefreshToken = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7d",
    });

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Refresh token success",
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

const getInfoUser = async (req, res, next) => {
  try {
    const user = req.user;
    return res.json({
      message: "Get user info success",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        address: user.address,
        phone: user.phone,
        description: user.description,
        avatar: user.avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.json({
      message: "Logout success",
    });
  } catch (error) {
    next(error);
  }
};

const googleCallback = async (req, res) => {
  const user = req.user;

  const payload = {
    userId: user._id,
    username: user.username,
    role: "user",
  };

  const accessToken = jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "7d",
  });

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.redirect("http://localhost:5173");
};

const editProfile = async (req, res, next) => {
  try {
    const user = req.user; 
    const { phone, description, address, username } = req.body;

    const updateData = {};

    if (phone) {
      const cleanPhone = phone.trim().replace(/\s+/g, "");
      const isValidPhone = /^(0|\+84)[0-9]{9}$/.test(cleanPhone);
      if (!isValidPhone) {
        if (req.file) fs.unlink(req.file.path, () => {}); 
        return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
      }
      updateData.phone = cleanPhone;
    }


    if (description !== undefined) {
      if (description.length > 500) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(400).json({ message: "Mô tả quá dài (tối đa 500 ký tự)" });
      }
      updateData.description = description.trim();
    }

    if (address !== undefined) {
      updateData.address = address.trim();
    }

    if (username) {
      const trimmedUsername = username.trim();
      const existingUser = await User.findOne({
        username: trimmedUsername,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(400).json({ message: "Tên người dùng đã tồn tại" });
      }
      updateData.username = trimmedUsername;
    }

    if (req.file) {
      const currentUser = await User.findById(user._id);
      if (currentUser.avatarUrl && currentUser.avatarUrl.includes("uploads/avatars/")) {
        const oldPath = path.join(__dirname, "..", "public", currentUser.avatarUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (err) => {
            if (err) console.error("Lỗi xóa ảnh cũ:", err);
          });
        }
      }
      updateData.avatarUrl = `uploads/avatars/${req.file.filename}`;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu nào được thay đổi" });
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updateData, {
      new: true,
    }).populate("role");

    return res.json({
      success: true,
      message: "Cập nhật thông tin thành công",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        description: updatedUser.description,
        address: updatedUser.address,
        avatarUrl: updatedUser.avatarUrl, 
        role: updatedUser.role?.name || "User",
      },
    });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {}); 
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        message: "New passwords do not match",
      });
    }

    const currentUser = await User.findById(user._id);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = bcrypt.compareSync(oldPassword, currentUser.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect",
      });
    }

    const isSamePassword = bcrypt.compareSync(
      newPassword,
      currentUser.password,
    );
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from old password",
      });
    }
    currentUser.password = newPassword;
    await currentUser.save();

    return res.json({
      message: "Change password success",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  register,
  login,
  refreshToken,
  getInfoUser,
  logout,
  googleCallback,
  forgotPassword,
  resetPassword,
  verifyOtp,
  editProfile,
  changePassword,
};
