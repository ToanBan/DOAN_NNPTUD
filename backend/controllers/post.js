const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Post = require("../schemas/post");
const PostFile = require("../schemas/post_file");

const uploadDir = path.join(__dirname, "../public/uploads/posts");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const uploadPostFile = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const getFileType = (mimetype = "") => {
  if (mimetype.startsWith("image/")) {
    return "image";
  }

  if (mimetype.startsWith("video/")) {
    return "video";
  }

  return "file";
};

const mapPostToResponse = (postDoc, fileDoc) => {
  const post = postDoc.toObject ? postDoc.toObject() : postDoc;
  const user = post.user || {};

  return {
    postId: post._id,
    content: post.content,
    privacy: post.privacy,
    username: user.username || "Unknown",
    avatar: user.avatarUrl || "",
    fileUrl: fileDoc?.fileUrl || "",
    fileType: fileDoc?.fileType || null,
    likeCount: post.likeCount || 0,
    commentCount: post.commentCount || 0,
    likedByCurrentUser: false,
    createdAt: post.createdAt,
  };
};

const createPost = async (req, res, next) => {
  try {
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
    const privacy = typeof req.body.privacy === "string" ? req.body.privacy : "public";

    if (!content && !req.file) {
      return res.status(400).json({ message: "Post content or file is required" });
    }

    const newPost = await Post.create({
      user: req.user._id,
      content,
      privacy,
      fileCount: req.file ? 1 : 0,
    });

    let postFile = null;
    if (req.file) {
      postFile = await PostFile.create({
        post: newPost._id,
        fileUrl: `uploads/posts/${req.file.filename}`,
        fileType: getFileType(req.file.mimetype),
        fileName: req.file.originalname,
        fileSize: req.file.size,
      });
    }

    const populatedPost = await Post.findById(newPost._id).populate("user", "username avatarUrl");

    return res.status(201).json({
      message: "Create post success",
      post: mapPostToResponse(populatedPost, postFile),
    });
  } catch (error) {
    next(error);
  }
};

const getPosts = async (_req, res, next) => {
  try {
    const posts = await Post.find({
      isDeleted: false,
      privacy: "public",
    })
      .populate("user", "username avatarUrl")
      .sort({ createdAt: -1 })
      .lean();

    const postIds = posts.map((post) => post._id);
    const postFiles = await PostFile.find({
      post: { $in: postIds },
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .lean();

    const postFileMap = new Map(postFiles.map((file) => [String(file.post), file]));

    return res.json({
      message: "Get posts success",
      posts: posts.map((post) => mapPostToResponse(post, postFileMap.get(String(post._id)))),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadPostFile,
  createPost,
  getPosts,
};
