import FileSaver from "file-saver";
import { io } from "socket.io-client";
import { encode, decode } from "./steg";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const userName = urlParams.get("username");
const roomId = urlParams.get("roomId");

const messageContainer = document.getElementById("message-container");
const leaveRoomButton = document.getElementById("leave-room-btn");
const messageInput = document.getElementById("message-input");
const form = document.getElementById("form");

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
  let { textMessage } = msgObject;
  let sender = msgObject.userName;
  sender = sender == userName ? "You" : sender;
  displayMessage(sender, textMessage);
});

// receiveing audioFiles
socket.on("audioFile", (fileMessageObject) => {
  const sender = fileMessageObject.userName;
  if (sender === userName) return;
  const arrayBuffer = fileMessageObject.body;
  const fileName = fileMessageObject.fileName;
  const blob = new Blob([arrayBuffer], { type: "audio/wav" });
  FileSaver.saveAs(blob, fileName);
  const secretMessage = decode(arrayBuffer);
  console.log(secretMessage);
  displayMessage("Steganographic message", secretMessage);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const textMessage = messageInput.value;

  if (textMessage == "") return;
  // displayMessage(textMessage);
  messageInput.value = "";
  // emit message to server
  socket.emit("chatMessage", { userName, textMessage });
});

const displayMessage = (sender, textMessage) => {
  const div = document.createElement("div");
  div.classList.add("chat-message");
  div.innerHTML = `<p class="chat-message-header">${sender} <span>11:11</span> </p>
	<p class="chat-message-body">${textMessage}</p>
	`;
  if (sender == "You") {
    div.classList.add("self-message");
  }
  messageContainer.append(div);
};

const displayInfo = (message) => {
  const div = document.createElement("div");
  div.classList.add("info-message");
  div.innerHTML = `
	<p class="info-message-header">StegChat <span>11:11</span> </p>
	<p class="info-message-body">${message}</p>
	`;
  messageContainer.append(div);
};

// -------------------------------------------------

const encodeBtn = document.getElementById("btn-encode");

encodeBtn.addEventListener("click", async () => {
  const wavFileInput = document.getElementById("wav-file");
  if (wavFileInput.files === undefined || wavFileInput.files.length === 0) {
    console.log(`select files to proceed with encoding`);
    return;
  }
  const fileFullName = wavFileInput.files[0].name;
  const fileName = fileFullName.slice(0, fileFullName.search(".wav"));
  const secretMessage = document.getElementById("secret-message").value;
  const arrayBuffer = await getArrayBuffer(wavFileInput);
  const encodedBuffer = encode(arrayBuffer, secretMessage);
  const encodedBlob = new Blob([encodedBuffer], { type: "audio/wav" });
  const encodedFile = new File([encodedBlob], `${fileName}-encoded.wav`, {
    type: "audio/wav",
  });
  FileSaver.saveAs(encodedBlob, `${fileName}-encoded.wav`);
  // send encodedFile via socket
  const fileMessageObject = {
    userName: userName,
    type: "file",
    body: encodedFile,
    mimeType: encodedFile.type,
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
