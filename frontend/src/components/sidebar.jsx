// import React from "react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import "../css/sidebar.css";


const Sidebar = ({
  users,
  setSelectedUser,
  showSidebar,
  setShowSidebar,
  onlineUsers,
  unreadUser,
  setUnreadUser
}) => {

  const navigate = useNavigate();

  

  // socket listener for receiving messages and updating unread count
  // useEffect(() => {

  //   socket.on("receive_message", (data) => {

  //     const senderId = data.senderId;

  //     setUnreadMessages((oldData) => {

  //       const currentCount = oldData[senderId] || 0;

  //       return {
  //         ...oldData,
  //         [senderId]: currentCount + 1
  //       };

  //     });

  //   });

  // }, []);




  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const currentUser = JSON.parse(localStorage.getItem("user"));

  // online user ids banaye
  const onlineUserIds = onlineUsers.map((u) => u.userId);

  return (


    <div className={`sidebar w-72 h-screen bg-slate-950 text-white flex flex-col border-r border-slate-800 ${showSidebar ? "open" : ""}`}>

      {/* Close Button Mobile */}
      <button
        onClick={() => setShowSidebar(false)}
        className="md:hidden p-2 text-white sidebar-close-btn"
      >
        ✖
      </button>

      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <h1 className="text-xl font-bold text-blue-600 slide_heading">
          Aman ChatApp
        </h1>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="flex items-center bg-slate-800 px-3 py-2 shadow-inner search_box">
          <span className="text-gray-400 mr-2 text-sm search_icon">🔍</span>

          <input
            type="text"
            placeholder="Search user..."
            className="bg-transparent outline-none text-sm w-full placeholder-gray-400 search_input"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-2">


        {console.log("Online Users:", onlineUsers)}


        {users
          .filter((user) => user._id !== currentUser._id)
          .map((user) => {

            // simple online check
            const isOnline = onlineUserIds.includes(user._id);

            return (
              // user box par click karne par selected user set karo, sidebar band karo, aur unread count reset karo
              <div
                key={user._id}
                onClick={() => {
                  setSelectedUser(user);
                  setShowSidebar(false);
                  setUnreadUser(null);
                }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition cursor-pointer users_box"
              >

                {/* Avatar */}
                <div className="relative">

                  <img
                    src={user.img}
                    className="w-11 h-11 rounded-full object-cover"
                  />

                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full"></span>
                  )}

                </div>

                {/* User Info */}
                <div className="flex flex-col">

                  <div className="font-medium text-sm flex items-center gap-2">
                    {user.name}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${user._id}`);
                      }}
                      className="ml-2 text-gray-400 hover:text-blue-400"
                    >
                      <FaRegEdit />
                    </button>
                  </div>

                  <span
                    className={`text-xs ${isOnline ? "text-green-400" : "text-gray-400"}`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>

                </div>

                {/* <p className="text-gray-400 popup_msg">7</p> */}
                {unreadUser === user._id && (
                  <p className="bg-red-500 text-white text-xs px-2 py-1 rounded-full popup_msg">
                    New
                  </p>
                )}

              </div>

            );

          })}

      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800 logout_upper">

        <button
          onClick={handleLogout}
          className="w-full logout_btn py-2 rounded-lg font-semibold transition"
        >
          Logout
        </button>

      </div>

    </div>
  );
};

export default Sidebar;