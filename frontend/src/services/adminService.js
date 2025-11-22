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
}

const adminService = new AdminService();
export default adminService;
