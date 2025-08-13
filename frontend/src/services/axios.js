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
    // For user endpoints, prioritize user token
    // For admin endpoints, prioritize admin token
    const userToken = localStorage.getItem("token");
    const adminToken = localStorage.getItem("adminToken");

    // Check if this is an admin endpoint
    const isAdminEndpoint =
      config.url &&
      (config.url.startsWith("/admin") || config.url.includes("/admin/"));

    let token;
    if (isAdminEndpoint) {
      // For admin endpoints, use admin token first, then user token as fallback
      token = adminToken || userToken;
    } else {
      // For regular endpoints, use user token first, then admin token as fallback
      token = userToken || adminToken;
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
