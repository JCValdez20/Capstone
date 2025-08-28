import axios from "./axios";

class MessagingService {
  // Helper method to get role-based endpoint prefix - SIMPLIFIED
  getRoleBasedPrefix() {
    // SIMPLE: Check current URL to determine interface
    const currentPath = window.location.pathname;

    // If on admin/staff interface, use admin/staff endpoints
    if (currentPath.includes("/admin") || currentPath.includes("/staff")) {
      // Check for staff user first
      const staffUser = JSON.parse(localStorage.getItem("staffUser") || "{}");

      if (staffUser.roles === "staff") {
        return "/messaging/staff";
      }

      // Then check for admin user
      const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

      if (adminUser.roles === "admin") {
        return "/messaging/admin";
      }
    }

    // Default: Customer interface
    return "/messaging";
  }

  // Get all conversations for current user
  async getConversations(status = "active", page = 1, limit = 20) {
    try {
      const prefix = this.getRoleBasedPrefix();
      const endpoint = `${prefix}/conversations`;

      // DEBUG: Show endpoint and Authorization header
      const staffToken = localStorage.getItem("staffToken");
      const adminToken = localStorage.getItem("adminToken");
      const userToken = localStorage.getItem("token");
      let debugAuth = staffToken || adminToken || userToken || "none";
      if (debugAuth.length > 20) debugAuth = debugAuth.substring(0, 20) + "...";
      if (window && window.toast) window.toast(`[DEBUG] Endpoint: ${endpoint}`);
      if (window && window.toast) window.toast(`[DEBUG] Auth: ${debugAuth}`);
      console.log("[DEBUG] Calling endpoint:", endpoint);
      console.log("[DEBUG] Auth header (truncated):", debugAuth);

      const response = await axios.get(endpoint, {
        params: { status, page, limit },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get or create conversation for a booking
  async getBookingConversation(bookingId) {
    try {
      const prefix = this.getRoleBasedPrefix();
      const response = await axios.get(
        `${prefix}/conversations/booking/${bookingId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get or create direct conversation between admin/staff
  async getDirectConversation(targetUserId) {
    try {
      const prefix = this.getRoleBasedPrefix();
      const response = await axios.get(
        `${prefix}/conversations/direct/${targetUserId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get messages in a conversation
  async getMessages(conversationId, page = 1, limit = 50) {
    try {
      const prefix = this.getRoleBasedPrefix();
      const response = await axios.get(
        `${prefix}/conversations/${conversationId}/messages`,
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Send a message
  async sendMessage(
    conversationId,
    content,
    messageType = "text",
    replyTo = null
  ) {
    try {
      const prefix = this.getRoleBasedPrefix();
      const response = await axios.post(
        `${prefix}/conversations/${conversationId}/messages`,
        {
          content,
          messageType,
          replyTo,
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Mark conversation as read
  async markAsRead(conversationId) {
    try {
      const prefix = this.getRoleBasedPrefix();
      const response = await axios.put(
        `${prefix}/conversations/${conversationId}/read`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get admin and staff users for direct messaging
  async getStaffAndAdminUsers() {
    try {
      const prefix = this.getRoleBasedPrefix();
      const response = await axios.get(`${prefix}/staff-admin-users`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get messaging stats (admin only)
  async getStats() {
    try {
      const prefix = this.getRoleBasedPrefix();
      const response = await axios.get(`${prefix}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get staff list for admin to message (admin only)
  async getStaffList() {
    try {
      const response = await axios.get("/messaging/admin/staff-list");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Create direct conversation with staff (admin only)
  async createDirectConversation(staffId) {
    try {
      const response = await axios.post(
        "/messaging/admin/direct-conversation",
        {
          staffId,
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new MessagingService();
