const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const MessagingService = require("../services/MessagingService");
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

    // Authentication middleware with enhanced RBAC
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error("Authentication error: No token provided"));
        }

        // Verify token using consistent method
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || process.env.SECRET_KEY
        );

        // Use id field consistently (some tokens use userId, others use id)
        const userId = decoded.id || decoded.userId;
        const user = await User.findById(userId).select("-password");

        if (!user) {
          return next(new Error("Authentication error: User not found"));
        }

        // Attach standardized user data to socket
        socket.userData = {
          id: user._id,
          userId: user._id,
          email: user.email,
          roles: user.roles,
          role: user.roles,
          first_name: user.first_name,
          last_name: user.last_name,
        };

        console.log(
          `✅ Socket authenticated: ${user.first_name} ${user.last_name} (${user.roles})`
        );
        next();
      } catch (error) {
        console.error("❌ Socket authentication failed:", error.message);
        return next(new Error("Authentication error: Invalid token"));
      }
    });

    this.io.on("connection", (socket) => {
      this.handleConnection(socket);
    });

    console.log("✅ Socket.IO server initialized");
  }

  handleConnection(socket) {
    const userId = socket.userData.id.toString();
    const userRole = socket.userData.roles;

    console.log(
      `🔗 User connected: ${socket.userData.first_name} ${socket.userData.last_name} (${userRole}) - Socket: ${socket.id}`
    );

    // Store user connection with enhanced RBAC data
    this.connectedUsers.set(userId, {
      socketId: socket.id,
      roles: userRole,
      userData: socket.userData,
    });
    this.userSockets.set(socket.id, userId);

    // Join user to their personal room
    socket.join(`user_${userId}`);

    // Role-based room joining for RBAC
    if (userRole === "admin" || userRole === "staff") {
      socket.join("admin_room");
    }
    if (userRole === "staff") {
      socket.join("staff_room");
    }

    // Handle joining conversation rooms (support both legacy and namespaced events)
    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`👥 User ${userId} joined conversation: ${conversationId}`);
    });
    socket.on("conversation:join", (payload) => {
      const conversationId = payload?.conversationId || payload;
      socket.join(`conversation_${conversationId}`);
      console.log(`👥 User ${userId} joined conversation: ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`👋 User ${userId} left conversation: ${conversationId}`);
    });

    // Handle sending messages (support namespaced event from frontend)
    socket.on("send_message", (data) => {
      this.handleSendMessage(socket, data);
    });
    socket.on("conversation:send_message", async (payload) => {
      // payload expected: { conversationId, content, clientTempId, messageType, replyTo }
      try {
        await this.handleSendMessage(socket, payload);
      } catch (err) {
        console.error("Error in conversation:send_message handler:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing_start", (data) => {
      socket.to(`conversation_${data.conversationId}`).emit("user_typing", {
        userId: userId,
        userName: `${socket.userData.first_name} ${socket.userData.last_name}`,
        conversationId: data.conversationId,
      });
    });
    socket.on("conversation:typing:start", (payload) => {
      const conversationId = payload?.conversationId || payload;
      socket.to(`conversation_${conversationId}`).emit("user_typing", {
        userId: userId,
        userName: `${socket.userData.first_name} ${socket.userData.last_name}`,
        conversationId,
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
    socket.on("conversation:typing:stop", (payload) => {
      const conversationId = payload?.conversationId || payload;
      socket.to(`conversation_${conversationId}`).emit("user_stop_typing", {
        userId: userId,
        conversationId,
      });
    });

    // Handle message read receipts
    socket.on("mark_as_read", (data) => {
      this.handleMarkAsRead(socket, data);
    });
    socket.on("conversation:mark_as_read", (payload) => {
      const conversationId = payload?.conversationId || payload;
      this.handleMarkAsRead(socket, { conversationId });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      this.handleDisconnection(socket);
    });
  }

  async handleSendMessage(socket, data) {
    const userId = socket.userData.id.toString();
    const userRole = socket.userData.roles;

    try {
      // Basic RBAC validation - admins and staff can message anyone
      // Customers can only participate in conversations they're part of
      if (userRole === "customer") {
        const conversation = await Conversation.findById(data.conversationId);
        if (
          !conversation ||
          !conversation.participants.some(
            (p) => p.user && p.user.toString() === userId
          )
        ) {
          socket.emit("error", {
            message: "Access denied to this conversation",
          });
          return;
        }
      }

      // Persist the message using the MessagingService so the server is authoritative
      // Accept messageData fields: content, messageType, replyTo
      const messageData = {
        content: (data.content || "").toString(),
        messageType: data.messageType || "text",
        replyTo: data.replyTo || null,
      };

      const persisted = await MessagingService.sendMessage(
        data.conversationId,
        userId,
        userRole,
        messageData
      );

      // Build emit payload: include persisted message and clientTempId if provided
      const emitPayload = {
        conversationId: data.conversationId,
        message: persisted.toObject ? persisted.toObject() : persisted,
      };
      if (data.clientTempId) emitPayload.clientTempId = data.clientTempId;

      await this.emitToConversation(
        data.conversationId,
        "new_message",
        emitPayload
      );

      console.log(
        `💬 Message persisted and emitted in conversation ${data.conversationId} by ${socket.userData.first_name} (${userRole})`
      );
    } catch (error) {
      console.error("❌ Error handling send message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  }

  handleMarkAsRead(socket, data) {
    const userId = socket.userData.id.toString();

    // Notify other participants that messages were read
    socket.to(`conversation_${data.conversationId}`).emit("messages_read", {
      conversationId: data.conversationId,
      readBy: userId,
      readAt: new Date(),
    });

    console.log(
      `📖 Messages marked as read in conversation ${data.conversationId} by ${socket.userData.first_name}`
    );
    console.log(
      `[socket] user ${socket.userData?.id} joining conversation room ${roomName}`
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
    const userConnection = this.connectedUsers.get(userId.toString());
    if (userConnection) {
      this.io.to(userConnection.socketId).emit(event, data);
      return true;
    }
    return false;
  }

  async emitToConversation(conversationId, event, data) {
    const roomName = `conversation_${conversationId}`;
    console.log(`[socket] emitting event '${event}' to room ${roomName}`);
    this.io.to(roomName).emit(event, data);

    // Emit to each participant's personal room so clients who haven't joined the conversation room
    // still receive immediate notifications.
    try {
      const conversation = await Conversation.findById(conversationId).lean();
      if (conversation && Array.isArray(conversation.participants)) {
        for (const p of conversation.participants) {
          const participantId =
            (p.user && p.user.toString()) || (p.toString && p.toString());
          if (participantId) this.emitToUser(participantId, event, data);
        }
      }
    } catch (err) {
      console.error(
        "emitToConversation: failed to notify individual users",
        err
      );
    }
  }

  emitToAdmins(event, data) {
    this.io.to("admin_room").emit(event, data);
  }

  emitToStaff(event, data) {
    this.io.to("staff_room").emit(event, data);
  }

  // RBAC-aware method to emit based on user roles
  emitToRole(role, event, data) {
    if (role === "admin") {
      this.emitToAdmins(event, data);
    } else if (role === "staff") {
      this.emitToStaff(event, data);
    }
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
