const mongoose = require("mongoose");
const Conversations = mongoose.Schema(
  {
    members: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversations", Conversations);
