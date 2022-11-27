import FileSaver from "file-saver";
const downloadFile = (arrayBuffer, fileName) => {
  const blob = new Blob([arrayBuffer], { type: "audio/wav" });
  FileSaver.saveAs(blob, fileName);
};

const getArrayBuffer = async (wavFileInput) => {
  if (wavFileInput.files == undefined || wavFileInput.files.length == 0) return;
  let file = wavFileInput.files[0];
  const arrBuff = await file.arrayBuffer();
  return arrBuff;
};

const getTimeString = (dateObj) => {
  const hours = dateObj.getHours().toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");
  const result = `${hours}:${minutes}`;
  return result;
};

export { downloadFile, getArrayBuffer, getTimeString };
