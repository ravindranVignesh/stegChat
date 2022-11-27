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

const getStegMarker = () => {
  let msgMarker = document.createElement("div");
  msgMarker.classList.add("steg-msg-marker");
  msgMarker.innerText = "Steganographic Message";
  return msgMarker;
};

export { getSentBubble, getReceivedBubble, getStegMarker };
