const express = require("express");
const { verifyAccessToken , verifyAdmin} = require("../middleware/auth");
const {
  createReport,
  getReports,
  updateReportStatus,
  getReportStats
} = require("../controllers/report");

const router = express.Router();

router.post("/", verifyAccessToken, createReport);

router.get("/", verifyAccessToken, verifyAdmin, getReports);

router.get("/stats", verifyAccessToken, verifyAdmin,getReportStats);

router.put("/:reportId", verifyAccessToken, verifyAdmin, updateReportStatus);

module.exports = router;
