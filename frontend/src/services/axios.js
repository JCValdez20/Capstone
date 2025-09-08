import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies for authentication
});

// Remove the token-based auth logic since we're using cookies
axiosInstance.interceptors.request.use((config) => {
  // No need to add Authorization header - cookies are sent automatically
  return config;
});

// Add response interceptor to handle token expiration and automatic refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401 errors and if we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't attempt refresh if the failing request was already to /auth/refresh or /auth/me
      if (
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/me")
      ) {
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token
        const refreshResponse = await axiosInstance.post("/auth/refresh");

        // Only retry if refresh was successful and user is logged in
        if (refreshResponse.data.success && refreshResponse.data.loggedIn) {
          // Retry the original request
          return axiosInstance(originalRequest);
        } else {
          // User is not logged in, don't retry
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Refresh failed - redirect to login only if it's a legitimate 401 (not just no cookies)
        console.warn(
          "🔐 Authentication refresh failed:",
          refreshError.response?.data?.message || refreshError.message
        );

        // Only redirect if the refresh error was a 401 (invalid/expired token)
        // If it was a 200 with loggedIn: false, user just isn't logged in
        if (refreshError.response?.status === 401) {
          // Redirect to appropriate login page based on current path
          const currentPath = window.location.pathname;
          if (currentPath.includes("/admin")) {
            window.location.href = "/admin/login";
          } else if (currentPath.includes("/staff")) {
            window.location.href = "/staff/login";
          } else {
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
