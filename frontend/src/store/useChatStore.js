import { create } from "zustand";
import axios from "../services/axios";
import socketService from "../services/socketService";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,

  // Get admin and staff users for messaging
  getUsers: async () => {
    set({ isUsersLoading: true });

    try {
      const response = await axios.get("/messages/users");

      // Filter to only admin and staff roles
      const adminStaffUsers =
        response.data?.filter((user) => {
          const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
          return roles.includes("admin") || roles.includes("staff");
        }) || [];

      console.log("📋 Fetched users for messaging:", adminStaffUsers.length);
      set({ users: adminStaffUsers });
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Get messages between current user and selected user
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });

    try {
      console.log("📨 Fetching messages with user:", userId);
      const response = await axios.get(`/messages/${userId}`);

      console.log("📨 Messages received:", response.data?.length || 0);
      set({ messages: response.data || [] });
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send message to selected user
  sendMessage: async (messageData) => {
    const { selectedUser } = get();

    if (!selectedUser) {
      throw new Error("No user selected");
    }

    set({ isSendingMessage: true });

    try {
      const payload = {
        text: messageData.text || messageData.content,
        image: messageData.image || null,
      };

      console.log("📤 Sending message:", payload);

      const response = await axios.post(
        `/messages/send/${selectedUser._id}`,
        payload
      );

      console.log("✅ Message sent successfully");

      // Message will be added via socket event to prevent duplicates
      return response.data;
    } catch (error) {
      console.error("❌ Error sending message:", error);
      throw error;
    } finally {
      set({ isSendingMessage: false });
    }
  },

  // Subscribe to real-time messages
  subscribeToMessages: () => {
    const { selectedUser } = get();
    const socket = socketService.getSocket();

    if (!selectedUser || !socket?.connected) {
      console.log("⚠️ Cannot subscribe - missing selectedUser or socket");
      return;
    }

    console.log("🔔 Subscribing to messages for user:", selectedUser._id);

    // Listen for new messages
    socket.on("newMessage", (newMessage) => {
      console.log("📨 Received new message via socket:", newMessage);

      const currentSelectedUser = get().selectedUser;
      if (!currentSelectedUser) return;

      // Check if this message belongs to current conversation
      const isPartOfCurrentConversation =
        newMessage.senderId === currentSelectedUser._id ||
        newMessage.receiverId === currentSelectedUser._id;

      if (isPartOfCurrentConversation) {
        console.log("✅ Adding message to current conversation");
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    });
  },

  // Unsubscribe from real-time messages
  unsubscribeFromMessages: () => {
    const socket = socketService.getSocket();

    if (socket?.connected) {
      console.log("🔕 Unsubscribing from messages");
      socket.off("newMessage");
    }
  },

  // Set selected user and setup message subscription
  setSelectedUser: async (user) => {
    const currentState = get();

    // Unsubscribe from previous user's messages
    if (currentState.selectedUser) {
      currentState.unsubscribeFromMessages();
    }

    // Set new selected user
    set({ selectedUser: user, messages: [] });

    if (user) {
      // Fetch messages for new user
      await currentState.getMessages(user._id);

      // Subscribe to real-time messages
      currentState.subscribeToMessages();
    }
  },

  // Clear all chat data
  clearChat: () => {
    const currentState = get();
    currentState.unsubscribeFromMessages();

    set({
      messages: [],
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
      isSendingMessage: false,
    });
  },

  // Initialize chat (called when auth is ready)
  initializeChat: () => {
    // Socket should already be connected if user is admin/staff
    if (socketService.isConnected()) {
      console.log("🚀 Initializing chat for admin/staff user");
      get().getUsers();
    }
  },
}));
