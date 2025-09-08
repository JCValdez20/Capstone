import { create } from "zustand";
import { io } from "socket.io-client";
import authService from "../services/authService";
import bookingService from "../services/bookingService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const initialState = {
  user: null,
  isLoggedIn: false,
  role: null,
  authType: null, // 'customer', 'admin', 'staff'
  isLoading: true,
  error: null,
  socket: null,
  onlineUsers: [],
};

export const useAuthStore = create((set, get) => ({
  ...initialState,

  // Get current authenticated user using HTTP-only cookies
  getCurrentAuth: async () => {
    try {
      const user = await authService.checkAuth();
      return user;
    } catch {
      return null;
    }
  },

  // Connect socket with JWT from cookies
  connectSocket: () => {
    const { user, socket: existingSocket } = get();

    if (existingSocket?.connected) {
      console.log("🔗 Socket already connected");
      return;
    }

    if (!user) {
      console.warn("⚠️ Cannot connect socket: No authenticated user");
      return;
    }

    try {
      console.log("🔗 Connecting socket for user:", user.id);

      const socket = io(API_URL, {
        withCredentials: true, // Send cookies with socket connection
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
        set({ socket });
      });

      socket.on("getOnlineUsers", (users) => {
        console.log("👥 Online users updated:", users);
        set({ onlineUsers: users });
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        set({ socket: null, onlineUsers: [] });
      });

      socket.on("connect_error", (error) => {
        console.error("🔥 Socket connection error:", error.message);
      });
    } catch (error) {
      console.error("🔥 Socket connection failed:", error);
    }
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      console.log("🔌 Disconnecting socket");
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },

  clearAuth: () => {
    const { disconnectSocket } = get();
    disconnectSocket();
    set({
      user: null,
      isLoggedIn: false,
      role: null,
      authType: null,
      error: null,
    });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.checkAuth();
      if (user) {
        set({
          user,
          isLoggedIn: true,
          role: user.roles,
          authType: user.roles,
          isLoading: false,
          error: null,
        });

        // Connect socket if user is admin or staff
        if (user.roles === "admin" || user.roles === "staff") {
          get().connectSocket();
        }

        return user;
      } else {
        set({
          user: null,
          isLoggedIn: false,
          role: null,
          authType: null,
          isLoading: false,
          error: null,
        });
        return null;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      set({
        user: null,
        isLoggedIn: false,
        role: null,
        authType: null,
        isLoading: false,
        error: error.message,
      });
      return null;
    }
  },

  login: async (credentials, userRole = "customer") => {
    set({ isLoading: true, error: null });

    try {
      let result;

      if (userRole === "customer") {
        result = await authService.customerLogin(credentials);
      } else {
        result = await authService.adminLogin(credentials);
      }

      if (result.success) {
        const user = result.user;
        set({
          user,
          isLoggedIn: true,
          role: user.roles,
          authType: user.roles,
          isLoading: false,
          error: null,
        });

        // Connect socket if user is admin or staff
        if (user.roles === "admin" || user.roles === "staff") {
          get().connectSocket();
        }

        return { success: true, user };
      } else {
        set({
          isLoading: false,
          error: result.message,
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error("Login failed:", error);
      set({
        isLoading: false,
        error: "Login failed",
      });
      return { success: false, message: "Login failed" };
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      get().clearAuth();
    }
  },

  isAuthenticated: () => {
    const { isLoggedIn, user } = get();
    return isLoggedIn && !!user;
  },

  isAdminAuthenticated: () => {
    const { isAuthenticated } = get();
    const { user } = get();
    return isAuthenticated() && user?.roles === "admin";
  },

  isStaffAuthenticated: () => {
    const { isAuthenticated } = get();
    const { user } = get();
    return isAuthenticated() && user?.roles === "staff";
  },

  isCustomerAuthenticated: () => {
    const { isAuthenticated } = get();
    const { user } = get();
    return isAuthenticated() && user?.roles === "customer";
  },

  isAdminOrStaff: () => {
    const { isAuthenticated } = get();
    const { user } = get();
    return (
      isAuthenticated() && (user?.roles === "admin" || user?.roles === "staff")
    );
  },

  getCurrentAdmin: () => {
    const { user } = get();
    return user?.roles === "admin" ? user : null;
  },

  getCurrentStaff: () => {
    const { user } = get();
    return user?.roles === "staff" ? user : null;
  },

  getCurrentCustomer: () => {
    const { user } = get();
    return user?.roles === "customer" ? user : null;
  },

  // Booking methods for role-based access

  // Customer: Create a new booking
  createBooking: async (bookingData) => {
    return await bookingService.createBooking(bookingData);
  },

  // Customer: Get user's own bookings
  getUserBookings: async (params = {}) => {
    return await bookingService.getUserBookings(params);
  },

  // Customer: Cancel own booking
  cancelBooking: async (bookingId) => {
    return await bookingService.cancelBooking(bookingId);
  },

  // Public: Get available time slots
  getAvailableSlots: async (date) => {
    return await bookingService.getAvailableSlots(date);
  },

  // Admin/Staff: Get all bookings
  getAllBookings: async (params = {}) => {
    return await bookingService.getAllBookings(params);
  },

  // Admin/Staff: Update booking status
  updateBookingStatus: async (bookingId, status, notes = "") => {
    return await bookingService.updateBookingStatus(bookingId, status, notes);
  },

  // Admin/Staff: Update entire booking
  updateBooking: async (bookingId, bookingData) => {
    return await bookingService.updateBooking(bookingId, bookingData);
  },

  // Admin/Staff: Get booking statistics
  getBookingStats: async () => {
    return await bookingService.getBookingStats();
  },
}));
