// UI enhancements
window.onload = function () {
  document.getElementById("message-input").focus();
};

const wavFileInput = document.getElementById("wav-file");
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

wavFileInput.onfocus = () => {
  wavFileInput.nextElementSibling.classList.add("wav-file-focus");
};

wavFileInput.onblur = () => {
  wavFileInput.nextElementSibling.classList.remove("wav-file-focus");
};
