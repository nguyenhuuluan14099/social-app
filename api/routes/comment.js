const Comment = require("../model/Comment");
const User = require("../model/User");
const Post = require("../model/Post");
const router = require("express").Router();

//create comment
router.post("/", async (req, res) => {
  try {
    const { postId, content, user, reply, friendName } = req.body;

    const newComment = new Comment({
      user,
      content,
      reply,
      friendName,
    });

    await Post.findOneAndUpdate(
      { _id: postId },
      {
        $push: { comments: newComment._id },
      }
    );

    const saveComment = await newComment.save();
    res.status(200).json(saveComment);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get comment
router.get("/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    const comments = await Promise.all(
      post.comments.map((comment) => {
        return Comment.findById(comment);
      })
    );
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json(error);
  }
});
//get one comment
router.get("/getOne/:cmtId", async (req, res) => {
  try {
    const cmt = await Comment.findById(req.params.cmtId);
    res.status(200).json(cmt);
  } catch (error) {
    res.status(500).json(error);
  }
});

//delete comment
router.delete("/:cmtId", async (req, res) => {
  const cmt = await Comment.findById(req.params.cmtId);
  try {
    await cmt.deleteOne();
    res.status(200).json("you have been delete comment");
  } catch (error) {
    res.status(500).json(error);
  }
});

//like and dislike comment
router.put("/:cmtId/like", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.cmtId);
    if (!comment.like.includes(req.body.userId)) {
      await comment.updateOne({ $push: { like: req.body.userId } });
      res.status(200).json("you have been liked comment");
    } else {
      await comment.updateOne({ $pull: { like: req.body.userId } });
      res.status(200).json("you have been disliked comment");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

//get list user liked comment
router.get("/:cmtId/listUser", async (req, res) => {
  const comment = await Comment.findById(req.params.cmtId);
  try {
    const userList = await Promise.all(
      comment.like.map((cmt) => {
        return User.findById(cmt);
      })
    );
    res.status(200).json(userList);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
