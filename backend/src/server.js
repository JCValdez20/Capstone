require("dotenv").config();
const http = require("http");
const express = require("express");
const app = require("./app");
const { port } = require("./config/config");
const { Server } = require("socket.io");
const socketManager = require("./utils/SocketManager");

const server = http.createServer(app);

// Use Render's PORT or fallback to 3000 for local development
const PORT = port || process.env.PORT || 3000;

// Initialize Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize socket manager with io instance
socketManager.initialize(io);

server.listen(PORT, () => {
  console.log("Server is running on port: " + PORT);
  console.log("Socket.IO server initialized");
});
