const mongoose = require("mongoose");

const postFileSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      required: true
    },

    fileUrl: { type: String, required: true },

    fileType: {
      type: String,
      enum: ["image", "video", "file"],
      required: true
    },

    fileName: String,
    fileSize: Number,

    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("post_file", postFileSchema);