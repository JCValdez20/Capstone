import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach JWT from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401 errors and if we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't attempt refresh if the failing request was already to /auth/refresh or /auth/login
      if (
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/login")
      ) {
        // Clear tokens and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        const currentPath = window.location.pathname;
        if (currentPath.includes("/admin")) {
          window.location.href = "/admin/login";
        } else if (currentPath.includes("/staff")) {
          window.location.href = "/staff/login";
        } else {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Try to refresh the token
        const refreshResponse = await axiosInstance.post("/auth/refresh", {
          refreshToken,
        });

        if (refreshResponse.data.success && refreshResponse.data.accessToken) {
          // Save new tokens
          localStorage.setItem("accessToken", refreshResponse.data.accessToken);
          localStorage.setItem(
            "refreshToken",
            refreshResponse.data.refreshToken
          );

          // Update Authorization header for retry
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;

          // Retry the original request
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        console.warn("🔐 Token refresh failed:", refreshError.message);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        const currentPath = window.location.pathname;
        if (currentPath.includes("/admin")) {
          window.location.href = "/admin/login";
        } else if (currentPath.includes("/staff")) {
          window.location.href = "/staff/login";
        } else {
          window.location.href = "/login";
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
