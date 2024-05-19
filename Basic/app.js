//  setting up express
const express = require("express");
const app = express();
const path = require("path");

const PORT = process.env.PORT || 4000;
//  setting up listener as a variable 
const server = app.listen(PORT, () => {
  `server runing on ${PORT}`;
});

//  importing sockect io
const io = require("socket.io")(server);

//  serving our html
app.use(express.static(path.join(__dirname, "public")));

//  creating a new set to store number of sockets connected .
let socketsConnected = new Set();


//  turning on  connection  and  handling the connection
io.on("connection", onConnected);

function onConnected(socket) {
  console.log(socket.id);
//  adding socket to the set 
  socketsConnected.add(socket);
//  emmiting the size of the connected users
  io.emit("clients-total", socketsConnected.size);
//  handling a disconnect 
  socket.on("disconnect", () => {
    console.log("Socket disconnected", socket.id);
  //  removing the socket id from the set 
    socketsConnected.delete(socket.id);
    // emitting the socket size 
    io.emit("clients-total", socketsConnected.size);
  });
  //  handling messages
  socket.on("message", (data) => {
    //  broadcasting message data
    socket.broadcast.emit("chat-message", data);
    console.log(data);
  });
  //  broad casting replies also know as feedback
  socket.on("feedback", (data) => {
    socket.broadcast.emit("feedback", data);
  });
}
