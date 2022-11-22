const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server, {
  maxHttpBufferSize: 1e8,
});

// set static folder
app.use(express.static(path.join(__dirname, "..", "client", "dist")));

// run when client connects
io.on("connection", (socket) => {
  // join room
  socket.on("joinRoom", ({ userName, roomId }) => {
    socket.join(roomId);
    console.log(`${userName} (ID: ${socket.id}) joined ${roomId}`);
  });

  // leave room
  socket.on("leaveRoom", ({ userName, roomId }) => {
    socket.leave(roomId);
    console.log(`${userName} (ID: ${socket.id}) left ${roomId}`);
  });

  // welcome current user
  socket.emit("infoMessage", "connected to StegChat"); // socket.emit is only to one of the client

  // Broadcast when a user connects
  socket.broadcast.emit("infoMessage", "a user has joined the chat"); // socket.broadcast.emit all clients except the one who connected

  // Runs when client disconnects
  socket.on("disconnect", () => {
    io.emit("infoMessage", "a user has left the chat"); // io.emit all clients
  });

  // listen for new chatMessage
  socket.on("chatMessage", (msgObject) => {
    io.emit("chatMessage", msgObject); //broadcast to all
  });

  // listen for new audioFile
  socket.on("audioFile", (fileMessageObject) => {
    io.emit("audioFile", fileMessageObject); //broadcast to all
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
