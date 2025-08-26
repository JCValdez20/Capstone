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
    
    // SIMPLE: Check current URL to determine which token to use
    const currentPath = window.location.pathname;
    
    let token;
    if (currentPath.includes('/admin') || currentPath.includes('/staff')) {
      // On admin/staff interface - use admin token
      token = adminToken;
    } else {
      // On customer interface - use customer token
      token = userToken;
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

      if (wasAdminEndpoint) {
        // Clear admin token if admin endpoint failed
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
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
