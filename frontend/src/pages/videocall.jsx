import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MdCallEnd } from "react-icons/md";
import { FaMicrophone, FaVideo } from "react-icons/fa";
import "../css/videocall.css";
import { socket } from "../socket";

const Videocall = () => {

const location = useLocation();
const selectedUser = location.state?.user;

const [incomingCall,setIncomingCall] = useState(null);

const myVideo = useRef(null);
const userVideo = useRef(null);

const peerRef = useRef(null);
const streamRef = useRef(null);

const currentUser = JSON.parse(localStorage.getItem("user"));


// ICE SERVERS (STUN + TURN)
const iceConfig = {
iceServers:[
{ urls:"stun:stun.l.google.com:19302" },
{
urls:"turn:openrelay.metered.ca:80",
username:"openrelayproject",
credential:"openrelayproject"
},
{
urls:"turn:openrelay.metered.ca:443",
username:"openrelayproject",
credential:"openrelayproject"
}
]
};


// CREATE PEER
const createPeer = (targetUser) => {

peerRef.current = new RTCPeerConnection(iceConfig);

streamRef.current.getTracks().forEach(track=>{
peerRef.current.addTrack(track,streamRef.current);
});

peerRef.current.ontrack = (event)=>{
if(userVideo.current){
userVideo.current.srcObject = event.streams[0];
}
};

peerRef.current.onicecandidate = (event)=>{

if(event.candidate){

socket.emit("ice-candidate",{
to:targetUser,
candidate:event.candidate
});

}

};

peerRef.current.onconnectionstatechange = ()=>{
console.log("Connection State:",peerRef.current.connectionState);
};

};


// START CAMERA
useEffect(()=>{

socket.emit("userOnline",currentUser._id);

const startCamera = async ()=>{

const stream = await navigator.mediaDevices.getUserMedia({
video:true,
audio:true
});

streamRef.current = stream;

if(myVideo.current){
myVideo.current.srcObject = stream;
}

};

startCamera();

},[]);


// START CALL
const startCall = async ()=>{

createPeer(selectedUser._id);

const offer = await peerRef.current.createOffer();

await peerRef.current.setLocalDescription(offer);

socket.emit("call-user",{
to:selectedUser._id,
offer,
from:currentUser._id
});

};


// ACCEPT CALL
const acceptCall = async ()=>{

const {from,offer} = incomingCall;

createPeer(from);

await peerRef.current.setRemoteDescription(offer);

const answer = await peerRef.current.createAnswer();

await peerRef.current.setLocalDescription(answer);

socket.emit("answer-call",{
to:from,
answer
});

setIncomingCall(null);

};


// REJECT CALL
const rejectCall = ()=>{
setIncomingCall(null);
};


// END CALL
const endCall = ()=>{

if(peerRef.current){
peerRef.current.close();
peerRef.current = null;
}

if(userVideo.current){
userVideo.current.srcObject = null;
}

};


// SOCKET EVENTS
useEffect(()=>{

socket.on("incoming-call",({from,offer})=>{

setIncomingCall({from,offer});

});


socket.on("call-accepted",async ({answer})=>{

await peerRef.current.setRemoteDescription(answer);

});


socket.on("ice-candidate",async ({candidate})=>{

try{

await peerRef.current.addIceCandidate(candidate);

}catch(err){
console.log(err);
}

});


return ()=>{

socket.off("incoming-call");
socket.off("call-accepted");
socket.off("ice-candidate");

};

},[]);



return(

<>

{incomingCall && (

<div className="incoming-call-popup">

<h3>Incoming Video Call</h3>

<div className="popup-buttons">

<button className="accept-btn" onClick={acceptCall}>
Accept
</button>

<button className="reject-btn" onClick={rejectCall}>
Reject
</button>

</div>

</div>

)}


<div className="video-page">

<div className="video-navbar">

<h2>Video Call</h2>

<div className="user-info">

<img src={selectedUser?.img} alt="user"/>

<span>{selectedUser?.name}</span>

</div>

</div>


<div className="video-area">

<div className="receiver-box">

<video
ref={userVideo}
autoPlay
playsInline
className="video-placeholder"
/>

</div>


<div className="sender-box">

<video
ref={myVideo}
autoPlay
playsInline
muted
className="video-placeholder small"
/>

</div>

</div>


<div className="call-controls">

<button className="call-btn blue" onClick={startCall}>
<FaVideo/>
</button>

<button className="call-btn gray">
<FaMicrophone/>
</button>

<button className="call-btn red" onClick={endCall}>
<MdCallEnd/>
</button>

</div>

</div>

</>

);

};

export default Videocall;