import axios from "./axios";

class AdminService {
  // Admin login
  async login(email, password) {
    try {
      const response = await axios.post("/admin/login", {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem("adminUser", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Admin logout
  logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  }

  // Get current admin user
  getCurrentAdmin() {
    const adminUser = localStorage.getItem("adminUser");
    return adminUser ? JSON.parse(adminUser) : null;
  }

  // Check if user is authenticated admin
  isAuthenticated() {
    const token = localStorage.getItem("adminToken");
    const admin = this.getCurrentAdmin();
    return !!(token && admin && admin.role === "admin");
  }

  // Get admin token
  getToken() {
    return localStorage.getItem("adminToken");
  }

  // Dashboard data
  async getDashboard() {
    try {
      const response = await axios.get("/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
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
          Authorization: `Bearer ${this.getToken()}`,
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
          Authorization: `Bearer ${this.getToken()}`,
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
          Authorization: `Bearer ${this.getToken()}`,
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
          Authorization: `Bearer ${this.getToken()}`,
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

      const response = await axios.get(`/admin/bookings?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async getBookingStats() {
    try {
      const response = await axios.get("/admin/bookings/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async updateBookingStatus(id, status, notes = "", rejectionReason = "") {
    try {
      const payload = { status, notes };
      
      // Add rejection reason if status is rejected
      if (status === "rejected" && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      const response = await axios.put(`/admin/bookings/${id}/status`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async deleteBooking(id) {
    try {
      const response = await axios.delete(`/admin/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new AdminService();
