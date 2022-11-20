const readWavMetaData = (arrayBuffer) => {
  const dataView = new DataView(arrayBuffer);
  //RIFF marker B0 to B3 big endian
  let riffMarker = "";
  for (let i = 0; i < 4; i++)
    riffMarker += String.fromCharCode(dataView.getUint8(i));
  // totalSize of file - 8 in bytes = B4 to B7 little endian
  let totalSize = dataView.getUint32(4, true) + 8;
  // file type header 'WAVE' - B8 to B11 big endian
  let fileTypeHeader = "";
  for (let i = 8; i < 12; i++)
    fileTypeHeader += String.fromCharCode(dataView.getUint8(i));
  // format chunk marker 'fmt ' - B12 to B15 big endian
  let formatMarker = "";
  for (let i = 12; i < 16; i++)
    formatMarker += String.fromCharCode(dataView.getUint8(i));
  // length of format data in bytes (all the data specified above) - B16 to B19 little endian
  let formatDataLength = dataView.getUint32(16, true); // must be equal to 16
  // type of format - B20 and B21 - little endian
  let formatType = dataView.getUint16(20, true); // 1 - PCM
  let noOfChannels = dataView.getUint16(22, true);
  let sampleRate = dataView.getUint32(24, true);
  let byteRate = dataView.getUint32(28, true);
  let blockAlignment = dataView.getUint16(32, true);
  let bitsPerSample = dataView.getUint16(34, true);
  // data chunk header specifies the starting of the data
  let dataChunkHeader = "";
  for (let i = 36; i < 40; i++)
    dataChunkHeader += String.fromCharCode(dataView.getUint8(i));
  // size of data section
  let dataSize = dataView.getUint32(40, true);

  return {
    riffMarker,
    totalSize,
    fileTypeHeader,
    formatMarker,
    formatDataLength,
    formatType,
    noOfChannels,
    sampleRate,
    byteRate,
    blockAlignment,
    bitsPerSample,
    dataChunkHeader,
    dataSize,
  };
};

export default readWavMetaData;
