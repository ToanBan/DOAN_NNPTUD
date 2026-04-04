const express = require("express");
const { verifyAccessToken } = require("../middleware/auth");
const {
	uploadPostFile,
	createPost,
	updatePost,
	deletePost,
	getPosts,
	getMyPosts,
	sharePost,
	toggleLikePost,
	getPostComments,
	createComment,
	hidePost,
	deletePost,
	adminDeletePost,
	restorePost,
	getHiddenPosts,
} = require("../controllers/post");

const router = express.Router();

router.get("/", verifyAccessToken, getPosts);
router.get("/me", verifyAccessToken, getMyPosts);
router.get("/:postId/comments", verifyAccessToken, getPostComments);
router.get("/hidden", verifyAccessToken, getHiddenPosts);
router.post("/", verifyAccessToken, uploadPostFile.single("file"), createPost);
router.put("/:postId", verifyAccessToken, updatePost);
router.delete("/:postId", verifyAccessToken, deletePost);
router.post("/:postId/like", verifyAccessToken, toggleLikePost);
router.post("/:postId/comments", verifyAccessToken, createComment);
router.post("/:postId/share", verifyAccessToken, sharePost);
router.put("/:postId/hide", verifyAccessToken, hidePost);
router.put("/:postId/delete", verifyAccessToken, adminDeletePost);
router.put("/:postId/restore", verifyAccessToken, restorePost);

module.exports = router;
