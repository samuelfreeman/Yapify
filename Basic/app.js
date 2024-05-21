//  setting up express
const express = require("express");
const app = express();
const path = require("path");

const PORT = process.env.PORT || 4000;
//  setting up listener as a variable 
const server = app.listen(PORT, () => {
  `server runing on ${PORT}`;
});
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


//  importing sockect io
const io = require("socket.io")(server);

//  serving our html
app.use(express.static(path.join(__dirname, "public")));

//  creating a new set to store number of sockets connected .
let socketsConnected = new Set();


//  turning on  connection  and  handling the connection
io.on("connection", onConnected);

async function onConnected(socket) {
  console.log(socket.id);

  // Add socket to the set
  socketsConnected.add(socket);

  // Emit the total number of clients
  io.emit("clients-total", socketsConnected.size);

  // Fetch and send all previous messages to the newly connected client
  const messages = await prisma.message.findMany({
    orderBy: {
      dateTime: 'asc',
    },
  });

  messages.forEach((message) => {
    socket.emit("chat-message", message);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Socket disconnected", socket.id);
    socketsConnected.delete(socket.id);
    io.emit("clients-total", socketsConnected.size);
  });

  // Handle incoming messages
  socket.on("message", async (data) => {
    const message = await prisma.message.create({
      data: {
        name: data.name,
        message: data.message,
        dateTime: data.dateTime,
      },
    });
    socket.broadcast.emit("chat-message", data);
    console.log(data);
  });

  // Handle feedback
  socket.on("feedback", (data) => {
    socket.broadcast.emit("feedback", data);
  });
}


process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

