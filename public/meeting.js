const socket = io("/room");
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;
const myPeer = new Peer(undefined, { host: "peerjs-server.herokuapp.com", secure: true, port: 443, });
var peers = {};

let myVideoStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    // Receive calls
    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {      
            addVideoStream(video, userVideoStream);
        });
    });
    socket.on('user-connected', (userId, name) => {
        connectToNewUser(userId, stream, name);
    })
    socket.on('user-disconnected', userId => {
        if (peers[userId]) {
            peers[userId].close();
            peers[userId].destroy();
            delete peers[userId];
        }
    });
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id, FIRST_NAME);
})

socket.on('updateUsersList', (users) => {
    var count = 0;
    var ul = document.createElement('ul');

    users.forEach((user) => {
      var li = document.createElement('li');
      li.innerHTML = user;
      ul.appendChild(li);
      count++;
    });
    var header = document.getElementById("participants-header");
    header.innerHTML = "Participants (" + count + ")"; 
    var window = document.getElementById("participants-window");
    window.innerHTML = "";
    window.appendChild(ul);
})

document.getElementById('form').addEventListener('submit', e => {
    const input = document.getElementById('chat-input');
    e.preventDefault();
    if (input.value) {
        socket.emit('send-chat-message', input.value);
        input.value = '';
    }
});

// On chat-message event, append the msg to the chat-window
socket.on('chat-message', (msg, name) => {
    const chatWindow = document.getElementById('chat-window');
    const item = document.createElement('li');  
    item.innerHTML = name + '<br/>' + msg;
    chatWindow.append(item);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Make calls when new users connect to room
function connectToNewUser(userId, stream, name) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    });
    peers[userId] = call;
}

function addVideoStream(video, stream) {    
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play();
        videoGrid.append(video);
    })
}

function makeLabel(label) {
    var videoLabel = document.createElement('div');
    videoLabel.setAttribute('class', 'videoLabel');
    videoLabel.appendChild(document.createTextNode(label));
    return videoLabel;
}

function muteUnmute() {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

function setMuteButton() {
    const html = `
        <i class="fa-solid fa-microphone"></i>
        <span>Mute</span>
    `;
    document.querySelector('.main-mute-button').innerHTML = html;
}

function setUnmuteButton() {
    const html = `
        <i class="unmute fa-solid fa-microphone-slash"></i>
        <span>Mute</span>
    `;
    document.querySelector('.main-mute-button').innerHTML = html;
}

function playStop() {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        setPlayVideo();
        myVideoStream.getVideoTracks()[0].enabled = false;
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

function setPlayVideo() {
    const html = `
        <i class="stop fa-solid fa-video-slash"></i>
        <span>Play Video</span>
    `;
    document.querySelector('.main-video-button').innerHTML = html;
}

function setStopVideo() {
    const html = `
        <i class="fa-solid fa-video"></i>
        <span>Play Video</span>
    `;
    document.querySelector('.main-video-button').innerHTML = html;
}

function copyLink() {
    var copyText = document.getElementById("link");
    copyText.select();
    copyText.setSelectionRange(0,99999);
    navigator.clipboard.writeText(copyText.value);
    alert("Invite link copied to clipboard");
}

function copyCode() {
    var copyText = document.getElementById("code");
    copyText.select();
    copyText.setSelectionRange(0,99999);
    navigator.clipboard.writeText(copyText.value);
    alert("Invite code copied to clipboard");
}

function toggleParticipants() {
    document.getElementById("chat").style.display = "none";
    document.getElementById("participants").style.display = "flex";
}

function toggleChat() {
    document.getElementById("participants").style.display = "none";
    document.getElementById("chat").style.display = "flex";
}


function toggleExpand() {
    try{ 
        document.querySelector(".main-left").setAttribute("class", "main-left-alt");
        document.querySelector(".main-right").setAttribute("class", "main-right-alt"); 
        setExpand();
    } catch (exception) {
        document.querySelector(".main-left-alt").setAttribute("class", "main-left");
        document.querySelector(".main-right-alt").setAttribute("class", "main-right");
        setShrink();
        return;
    }
}

function setExpand() {
    const html = `
        <i class="fa-solid fa-compress"></i>
        <span>Shrink</span>
    `;
    document.querySelector('.main-expand-button').innerHTML = html;
}

function setShrink() {
    const html = `
        <i class="fa-solid fa-expand"></i>
        <span>Expand</span>
    `;
    document.querySelector('.main-expand-button').innerHTML = html;
}

function leaveMeeting() {
    window.location.href = "/meeting";
}

function isCreatingRoom() {
    // Check
    document.getElementById("create").checked = true;
}

// Invite Button popup
var invitePopup = document.getElementById("invite");
invitePopup.setAttribute("visibility", "visible");
var link = document.getElementById("link");
link.setAttribute("value", window.location.href);

// Settings button popup
var settingsPopup = document.getElementById("settings");
settingsPopup.setAttribute("visibility", "visible");


// Button click events
document.querySelector('.main-mute-button').addEventListener('click', muteUnmute);
document.querySelector('.main-video-button').addEventListener('click', playStop);
document.querySelector('.main-participants-button').addEventListener('click', toggleParticipants);
document.querySelector('.main-chat-button').addEventListener('click', toggleChat);
document.querySelector('.main-expand-button').addEventListener('click', toggleExpand);
document.querySelector('.main-leave-button').addEventListener('click', leaveMeeting);