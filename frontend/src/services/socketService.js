import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket && this.connected) {
      return this.socket;
    }

    const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

    this.socket = io(serverUrl, {
      auth: {
        token: token,
      },
      autoConnect: false,
    });

    this.socket.connect();

    this.socket.on("connect", () => {
      this.connected = true;
    });

    this.socket.on("disconnect", () => {
      this.connected = false;
    });

    this.socket.on("connect_error", () => {
      this.connected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinConversation(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit("join_conversation", conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit("leave_conversation", conversationId);
    }
  }

  sendMessage(data) {
    if (this.socket && this.connected) {
      this.socket.emit("send_message", data);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on("new_message", callback);
    }
  }

  onNewMessageFromUser(callback) {
    if (this.socket) {
      this.socket.on("new-message", callback);
    }
  }

  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.on("messages_read", callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on("user_typing", callback);
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on("user_stop_typing", callback);
    }
  }

  startTyping(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit("typing_start", { conversationId });
    }
  }

  stopTyping(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit("typing_stop", { conversationId });
    }
  }

  markAsRead(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit("mark_as_read", { conversationId });
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

export default new SocketService();
