import axios from "./axios";

class AdminService {
  // Helper method to get role-specific storage keys
  getStorageKeys(role) {
    if (role === "admin") {
      return { tokenKey: "adminToken", userKey: "adminUser" };
    } else if (role === "staff") {
      return { tokenKey: "staffToken", userKey: "staffUser" };
    }
    // Fallback to original keys for backwards compatibility
    return { tokenKey: "adminToken", userKey: "adminUser" };
  }

  // Admin/Staff login with role-specific storage
  async login(email, password) {
    try {
      const response = await axios.post("/admin/login", {
        email,
        password,
      });

      if (response.data.token && response.data.user) {
        const userRole = response.data.user.role || response.data.user.roles;
        const { tokenKey, userKey } = this.getStorageKeys(userRole);

        localStorage.setItem(tokenKey, response.data.token);
        localStorage.setItem(userKey, JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Role-specific logout
  logout(role = null) {
    if (role) {
      // Logout specific role
      const { tokenKey, userKey } = this.getStorageKeys(role);
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
    } else {
      // Logout all (backwards compatibility)
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("staffToken");
      localStorage.removeItem("staffUser");
    }
  }

  // Get current admin user
  getCurrentAdmin() {
    const adminUser = localStorage.getItem("adminUser");
    return adminUser ? JSON.parse(adminUser) : null;
  }

  // Get current staff user
  getCurrentStaff() {
    const staffUser = localStorage.getItem("staffUser");
    return staffUser ? JSON.parse(staffUser) : null;
  }

  // Get user by role
  getCurrentUser(role) {
    if (role === "admin") {
      return this.getCurrentAdmin();
    } else if (role === "staff") {
      return this.getCurrentStaff();
    }
    return this.getCurrentAdmin(); // Fallback
  }

  // Check if specific role is authenticated
  isAuthenticated(role = null) {
    if (role) {
      const { tokenKey } = this.getStorageKeys(role);
      const token = localStorage.getItem(tokenKey);
      const user = this.getCurrentUser(role);
      return !!(token && user && user.roles === role);
    }

    // Check if any admin/staff is authenticated (backwards compatibility)
    const adminToken = localStorage.getItem("adminToken");
    const staffToken = localStorage.getItem("staffToken");
    const admin = this.getCurrentAdmin();
    const staff = this.getCurrentStaff();

    return !!(
      (adminToken && admin && admin.roles === "admin") ||
      (staffToken && staff && staff.roles === "staff")
    );
  }

  // Check if admin is specifically authenticated
  isAdminAuthenticated() {
    return this.isAuthenticated("admin");
  }

  // Check if staff is specifically authenticated
  isStaffAuthenticated() {
    return this.isAuthenticated("staff");
  }

  // Get token for specific role
  getToken(role = null) {
    if (role) {
      const { tokenKey } = this.getStorageKeys(role);
      return localStorage.getItem(tokenKey);
    }
    return localStorage.getItem("adminToken"); // Fallback
  }

  // Get the appropriate token for API calls (admin first, then staff)
  getApiToken() {
    // Try admin token first
    const adminToken = this.getToken("admin");
    if (adminToken && this.isAdminAuthenticated()) {
      return adminToken;
    }

    // Fall back to staff token
    const staffToken = this.getToken("staff");
    if (staffToken && this.isStaffAuthenticated()) {
      return staffToken;
    }

    // Fallback to original token for backwards compatibility
    return this.getToken();
  }

  // Dashboard data
  async getDashboard() {
    try {
      const response = await axios.get("/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${this.getApiToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // User management methods
  async getAllUsers() {
    try {
      const response = await axios.get("/admin/users", {
        headers: {
          Authorization: `Bearer ${this.getApiToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async getUserById(id) {
    try {
      const response = await axios.get(`/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${this.getApiToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await axios.put(`/admin/users/${id}`, userData, {
        headers: {
          Authorization: `Bearer ${this.getApiToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async deleteUser(id) {
    try {
      const response = await axios.delete(`/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${this.getApiToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Booking management methods
  async getAllBookings(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status);
      }
      if (filters.date) {
        params.append("date", filters.date);
      }
      if (filters.limit) {
        params.append("limit", filters.limit);
      }
      if (filters.page) {
        params.append("page", filters.page);
      }

      const response = await axios.get(`/admin/bookings?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${this.getApiToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async getBookingStats() {
    try {
      const response = await axios.get("/admin/bookings/stats", {
        headers: {
          Authorization: `Bearer ${this.getApiToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async updateBookingStatus(id, status, notes = "", rejectionReason = "") {
    try {
      const payload = { status };

      // Add notes if provided
      if (notes) {
        payload.notes = notes;
      }

      // Add rejection reason if status is rejected
      if (status === "rejected" && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      const response = await axios.put(
        `/admin/bookings/${id}/status`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.getApiToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async updateBooking(id, bookingData) {
    try {
      const response = await axios.put(`/admin/bookings/${id}`, bookingData, {
        headers: {
          Authorization: `Bearer ${this.getApiToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async deleteBooking(id) {
    try {
      const response = await axios.delete(`/admin/bookings/${id}`, {
        headers: {
          Authorization: `Bearer ${this.getApiToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Staff Management Methods
  async createStaffAccount(staffData) {
    try {
      const response = await axios.post("/admin/staff", staffData, {
        headers: {
          Authorization: `Bearer ${this.getApiToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async getAllStaff() {
    try {
      const response = await axios.get("/admin/staff", {
        headers: {
          Authorization: `Bearer ${this.getApiToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async updateStaffAccount(staffId, staffData) {
    try {
      const response = await axios.put(`/admin/staff/${staffId}`, staffData, {
        headers: {
          Authorization: `Bearer ${this.getApiToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async deleteStaffAccount(staffId) {
    try {
      const response = await axios.delete(`/admin/staff/${staffId}`, {
        headers: {
          Authorization: `Bearer ${this.getApiToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async resetStaffPassword(staffId, passwordData) {
    try {
      const response = await axios.put(
        `/admin/staff/${staffId}/reset-password`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${this.getApiToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new AdminService();
