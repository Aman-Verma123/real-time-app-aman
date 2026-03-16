import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/profile.css";
import { IoChevronBackCircle } from "react-icons/io5";

const Profile = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [user,setUser] = useState({});
  const [editMode,setEditMode] = useState(false);

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");

  useEffect(()=>{

    const fetchUser = async () => {

      try{

        const res = await axios.get(`http://localhost:5000/users/${id}`);

        setUser(res.data);
        setName(res.data.name);
        setEmail(res.data.email);

      }catch(err){
        console.log(err);
      }

    }

    fetchUser();

  },[id]);


  const handleUpdate = async () => {

    try{

      const res = await axios.put(`http://localhost:5000/users/${id}`,{
        name,
        email
      });

      setUser(res.data);
      setEditMode(false);

    }catch(err){
      console.log(err);
    }

  }


  const handleDelete = async () => {

    const confirmDelete = window.confirm("Delete your account?");

    if(!confirmDelete) return;

    try{

      await axios.delete(`http://localhost:5000/users/${id}`);

      alert("Account deleted");

      navigate("/login");

    }catch(err){
      console.log(err);
    }

  }


  return (

    <div className="profile-container">

      <div className="profile-card">



<IoChevronBackCircle
  className="back-btn"
  onClick={() => navigate("/")}
/>



        <div className="profile-header">

          <img
            src={user.img || "https://i.pravatar.cc/150"}
            alt="profile"
            className="profile-img"
          />

          <h2>{user.name}</h2>
          <p>{user.email}</p>

        </div>


        <div className="profile-form">

          <label>Name</label>

          <input
            type="text"
            value={name}
            disabled={!editMode}
            onChange={(e)=>setName(e.target.value)}
          />

          <label>Email</label>

          <input
            type="email"
            value={email}
            disabled={!editMode}
            onChange={(e)=>setEmail(e.target.value)}
          />

        </div>


        <div className="profile-buttons">

          {!editMode ? (

            <button
              className="edit-btn"
              onClick={()=>setEditMode(true)}
            >
              Edit Profile
            </button>

          ) : (

            <button
              className="update-btn"
              onClick={handleUpdate}
            >
              Save Changes
            </button>

          )}

          <button
            className="delete-btn"
            onClick={handleDelete}
          >
            Delete Account
          </button>

        </div>

      </div>

    </div>

  )

}

export default Profile;