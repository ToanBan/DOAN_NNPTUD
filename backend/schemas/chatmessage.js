const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    content: {
      type: String,
      default: ""
    },

    isRead: {
      type: Boolean,
      default: false
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("chat_message", chatMessageSchema);