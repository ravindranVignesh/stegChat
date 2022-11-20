import FileSaver from "file-saver";
import readWavMetaData from "./readWavMetaData";
import {
  encode,
  decode,
  getBitsArray,
  getString,
  spliceIntoChunks,
  endOfMsgMarker,
} from "./steg";

const joinRoomButton = document.getElementById("room-button");
const messageInput = document.getElementById("message-input");
const roomInput = document.getElementById("room-input");
const form = document.getElementById("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const textMessage = messageInput.value;
  const room = roomInput.value;

  if (textMessage == "") return;
  displayMessage(textMessage);

  messageInput.value = "";
});

joinRoomButton.addEventListener("click", () => {
  const room = roomInput.value;
});

const displayMessage = (messageToBeDisplayed) => {
  const div = document.createElement("div");
  div.textContent = messageToBeDisplayed;
  document.getElementById("message-container").append(div);
};

// -------------------------------------------------

const encodeBtn = document.getElementById("btn-encode");

encodeBtn.addEventListener("click", async () => {
  const wavFileInput = document.getElementById("wav-file");
  if (wavFileInput.files === undefined || wavFileInput.files.length === 0) {
    console.log(`select files to proceed with encoding`);
    return;
  }
  const secretMessage = document.getElementById("secret-message").value;
  const arrayBuffer = await getArrayBuffer(wavFileInput);
  const encodedBuffer = encode(arrayBuffer, secretMessage);
  const encodedBlob = new Blob([encodedBuffer], { type: "audio/wav" });
  FileSaver.saveAs(encodedBlob, "encodedAud.wav");
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

const readWavFiles = (input) => {
  if (input.files == undefined || input.files.length == 0) return;

  const length = input.files.length;

  for (let i = 0; i < length; i++) {
    let bufReader = new FileReader();
    let file = input.files[i];

    bufReader.onloadend = (e) => {
      console.log(`array buffer : ${i + 1}`);
      let arrayBuffer = e.target.result;
      console.log(`size in MB: ${MegaBytes(arrayBuffer.byteLength)}`);
      console.log(arrayBuffer);
      let metaData = readWavMetaData(arrayBuffer);
      console.log(`metaData : ${JSON.stringify(metaData, undefined, 2)}`);
    };

    bufReader.readAsArrayBuffer(file);
  }
};

const MegaBytes = (bytes) => {
  return parseFloat((bytes / 1024 / 1024).toFixed(3));
};
