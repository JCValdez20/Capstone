import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class SocketService {
  constructor() {
    this.socket = null;
    this.onlineUsers = [];
  }

  connect() {
    if (this.socket?.connected) {
      console.log("🔗 Socket already connected");
      return this.socket;
    }

    console.log("🔗 Connecting socket...");

    // Get access token from localStorage
    const token = localStorage.getItem("accessToken");

    this.socket = io(API_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: {
        token: token, // Send token for authentication
      },
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket.id);
    });

    this.socket.on("getOnlineUsers", (users) => {
      console.log("👥 Online users updated:", users);
      this.onlineUsers = users;
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔥 Socket connection error:", error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting socket");
      this.socket.disconnect();
      this.socket = null;
      this.onlineUsers = [];
    }
  }

  getSocket() {
    return this.socket;
  }

  getOnlineUsers() {
    return this.onlineUsers;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

const socketService = new SocketService();
export default socketService;
