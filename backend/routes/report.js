const express = require("express");
const { verifyAccessToken } = require("../middleware/auth");
const {
  createReport,
  getReports,
  updateReportStatus,
  getReportStats
} = require("../controllers/report");

const router = express.Router();

// Create report (user)
router.post("/", verifyAccessToken, createReport);

// Get all reports (admin only)
router.get("/", verifyAccessToken, getReports);

// Get report statistics (admin only)
router.get("/stats", verifyAccessToken, getReportStats);

// Update report status (admin only)
router.put("/:reportId", verifyAccessToken, updateReportStatus);

module.exports = router;
