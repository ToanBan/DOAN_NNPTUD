const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const User = require("../schemas/users");

const publicKey = fs.readFileSync(
  path.join(__dirname, "../keys/public.pem"),
  "utf8"
);

const verifyAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ message: "No access token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired access token" });
    }

    const user = await User.findById(decoded.userId).select("-password").populate("role");

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; 
    next();
  } catch (error) {
    next(error);
  }
};


const verifyRefreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.userId).populate("role");

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.refreshToken && user.refreshToken !== token) {
      return res.status(403).json({ message: "Refresh token mismatch" });
    }

    req.user = user; 
    next();
  } catch (error) {
    next(error);
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role.name !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { verifyAccessToken, verifyRefreshToken, verifyAdmin };