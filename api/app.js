const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(bodyParser.json());
app.use(cors());
//middleware
require("dotenv/config");

app.get("/", (req, res) => {
  res.send("we are go home");
});

//import router
const routerUser = require("./routes/user");
const routerConversation = require("./routes/conversations");
const routerMessage = require("./routes/message");
const routerPost = require("./routes/posts");
const routerComment = require("./routes/comment");
const routerNotification = require("./routes/notifications");
app.use("/users", routerUser);

app.use("/conversations", routerConversation);
app.use("/messages", routerMessage);
app.use("/posts", routerPost);
app.use("/comments", routerComment);
app.use("/notifications", routerNotification);
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => console.log("Connect database "))
  .catch((err) => console.log(err));

app.listen(5000, () => console.log("server is running with port 5000"));
