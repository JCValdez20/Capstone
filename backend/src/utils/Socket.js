const { Server } = require("socket.io");
const { createServer } = require("http");
const jwt = require("jsonwebtoken");
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

  // Socket authentication middleware - extract JWT from Authorization header or query
  io.use((socket, next) => {
    try {
      // Try to get token from query params (for socket.io client connection)
      let accessToken =
        socket.handshake.auth?.token || socket.handshake.query?.token;

      // Fallback: try cookies (for legacy support)
      if (!accessToken) {
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");
        accessToken = cookies.accessToken;
      }

      if (!accessToken) {
        return next(new Error("Access token not found"));
      }

      // Verify token directly
      const accessTokenSecret =
        process.env.JWT_ACCESS_SECRET ||
        process.env.SECRET_KEY ||
        "ACCESS_SECRET";
      const decoded = jwt.verify(accessToken, accessTokenSecret);
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

// Helper function to emit to a specific user
const emitToUser = (userId, event, data) => {
  if (!global.io || !global.userSocketMap) {
    console.warn("⚠️ Socket.IO not initialized");
    return false;
  }

  const socketId = global.userSocketMap[userId];
  if (socketId) {
    global.io.to(socketId).emit(event, data);
    console.log(`📤 Emitted '${event}' to user ${userId}`);
    return true;
  }
  console.log(`⚠️ User ${userId} not connected`);
  return false;
};

// Helper function to emit to all admin users
const emitToAdmins = (event, data) => {
  if (!global.io || !global.userSocketMap) {
    console.warn("⚠️ Socket.IO not initialized");
    return;
  }

  // Emit to all connected sockets with admin role
  Object.entries(global.userSocketMap).forEach(([userId, socketId]) => {
    const socket = global.io.sockets.sockets.get(socketId);
    if (socket && socket.user) {
      const roles = Array.isArray(socket.user.roles)
        ? socket.user.roles
        : [socket.user.roles];

      if (roles.includes("admin")) {
        global.io.to(socketId).emit(event, data);
        console.log(`📤 Emitted '${event}' to admin ${userId}`);
      }
    }
  });
};

// Helper function to emit to all staff users
const emitToStaff = (event, data) => {
  if (!global.io || !global.userSocketMap) {
    console.warn("⚠️ Socket.IO not initialized");
    return;
  }

  // Emit to all connected sockets with staff role
  Object.entries(global.userSocketMap).forEach(([userId, socketId]) => {
    const socket = global.io.sockets.sockets.get(socketId);
    if (socket && socket.user) {
      const roles = Array.isArray(socket.user.roles)
        ? socket.user.roles
        : [socket.user.roles];

      if (roles.includes("staff")) {
        global.io.to(socketId).emit(event, data);
        console.log(`📤 Emitted '${event}' to staff ${userId}`);
      }
    }
  });
};

// Helper function to get receiver socket ID (for direct access)
const getReceiverSocketId = (userId) => {
  if (global.getReceiverSocketId) {
    return global.getReceiverSocketId(userId);
  }
  return null;
};

module.exports = {
  setupSocketIO,
  getReceiverSocketId,
  emitToUser,
  emitToAdmins,
  emitToStaff,
};
