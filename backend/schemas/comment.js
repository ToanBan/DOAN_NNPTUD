const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    content: { type: String, required: true },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
      default: null
    },

    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("comment", commentSchema);