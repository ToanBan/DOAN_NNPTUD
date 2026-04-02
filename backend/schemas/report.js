const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "post" },

    reason: String,

    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("report", reportSchema);