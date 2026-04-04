const mongoose = require("mongoose");

const forumPostSchema = new mongoose.Schema(
  {
    forum: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "forum",
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    content: {
      type: String,
      default: "",
    },

    images: [String],

    videos: [String], // 🔥 thêm video

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("forum_post", forumPostSchema);