const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    content: { type: String, default: "" },

    privacy: {
      type: String,
      enum: ["public", "private", "friends"],
      default: "public"
    },

    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    fileCount: { type: Number, default: 0 },

    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("post", postSchema);