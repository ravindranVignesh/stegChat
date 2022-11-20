const endOfMsgMarker = "#-#";
const encode = (arrayBuffer, message) => {
  message = message + endOfMsgMarker;
  const bits = getBitsArray(message);
  let dataView = new DataView(arrayBuffer);
  const base = 44;
  for (let i = 0; i < bits.length; i++) {
    let byte = dataView.getUint8(base + i);
    dataView.setUint8(base + i, (byte & 254) | bits[i]);
  }
  return dataView.buffer;
};

const decode = (arrayBuffer) => {
  let dataView = new DataView(arrayBuffer);
  const base = 44;
  const maxLimit = dataView.byteLength - base;
  const limit = 800;
  let extractedBits = [];
  for (let i = 0; i < limit; i++) {
    let extractedBit = dataView.getUint8(base + i) & 1;
    extractedBits.push(extractedBit);
  }
  const str = getString(extractedBits);
  const retrievedMessage = str.split(endOfMsgMarker)[0];
  return retrievedMessage;
};

const getBitsArray = (word) => {
  return word
    .split("")
    .map((letter) => letter.charCodeAt(0).toString(2).padStart(8, "0"))
    .reduce(
      (wordAsBinaryString, letterAsBinaryString) =>
        wordAsBinaryString + letterAsBinaryString
    )
    .split("")
    .map((bitChar) => parseInt(bitChar));
};

const getString = (bitsArray) => {
  return spliceIntoChunks(
    bitsArray.map((bit) => String(bit)),
    8
  )
    .map((byteCharArray) => byteCharArray.join(""))
    .map((byteString) => parseInt(byteString, 2))
    .map((charCode) => String.fromCharCode(charCode))
    .reduce((msg, char) => msg + char);
};

const spliceIntoChunks = (arr, chunkSize) => {
  const res = [];
  while (arr.length > 0) {
    const chunk = arr.splice(0, chunkSize);
    res.push(chunk);
  }
  return res;
};

export {
  encode,
  decode,
  getBitsArray,
  getString,
  spliceIntoChunks,
  endOfMsgMarker,
};
