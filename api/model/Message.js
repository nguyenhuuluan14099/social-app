const mongoose = require("mongoose");
const Messages = mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    sender: {
      type: String,
    },
    text: {
      type: String,
    },
    imageMes: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Messages", Messages);
