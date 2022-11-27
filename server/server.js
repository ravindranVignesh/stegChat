const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { getTimeString } = require("./util");

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server, {
  maxHttpBufferSize: 1e8,
});

// set static folder
app.use(express.static(path.join(__dirname, "..", "client", "dist")));

// run when client connects
io.on("connection", (socket) => {
  // welcome current user
  // send only to the client
  socket.emit("infoMessage", "connected to StegChat");

  // join room
  socket.on("joinRoom", ({ userName, roomId }) => {
    socket.join(roomId);
    // Broadcast to room except client when client joins
    socket.to(roomId).emit("infoMessage", `"${userName}" has joined the chat`);
  });

  // leave room
  socket.on("leaveRoom", ({ userName, roomId }) => {
    socket.leave(roomId);
    // Broadcast to room except client when client leaves
    socket.to(roomId).emit("infoMessage", `"${userName}" has left the chat`);
  });

  // listen for new chatMessage
  socket.on("chatMessage", (msgObject) => {
    let rooms = [...socket.rooms];
    //broadcast to all in the room
    msgObject.timeStamp = getTimeString(msgObject.timeStamp);
    io.in(rooms[1]).emit("chatMessage", msgObject);
  });

  // listen for new audioFile
  socket.on("audioFile", (fileMessageObject) => {
    let rooms = [...socket.rooms];
    //broadcast to all in the room
    fileMessageObject.timeStamp = getTimeString(fileMessageObject.timeStamp);
    io.in(rooms[1]).emit("audioFile", fileMessageObject);
  });

  // Runs when client disconnects
  socket.on("disconnecting", () => {
    let rooms = [...socket.rooms];
    // broadcast to room except the client when client leaves
    socket.to(rooms[1]).emit("infoMessage", "a user has left the chat");
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
