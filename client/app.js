import FileSaver from "file-saver";
import { io } from "socket.io-client";
import { encode, decode } from "./steg";

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
const form = document.getElementById("form");

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

const downloadFile = (arrayBuffer, fileName) => {
  const blob = new Blob([arrayBuffer], { type: "audio/wav" });
  FileSaver.saveAs(blob, fileName);
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let timeStamp = new Date().toString();
  const textMessage = messageInput.value;
  if (textMessage == "") return;
  let msgObject = {
    textMessage,
    timeStamp,
    sender: userName,
  };
  messageInput.value = "";
  // emit message to server
  socket.emit("chatMessage", msgObject);
});

const displayMessage = (msgObject) => {
  let { sender } = msgObject;
  let bubble =
    sender == userName
      ? getSentBubble(msgObject)
      : getReceivedBubble(msgObject);

  messageContainer.append(bubble);
};

const getSentBubble = (msgObject) => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("sent-bubble-wrapper");
  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble", "msg-sent");
  const meta = document.createElement("div");
  meta.classList.add("msg-meta", "msg-meta-sent");
  let nametag = document.createElement("span");
  nametag.classList.add("sender-nametag");
  let time = document.createElement("span");
  time.classList.add("time-stamp");
  const body = document.createElement("div");
  body.classList.add("msg-body");

  nametag.innerText = "You";
  time.innerText = msgObject.timeStamp;
  body.innerText = msgObject.textMessage;
  meta.append(nametag);
  meta.append(time);
  bubble.append(meta);
  bubble.append(body);
  wrapper.append(bubble);

  return wrapper;
};

const getReceivedBubble = (msgObject) => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("received-bubble-wrapper");
  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble", "msg-received");
  const meta = document.createElement("div");
  meta.classList.add("msg-meta", "msg-meta-received");
  let nametag = document.createElement("span");
  nametag.classList.add("sender-nametag");
  let time = document.createElement("span");
  time.classList.add("time-stamp");
  const body = document.createElement("div");
  body.classList.add("msg-body");

  nametag.innerText = msgObject.sender;
  time.innerText = msgObject.timeStamp;
  body.innerText = msgObject.textMessage;
  meta.append(nametag);
  meta.append(time);
  bubble.append(meta);
  bubble.append(body);
  wrapper.append(bubble);

  return wrapper;
};

const displayInfo = (message) => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("info-message-wrapper");
  const body = document.createElement("span");
  body.classList.add("info-msg-body");
  body.innerText = message;
  wrapper.append(body);

  messageContainer.append(wrapper);
};

const displayStegMessage = (msgObject) => {
  let { sender } = msgObject;
  let bubble =
    sender == userName
      ? getSentBubble(msgObject)
      : getReceivedBubble(msgObject);

  let msgMarker = document.createElement("div");
  msgMarker.classList.add("steg-msg-marker");
  msgMarker.innerText = "Steganographic Message";

  bubble.children[0].children[1].prepend(msgMarker);

  messageContainer.append(bubble);
};

// -------------------------------------------------

encodeBtn.addEventListener("click", async () => {
  if (wavFileInput.files === undefined || wavFileInput.files.length === 0) {
    console.log(`select files to proceed with encoding`);
    return;
  }
  const timeStamp = new Date().toString();
  const fileFullName = wavFileInput.files[0].name;
  const fileName = fileFullName.slice(0, fileFullName.search(".wav"));
  const secretMessage = secretMessageInput.value;
  const arrayBuffer = await getArrayBuffer(wavFileInput);
  const encodedBuffer = encode(arrayBuffer, secretMessage);
  const encodedBlob = new Blob([encodedBuffer], { type: "audio/wav" });
  const encodedFile = new File([encodedBlob], `${fileName}-encoded.wav`, {
    type: "audio/wav",
  });
  FileSaver.saveAs(encodedBlob, `${fileName}-encoded.wav`);
  // send encodedFile via socket
  const fileMessageObject = {
    sender: userName,
    timeStamp,
    body: encodedFile,
    fileName: encodedFile.name,
  };
  socket.emit("audioFile", fileMessageObject);

  verifySteg(wavFileInput);
});

const verifySteg = async (wavFileInput) => {
  const message = document.getElementById("secret-message").value;
  const arrayBuffer = await getArrayBuffer(wavFileInput);
  const encodedBuffer = encode(arrayBuffer, message);
  const result = decode(encodedBuffer);
  console.log(`result is :${result}`);
  console.log(message === result);
};

const getArrayBuffer = async (wavFileInput) => {
  if (wavFileInput.files == undefined || wavFileInput.files.length == 0) return;
  let file = wavFileInput.files[0];
  const arrBuff = await file.arrayBuffer();
  return arrBuff;
};

wavFileInput.onchange = () => {
  const fileNameLabel = document.getElementById("wav-file-name");
  if (wavFileInput.files === undefined || wavFileInput.files.length === 0) {
    fileNameLabel.innerText = "";
    return;
  }
  const fileFullName = wavFileInput.files[0].name;
  const fileName = fileFullName.slice(0, fileFullName.search(".wav"));
  fileNameLabel.innerText = fileName;
};
