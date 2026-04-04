const express = require("express");
const { verifyAccessToken } = require("../middleware/auth");
const {
	uploadPostFile,
	createPost,
	getPosts,
	getMyPosts,
	sharePost,
	hidePost,
	deletePost,
	adminDeletePost,
	restorePost,
	getHiddenPosts,
} = require("../controllers/post");

const router = express.Router();

router.get("/", verifyAccessToken, getPosts);
router.get("/me", verifyAccessToken, getMyPosts);
router.get("/hidden", verifyAccessToken, getHiddenPosts);
router.post("/", verifyAccessToken, uploadPostFile.single("file"), createPost);
router.post("/:postId/share", verifyAccessToken, sharePost);
router.put("/:postId/hide", verifyAccessToken, hidePost);
router.put("/:postId/delete", verifyAccessToken, adminDeletePost);
router.put("/:postId/restore", verifyAccessToken, restorePost);

module.exports = router;
