const mongoose = require("mongoose");

const forumSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Forum name is required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("forum", forumSchema);