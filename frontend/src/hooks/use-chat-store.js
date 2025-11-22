import axios from "../services/axios";
import { create } from "zustand";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  socket: null,

  // Set the socket instance
  setSocket: (socket) => set({ socket }),

  // Initialize the store with socket from auth context
  initialize: (socket) => {
    set({ socket });
  },

  // Get admin and staff users for messaging
  getUsers: async () => {
    set({ isUsersLoading: true });

    try {
      // Use the messaging users route
      const res = await axios.get("/messages/users");

      // Filter to only admin and staff roles
      const adminStaffUsers =
        res.data?.filter((user) => {
          const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
          return roles.includes("admin") || roles.includes("staff");
        }) || [];

      set({ users: adminStaffUsers });
    } catch (error) {
      console.error("Error fetching users:", error);
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });

    try {
      console.log("Fetching messages for user:", userId);
      const res = await axios.get(`/messages/${userId}`);
      console.log("Messages received:", res.data);
      set({ messages: res.data });
    } catch (error) {
      console.error("Error fetching messages:", error);
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    try {
      // Backend expects 'text' field, not 'content'
      const payload = {
        text: messageData.content || messageData.text,
        image: messageData.image || null,
      };

      console.log("Sending message:", payload, "to user:", selectedUser._id);

      const res = await axios.post(
        `/messages/send/${selectedUser._id}`,
        payload
      );

      console.log("Message sent successfully:", res.data);

      // Don't manually add to messages here - let the socket event handle it
      // This prevents duplicate messages in the UI
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, socket } = get();
    if (!selectedUser || !socket) {
      console.log("Cannot subscribe - missing selectedUser or socket");
      return;
    }

    console.log("Subscribing to messages for user:", selectedUser._id);

    socket.on("newMessage", (newMessage) => {
      console.log("Received new message via socket:", newMessage);

      // Check if this message is part of the current conversation
      const currentUser = get().selectedUser;
      if (!currentUser) return;

      const isPartOfCurrentConversation =
        newMessage.senderId === currentUser._id ||
        newMessage.receiverId === currentUser._id;

      if (isPartOfCurrentConversation) {
        console.log("Adding message to current conversation");
        set({
          messages: [...get().messages, newMessage],
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const { socket } = get();
    if (socket) {
      console.log("Unsubscribing from messages");
      socket.off("newMessage");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
