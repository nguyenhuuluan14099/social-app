const router = require("express").Router();

const Message = require("../model/Message");

router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get message from conversationId

router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all latest message
// router.delete("/latest", async (req, res) => {
//   try {
//     const message = await Message.find();
//     const a = message.remove();
//     res.status(200).json(a);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

//delete message
router.delete("/:mesId", async (req, res) => {
  const mess = await Message.findById(req.params.mesId);
  try {
    await mess.deleteOne();
    res.status(200).json("you have been delete this message");
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
