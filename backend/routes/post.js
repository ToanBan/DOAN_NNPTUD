const express = require("express");
const { verifyAccessToken } = require("../middleware/auth");
const { uploadPostFile, createPost, getPosts } = require("../controllers/post");

const router = express.Router();

router.get("/", verifyAccessToken, getPosts);
router.post("/", verifyAccessToken, uploadPostFile.single("file"), createPost);

module.exports = router;
