import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import axios from "../services/axios";

const initialAuthState = {
  user: null,
  isLoggedIn: false,
  role: null,
  isLoading: true,
  error: null,
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(initialAuthState);
  const [forceUpdateTrigger, setForceUpdateTrigger] = useState(0);

  const verifyToken = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { valid: false };
      }

      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) {
        return { valid: false };
      }

      // Basic token format validation
      if (!token.includes(".")) {
        console.log("Invalid token format detected, clearing auth");
        return { valid: false };
      }

      return { valid: true, user: storedUser };
    } catch (error) {
      console.error("Token verification error:", error);
      return { valid: false };
    }
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({
      user: null,
      isLoggedIn: false,
      role: null,
      isLoading: false,
      error: null,
    });
  };

  const logout = async () => {
    try {
      // Clear frontend auth state first
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // If it's a Google user, redirect to backend logout
      if (auth.user?.isGoogleUser || auth.isGoogleUser) {
        // Set loading state before redirect
        setAuth({
          user: null,
          isLoggedIn: false,
          role: null,
          isLoading: true, // Keep loading true during redirect
          error: null,
        });
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/logout`;
      } else {
        // For local users, just clear state
        setAuth({
          user: null,
          isLoggedIn: false,
          role: null,
          isLoading: false, // Make sure this is false
          error: null,
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback to local logout if Google logout fails
      setAuth({
        user: null,
        isLoggedIn: false,
        role: null,
        isLoading: false, // Make sure this is false
        error: null,
      });
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const { valid, user } = await verifyToken();
      if (valid && user) {
        setAuth({
          user,
          isLoggedIn: true,
          role: user.role,
          isLoading: false,
          error: null,
        });

        // Trigger initial render
        setForceUpdateTrigger((prev) => prev + 1);
      } else {
        clearAuth();
      }
    };

    initAuth();
  }, []);

  const login = async (email, password, isGoogleAuth = false) => {
    try {
      setAuth((prev) => ({ ...prev, isLoading: true }));

      let data;
      if (isGoogleAuth) {
        // Google auth already provides standardized data
        data = { token: email, user: password };
      } else {
        const response = await axios.post("/user/login", { email, password });
        data = response.data;
        if (!data.token || !data.user) throw new Error("Invalid response");
      }

      // Standardized user object handling
      const user = {
        ...data.user,
        name:
          data.user.name || `${data.user.first_name} ${data.user.last_name}`,
        role: data.user.role || data.user.roles, // Handle both cases
        // Ensure profile picture is included
        profilePic: data.user.profilePic || "",
      };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Login successful - Token stored:", data.token ? "✓" : "✗");
      console.log("Login successful - User stored:", user ? "✓" : "✗");

      const newAuthState = {
        user,
        isLoggedIn: true,
        role: user.role,
        isLoading: false,
        error: null,
        isGoogleUser: isGoogleAuth,
      };

      setAuth(newAuthState);

      // Also trigger the force update to ensure UI updates
      setForceUpdateTrigger((prev) => prev + 1);

      return {
        success: true,
        message: `Welcome back, ${user.name}!`,
      };
    } catch (err) {
      console.error("Login error:", err);
      clearAuth();

      // Check if it's an email verification error
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

  // SIMPLE, DIRECT UPDATE FUNCTION
  const updateUserData = (updatedUser) => {
    try {
      // Step 1: Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Step 2: FORCE React state update with completely new object
      setAuth((prevAuth) => {
        const newAuth = {
          user: { ...updatedUser }, // Create new object reference
          isLoggedIn: prevAuth.isLoggedIn,
          role: updatedUser.role || updatedUser.roles,
          isLoading: prevAuth.isLoading,
          error: prevAuth.error,
          isGoogleUser: prevAuth.isGoogleUser,
        };
        return newAuth;
      });

      // Step 3: Force re-render trigger
      setForceUpdateTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("❌ Error updating user data:", error);
    }
  };

  const value = {
    ...auth,
    login,
    register, // keep your existing register function
    logout, // now handles both types
    updateUserData, // Add the new function
    forceUpdateTrigger, // Add this to trigger re-renders
    isAdmin: auth.role === "admin",
    isStaff: auth.role === "staff",
    isAdminOrStaff: auth.role === "admin" || auth.role === "staff",
    isCustomer: auth.role === "customer",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
