const mongoose = require("mongoose");

const forumMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    forum: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "forum",
      required: true,
    },


    status: {
      type: String,
      enum: ["active", "banned", "pending"],
      default: "active",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

forumMemberSchema.index({ user: 1, forum: 1 }, { unique: true });

module.exports = mongoose.model("forum_member", forumMemberSchema);