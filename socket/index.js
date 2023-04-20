const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    userId !== null &&
    users.push({ userId, socketId });
};

//get your friend receiver
const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

let userList = [];
const addNewUser01 = (username, socketId) => {
  !userList.some((user) => user.username === username) &&
    userList.push({ username, socketId });
};

const removeUser01 = (socketId) => {
  userList = userList.filter((user) => user.socketId !== socketId);
};

const getUser01 = (username) => {
  return userList.find((user) => user.username === username);
};

//when connected
io.on("connection", (socket) => {
  console.log("a user connected");

  //get userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);

    io.emit("getUsers", users);
  });

  socket.on("addNewUser01", (username) => {
    addNewUser01(username, socket.id);
    // io.emit("getUsers01", userList);
  });

  // socket.on("demoSocket", (data) => {
  //   io.emit("nguyenluan", data);
  // });

  //get and send message

  socket.on("sendMessage", ({ senderId, receiverId, text, imageMes }) => {
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getMessages", {
      senderId,
      text,
      imageMes,
    });
  });

  socket.on(
    "sendNotification",
    ({ senderName, receiverName, type, senderImg, ...rest }) => {
      const user = getUser01(receiverName);
      io.to(user?.socketId).emit("getNotifications", {
        senderName,
        type,
        senderImg,
        ...rest,
      });
    }
  );

  //when disconnected
  socket.on("disconnect", () => {
    console.log("a user disconnected");
    removeUser(socket.id);
    removeUser01(socket.id);
    io.emit("getUsers", users);
    // io.emit("getUsers01", userList);
  });
});
