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
      success:true,
      accessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role.name,
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

    user.password = newPassword
    user.resetToken = null;
    user.resetExpire = null;
    await user.save();

    res.json({ message: "Password has been reset successfully", success:true});
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
};
