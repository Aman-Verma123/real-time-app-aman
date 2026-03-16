import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  text: String
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;