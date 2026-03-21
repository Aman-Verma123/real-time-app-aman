import React, { useState } from "react";
import axios from "axios";
import "../css/auth.css";
import { Link } from "react-router-dom";

const Signup = () => {

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const registerUser = async () => {

    try{

      const res = await axios.post(
        // "http://localhost:5000/register",
        "https://real-time-app-aman-backend.onrender.com/register",
        {
          name,
          email,
          password
        }
      );

      alert("User created successfully");

    }
    catch(err){
      console.log(err);
      alert("Register failed");
    }

  };

  return (
    <>
    <div className="auth_page">
      
    <div className="auth-container">

      <h2>Create Account</h2>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button onClick={registerUser}>
        Sign Up
      </button>


    </div>
    </div>
    <Link to="/login">Already have an account? <span className="button">Login here</span></Link>

    </>
  );
};

export default Signup;