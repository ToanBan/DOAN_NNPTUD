const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    type: {
      type: String,
      enum: ["like", "comment", "follow"]
    },

    post: { type: mongoose.Schema.Types.ObjectId, ref: "post" },

    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("notification", notificationSchema);
