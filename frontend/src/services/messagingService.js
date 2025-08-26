import axios from "./axios";

class MessagingService {
  // Helper method to get role-based endpoint prefix - SIMPLIFIED
  getRoleBasedPrefix() {
    // SIMPLE: Check current URL to determine interface
    const currentPath = window.location.pathname;
    
    // If on admin/staff interface, use admin/staff endpoints
    if (currentPath.includes('/admin') || currentPath.includes('/staff')) {
      const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
      
      if (adminUser.roles === "admin") {
        return "/messaging/admin";
      } else if (adminUser.roles === "staff") {
        return "/messaging/staff";
      }
    }
    
    // Default: Customer interface
    return "/messaging";
  }

  // Get all conversations for current user
  async getConversations(status = "active", page = 1, limit = 20) {
    try {
      const prefix = this.getRoleBasedPrefix();
      const response = await axios.get(`${prefix}/conversations`, {
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
}

export default new MessagingService();
