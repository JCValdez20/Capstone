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

  const login = async (email, password) => {
    try {
      setAuth((prev) => ({ ...prev, isLoading: true }));

      const { data } = await axios.post("/user/login", { email, password });
      console.log("Login response:", data); // Debug log

      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }

      // Create user object with combined name
      const userWithFullName = {
        ...data.user,
        name: `${data.user.first_name} ${data.user.last_name}`,
      };

      // Store auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userWithFullName));

      // Update auth state
      setAuth({
        user: userWithFullName,
        isLoggedIn: true,
        role: data.user.role,
        isLoading: false,
        error: null,
      });

      return {
        success: true,
        message: `Welcome back, ${userWithFullName.name}!`,
      };
    } catch (err) {
      console.error("Login error:", err);
      clearAuth();

      return {
        success: false,
        message: err.response?.data?.message || "Invalid credentials",
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
    register,
    logout: clearAuth,
    isAdmin: auth.role === "admin",
    isBuyer: auth.role === "buyer",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
