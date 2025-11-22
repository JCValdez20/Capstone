import React, { useState, useEffect, useCallback } from "react";
import AuthContext from "./AuthContext";
import authService from "../services/authService";
import bookingService from "../services/bookingService";
import axios from "../services/axios";
import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const initialAuthState = {
  user: null,
  isLoggedIn: false,
  role: null,
  isLoading: true,
  error: null,
  socket: null,
};

/**
 * AuthProvider - 100% HttpOnly Cookie-Based Authentication
 *
 * NO localStorage token management
 * NO manual JWT handling
 * Backend manages ALL authentication via HttpOnly cookies
 */
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(initialAuthState);

  /**
   * Check authentication status - calls backend to verify session
   */
  // 1️⃣ Put REFRESH first
  const refresh = useCallback(async () => {
    console.log("🔄 AuthProvider: Refreshing session...");
    setAuth((prev) => ({ ...prev, isLoading: true }));

    try {
      const refreshResult = await authService.refreshToken();

      if (refreshResult.success && refreshResult.loggedIn) {
        console.log("✅ Refresh successful, fetching user...");
        const userResult = await authService.getCurrentUser();

        if (userResult.success && userResult.user) {
          setAuth({
            user: userResult.user,
            isLoggedIn: true,
            role: userResult.user.roles,
            isLoading: false,
            error: null,
            socket: null,
          });
          return userResult.user;
        }
      }

      console.log("❌ Refresh failed. User not logged in.");
      setAuth({ ...initialAuthState, isLoading: false });
      return null;
    } catch (error) {
      console.error("❌ Refresh error:", error);
      setAuth({ ...initialAuthState, isLoading: false });
      return null;
    }
  }, []);

  // 2️⃣ NOW define checkAuth (AFTER refresh)
  const checkAuth = useCallback(async () => {
    console.log("🔐 Checking session...");

    try {
      const result = await authService.getCurrentUser();

      if (result.success && result.user) {
        console.log("✅ User authenticated");
        setAuth({
          user: result.user,
          isLoggedIn: true,
          role: result.user.roles,
          isLoading: false,
          error: null,
          socket: null,
        });
        return result.user;
      }

      console.log("🔄 Access token expired → refreshing...");
      return await refresh();
    } catch {
      console.log("🔄 Token invalid → trying refresh...");
      return await refresh();
    }
  }, [refresh]);

  /**
   * Socket connection - uses HttpOnly cookies automatically
   */
  const connectSocket = useCallback(() => {
    if (!auth.user || auth.socket?.connected) return;

    console.log("🔗 AuthProvider: Connecting socket...");

    const socket = io(URL, {
      withCredentials: true, // Send HttpOnly cookies with socket
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setAuth((prev) => ({ ...prev, socket }));
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setAuth((prev) => ({ ...prev, socket: null }));
    });

    return socket;
  }, [auth.user, auth.socket]);

  const disconnectSocket = useCallback(() => {
    if (auth.socket?.connected) {
      console.log("🔌 Disconnecting socket");
      auth.socket.disconnect();
      setAuth((prev) => ({ ...prev, socket: null }));
    }
  }, [auth.socket]);

  /**
   * Initialize auth on app start
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Connect socket after authentication
   */
  useEffect(() => {
    if (auth.isLoggedIn && !auth.socket) {
      connectSocket();
    }
  }, [auth.isLoggedIn, auth.socket, connectSocket]);

  /**
   * Logout - Call backend to clear HttpOnly cookies
   */
  const logout = async () => {
    try {
      console.log("🔐 AuthProvider: Logging out...");

      // Disconnect socket first
      disconnectSocket();

      // Call backend logout endpoint (clears cookies)
      await authService.logout();

      console.log("✅ AuthProvider: Logout successful");

      // Clear state
      setAuth({
        ...initialAuthState,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error("❌ AuthProvider: Logout error:", error);

      // Still clear state even if backend call fails
      setAuth({
        ...initialAuthState,
        isLoading: false,
      });

      return {
        success: false,
        message: error.message,
      };
    }
  };

  /**
   * Login - Backend sets HttpOnly cookies, we just store user data
   */
  const login = async (credentials, loginType = "customer") => {
    try {
      console.log(`🔐 AuthProvider: Logging in as ${loginType}...`);
      setAuth((prev) => ({ ...prev, isLoading: true, error: null }));

      let result;

      if (loginType === "customer") {
        result = await authService.customerLogin(credentials);
      } else {
        result = await authService.adminLogin(credentials);
      }

      if (result.success && result.user) {
        console.log("✅ AuthProvider: Login successful:", result.user.roles);

        setAuth({
          user: result.user,
          isLoggedIn: true,
          role: result.user.roles,
          isLoading: false,
          error: null,
          socket: null,
        });

        // Connect socket after successful login
        setTimeout(connectSocket, 100);

        return {
          success: true,
          message: result.message || "Login successful",
        };
      } else {
        console.error("❌ AuthProvider: Login failed");
        setAuth((prev) => ({
          ...prev,
          isLoading: false,
          error: result.message,
        }));

        return {
          success: false,
          error: result.message || "Login failed",
          requiresVerification: result.requiresVerification,
          email: result.email,
        };
      }
    } catch (error) {
      console.error("❌ AuthProvider: Login error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";

      setAuth((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      setAuth((prev) => ({ ...prev, isLoading: true, error: null }));

      const result = await authService.register(userData);

      setAuth((prev) => ({ ...prev, isLoading: false }));

      return result;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";

      setAuth((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  /**
   * Update user data in state
   */
  const updateUserData = (updatedUser) => {
    setAuth((prev) => ({
      ...prev,
      user: updatedUser,
      role: updatedUser.roles || updatedUser.role,
    }));
  };

  // ===== ADMIN SERVICE METHODS =====

  const getDashboard = async () => {
    try {
      const response = await axios.get("/admin/dashboard");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const getAllUsers = async () => {
    try {
      const response = await axios.get("/admin/users");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const getAllBookings = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status);
      }
      if (filters.date) {
        params.append("date", filters.date);
      }
      if (filters.limit) {
        params.append("limit", filters.limit);
      }
      if (filters.page) {
        params.append("page", filters.page);
      }

      const response = await axios.get(`/admin/bookings?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const updateBookingStatus = async (
    id,
    status,
    notes = "",
    rejectionReason = ""
  ) => {
    try {
      const payload = { status };
      if (notes) payload.notes = notes;
      if (status === "rejected" && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      const response = await axios.put(`/admin/bookings/${id}/status`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const updateBooking = async (id, bookingData) => {
    try {
      const response = await axios.put(`/admin/bookings/${id}`, bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  // ===== STAFF MANAGEMENT METHODS =====

  const getAllStaff = async () => {
    try {
      const response = await axios.get("/admin/staff");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const createStaffAccount = async (staffData) => {
    try {
      const response = await axios.post("/admin/staff", staffData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const updateStaffAccount = async (staffId, staffData) => {
    try {
      const response = await axios.put(`/admin/staff/${staffId}`, staffData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const deleteStaffAccount = async (staffId) => {
    try {
      const response = await axios.delete(`/admin/staff/${staffId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const resetStaffPassword = async (staffId, passwordData) => {
    try {
      const response = await axios.put(
        `/admin/staff/${staffId}/reset-password`,
        passwordData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  // ===== USER BOOKING METHODS =====

  const getUserBookings = async (params = {}) => {
    try {
      return await bookingService.getUserBookings(params);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      return await bookingService.cancelBooking(bookingId);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const createBooking = async (bookingData) => {
    try {
      return await bookingService.createBooking(bookingData);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const getAvailableSlots = async (date) => {
    try {
      return await bookingService.getAvailableSlots(date);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  // ===== CONTEXT VALUE =====

  return (
    <AuthContext.Provider
      value={{
        // State
        ...auth,

        // Core auth methods
        login,
        register,
        logout,
        checkAuth,
        updateUserData,
        refresh,

        // Socket methods
        connectSocket,
        disconnectSocket,

        // Role checks (array-based roles)
        isAdmin: (() => {
          const roles = Array.isArray(auth.user?.roles)
            ? auth.user.roles
            : [auth.user?.roles];
          return roles.includes("admin");
        })(),
        isStaff: (() => {
          const roles = Array.isArray(auth.user?.roles)
            ? auth.user.roles
            : [auth.user?.roles];
          return roles.includes("staff");
        })(),
        isCustomer: (() => {
          const roles = Array.isArray(auth.user?.roles)
            ? auth.user.roles
            : [auth.user?.roles];
          return roles.includes("customer");
        })(),
        isAdminOrStaff: (() => {
          const roles = Array.isArray(auth.user?.roles)
            ? auth.user.roles
            : [auth.user?.roles];
          return roles.includes("admin") || roles.includes("staff");
        })(),

        // Authentication checks
        isAuthenticated: () => auth.isLoggedIn,
        isAdminAuthenticated: () => {
          const roles = Array.isArray(auth.user?.roles)
            ? auth.user.roles
            : [auth.user?.roles];
          return auth.isLoggedIn && roles.includes("admin");
        },
        isStaffAuthenticated: () => {
          const roles = Array.isArray(auth.user?.roles)
            ? auth.user.roles
            : [auth.user?.roles];
          return auth.isLoggedIn && roles.includes("staff");
        },
        isCustomerAuthenticated: () => {
          const roles = Array.isArray(auth.user?.roles)
            ? auth.user.roles
            : [auth.user?.roles];
          return auth.isLoggedIn && roles.includes("customer");
        },

        // Admin service methods
        getDashboard,
        getAllUsers,
        getAllBookings,
        updateBookingStatus,
        updateBooking,

        // Staff management methods
        getAllStaff,
        createStaffAccount,
        updateStaffAccount,
        deleteStaffAccount,
        resetStaffPassword,

        // User booking methods
        getUserBookings,
        cancelBooking,
        createBooking,
        getAvailableSlots,

        // Current user getters (for backward compatibility)
        getCurrentAdmin: () => {
          const roles = Array.isArray(auth.user?.roles)
            ? auth.user.roles
            : [auth.user?.roles];
          return roles.includes("admin") ? auth.user : null;
        },
        getCurrentStaff: () => {
          const roles = Array.isArray(auth.user?.roles)
            ? auth.user.roles
            : [auth.user?.roles];
          return roles.includes("staff") ? auth.user : null;
        },
        getCurrentCustomer: () => {
          const roles = Array.isArray(auth.user?.roles)
            ? auth.user.roles
            : [auth.user?.roles];
          return roles.includes("customer") ? auth.user : null;
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
