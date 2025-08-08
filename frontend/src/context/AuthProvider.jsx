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

      return { valid: true, user: storedUser };
    } catch (error) {
      console.error("Token verification error:", error);
      return { valid: false };
    }
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ ...initialAuthState, isLoading: false });
  };

  const logout = async () => {
    try {
      // Clear frontend auth state first
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // If it's a Google user, redirect to backend logout
      if (auth.isGoogleUser) {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/logout`;
      } else {
        // For local users, just clear state
        setAuth({
          ...initialAuthState,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback to local logout if Google logout fails
      setAuth({
        ...initialAuthState,
        isLoading: false,
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
      };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));

      setAuth({
        user,
        isLoggedIn: true,
        role: user.role,
        isLoading: false,
        error: null,
        isGoogleUser: isGoogleAuth,
      });

      return {
        success: true,
        message: `Welcome back, ${user.name}!`,
      };
    } catch (err) {
      console.error("Login error:", err);
      clearAuth();
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


  const value = {
    ...auth,
    login,
    register, // keep your existing register function
    logout, // now handles both types
    isAdmin: auth.role === "admin",
    isCustomer: auth.role === "customer",
  };
  

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
