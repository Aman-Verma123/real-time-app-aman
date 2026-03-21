import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/auth.css";

import { Link, useNavigate } from "react-router-dom";



const Signup = () => {

 const navigate = useNavigate(); // ✅ ADD THIS


useEffect(() => {
  const token = localStorage.getItem("token");
  if(token){
    navigate("/");
  }
}, []);


  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const registerUser = async () => {

      if(!name || !email || !password){
    alert("All fields are required");
    return;
      }


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

  const token = res.data.token;
      const user = res.data.user;

      // ✅ Store same as login
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));


      alert("User created successfully");
         navigate("/");

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
    <Link to="/login">Already have an account? <span className="button">Login here</span></Link>
    </div>

    </>
  );
};

export default Signup;