import axios from "./axios";

class AuthService {
  /**
   * Customer login
   */
  async customerLogin(credentials) {
    try {
      const response = await axios.post("/user/login", credentials);
      return {
        success: true,
        user: response.data.user,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
        error: error.response?.data,
      };
    }
  }

  /**
   * Admin/Staff login
   */
  async adminLogin(credentials) {
    try {
      const response = await axios.post("/admin/login", credentials);
      return {
        success: true,
        user: response.data.user,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Admin login failed",
        error: error.response?.data,
      };
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const response = await axios.get("/auth/me");
      return {
        success: true,
        user: response.data.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get user profile",
        error: {
          status: error.response?.status,
          data: error.response?.data,
        },
      };
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    try {
      const response = await axios.post("/auth/refresh");
      return {
        success: true,
        loggedIn: response.data.loggedIn,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        loggedIn: false,
        message: error.response?.data?.message || "Token refresh failed",
        error: error.response?.data,
      };
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      const response = await axios.post("/auth/logout");
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Logout failed",
        error: error.response?.data,
      };
    }
  }

  /**
   * Google OAuth login
   */
  initiateGoogleLogin() {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await axios.post("/user/register", userData);
      return {
        success: true,
        user: response.data.user || response.data,
        message: response.data.message,
        requiresVerification: response.data.requiresVerification,
        developmentMode: response.data.developmentMode,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
        error: error.response?.data,
      };
    }
  }

  /**
   * Verify email with OTP
   */
  async verifyEmail(email, otp) {
    try {
      const response = await axios.post("/user/verify-email", { email, otp });
      return {
        success: true,
        message: response.data.message,
        verified: response.data.verified,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Email verification failed",
        error: error.response?.data,
      };
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email) {
    try {
      const response = await axios.post("/user/resend-verification", { email });
      return {
        success: true,
        message: response.data.message,
        developmentMode: response.data.developmentMode,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to resend verification email",
        error: error.response?.data,
      };
    }
  }

  /**
   * Check if user is authenticated by checking if we can get current user
   * Implements proper refresh logic to avoid infinite retries
   */
  async checkAuth() {
    try {
      // First, try to get current user
      const result = await this.getCurrentUser();
      if (result.success) {
        return result.user;
      }

      // If getCurrentUser failed with 401, try to refresh once
      if (result.error?.status === 401) {
        console.log("🔄 Access token expired, trying to refresh...");

        const refreshResult = await this.refreshToken();

        if (refreshResult.success && refreshResult.loggedIn) {
          // Refresh successful, retry getCurrentUser
          console.log(
            "✅ Token refreshed successfully, retrying getCurrentUser..."
          );
          const retryResult = await this.getCurrentUser();
          return retryResult.success ? retryResult.user : null;
        } else {
          // Refresh failed or user not logged in
          console.log("❌ Token refresh failed or user not logged in");
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error("🔥 Auth check failed:", error);
      return null;
    }
  }
}

const authService = new AuthService();
export default authService;
