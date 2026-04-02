const express = require("express");
const { verifyAccessToken } = require("../middleware/auth");
const {
  uploadForumPostFiles,
  // Forum
  getForums,
  getForumById,
  createForum,
  updateForum,
  deleteForum,
  // Forum Members
  getForumMembers,
  joinForum,
  leaveForum,
  updateMemberStatus,
  // Forum Posts
  getForumPosts,
  getForumPostById,
  createForumPost,
  updateForumPost,
  deleteForumPost,
} = require("../controllers/forum");

const router = express.Router();

// ─── Forum ─────────────────────────────────────────────────────────────────
// GET    /api/forums            → lấy danh sách forum
// POST   /api/forums            → tạo forum mới
// GET    /api/forums/:forumId   → chi tiết forum
// PUT    /api/forums/:forumId   → cập nhật forum (chủ sở hữu)
// DELETE /api/forums/:forumId   → xóa forum (chủ sở hữu)

router.get("/", verifyAccessToken, getForums);
router.post("/", verifyAccessToken, createForum);
router.get("/:forumId", verifyAccessToken, getForumById);
router.put("/:forumId", verifyAccessToken, updateForum);
router.delete("/:forumId", verifyAccessToken, deleteForum);

// ─── Forum Members ─────────────────────────────────────────────────────────
// GET    /api/forums/:forumId/members                     → danh sách thành viên
// POST   /api/forums/:forumId/join                        → tham gia forum
// DELETE /api/forums/:forumId/leave                       → rời forum
// PUT    /api/forums/:forumId/members/:userId/status      → cập nhật trạng thái thành viên (chủ sở hữu)

router.get("/:forumId/members", verifyAccessToken, getForumMembers);
router.post("/:forumId/join", verifyAccessToken, joinForum);
router.delete("/:forumId/leave", verifyAccessToken, leaveForum);
router.put("/:forumId/members/:userId/status", verifyAccessToken, updateMemberStatus);

// ─── Forum Posts ────────────────────────────────────────────────────────────
// GET    /api/forums/:forumId/posts              → danh sách bài đăng
// POST   /api/forums/:forumId/posts              → tạo bài đăng (thành viên active)
// GET    /api/forums/:forumId/posts/:postId      → chi tiết bài đăng
// PUT    /api/forums/:forumId/posts/:postId      → cập nhật bài đăng (tác giả)
// DELETE /api/forums/:forumId/posts/:postId      → xóa bài đăng (tác giả / chủ forum)

router.get("/:forumId/posts", verifyAccessToken, getForumPosts);
router.post(
  "/:forumId/posts",
  verifyAccessToken,
  uploadForumPostFiles.array("files", 10),
  createForumPost
);
router.get("/:forumId/posts/:postId", verifyAccessToken, getForumPostById);
router.put(
  "/:forumId/posts/:postId",
  verifyAccessToken,
  uploadForumPostFiles.array("files", 10),
  updateForumPost
);
router.delete("/:forumId/posts/:postId", verifyAccessToken, deleteForumPost);

module.exports = router;
