import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import bookingService from "../services/bookingService";
import adminService from "../services/adminService";
import staffService from "../services/staffService";

const AuthContext = createContext(null);

// Helper functions for localStorage
const storage = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setAccessToken: (token) => localStorage.setItem("accessToken", token),
  setRefreshToken: (token) => localStorage.setItem("refreshToken", token),
  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};

// Decode user from JWT
const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles || [],
      first_name: decoded.first_name,
      last_name: decoded.last_name,
      name: `${decoded.first_name} ${decoded.last_name}`,
    };
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize: Check if user is logged in
  useEffect(() => {
    const token = storage.getAccessToken();
    if (token) {
      const userData = getUserFromToken(token);
      setUser(userData);
    }
    setIsLoading(false);
  }, []);

  // Login
  const login = (accessToken, refreshToken, userData) => {
    console.log("🔐 SimpleAuthContext.login called with:", {
      accessToken: accessToken ? "present" : "missing",
      refreshToken: refreshToken ? "present" : "missing",
      userData,
      userDataRoles: userData?.roles,
    });
    storage.setAccessToken(accessToken);
    storage.setRefreshToken(refreshToken);
    setUser(userData);
  };

  // Logout
  const logout = () => {
    storage.clearTokens();
    setUser(null);
  };

  // Register
  const register = async (userData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Registration failed",
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      };
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Role checks
  const hasRole = (role) => {
    if (!user || !user.roles) {
      console.log("🔍 hasRole check failed:", {
        role,
        user,
        userRoles: user?.roles,
      });
      return false;
    }
    const result = user.roles.includes(role);
    console.log("🔍 hasRole check:", { role, userRoles: user.roles, result });
    return result;
  };

  const isAdmin = () => hasRole("admin");
  const isStaff = () => hasRole("staff");
  const isCustomer = () => hasRole("customer");
  const isAuthenticated = () => !!user;

  // Booking methods - delegate to bookingService
  const getUserBookings = (params = {}) =>
    bookingService.getUserBookings(params);
  const cancelBooking = (bookingId, cancellationReason) =>
    bookingService.cancelBooking(bookingId, cancellationReason);
  const createBooking = (bookingData) =>
    bookingService.createBooking(bookingData);
  const getAvailableSlots = (date, services = []) =>
    bookingService.getAvailableSlots(date, services);
  const validateServices = (services) =>
    bookingService.validateServices(services);
  const getServicesCatalog = () => bookingService.getServicesCatalog();

  // Admin methods - delegate to adminService and extract data
  const getAllUsers = async () => {
    const response = await adminService.getAllUsers();
    // Return the actual users array from response.data.data
    return response.data?.data || response.data || [];
  };

  const getAllBookings = async (filters = {}) => {
    const params = {};
    if (filters.status && filters.status !== "all")
      params.status = filters.status;
    if (filters.date) params.date = filters.date;
    if (filters.limit) params.limit = filters.limit;
    if (filters.page) params.page = filters.page;
    const response = await bookingService.getAllBookings(params);
    return response;
  };

  const updateBookingStatus = (id, status, notes = "", rejectionReason = "") =>
    bookingService.updateBookingStatus(id, status, notes, rejectionReason);
  const updateBooking = (id, bookingData) =>
    bookingService.updateBooking(id, bookingData);

  // Staff methods - delegate to staffService and extract data
  const getAllStaff = async () => {
    const response = await staffService.getAllStaff();
    // Return the actual staff array from response.data.staff
    return response.data?.staff || response.data?.data || [];
  };

  const createStaffAccount = (staffData) =>
    staffService.createStaffAccount(staffData);
  const updateStaffAccount = (staffId, staffData) =>
    staffService.updateStaffAccount(staffId, staffData);
  const deleteStaffAccount = (staffId) =>
    staffService.deleteStaffAccount(staffId);
  const resetStaffPassword = (staffId, passwordData) =>
    staffService.resetStaffPassword(staffId, passwordData.newPassword);

  // Current user getters
  const getCurrentAdmin = () => (isAuthenticated() && isAdmin() ? user : null);
  const getCurrentStaff = () => (isAuthenticated() && isStaff() ? user : null);
  const getCurrentCustomer = () =>
    isAuthenticated() && isCustomer() ? user : null;

  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
    updateUser,
    hasRole,
    isAdmin,
    isStaff,
    isCustomer,
    isAuthenticated,
    // Compatibility methods
    isAdminAuthenticated: () => isAuthenticated() && isAdmin(),
    isStaffAuthenticated: () => isAuthenticated() && isStaff(),
    isCustomerAuthenticated: () => isAuthenticated() && isCustomer(),
    // Booking methods
    getUserBookings,
    cancelBooking,
    createBooking,
    getAvailableSlots,
    validateServices,
    getServicesCatalog,
    // Admin methods
    getAllUsers,
    getAllBookings,
    updateBookingStatus,
    updateBooking,
    // Staff methods
    getAllStaff,
    createStaffAccount,
    updateStaffAccount,
    deleteStaffAccount,
    resetStaffPassword,
    // Current user getters
    getCurrentAdmin,
    getCurrentStaff,
    getCurrentCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
