const mongoose = require("mongoose");

const Comment = mongoose.Schema(
  {
    user: {
      type: Object,
    },

    content: {
      type: String,
      require: true,
    },
    like: {
      type: Array,
      default: [],
    },
    reply: {
      type: String,
      default: "",
    },
    friendName: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Comment", Comment);
