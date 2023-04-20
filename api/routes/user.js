const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../model/User");
const mongoose = require("mongoose");
const Post = require("../model/Post");

const convertObjectId = require("mongodb").ObjectId;

router.post("/register", async (req, res) => {
  try {
    //generate password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //create user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashPassword,
      desc: req.body.desc,
      city: req.body.city,
      relationship: req.body.relationship,
    });
    //save db
    const saveUser = await newUser.save();
    res.status(200).json(saveUser);
  } catch (error) {
    if (error.keyPattern?.username) {
      res.status(500).json("username has been exist!");
    }
    if (error.keyPattern?.email) {
      res.status(500).json("email has been exist!");
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).json("user not found");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    !validPassword && res.status(400).json("password is not correct");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get user
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get friendOnline by userId
// router.get("/friendOnline/", async (req, res) => {
//   console.log(" req.body.userList", req.body.userList);
//   if (!req.body.userList) return;
//   try {
//     const userList = await Promise.all(
//       req.body.userList.map((user) => User.findById(user))
//     );
//     res.status(200).json(userList);
//   } catch (error) {
//     console.log(error);
//   }
// });

//get friend
router.get("/friend/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList);
  } catch (error) {
    res.status(500).json(error);
  }
});
//get friendFollowers
router.get("/friendFollower/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followers.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get user suggest follow
router.get("/suggest/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const users = await User.find();

    const followingList = [];
    const userList = [];
    user.followings.map((friendId) => {
      followingList.push(friendId);
    });
    users.map((user) => {
      return userList.push(user._id.toString());
    });
    const result = userList.filter((i) => !followingList.includes(i));
    const suggestList = result.filter((i) => i !== req.params.userId);

    const suggestUser = await Promise.all(
      suggestList.map((suggest) => {
        return User.findById(suggest);
      })
    );

    //demo

    const suggestPost1 = await Promise.all(
      suggestList.map((suggest) => {
        return Post.find({ userId: suggest });
      })
    );
    const suggestPost = suggestPost1.flat(2);

    const userInfo = [];
    suggestUser.map((user) => {
      const { username, profilePicture, _id, city } = user;
      return userInfo.push({
        username,
        profilePicture,
        _id,
        city,
      });
    });

    // const postInfo = [];
    // suggestPost.map((post) => {
    //   return postInfo.push(post, userInfo);
    // });
    const postBigSuggest = [...userInfo, ...suggestPost];
    res.status(200).json(postBigSuggest);
  } catch (error) {
    res.status(500).json(error);
  }
});

//follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.params.id !== req.body.userId) {
    const friend = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userId);
    if (!friend.followers.includes(req.body.userId)) {
      await friend.updateOne({ $push: { followers: req.body.userId } });
      await currentUser.updateOne({ $push: { followings: req.params.id } });
      res.status(200).json("you have been followed");
    } else {
      res.status(403).json("you already follow this user");
    }
  } else {
    res.status(500).json("you can not follow yourself");
  }
});

//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const friend = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (friend.followers.includes(req.body.userId)) {
        await friend.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("you have been unfollowed");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(500).json("you can't unfollow yourself");
  }
});

//update user
router.put("/", async (req, res) => {
  if (req.body.userId || req.body.isAdmin) {
    const currentUser = await User.findById(req.body.userId);
    // let validPassword = false;
    if (req.body.currentPassword && req.body.password) {
      const validPassword = await bcrypt.compare(
        req.body.currentPassword,
        currentUser.password
      );
      if (validPassword) {
        try {
          const salt = await bcrypt.genSalt(10);
          req.body.password = await bcrypt.hash(req.body.password, salt);
          await User.findByIdAndUpdate(req.body.userId, {
            $set: req.body,
          });
          res.status(200).json("Account has been updated");
        } catch (err) {
          return res.status(500).json(err);
        }
      } else {
        res.status(403).json("current password does not correct!");
      }
    } else {
      if (req.body.currentPassword === "" && req.body.password === "") {
        try {
          await User.findByIdAndUpdate(req.body.userId, {
            $set: {
              username: req.body.username,
              profilePicture: req.body.profilePicture,
              desc: req.body.desc,
              city: req.body.city,
            },
          });
          res.status(200).json("Account has been updated");
        } catch (err) {
          return res.status(500).json(err);
        }
      } else {
        try {
          await User.findByIdAndUpdate(req.body.userId, {
            $set: req.body,
          });
          res.status(200).json("Account has been updated");
        } catch (err) {
          return res.status(500).json(err);
        }
      }
    }
  }
});

//get search user
router.get("/search/:key", async (req, res) => {
  try {
    const userSearch = await User.find({
      $or: [
        {
          username: { $regex: req.params.key },
        },
        {
          city: { $regex: req.params.key },
        },
      ],
    });
    res.status(200).json(userSearch);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get all users
router.get("/listUser/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  try {
    if (user.isAdmin) {
      const users = await User.find();
      res.status(200).json(users);
    } else {
      res.status(500).json("you don't have admin");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});
module.exports = router;
