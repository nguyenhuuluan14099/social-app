const router = require("express").Router();
const Notification = require("../model/Notification");

//create not
router.post("/", async (req, res) => {
  const newNot = new Notification(req.body);
  try {
    const saveNot = await newNot.save();
    res.status(200).json(saveNot);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get not of a user
router.get("/:receiverName", async (req, res) => {
  try {
    const nots = await Notification.find({
      receiverName: req.params.receiverName,
    });
    res.status(200).json(nots);
  } catch (error) {
    res.status(500).json(error);
  }
});

//mark all read
router.delete("/:receiverName", async (req, res) => {
  try {
    await Notification.find({
      receiverName: req.params.receiverName,
    }).deleteMany({ receiverName: req.params.receiverName });
    res.status(200).json("you have been deleted");
  } catch (error) {
    res.status(500).json(error);
  }
  // console.log("result", result);
});
module.exports = router;
