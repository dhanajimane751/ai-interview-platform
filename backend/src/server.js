const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const { PORT, CLIENT_URL } = require("./config/env");

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: CLIENT_URL, credentials: true },
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});