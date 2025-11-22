import axios from "./axios";

class AuthService {
  /**
   * Login (unified for all roles)
   */
  async login(credentials) {
    try {
      const response = await axios.post("/auth/login", credentials);
      return {
        success: true,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: response.data.user,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
        requiresVerification: error.response?.data?.requiresVerification,
        email: error.response?.data?.email,
      };
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await axios.post("/auth/logout");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return { success: true };
    } catch (error) {
      // Clear tokens anyway
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return { success: true };
    }
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
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
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
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Verification failed",
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
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to resend verification",
      };
    }
  }

  /**
   * Get current user
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
        message: error.response?.data?.message || "Failed to get user",
      };
    }
  }
}

const authService = new AuthService();
export default authService;
