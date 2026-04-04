const express = require("express");
const { verifyAccessToken, verifyAdmin} = require("../middleware/auth");
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
	adminDeletePost,
	restorePost,
	getHiddenPosts,
	getForumPosts,
} = require("../controllers/post");

const router = express.Router();

router.get("/", verifyAccessToken, getPosts);
router.get("/me", verifyAccessToken, getMyPosts);
router.get("/hidden", verifyAccessToken,verifyAdmin, getHiddenPosts);
router.get("/:postId/comments", verifyAccessToken, getPostComments);
router.post("/", verifyAccessToken, uploadPostFile.single("file"), createPost);
router.post("/:postId/share", verifyAccessToken, sharePost);
router.post("/:postId/comments", verifyAccessToken, createComment);
router.put("/:postId", verifyAccessToken, updatePost);
router.put("/:postId/like", verifyAccessToken, toggleLikePost);
router.put("/:postId/hide", verifyAccessToken,verifyAdmin, hidePost);
router.put("/:postId/delete", verifyAccessToken, verifyAdmin, adminDeletePost);
router.put("/:postId/restore", verifyAccessToken, verifyAdmin, restorePost);
router.delete("/:postId", verifyAccessToken, deletePost);
router.get("/forum/:forumId", verifyAccessToken, getForumPosts);
module.exports = router;
