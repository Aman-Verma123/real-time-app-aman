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

// ✅ SAME SECRET EVERYWHERE
const JWT_SECRET = "secretkey";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(cors());
app.use(express.json());

// ✅ MongoDB (later .env me daalna)
mongoose
  .connect("mongodb+srv://amanwebsitedeveloper_db_user:aman123@cluster0.s63uypv.mongodb.net/chatappdb")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// ================= SOCKET =================

let onlineUsers = [];

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("userOnline", (userId) => {
    const exists = onlineUsers.find(u => u.userId === userId);

    if (!exists) {
      onlineUsers.push({ userId, socketId: socket.id });
    }

    io.emit("onlineUsers", onlineUsers);
  });

  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", data);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  // VIDEO CALL
  socket.on("call-user", ({ to, offer, from }) => {
    const user = onlineUsers.find(u => u.userId === to);
    if (user) {
      io.to(user.socketId).emit("incoming-call", { from, offer });
    }
  });

  socket.on("answer-call", ({ to, answer }) => {
    const user = onlineUsers.find(u => u.userId === to);
    if (user) {
      io.to(user.socketId).emit("call-accepted", { answer });
    }
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    const user = onlineUsers.find(u => u.userId === to);
    if (user) {
      io.to(user.socketId).emit("ice-candidate", { candidate });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);
    io.emit("onlineUsers", onlineUsers);
  });

});

// ================= ROUTES =================

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ✅ USERS (NO PASSWORD)
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ================= REGISTER =================

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // ✅ Check existing
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Hash
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      img: "https://i.pravatar.cc/150"
    });

    await newUser.save();

    // ✅ TOKEN (FIXED)
    const token = jwt.sign(
      { userId: newUser._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        img: newUser.img
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Register failed" });
  }
});

// ================= LOGIN =================

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

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
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Remove password
    const { password: _, ...safeUser } = user._doc;

    res.json({
      token,
      user: safeUser
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ================= MESSAGES =================

app.post("/send-message", async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    const newMessage = new Message({ senderId, receiverId, text });
    await newMessage.save();

    res.json(newMessage);
  } catch {
    res.status(500).json({ error: "Message not saved" });
  }
});

app.get("/messages", async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch {
    res.status(500).json({ error: "Messages fetch failed" });
  }
});

// ================= USER =================

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/users/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).select("-password");

  res.json(user);
});

app.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

// ================= DELETE MESSAGE =================

app.delete("/messages/:id", async (req, res) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    res.json(msg);
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ================= START =================

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});