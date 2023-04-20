const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    user: {
      type: Object,
    },
    desc: {
      type: String,
      max: 500,
    },
    img: {
      required: true,
      type: Object,
    },
    comments: {
      type: Array,
      default: [],
    },
    likes: {
      type: Array,
      default: [],
    },
    location: {
      type: String,
    },
    hideLike: {
      type: Boolean,
    },
    hideComment: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", PostSchema);
