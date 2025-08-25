const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { SOCKET_EVENTS, ROOM_TYPES } = require("./SocketConstants");

class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        console.log(
          "🔐 Socket authentication attempt with token:",
          token ? "Present" : "Missing"
        );

        if (!token) {
          console.log("❌ Socket auth failed: No token provided");
          return next(new Error("Authentication error: No token provided"));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Socket token decoded:", decoded);

        const user = await User.findById(decoded.userId).select("-password");
        console.log(
          "👤 Socket user found:",
          user
            ? `${user.first_name} ${user.last_name} (${user.role})`
            : "Not found"
        );

        if (!user) {
          console.log("❌ Socket auth failed: User not found");
          return next(new Error("Authentication error: User not found"));
        }

        socket.user = user;
        console.log("✅ Socket authentication successful");
        next();
      } catch (error) {
        console.error("❌ Socket authentication error:", error.message);
        next(new Error("Authentication error: Invalid token"));
      }
    });

    this.io.on("connection", (socket) => {
      this.handleConnection(socket);
    });

    console.log("✅ Socket.IO server initialized");
  }

  handleConnection(socket) {
    const userId = socket.user._id.toString();
    const userRole = socket.user.role || socket.user.roles;

    console.log(
      `🔗 User connected: ${socket.user.first_name} ${socket.user.last_name} (${userRole}) - Socket: ${socket.id}`
    );

    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, userId);

    // Join user to their personal room
    socket.join(`user_${userId}`);

    // Join admin users to admin room
    if (userRole === "admin") {
      socket.join("admin_room");
    }

    // Handle joining conversation rooms
    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`👥 User ${userId} joined conversation: ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`👋 User ${userId} left conversation: ${conversationId}`);
    });

    // Handle sending messages
    socket.on("send_message", (data) => {
      this.handleSendMessage(socket, data);
    });

    // Handle typing indicators
    socket.on("typing_start", (data) => {
      socket.to(`conversation_${data.conversationId}`).emit("user_typing", {
        userId: userId,
        userName: `${socket.user.first_name} ${socket.user.last_name}`,
        conversationId: data.conversationId,
      });
    });

    socket.on("typing_stop", (data) => {
      socket
        .to(`conversation_${data.conversationId}`)
        .emit("user_stop_typing", {
          userId: userId,
          conversationId: data.conversationId,
        });
    });

    // Handle message read receipts
    socket.on("mark_as_read", (data) => {
      this.handleMarkAsRead(socket, data);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      this.handleDisconnection(socket);
    });
  }

  handleSendMessage(socket, data) {
    const userId = socket.user._id.toString();

    // Emit to all users in the conversation
    this.io.to(`conversation_${data.conversationId}`).emit("new_message", {
      ...data,
      sender: {
        _id: userId,
        first_name: socket.user.first_name,
        last_name: socket.user.last_name,
        role: socket.user.role || socket.user.roles,
      },
      timestamp: new Date(),
    });

    console.log(
      `💬 Message sent in conversation ${data.conversationId} by ${socket.user.first_name}`
    );
  }

  handleMarkAsRead(socket, data) {
    const userId = socket.user._id.toString();

    // Notify other participants that messages were read
    socket.to(`conversation_${data.conversationId}`).emit("messages_read", {
      conversationId: data.conversationId,
      readBy: userId,
      readAt: new Date(),
    });

    console.log(
      `✅ Messages marked as read in conversation ${data.conversationId} by ${userId}`
    );
  }

  handleDisconnection(socket) {
    const userId = this.userSockets.get(socket.id);

    if (userId) {
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socket.id);
      console.log(`🔌 User disconnected: ${userId} - Socket: ${socket.id}`);
    }
  }

  // Helper methods for emitting events from controllers
  emitToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId.toString());
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  emitToConversation(conversationId, event, data) {
    console.log(
      `📤 Emitting ${event} to conversation_${conversationId}:`,
      data
    );
    const roomName = `conversation_${conversationId}`;
    const socketsInRoom = this.io.sockets.adapter.rooms.get(roomName);
    console.log(
      `👥 Sockets in room ${roomName}:`,
      socketsInRoom ? Array.from(socketsInRoom) : "No sockets"
    );
    this.io.to(roomName).emit(event, data);
  }

  emitToAdmins(event, data) {
    this.io.to("admin_room").emit(event, data);
  }

  // Get online status
  isUserOnline(userId) {
    return this.connectedUsers.has(userId.toString());
  }

  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }
}

module.exports = new SocketManager();
