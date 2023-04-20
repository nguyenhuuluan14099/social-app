const router = require("express").Router();
const Post = require("../model/Post");
const User = require("../model/User");
const mongoose = require("mongoose");
//create post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savePosted = await newPost.save();
    res.json(savePosted);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get timeline of user
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser?._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (error) {
    res.status(500).json(error);
  }
});

//get user by username
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const postUser = await Post.find({ userId: user?._id });
    res.status(200).json(postUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get user by useId
router.get("/getPostUser/:userId", async (req, res) => {
  try {
    const postUser = await Post.find({ userId: req.params.userId });
    res.status(200).json(postUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

//like and dislike post
router.put("/:id/like", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post.likes.includes(req.body.userId)) {
    await post.updateOne({ $push: { likes: req.body.userId } });
    res.status(200).json("the post has been liked!");
  } else {
    await post.updateOne({ $pull: { likes: req.body.userId } });
    res.status(200).json("the post has been disliked!");
  }
});

//update post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can only update your post");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

//get post by id
router.get("/:id", async (req, res) => {
  try {
    const result = await Post.findOne({ _id: req.params.id });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

//delete post
router.delete("/:postId", async (req, res) => {
  const post = await Post.findById(req.params.postId);
  try {
    await post.deleteOne();
    res.status(200).json("you have been deleted");
  } catch (error) {
    res.status(500).json(error);
  }
  // if (post.userId === req.body.userId) {
  //   await post.deleteOne();
  //   res.status(200).json("you have been deleted");
  // } else {
  //   res.status(500).json("you only delete your post");
  // }
});

//get all posts
//

//get post suggest explore
// router.get("/explore", async (req, res) => {
//   try {
//     const posts = await Post.find();
//     res.status(200).json(posts);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

router.get("/postList", function (req, res) {
  try {
    const post = Post.find();
    console.log(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

//saved post
router.put("/saved/:postId", async (req, res) => {
  const user = await User.findById(req.body.userId);
  try {
    if (!user.saved.includes(req.params.postId)) {
      await user.updateOne({ $push: { saved: req.params.postId } });
      res.status(200).json("you have been saved post");
    } else {
      await user.updateOne({ $pull: { saved: req.params.postId } });
      res.status(200).json("you have been unsaved post");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

//get post saved
router.get("/savedItem/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);

  try {
    const posts = await Promise.all(user.saved.map((u) => Post.findById(u)));
    res.status(200).json(posts);
  } catch (error) {
    ``;
    res.status(500).json(error);
  }
});

//get all post
router.get("/listPost/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  try {
    if (user.isAdmin) {
      const posts = await Post.find();
      res.status(200).json(posts);
    } else {
      res.status(500).json("you don't have admin");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
