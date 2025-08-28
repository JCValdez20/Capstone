import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  // Only add Authorization header if one is not explicitly provided
  if (!config.headers.Authorization) {
    const userToken = localStorage.getItem("token");
    const adminToken = localStorage.getItem("adminToken");
    const staffToken = localStorage.getItem("staffToken");

    // SIMPLE: Check current URL to determine which token to use
    const currentPath = window.location.pathname;

    let token;
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const staffUser = JSON.parse(localStorage.getItem("staffUser") || "{}");

    // Debug logging
    console.log("🔍 Current path:", currentPath);
    console.log("🔍 Admin user:", adminUser);
    console.log("🔍 Staff user:", staffUser);
    console.log("🔍 Admin token exists:", !!adminToken);
    console.log("🔍 Staff token exists:", !!staffToken);

    if (currentPath.includes("/admin")) {
      // On admin interface, use admin token if available
      if (adminUser.roles === "admin" && adminToken) {
        token = adminToken;
        console.log("🔍 Using admin token");
      } else if (staffUser.roles === "staff" && staffToken) {
        token = staffToken;
        console.log("🔍 Using staff token (fallback)");
      }
    } else if (currentPath.includes("/staff")) {
      // On staff interface, use staff token if available
      if (staffUser.roles === "staff" && staffToken) {
        token = staffToken;
        console.log("🔍 Using staff token");
      } else if (adminUser.roles === "admin" && adminToken) {
        token = adminToken;
        console.log("🔍 Using admin token (fallback)");
      }
    } else {
      // On customer interface - use customer token
      token = userToken;
      console.log("🔍 Using customer token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      const wasAdminEndpoint =
        error.config.url &&
        (error.config.url.startsWith("/admin") ||
          error.config.url.includes("/admin/"));

      const wasStaffEndpoint =
        error.config.url &&
        (error.config.url.startsWith("/staff") ||
          error.config.url.includes("/staff/"));

      if (wasAdminEndpoint || wasStaffEndpoint) {
        // Clear both admin and staff tokens if admin/staff endpoint failed
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("staffToken");
        localStorage.removeItem("staffUser");
      } else {
        // Clear user token if user endpoint failed
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
