const { Server } = require("socket.io");
const { createServer } = require("http");
const jwt = require("jsonwebtoken");
const JwtService = require("./JwtService");
const cookie = require("cookie");

// Socket.io setup function
const setupSocketIO = (app) => {
  const server = createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  const userSocketMap = {}; // {userId: socketId}

  // Function to get receiver socket ID
  function getReceiverSocketId(userId) {
    return userSocketMap[userId];
  }

  // Socket authentication middleware - extract JWT from cookies
  io.use((socket, next) => {
    try {
      // Extract cookies from handshake headers
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const accessToken = cookies.accessToken;

      if (!accessToken) {
        return next(new Error("Access token not found in cookies"));
      }

      // Verify token using JwtService
      const decoded = JwtService.verifyAccessToken(accessToken);
      socket.userId = decoded.id;
      socket.user = decoded;

      console.log(
        "🔐 Socket authenticated for user:",
        decoded.id,
        "Role:",
        decoded.roles
      );
      next();
    } catch (error) {
      console.error("❌ Socket authentication failed:", error.message);
      next(new Error("Authentication failed: " + error.message));
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id, "UserID:", socket.userId);

    // Map user to socket
    if (socket.userId) {
      userSocketMap[socket.userId] = socket.id;
      console.log(`👤 User ${socket.userId} mapped to socket ${socket.id}`);

      // Emit updated online users to all clients
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
      if (socket.userId) {
        delete userSocketMap[socket.userId];
        console.log(`👤 User ${socket.userId} removed from socket map`);

        // Emit updated online users to all clients
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
    });

    // Handle connection errors
    socket.on("error", (error) => {
      console.error("🔥 Socket error:", error);
    });
  });

  // Make utilities available globally
  global.getReceiverSocketId = getReceiverSocketId;
  global.userSocketMap = userSocketMap;
  global.io = io;

  return { io, server };
};

module.exports = { setupSocketIO };
