import React, { useState, useEffect, useCallback } from "react";
import AuthContext from "./AuthContext";
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
  authType: null, // 'customer', 'admin', or 'staff'
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(initialAuthState);
  const [forceUpdateTrigger, setForceUpdateTrigger] = useState(0);

  // Helper method to get role-specific storage keys
  const getStorageKeys = useCallback((role) => {
    switch (role) {
      case "admin":
        return { tokenKey: "adminToken", userKey: "adminUser" };
      case "staff":
        return { tokenKey: "staffToken", userKey: "staffUser" };
      case "customer":
      default:
        return { tokenKey: "token", userKey: "user" };
    }
  }, []);

  // Get current user from any authentication source
  const getCurrentUser = useCallback(() => {
    // Check admin first
    const adminToken = localStorage.getItem("adminToken");
    const adminUser = localStorage.getItem("adminUser");
    if (adminToken && adminUser) {
      try {
        const user = JSON.parse(adminUser);
        if (user.roles === "admin")
          return { user, authType: "admin", token: adminToken };
      } catch {
        localStorage.removeItem("adminUser");
      }
    }

    // Check staff
    const staffToken = localStorage.getItem("staffToken");
    const staffUser = localStorage.getItem("staffUser");
    if (staffToken && staffUser) {
      try {
        const user = JSON.parse(staffUser);
        if (user.roles === "staff")
          return { user, authType: "staff", token: staffToken };
      } catch {
        localStorage.removeItem("staffUser");
      }
    }

    // Check customer
    const customerToken = localStorage.getItem("token");
    const customerUser = localStorage.getItem("user");
    if (customerToken && customerUser) {
      try {
        const user = JSON.parse(customerUser);
        return { user, authType: "customer", token: customerToken };
      } catch {
        localStorage.removeItem("user");
      }
    }

    return null;
  }, []);

  // Get the appropriate token for current user
  const getCurrentToken = useCallback(() => {
    const currentAuth = getCurrentUser();
    return currentAuth?.token || null;
  }, [getCurrentUser]);

  const connectSocket = useCallback(() => {
    const token = getCurrentToken();
    const currentUser = getCurrentUser();
    if (!token || !currentUser || auth.socket?.connected) return;

    const userId = currentUser.user.id || currentUser.user.userId;
    console.log("Connecting socket with userId:", userId);

    const socket = io(URL, {
      auth: { token },
      query: { userId }, // Pass userId in query for socket mapping
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
  }, [auth.socket, getCurrentToken, getCurrentUser]);

  const disconnectSocket = useCallback(() => {
    if (auth.socket?.connected) {
      auth.socket.disconnect();
      setAuth((prev) => ({ ...prev, socket: null }));
    }
  }, [auth.socket]);

  // Create standardized user object
  const createUserObject = useCallback((decoded, isGoogleAuth = false) => {
    const userRole = decoded.roles || decoded.role || "customer";
    return {
      id: decoded.id,
      userId: decoded.id,
      email: decoded.email,
      roles: userRole,
      role: userRole,
      first_name: decoded.first_name,
      last_name: decoded.last_name,
      name: `${decoded.first_name || ""} ${decoded.last_name || ""}`.trim(),
      isGoogleUser: isGoogleAuth || decoded.isGoogleUser || false,
      isVerified: decoded.isVerified || true,
    };
  }, []);

  const verifyJWT = useCallback((token) => {
    if (!token?.includes(".")) return null;
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.exp && decoded.exp < Date.now() / 1000 ? null : decoded;
    } catch {
      return null;
    }
  }, []);

  const verifyToken = useCallback(async () => {
    const currentAuth = getCurrentUser();

    if (!currentAuth) {
      return { valid: false, error: "No authentication found" };
    }

    const decoded = verifyJWT(currentAuth.token);
    if (!decoded) {
      return { valid: false, error: "Invalid or expired token" };
    }

    return {
      valid: true,
      user: createUserObject(decoded),
      authType: currentAuth.authType,
    };
  }, [getCurrentUser, verifyJWT, createUserObject]);

  const checkUserAccess = useCallback((userRole, allowedRoles = null) => {
    if (!allowedRoles) return true;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return (
      userRole === "admin" ||
      roles.includes(userRole) ||
      (userRole === "staff" && roles.includes("customer"))
    );
  }, []);

  const clearAuth = useCallback(() => {
    // Clear all possible tokens and user data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staffUser");

    setAuth({
      user: null,
      isLoggedIn: false,
      role: null,
      isLoading: false,
      error: null,
      socket: null,
      authType: null,
    });
  }, []);

  const logout = async (role = null) => {
    disconnectSocket();

    if (role) {
      // Logout specific role
      const { tokenKey, userKey } = getStorageKeys(role);
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
    } else {
      // Check if it's Google user before clearing all
      const isGoogleUser = auth.user?.isGoogleUser;

      // Clear all tokens and user data
      clearAuth();

      if (isGoogleUser) {
        setAuth({ ...initialAuthState, isLoading: true });
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/logout`;
        return;
      }
    }

    setAuth({ ...initialAuthState, isLoading: false });
  };

  useEffect(() => {
    const initAuth = async () => {
      const { valid, user, authType } = await verifyToken();
      if (valid && user) {
        setAuth({
          user,
          isLoggedIn: true,
          role: user.role,
          isLoading: false,
          error: null,
          socket: null,
          authType,
        });
        setForceUpdateTrigger((prev) => prev + 1);
      } else {
        clearAuth();
      }
    };
    initAuth();
  }, [verifyToken, clearAuth]);

  // Separate useEffect for socket connection after auth is established
  useEffect(() => {
    if (auth.isLoggedIn && !auth.socket) {
      connectSocket();
    }
  }, [auth.isLoggedIn, auth.socket, connectSocket]);

  const login = async (
    email,
    password,
    isGoogleAuth = false,
    loginType = "customer"
  ) => {
    try {
      setAuth((prev) => ({ ...prev, isLoading: true }));

      let data;
      let authType = loginType;

      if (isGoogleAuth) {
        data = { token: email, user: password };
        authType = "customer"; // Google auth is always customer
      } else {
        // Choose endpoint based on login type
        const endpoint =
          loginType === "customer" ? "/user/login" : "/admin/login";
        const response = await axios.post(endpoint, { email, password });
        data = response.data;

        if (!data.token || !data.user) throw new Error("Invalid response");

        // Determine actual auth type from user role
        authType = data.user.role || data.user.roles || loginType;
      }

      const decoded = verifyJWT(data.token);
      if (!decoded) throw new Error("Invalid token received");

      const user = createUserObject(decoded, isGoogleAuth);

      // Store in role-specific storage
      const { tokenKey, userKey } = getStorageKeys(authType);
      localStorage.setItem(tokenKey, data.token);
      localStorage.setItem(userKey, JSON.stringify(user));

      setAuth({
        user,
        isLoggedIn: true,
        role: user.role,
        isLoading: false,
        error: null,
        isGoogleUser: isGoogleAuth,
        socket: null,
        authType,
      });

      connectSocket();
      setForceUpdateTrigger((prev) => prev + 1);

      return { success: true, message: `Welcome back, ${user.name}!` };
    } catch (err) {
      clearAuth();

      if (
        err.response?.status === 403 &&
        err.response?.data?.requiresVerification
      ) {
        return {
          success: false,
          requiresVerification: true,
          message: err.response.data.message,
          email: err.response.data.email,
        };
      }

      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      setAuth((prev) => ({ ...prev, isLoading: true, error: null }));
      const { data } = await axios.post("/user/register", userData);
      setAuth((prev) => ({ ...prev, isLoading: false }));
      return {
        success: true,
        message: "Registration Successful",
        user: data.user,
      };
    } catch (err) {
      const msg = err.response?.data?.message;
      const errorMessage = msg?.includes("email")
        ? "Email already in use"
        : msg || "Registration Failed";
      setAuth((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, message: errorMessage };
    }
  };

  const updateUserData = (updatedUser) => {
    const authType = auth.authType || "customer";
    const { userKey } = getStorageKeys(authType);
    localStorage.setItem(userKey, JSON.stringify(updatedUser));

    setAuth((prevAuth) => ({
      ...prevAuth,
      user: { ...updatedUser },
      role: updatedUser.role || updatedUser.roles,
    }));
    setForceUpdateTrigger((prev) => prev + 1);
  };

  // Admin Service Methods - integrated into AuthProvider
  const getDashboard = async () => {
    try {
      const token = getCurrentToken();
      const response = await axios.get("/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const getAllUsers = async () => {
    try {
      const token = getCurrentToken();
      const response = await axios.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const getAllBookings = async (filters = {}) => {
    try {
      const token = getCurrentToken();
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

      const response = await axios.get(`/admin/bookings?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const token = getCurrentToken();
      const payload = { status };

      if (notes) payload.notes = notes;
      if (status === "rejected" && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      const response = await axios.put(
        `/admin/bookings/${id}/status`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const updateBooking = async (id, bookingData) => {
    try {
      const token = getCurrentToken();
      const response = await axios.put(`/admin/bookings/${id}`, bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  // Staff Management Methods
  const getAllStaff = async () => {
    try {
      const token = getCurrentToken();
      const response = await axios.get("/admin/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const createStaffAccount = async (staffData) => {
    try {
      const token = getCurrentToken();
      const response = await axios.post("/admin/staff", staffData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const updateStaffAccount = async (staffId, staffData) => {
    try {
      const token = getCurrentToken();
      const response = await axios.put(`/admin/staff/${staffId}`, staffData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const deleteStaffAccount = async (staffId) => {
    try {
      const token = getCurrentToken();
      const response = await axios.delete(`/admin/staff/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const resetStaffPassword = async (staffId, passwordData) => {
    try {
      const token = getCurrentToken();
      const response = await axios.put(
        `/admin/staff/${staffId}/reset-password`,
        passwordData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        login,
        register,
        logout,
        updateUserData,
        connectSocket,
        disconnectSocket,
        checkUserAccess,
        verifyJWT,
        forceUpdateTrigger,
        // Role checks
        isAdmin: auth.role === "admin",
        isStaff: auth.role === "staff",
        isAdminOrStaff: auth.role === "admin" || auth.role === "staff",
        isCustomer: auth.role === "customer",
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
        // Current user getters (for backward compatibility)
        getCurrentAdmin: () => (auth.authType === "admin" ? auth.user : null),
        getCurrentStaff: () => (auth.authType === "staff" ? auth.user : null),
        getCurrentUser,
        getCurrentToken,
        // Authentication checks
        isAuthenticated: (role = null) => {
          if (!auth.isLoggedIn) return false;
          return role ? auth.role === role : true;
        },
        isAdminAuthenticated: () => auth.isLoggedIn && auth.role === "admin",
        isStaffAuthenticated: () => auth.isLoggedIn && auth.role === "staff",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
