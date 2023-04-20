const mongoose = require("mongoose");
const Notification = mongoose.Schema(
  {
    senderName: {
      type: String,
    },
    receiverName: {
      type: String,
    },
    type: {
      type: Number,
    },
    postId: {
      type: String,
    },
    senderId: {
      type: String,
    },
    postImg: {
      type: Object,
    },
    senderImg: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", Notification);
