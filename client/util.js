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

export { downloadFile, getArrayBuffer };
