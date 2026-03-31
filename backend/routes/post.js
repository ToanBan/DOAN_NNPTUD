const express = require("express");
const { verifyAccessToken } = require("../middleware/auth");
const {
	uploadPostFile,
	createPost,
	getPosts,
	getMyPosts,
	sharePost,
} = require("../controllers/post");

const router = express.Router();

router.get("/", verifyAccessToken, getPosts);
router.get("/me", verifyAccessToken, getMyPosts);
router.post("/", verifyAccessToken, uploadPostFile.single("file"), createPost);
router.post("/:postId/share", verifyAccessToken, sharePost);

module.exports = router;
