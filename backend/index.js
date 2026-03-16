import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import http from "http";
import { Server } from "socket.io";

import User from "./user.model.js";
import Message from "./message.model.js";

const app = express();
const PORT = 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://amanwebsitedeveloper_db_user:aman123@cluster0.s63uypv.mongodb.net/chatappdb")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// ................................

let onlineUsers = [];

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("userOnline", (userId) => {

    const userExists = onlineUsers.find(
      (user) => user.userId === userId
    );

    if (!userExists) {
      onlineUsers.push({
        userId: userId,
        socketId: socket.id
      });
    }

    console.log("Online Users:", onlineUsers);

    io.emit("onlineUsers", onlineUsers);

  });


  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", data);
  });

// typing
  socket.on("typing", (data) => {
  socket.broadcast.emit("typing", data);
});




// VIDEO CALL EVENTS

// user A call karega
socket.on("call-user", ({ to, offer, from }) => {

  const user = onlineUsers.find(
    (u) => u.userId === to
  );

  if (user) {
    io.to(user.socketId).emit("incoming-call", {
      from,
      offer
    });
  }

});


// user B answer karega
socket.on("answer-call", ({ to, answer }) => {

  const user = onlineUsers.find(
    (u) => u.userId === to
  );

  if (user) {
    io.to(user.socketId).emit("call-accepted", {
      answer
    });
  }

});


// ICE candidate exchange
socket.on("ice-candidate", ({ to, candidate }) => {

  const user = onlineUsers.find(
    (u) => u.userId === to
  );

  if (user) {
    io.to(user.socketId).emit("ice-candidate", {
      candidate
    });
  }

});



  socket.on("disconnect", () => {

    console.log("User disconnected:", socket.id);

    onlineUsers = onlineUsers.filter(
      (user) => user.socketId !== socket.id
    );

    io.emit("onlineUsers", onlineUsers);

  });

});



app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});






app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});



app.post("/send-message", async (req, res) => {

  try {
    const { senderId, receiverId, text } = req.body;
    const newMessage = new Message({
      senderId,
      receiverId,
      text
    });
    await newMessage.save();
    console.log("Message saved:", newMessage);
    res.json(newMessage);
}

catch (error) {
    console.log(error);
    res.status(500).json({ error: "Message not saved" });
  }});





  app.post("/register", async (req, res) => {

  try {

    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      img: "https://i.pravatar.cc/150"
    });

    await newUser.save();

    res.json({ message: "User created" });

  } 
  catch (error) {
    console.log(error);
    res.status(500).json({ error: "Register failed" });
}});


app.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user
    });

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Login failed" });

  }

});


app.get("/messages", async (req, res) => {

  try {

    const { senderId, receiverId } = req.query;

    // const messages = await Message.find({
    //   senderId: senderId, 
    //   receiverId: receiverId
    // });
//     A → B
// B → A
const messages = await Message.find({
  $or: [
    { senderId: senderId, receiverId: receiverId },
    { senderId: receiverId, receiverId: senderId }
  ]
}).sort({ createdAt: 1 });

    res.json(messages);

  } catch (error) {

    console.log(error);
    res.status(500).json({ error: "Messages fetch failed" });

  }

});


app.get("/users/:id", async (req, res) => {
  try {

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});


// update user
app.put("/users/:id", async (req,res)=>{

const updatedUser = await User.findByIdAndUpdate(
 req.params.id,
 req.body,
 {new:true}
);

res.json(updatedUser);

});

app.delete("/users/:id", async (req,res)=>{

await User.findByIdAndDelete(req.params.id);

res.json({message:"User deleted"});

});


// DELETE /messages/:id
app.delete("/messages/:id", async (req, res) => {
  const messageId = req.params.id;

  try {
    const deletedMessage = await Message.findByIdAndDelete(messageId);
    res.json(deletedMessage);
  } catch (err) {
    res.status(500).json({ error: "Cannot delete message" });
  }
});


server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});