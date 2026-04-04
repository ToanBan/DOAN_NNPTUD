const express = require("express");
const { verifyAccessToken } = require("../middleware/auth");
const {
  getForums,
  getForumById,
  createForum,
  updateForum,
  deleteForum,
  joinForum,
  leaveForum,
  getForumPosts,
  getForumPostById,
  createForumPost,
  updateForumPost,
  deleteForumPost,
  getMyForums,
} = require("../controllers/forum");

const router = express.Router();

router.get("/", verifyAccessToken, getForums);
router.post("/", verifyAccessToken, createForum);
router.get("/my-forums", verifyAccessToken, getMyForums);

router.get("/:forumId", verifyAccessToken, getForumById);
router.put("/:forumId", verifyAccessToken, updateForum);
router.delete("/:forumId", verifyAccessToken, deleteForum);
router.post("/:forumId/join", verifyAccessToken, joinForum);
router.delete("/:forumId/leave", verifyAccessToken, leaveForum);
router.get("/:forumId/posts", verifyAccessToken, getForumPosts);
router.get("/:forumId/posts/:postId", verifyAccessToken, getForumPostById);
router.delete("/:forumId/posts/:postId", verifyAccessToken, deleteForumPost);
module.exports = router;
