import React, { useState } from "react";
import axios from "axios";
import "../css/auth.css";
const Login = () => {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const loginUser = async () => {

    try{

      const res = await axios.post(
        "https://real-time-app-aman-backend.onrender.com/login",
        {
          email,
          password
        }
      );

      const token = res.data.token;
      const user = res.data.user;

      localStorage.setItem("token",token);
      localStorage.setItem("user",JSON.stringify(user));

      alert("Login successful");

      window.location.href="/";

    }
    catch(err){

      console.log(err);
      alert("Login failed");

    }

  };

  return (
    <div className="auth_page">
      
    <div className="auth-container">

      <h2>Login</h2>

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

      <button onClick={loginUser}>
        Login
      </button>

    </div>
    </div>
  );
};

export default Login;