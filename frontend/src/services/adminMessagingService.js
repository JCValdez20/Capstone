import axios from "./axios";

class AdminMessagingService {
  // Get all conversations for current admin
  async getConversations(status = "active", page = 1, limit = 20) {
    try {
      const response = await axios.get("/admin-messaging/conversations", {
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
      const response = await axios.get(
        `/admin-messaging/conversations/booking/${bookingId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get or create direct conversation between admin/staff
  async getDirectConversation(targetUserId) {
    try {
      const response = await axios.get(
        `/admin-messaging/conversations/direct/${targetUserId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get messages in a conversation
  async getMessages(conversationId, page = 1, limit = 50) {
    try {
      const response = await axios.get(
        `/admin-messaging/conversations/${conversationId}/messages`,
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
      const response = await axios.post(
        `/admin-messaging/conversations/${conversationId}/messages`,
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
      const response = await axios.put(
        `/admin-messaging/conversations/${conversationId}/read`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get admin and staff users for direct messaging
  async getStaffAndAdminUsers() {
    try {
      const response = await axios.get("/admin-messaging/staff-admin-users");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get messaging stats (admin only)
  async getStats() {
    try {
      const response = await axios.get("/admin-messaging/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new AdminMessagingService();
