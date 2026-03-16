import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Sidebar from "../components/sidebar";
import Chatcontainer from "../components/chatcontainer";
import Rightsidebar from "../components/rightsidebar";
// socket se connect karne ke liye
import { io } from "socket.io-client";

// const socket = io("http://localhost:5000");
const socket = io("https://real-time-app-aman-backend.onrender.com");
// ...............................

const Home = () => {

  const [onlineUsers, setOnlineUsers] = useState([]); // ✅ declare first

  const [selectedUser, setSelectedUser] = useState(null);

 const isOnline = selectedUser 
  ? onlineUsers.some(u => u.userId === selectedUser._id) 
  : false;

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

// const [onlineUsers, setOnlineUsers] = useState([]);
const [onlineUserIds, setOnlineUserIds] = useState([]);


  const [showSidebar, setShowSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);

  const [unreadUser, setUnreadUser] = useState(null);


//  online users ko receive karne ke liye socket se 
useEffect(()=>{

socket.on("onlineUsers",(users)=>{

console.log("Online Users:",users);

setOnlineUsers(users);

// simple id list
const ids = users.map((u)=> u.userId);

setOnlineUserIds(ids);



});

},[]);
// ...............................





  // server ko bata raha hu ki user online hai

useEffect(()=>{

const currentUser = JSON.parse(localStorage.getItem("user"));

if(currentUser){
 socket.emit("userOnline", currentUser._id);
}

},[]);
// ............................................






  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }

  }, [navigate]);

  useEffect(() => {

    // axios.get("http://localhost:5000/users")
      axios.get("https://real-time-app-aman-backend.onrender.com/users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

  }, []);

  return (
    // <div className="chat-layout">
    //   <Sidebar users={users} setSelectedUser={setSelectedUser} />
    //   <Chatcontainer selectedUser={selectedUser} />
    //   {selectedUser ? <Rightsidebar selectedUser={selectedUser} /> : null}
    // </div>
    // responsive layout with toggle for sidebars



    <div className="chat-layout">

  <Sidebar
    users={users}
    setSelectedUser={setSelectedUser}
    showSidebar={showSidebar}
    setShowSidebar={setShowSidebar}
      onlineUsers={onlineUsers}
     unreadUser={unreadUser}
      setUnreadUser={setUnreadUser}
  />

  <Chatcontainer
    selectedUser={selectedUser}
    setShowSidebar={setShowSidebar}
    setShowRightSidebar={setShowRightSidebar}
     onlineUsers={onlineUsers}
      setUnreadUser={setUnreadUser}
  />

  <Rightsidebar
    selectedUser={selectedUser}
    showRightSidebar={showRightSidebar}
    setShowRightSidebar={setShowRightSidebar}
  onlineUsers={onlineUsers || []} 
  />

</div>
  );
};

export default Home;