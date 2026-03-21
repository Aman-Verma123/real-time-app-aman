import React, { useState } from "react";
import axios from "axios";
import "../css/auth.css";
// import Link 
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";




const Login = () => {
  const navigate = useNavigate();



  useEffect(() => {
    const token = localStorage.getItem("token");
    if(token){
      navigate("/");
    }
  }, []);
  

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const loginUser = async () => {


  if(!email || !password){
    alert("All fields are required");
    return;
  }

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

      // window.location.href="/";
      navigate("/");

    }
    catch(err){

      console.log(err);
      // alert("Login failed");
      alert(err.response?.data?.message || "Login failed");

    }

  };

  return (
    <>
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
      {/* signUp direct link  */}

  <Link to="/sign">Don't have an account? <span className="button">Sign up here</span></Link>
    </div>
    </div>
</> 

);
};

export default Login;