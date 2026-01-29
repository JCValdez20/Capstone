import axios from "./axios";

class AdminService {
  /**
   * Get all users (Admin/Staff only)
   */
  async getAllUsers() {
    try {
      const response = await axios.get("/admin/users");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch users",
        error: error.response?.data,
      };
    }
  }

  /**
   * Get user by ID (Admin/Staff only)
   */
  async getUserById(userId) {
    try {
      const response = await axios.get(`/admin/users/${userId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch user",
        error: error.response?.data,
      };
    }
  }

  /**
   * Update user (Admin/Staff only)
   */
  async updateUser(userId, userData) {
    try {
      const response = await axios.put(`/admin/users/${userId}`, userData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating user:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update user",
        error: error.response?.data,
      };
    }
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(userId) {
    try {
      const response = await axios.delete(`/admin/users/${userId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting user:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete user",
        error: error.response?.data,
      };
    }
  }

  /**
   * Get all bookings (Admin/Staff only)
   */
  async getAllBookings(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.status) queryParams.append("status", params.status);
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);

      const url = `/admin/bookings${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await axios.get(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch bookings",
        error: error.response?.data,
      };
    }
  }

  /**
   * Get booking statistics (Admin/Staff only)
   */
  async getBookingStats() {
    try {
      const response = await axios.get("/admin/bookings/stats");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching booking stats:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch booking stats",
        error: error.response?.data,
      };
    }
  }

  /**
   * Update booking status (Admin/Staff only)
   */
  async updateBookingStatus(bookingId, status) {
    try {
      const response = await axios.put(`/admin/bookings/${bookingId}/status`, {
        status,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating booking status:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update booking status",
        error: error.response?.data,
      };
    }
  }
}

const adminService = new AdminService();
export default adminService;
