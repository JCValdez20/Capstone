import axios from "./axios";

class StaffService {
  /**
   * Create staff account (Admin only)
   */
  async createStaffAccount(staffData) {
    try {
      const response = await axios.post("/admin/staff", staffData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating staff:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create staff",
        error: error.response?.data,
      };
    }
  }

  /**
   * Get all staff accounts (Admin only)
   */
  async getAllStaff() {
    try {
      const response = await axios.get("/admin/staff");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching staff:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch staff",
        error: error.response?.data,
      };
    }
  }

  /**
   * Update staff account (Admin only)
   */
  async updateStaffAccount(staffId, staffData) {
    try {
      const response = await axios.put(`/admin/staff/${staffId}`, staffData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating staff:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update staff",
        error: error.response?.data,
      };
    }
  }

  /**
   * Delete staff account (Admin only)
   */
  async deleteStaffAccount(staffId) {
    try {
      const response = await axios.delete(`/admin/staff/${staffId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting staff:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete staff",
        error: error.response?.data,
      };
    }
  }

  /**
   * Reset staff password (Admin only)
   */
  async resetStaffPassword(staffId, newPassword) {
    try {
      const response = await axios.put(
        `/admin/staff/${staffId}/reset-password`,
        {
          newPassword,
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error resetting staff password:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to reset staff password",
        error: error.response?.data,
      };
    }
  }
}

const staffService = new StaffService();
export default staffService;
