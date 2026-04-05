const express = require("express");
const { verifyAccessToken, verifyAdmin} = require("../middleware/auth");
const {
  getForums,
  getForumById,
  createForum,
  updateForum,
  deleteForum,
  joinForum,
  leaveForum,
  getMyForums,
  getMyCreatedForums,
} = require("../controllers/forum");

const router = express.Router();

router.get("/", verifyAccessToken,verifyAdmin, getForums);
router.post("/", verifyAccessToken, createForum);
router.get("/my-forums", verifyAccessToken, getMyForums);
router.get("/created-by-me", verifyAccessToken, getMyCreatedForums);

router.get("/:forumId", verifyAccessToken, getForumById);
router.put("/:forumId", verifyAccessToken, updateForum);
router.delete("/:forumId", verifyAccessToken, deleteForum);
router.post("/:forumId/join", verifyAccessToken, joinForum);
router.delete("/:forumId/leave", verifyAccessToken, leaveForum);
module.exports = router;
