import axios from "./axios";

class StaffMessagingService {
  // Get all conversations for current staff
  async getConversations(status = "active", page = 1, limit = 20) {
    try {
      const response = await axios.get("/staff-messaging/conversations", {
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
        `/staff-messaging/conversations/booking/${bookingId}`
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
        `/staff-messaging/conversations/direct/${targetUserId}`
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
        `/staff-messaging/conversations/${conversationId}/messages`,
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
        `/staff-messaging/conversations/${conversationId}/messages`,
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
        `/staff-messaging/conversations/${conversationId}/read`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get admin and staff users for direct messaging
  async getStaffAndAdminUsers() {
    try {
      const response = await axios.get("/staff-messaging/staff-admin-users");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get messaging stats (staff access)
  async getStats() {
    try {
      const response = await axios.get("/staff-messaging/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new StaffMessagingService();
