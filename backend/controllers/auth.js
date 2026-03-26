const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
let User = require("../schemas/users");
let Role = require("../schemas/roles");

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
      status:true,
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

const refreshToken = async (req, res, next) => {
  try {
    const user = req.user

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
module.exports = { register, login, refreshToken, getInfoUser, logout, googleCallback};
