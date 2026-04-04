const Report = require("../schemas/report");
const Post = require("../schemas/post");
const User = require("../schemas/users");

const createReport = async (req, res) => {
  try {
    const { postId, reason, description } = req.body;
    const reporterId = req.user.id;

    // Validate input
    if (!postId || !reason) {
      return res.status(400).json({
        message: "postId and reason are required"
      });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    // Check if user already reported this post
    const existingReport = await Report.findOne({
      reporter: reporterId,
      post: postId
    });

    if (existingReport) {
      return res.status(400).json({
        message: "You have already reported this post"
      });
    }

    // Create report
    const report = await Report.create({
      reporter: reporterId,
      post: postId,
      reportedUser: post.user,
      reason,
      description
    });

    await report.populate("reporter", "username avatar");
    await report.populate("post", "content");
    await report.populate("reportedUser", "username");

    return res.status(201).json({
      message: "Report submitted successfully",
      report
    });
  } catch (error) {
    console.error("Create report error:", error);
    return res.status(500).json({
      message: "Failed to submit report",
      error: error.message
    });
  }
};

const getReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const reports = await Report.find(filter)
      .populate("reporter", "username avatar email")
      .populate("post", "content userId")
      .populate("reportedUser", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);

    return res.status(200).json({
      reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get reports error:", error);
    return res.status(500).json({
      message: "Failed to fetch reports",
      error: error.message
    });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminNote } = req.body;

    if (!status || !["pending", "resolved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status,
        adminNote: adminNote || ""
      },
      { new: true }
    )
      .populate("reporter", "username avatar")
      .populate("post", "content")
      .populate("reportedUser", "username");

    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    return res.status(200).json({
      message: "Report status updated",
      report
    });
  } catch (error) {
    console.error("Update report status error:", error);
    return res.status(500).json({
      message: "Failed to update report status",
      error: error.message
    });
  }
};

const getReportStats = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: "$reason",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const statusStats = await Report.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      reasonStats: stats,
      statusStats
    });
  } catch (error) {
    console.error("Get report stats error:", error);
    return res.status(500).json({
      message: "Failed to fetch report statistics",
      error: error.message
    });
  }
};

module.exports = {
  createReport,
  getReports,
  updateReportStatus,
  getReportStats
};
