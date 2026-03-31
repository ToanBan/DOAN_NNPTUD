const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },

    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("follow", followSchema);
