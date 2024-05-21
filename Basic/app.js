const express = require("express");
const app = express();
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", onConnected);

async function onConnected(socket) {
  console.log(socket.id);

  // Update the client total in the database
  await incrementClientsTotal();

  // Emit the total number of clients
  const clientTotal = await getClientsTotal();
  io.emit("clients-total", clientTotal);

  // Fetch and send all previous messages to the newly connected client
  const messages = await prisma.message.findMany({
    orderBy: {
      dateTime: "asc",
    },
  });

  messages.forEach((message) => {
    socket.emit("chat-message", message);
  });

  // Handle disconnection
  socket.on("disconnect", async () => {
    console.log("Socket disconnected", socket.id);

    // Update the client total in the database
    await decrementClientsTotal();

    const clientTotal = await getClientsTotal();
    io.emit("clients-total", clientTotal);
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

async function getClientsTotal() {
  const clientTotal = await prisma.clientTotal.findFirst();
  return clientTotal ? clientTotal.total : 0;
}

async function incrementClientsTotal() {
  const clientTotal = await prisma.clientTotal.findFirst();
  if (clientTotal) {
    await prisma.clientTotal.update({
      where: { id: clientTotal.id },
      data: { total: clientTotal.total + 1 },
    });
  } else {
    await prisma.clientTotal.create({
      data: { total: 1 },
    });
  }
}

async function decrementClientsTotal() {
  const clientTotal = await prisma.clientTotal.findFirst();
  if (clientTotal && clientTotal.total > 0) {
    await prisma.clientTotal.update({
      where: { id: clientTotal.id },
      data: { total: clientTotal.total - 1 },
    });
  }
}

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
