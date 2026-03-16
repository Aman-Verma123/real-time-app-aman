import React from "react";
import { useEffect } from "react";
import { SiImessage } from "react-icons/si";
import { MdDelete } from "react-icons/md";
import "../css/chatcontainer.css";
import { useState } from "react";
import axios from "axios";
import { MdMissedVideoCall } from "react-icons/md";
import { IoIosCall } from "react-icons/io";
// import link from react router dom for video call page
import { Link } from "react-router-dom";

import { socket } from "../socket";


// import { io } from "socket.io-client";
// const socket = io("http://localhost:5000");


// const Chatcontainer = ({ selectedUser }) => {
const Chatcontainer = ({ selectedUser, setShowSidebar, setShowRightSidebar, onlineUsers, setUnreadUser }) => {

  const [selectedMsgId, setSelectedMsgId] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [typingUser, setTypingUser] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));



  const deleteMessage = async (id) => {
    try {

      await axios.delete(`http://localhost:5000/messages/${id}`);

      // UI se message remove
      setMessages(messages.filter((msg) => msg._id !== id));

      setSelectedMsgId(null);

    } catch (err) {
      console.log(err);
    }
  };


  useEffect(() => {

    socket.emit("userOnline", currentUser._id);

  }, []);


  const onlineUserIds = onlineUsers.map((u) => u.userId);
  const isOnline = onlineUserIds.includes(selectedUser?._id);



  useEffect(() => {

    socket.on("typing", (data) => {

      if (data.senderId === selectedUser?._id) {
        // jo input me type kr rha he vo receiver ki window pr selected user show he to typing.. dikhao

        setTypingUser(true);

        setTimeout(() => {
          setTypingUser(false);
        }, 2100);

      }

    });

    return () => socket.off("typing");

  }, [selectedUser]);



  function scrollToBottom() {

    const chatBox = document.getElementById("chatBox");

    // if (chatBox) {
    //   chatBox.scrollTop = chatBox.scrollHeight;
    // }

    if (chatBox) {
      chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: "smooth"
      });
    }

  }




  // fetching message function: 
  useEffect(() => {

    const fetchMessages = async () => {


      const res = await axios.get(
        "http://localhost:5000/messages",
        {
          params: {
            senderId: currentUser._id,
            receiverId: selectedUser._id
          }
        }
      );

      setMessages(res.data);

      setTimeout(() => {
        scrollToBottom();
      }, 100);
      console.log("Fetched messages aaye he ye :", res.data);

    };

    if (selectedUser) {
      fetchMessages();
    }

  }, [selectedUser]);
  // --------------------------------------------------------

  useEffect(() => {

    socket.on("receiveMessage", (newMessage) => {

      if (newMessage.senderId === selectedUser?._id) {
        setMessages((prev) => [...prev, newMessage]);


        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }

      else {

        setUnreadUser(newMessage.senderId);

      }

    });

    return () => socket.off("receiveMessage");

  }, [selectedUser]);

  // --------------------------------------------------------

  const sendMessage = async () => {

    if (!message) return;

    const data = {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      text: message
    };

    try {

      const res = await axios.post(
        "http://localhost:5000/send-message",
        data
      );

      setMessages([...messages, res.data]);

      scrollToBottom();

      // realtime emit
      socket.emit("sendMessage", res.data);

      setMessage("");

    } catch (err) {
      console.log(err);
    }
  };

  // if (!selectedUser) {
  //   return (
  //     <div className="chat-container empty-chat">
  //       <h2>Select a user to start chatting</h2>
  //     </div>
  //   );
  // }
  if (!selectedUser) {
    return (
      <div className="chat-container empty-chat margindihe">

        <div className="chat-header empty-header radius">

          <button
            className="mobile-menu-btn"
            onClick={() => setShowSidebar(true)}
          >
            ☰
          </button>

          {/* <h2 className="chat-title">
            Select a user
          </h2> */}
          <div className="empty-text">
            <div className="empty-state">

              <div className="empty-icon">
                <SiImessage />
              </div>

              <h2 className="empty-title">
                Start a Conversation
              </h2>

              <p className="empty-subtitle">
                Choose a user from the sidebar to begin chatting
              </p>

            </div>
          </div>


        </div>

        <div className="empty-text">
          <h2>Select a user to start chatting</h2>
        </div>

      </div>
    );
  }



  return (
    <div className="chat-container">

      {/* Top Header */}
      <div className="chat-header">

        <button
          className="mobile-menu-btn"
          onClick={() => setShowSidebar(true)}
        >
          ☰
        </button>

        <div className="chat-user-info">

          <div className="chat-avatar">
            <img src={selectedUser.img} alt={selectedUser.name} />

            {/* {selectedUser.online && (
              <span className="chat-online-dot"></span>
            )} */}
            {isOnline && (
              <span className="chat-online-dot"></span>
            )}

          </div>

          <div>
            <h2 className="chat-title">
              Chat with {selectedUser.name}
            </h2>

            {/* <p className={`chat-status ${selectedUser.online ? "online" : "offline"}`}>
              {selectedUser.online ? "Online" : "Offline"}
            </p> */}
            <p className={`chat-status ${isOnline ? "online" : "offline"}`}>
              {isOnline ? "Online" : "Offline"}
            </p>


            {typingUser && (
              <p className="typing-indicator">
                {selectedUser.name} is typing...
              </p>
            )}


          </div>


        </div>
                 


           {/* video call/ audio call btns */}

           <div className="call-buttons">
  {/* <button onClick={startAudioCall}>📞</button>
  <button onClick={startVideoCall}>📹</button> */}
    <button ><IoIosCall /></button>
    <Link to="/videocall" state={{ user: selectedUser }}><button><MdMissedVideoCall /></button></Link>
  

</div>


{/* {selectedUser && (condition 2) selected user nhi mila to show nhi krega} */}
{selectedUser && (
  <button
    className="mobile-profile-btn"
    onClick={() => setShowRightSidebar(true)}
  >
    👤
  </button>
)}

      </div>

      {/* Messages Area */}
      <div className="chat-messages" id="chatBox">
        {messages.map((msg) => {

          const isMe = msg.senderId === currentUser._id;

          return (

            <div
              key={msg._id}
              className={isMe ? "message me" : "message other"}
            >

              <p>{msg.text}</p>

              {/* three dots only for my messages */}
              {isMe && (

                <div className="message-menu">

                  <button
                    className="dots-btn"
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === msg._id ? null : msg._id
                      )
                    }
                  >
                    ⋮
                  </button>

                  {openMenuId === msg._id && (

                    <div className="menu-dropdown">
                      <button className="delete-btn" onClick={() => deleteMessage(msg._id)}>
                        <MdDelete className="menu-icon" />
                        Delete 
                      </button>

                    </div>

                  )}

                </div>

              )}

            </div>

          );

        })}

      </div>

      {/* Message Input */}
      <div className="chat-input-box">


        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          // onChange={(e) => setMessage(e.target.value)}
          onChange={(e) => {
            setMessage(e.target.value);

            socket.emit("typing", {
              senderId: currentUser._id,
              receiverId: selectedUser._id
            });

          }}
        />

        <button onClick={sendMessage}>
          Send
        </button>

      </div>

    </div>
  );
};

export default Chatcontainer;