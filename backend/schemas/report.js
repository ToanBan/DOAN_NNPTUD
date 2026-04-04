const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "post", required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    reason: {
      type: String,
      enum: [
        "spam",
        "inappropriate_content",
        "harassment",
        "misinformation",
        "copyright_violation",
        "hate_speech",
        "violence",
        "self_harm",
        "other"
      ],
      required: true
    },
    description: String,
    status: {
      type: String,
      enum: ["pending", "resolved", "rejected"],
      default: "pending"
    },
    adminNote: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("report", reportSchema);