const mongoose = require("mongoose");

const messageFileSchema = new mongoose.Schema(
  {
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat_message",
      required: true
    },

    fileUrl: { type: String, required: true },

    fileType: {
      type: String,
      enum: ["file"],
      required: true
    },

    fileName: String,
    fileSize: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("message_file", messageFileSchema);