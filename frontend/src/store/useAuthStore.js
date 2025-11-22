import { create } from "zustand";
import authService from "../services/authService";
import bookingService from "../services/bookingService";
import adminService from "../services/adminService";
import staffService from "../services/staffService";
import socketService from "../services/socketService";
import axios from "../services/axios";

const initialState = {
  user: null,
  isLoggedIn: false,
  isLoading: true,
  error: null,
};

export const useAuthStore = create((set, get) => ({
  ...initialState,

  /**
   * Check authentication status - backend validates HttpOnly cookies
   */
  checkAuth: async () => {
    console.log("🔐 useAuthStore.checkAuth() - Starting...");
    set({ isLoading: true });
    try {
      const user = await authService.checkAuth();

      console.log(
        "👤 useAuthStore.checkAuth() - Result:",
        user ? `User: ${user.email} (${user.roles})` : "No user"
      );

      if (user) {
        set({
          user,
          isLoggedIn: true,
          isLoading: false,
          error: null,
        });

        console.log(
          "✅ useAuthStore.checkAuth() - Auth state set, user logged in"
        );

        // Connect socket for admin/staff
        const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
        if (userRoles.includes("admin") || userRoles.includes("staff")) {
          console.log(
            "🔌 useAuthStore.checkAuth() - Connecting socket for",
            user.roles
          );
          socketService.connect();
        }

        return user;
      } else {
        console.log(
          "❌ useAuthStore.checkAuth() - No user, clearing auth state"
        );
        set({
          user: null,
          isLoggedIn: false,
          isLoading: false,
          error: null,
        });
        return null;
      }
    } catch (error) {
      console.error("🔥 useAuthStore.checkAuth() - Error:", error);
      set({
        user: null,
        isLoggedIn: false,
        isLoading: false,
        error: error.message,
      });
      return null;
    }
  },

  /**
   * Login - backend sets HttpOnly cookies
   */
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
          isLoading: false,
          error: null,
        });

        // Connect socket for admin/staff
        const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
        if (userRoles.includes("admin") || userRoles.includes("staff")) {
          socketService.connect();
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

  /**
   * Logout - backend clears HttpOnly cookies
   */
  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      socketService.disconnect();
      set({
        user: null,
        isLoggedIn: false,
        error: null,
      });
    }
  },

  /**
   * Register new user
   */
  register: async (userData) => {
    return await authService.register(userData);
  },

  // ===== AUTHENTICATION CHECKS =====

  isAuthenticated: () => {
    const { isLoggedIn, user } = get();
    return isLoggedIn && !!user;
  },

  isAdminAuthenticated: () => {
    const { user } = get();
    const roles = Array.isArray(user?.roles) ? user.roles : [user?.roles];
    return get().isAuthenticated() && roles.includes("admin");
  },

  isStaffAuthenticated: () => {
    const { user } = get();
    const roles = Array.isArray(user?.roles) ? user.roles : [user?.roles];
    return get().isAuthenticated() && roles.includes("staff");
  },

  isCustomerAuthenticated: () => {
    const { user } = get();
    const roles = Array.isArray(user?.roles) ? user.roles : [user?.roles];
    return get().isAuthenticated() && roles.includes("customer");
  },

  isAdminOrStaff: () => {
    const { user } = get();
    const roles = Array.isArray(user?.roles) ? user.roles : [user?.roles];
    return (
      get().isAuthenticated() &&
      (roles.includes("admin") || roles.includes("staff"))
    );
  },

  getCurrentAdmin: () => {
    const { user } = get();
    const roles = Array.isArray(user?.roles) ? user.roles : [user?.roles];
    return roles.includes("admin") ? user : null;
  },

  getCurrentStaff: () => {
    const { user } = get();
    const roles = Array.isArray(user?.roles) ? user.roles : [user?.roles];
    return roles.includes("staff") ? user : null;
  },

  getCurrentCustomer: () => {
    const { user } = get();
    const roles = Array.isArray(user?.roles) ? user.roles : [user?.roles];
    return roles.includes("customer") ? user : null;
  },

  // ===== BOOKING METHODS =====

  createBooking: async (bookingData) => {
    return await bookingService.createBooking(bookingData);
  },

  getUserBookings: async (params = {}) => {
    return await bookingService.getUserBookings(params);
  },

  cancelBooking: async (bookingId) => {
    return await bookingService.cancelBooking(bookingId);
  },

  getAvailableSlots: async (date) => {
    return await bookingService.getAvailableSlots(date);
  },

  getAllBookings: async (params = {}) => {
    return await bookingService.getAllBookings(params);
  },

  updateBookingStatus: async (bookingId, status, notes = "") => {
    return await bookingService.updateBookingStatus(bookingId, status, notes);
  },

  updateBooking: async (bookingId, bookingData) => {
    return await bookingService.updateBooking(bookingId, bookingData);
  },

  getBookingStats: async () => {
    return await bookingService.getBookingStats();
  },

  // ===== USER MANAGEMENT METHODS (Admin/Staff) =====

  getAllUsers: async () => {
    try {
      const response = await adminService.getAllUsers();
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await adminService.getUserById(userId);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await adminService.updateUser(userId, userData);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await adminService.deleteUser(userId);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // ===== STAFF MANAGEMENT METHODS (Admin only) =====

  createStaffAccount: async (staffData) => {
    try {
      const response = await staffService.createStaffAccount(staffData);
      return response.data;
    } catch (error) {
      console.error("Error creating staff:", error);
      throw error;
    }
  },

  getAllStaff: async () => {
    try {
      const response = await staffService.getAllStaff();
      return response.data;
    } catch (error) {
      console.error("Error fetching staff:", error);
      throw error;
    }
  },

  updateStaffAccount: async (staffId, staffData) => {
    try {
      const response = await staffService.updateStaffAccount(
        staffId,
        staffData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating staff:", error);
      throw error;
    }
  },

  deleteStaffAccount: async (staffId) => {
    try {
      const response = await staffService.deleteStaffAccount(staffId);
      return response.data;
    } catch (error) {
      console.error("Error deleting staff:", error);
      throw error;
    }
  },

  resetStaffPassword: async (staffId, newPassword) => {
    try {
      const response = await staffService.resetStaffPassword(
        staffId,
        newPassword
      );
      return response.data;
    } catch (error) {
      console.error("Error resetting staff password:", error);
      throw error;
    }
  },

  // ===== PROFILE MANAGEMENT =====

  updateUserData: async (userData) => {
    try {
      const response = await axios.put("/user/profile", userData);
      if (response.data.success) {
        const updatedUser = response.data.data;
        set({ user: updatedUser });
        return response.data;
      }
      throw new Error(response.data.message || "Failed to update profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // ===== SOCKET UTILITIES =====

  getSocket: () => socketService.getSocket(),
  getOnlineUsers: () => socketService.getOnlineUsers(),
}));
