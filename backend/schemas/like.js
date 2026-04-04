const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "post" }
  },
  { timestamps: true }
);

likeSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model("like", likeSchema);
