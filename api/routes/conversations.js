const router = require("express").Router();

const Conversations = require("../model/Conversations");

router.post("/:userId", async (req, res) => {
  const newConversations = new Conversations({
    //a conversation include two id of sender and received
    members: [req.body.senderId, req.body.receiveId],
  });
  const listCons = await Conversations.find({
    members: { $in: [req.params.userId] },
  });
  // console.log("listCons", listCons);
  const list = listCons.map((list) => list.members);
  const result = list.flat(2).filter((id) => id !== req.body.senderId);
  const isCons = result.includes(req.body.receiveId);
  try {
    if (!isCons) {
      const saveConversation = await newConversations.save();
      res.status(200).json(saveConversation);
    } else {
      //
    }
  } catch (error) {
    res.status(500).json(error);
  }
});
//get use in cov
// show list conversation in right page list message the same messenger left
router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversations.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get conversation for two user
router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversations.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json(error);
  }
});

//delete conversation
router.delete("/:consId", async (req, res) => {
  const cons = await Conversations.findById(req.params.consId);
  try {
    await cons.deleteOne();
    res.status(200).json("you have been deleted this conversations");
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
