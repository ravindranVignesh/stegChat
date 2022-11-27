import FileSaver from "file-saver";
import { io } from "socket.io-client";
import { encode, decode } from "./steg";
import { getReceivedBubble, getSentBubble, getStegMarker } from "./dom-util";
import { downloadFile, getArrayBuffer, getTimeString } from "./util";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const userName = urlParams.get("username");
const roomId = urlParams.get("roomId");

const roomLabel = document.getElementById("room-id");
const leaveRoomButton = document.getElementById("leave-room-btn");
const messageContainer = document.getElementById("message-container");
const messageInput = document.getElementById("message-input");
const wavFileInput = document.getElementById("wav-file");
const secretMessageInput = document.getElementById("secret-message");
const encodeBtn = document.getElementById("btn-encode");
const chatMsgForm = document.getElementById("form");

roomLabel.innerText = roomId;

const socket = io();
// join the room
socket.emit("joinRoom", { userName, roomId });

// leave room
leaveRoomButton.addEventListener("click", () => {
  socket.emit("leaveRoom", { userName, roomId });
  window.location = "../index.html";
});

// receiving infoMessages
socket.on("infoMessage", (message) => {
  displayInfo(message);
});

// receiveing chatMessages
socket.on("chatMessage", (msgObject) => {
  displayMessage(msgObject);
});

// receiveing audioFiles
socket.on("audioFile", (fileMessageObject) => {
  const { sender, timeStamp, fileName } = fileMessageObject;
  const arrayBuffer = fileMessageObject.body;
  const secretMessage = decode(arrayBuffer);
  displayStegMessage({ sender, timeStamp, textMessage: secretMessage });
  if (sender !== userName) {
    downloadFile(arrayBuffer, fileName);
  }
});

// sending chatMessages
chatMsgForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let timeStamp = getTimeString(new Date());
  const textMessage = messageInput.value;
  if (textMessage.trim().length == 0) {
    messageInput.value = "";
    return;
  }
  let msgObject = {
    textMessage,
    timeStamp,
    sender: userName,
  };
  socket.emit("chatMessage", msgObject);
  messageInput.value = "";
  messageInput.focus();
});

// sending audioFiles
encodeBtn.addEventListener("click", () => {
  encodeAndSend();
  messageInput.focus();
});

secretMessageInput.addEventListener("keypress", (e) => {
  if (e.key == "Enter") {
    encodeAndSend();
    messageInput.focus();
  }
});

const encodeAndSend = async () => {
  const timeStamp = getTimeString(new Date());
  const secretMessage = secretMessageInput.value;
  if (secretMessage.trim().length === 0) {
    console.log(`enter message to proceed with encoding`);
    secretMessageInput.value = "";
    return;
  }

  if (wavFileInput.files === undefined || wavFileInput.files.length === 0) {
    console.log(`select files to proceed with encoding`);
    return;
  }

  const fileFullName = wavFileInput.files[0].name;
  const fileName = fileFullName.slice(0, fileFullName.search(".wav"));
  const arrayBuffer = await getArrayBuffer(wavFileInput);
  const encodedBuffer = encode(arrayBuffer, secretMessage);
  const encodedBlob = new Blob([encodedBuffer], { type: "audio/wav" });
  const encodedFile = new File([encodedBlob], `${fileName}-encoded.wav`, {
    type: "audio/wav",
  });
  FileSaver.saveAs(encodedBlob, `${fileName}-encoded.wav`);

  const fileMessageObject = {
    sender: userName,
    timeStamp,
    body: encodedFile,
    fileName: encodedFile.name,
  };
  socket.emit("audioFile", fileMessageObject);

  document.getElementById("wav-file-name").innerText = "";
  wavFileInput.value = "";
  secretMessageInput.value = "";
};

// DOM functions
const displayInfo = (message) => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("info-message-wrapper");
  const body = document.createElement("span");
  body.classList.add("info-msg-body");
  body.innerText = message;
  wrapper.append(body);
  messageContainer.append(wrapper);
  messageContainer.scrollTop = messageContainer.scrollHeight;
};

const displayMessage = (msgObject) => {
  let { sender } = msgObject;
  let bubble =
    sender == userName
      ? getSentBubble(msgObject)
      : getReceivedBubble(msgObject);
  messageContainer.append(bubble);
  messageContainer.scrollTop = messageContainer.scrollHeight;
};

const displayStegMessage = (msgObject) => {
  let { sender } = msgObject;
  let bubble =
    sender == userName
      ? getSentBubble(msgObject)
      : getReceivedBubble(msgObject);
  let msgMarker = getStegMarker();
  bubble.children[0].children[1].prepend(msgMarker);
  messageContainer.append(bubble);
  messageContainer.scrollTop = messageContainer.scrollHeight;
};
