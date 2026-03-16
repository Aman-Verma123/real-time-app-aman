import React from "react";
import "../css/rightsidebar.css";

const Rightsidebar = ({ selectedUser, showRightSidebar, setShowRightSidebar, onlineUsers }) => {

const isOnline = selectedUser && onlineUsers 
  ? onlineUsers.some(u => u.userId === selectedUser._id) 
  : false;


  if (!selectedUser || !showRightSidebar) return null;


  return (
    <div className={`right-sidebar ${showRightSidebar ? "open" : ""}`}>
      {/* Close button */}
      <button onClick={() => setShowRightSidebar(false)} className="close-btn">✖</button>

      {/* Profile Top */}
      <div className="profile-top">
        <div className="profile-img-box">
          <img src={selectedUser.img || "https://i.pravatar.cc/150"} alt={selectedUser.name} />
          {isOnline && <span className="online-dot"></span>}
        </div>

        <h2 className="profile-name">{selectedUser.name}</h2>

        <p className={`profile-status ${isOnline ? "online" : "offline"}`}>
          {isOnline ? "Online" : "Offline"}
        </p>
      </div>

      {/* User Details */}
      <div className="profile-details">
        <div className="detail-box">
          <span className="detail-title">User ID</span>
          <p>{selectedUser._id}</p>
        </div>

        <div className="detail-box">
          <span className="detail-title">Online Status</span>
          <p className={`profile-status ${isOnline ? "online" : "offline"}`}>
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>

        <div className="detail-box">
          <span className="detail-title">Bio</span>
          <p>{selectedUser.bio || "Hey there! I am using Aman ChatApp 🚀"}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="profile-actions">
        <button className="message-btn">Send Message</button>
      </div>
    </div>
  );
};

export default Rightsidebar;