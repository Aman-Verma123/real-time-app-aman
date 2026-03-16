// import express from "express";
// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true },
//   online: { type: Boolean, default: false },
//   img: { type: String, default: "https://i.pravatar.cc/150?img=1" },
// })

// const User = mongoose.model("User", userSchema);

// export default User;
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  name: String,

  email: {
    type: String,
    unique: true
  },

  password: String,

  img: String,

  online: {
    type: Boolean,
    default: false
  }

});

const User = mongoose.model("User", userSchema);

export default User;