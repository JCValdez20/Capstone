const socketManager = require("../utils/SocketManager");
const send = require("../utils/Response");
const MessagingService = require("../services/MessagingService");

/**
 * Enhanced MessagingController with RBAC Integration
 * Handles HTTP requests and delegates business logic to MessagingService
 */
class MessagingController {
  // Get all conversations for a user with RBAC
  async getConversations(req, res) {
    try {
      const { id: userId, role: userRole } = req.userData;
      const { status = "active", page = 1, limit = 20 } = req.query;

      const conversations = await MessagingService.getConversationsForUser(
        userId,
        userRole,
        { status, page: parseInt(page), limit: parseInt(limit) }
      );

      return send.sendResponseMessage(
        res,
        200,
        {
          conversations,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: conversations.length,
          },
        },
        "Conversations fetched successfully"
      );
    } catch (error) {
      console.error("Get conversations error:", error);
      return send.sendErrorMessage(res, 500, error);
    }
  }

  // Get or create a conversation for a booking with RBAC
  async getOrCreateConversation(req, res) {
    try {
      const { id: userId, role: userRole } = req.userData;
      const { bookingId } = req.params;

      const conversation =
        await MessagingService.createOrGetBookingConversation(
          bookingId,
          userId,
          userRole
        );

      return send.sendResponseMessage(
        res,
        200,
        conversation,
        "Conversation fetched successfully"
      );
    } catch (error) {
      console.error("Get or create conversation error:", error);
      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("Access denied")
        ? 403
        : 500;
      return send.sendErrorMessage(res, statusCode, error);
    }
  }

  // Get or create direct conversation (admin-staff only)
  async getOrCreateDirectConversation(req, res) {
    try {
      const { id: userId, role: userRole } = req.userData;
      const { targetUserId } = req.params;

      // Only admin and staff can have direct conversations
      if (userRole !== "admin" && userRole !== "staff") {
        return send.sendErrorMessage(
          res,
          403,
          new Error("Access denied. Admin or staff privileges required.")
        );
      }

      // Verify target user is admin or staff
      const targetUser = await MessagingService.verifyDirectMessagingUser(
        targetUserId
      );
      if (!targetUser) {
        return send.sendErrorMessage(
          res,
          404,
          new Error("Target user not found or invalid role")
        );
      }

      const conversation = await MessagingService.createOrGetDirectConversation(
        userId,
        targetUserId,
        userRole
      );

      return send.sendResponseMessage(
        res,
        200,
        conversation,
        "Direct conversation fetched successfully"
      );
    } catch (error) {
      console.error("Get or create direct conversation error:", error);
      return send.sendErrorMessage(res, 500, error);
    }
  }

  // Get messages for a conversation with RBAC
  async getMessages(req, res) {
    try {
      const { id: userId, role: userRole } = req.userData;
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const messages = await MessagingService.getMessages(
        conversationId,
        userId,
        userRole,
        { page: parseInt(page), limit: parseInt(limit) }
      );

      // Emit read status to other participants
      socketManager.emitToConversation(conversationId, "messages_read", {
        conversationId: conversationId,
        readBy: userId,
        readAt: new Date(),
      });

      return send.sendResponseMessage(
        res,
        200,
        {
          messages,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: messages.length,
          },
        },
        "Messages fetched successfully"
      );
    } catch (error) {
      console.error("Get messages error:", error);
      const statusCode = error.message.includes("Access denied") ? 403 : 500;
      return send.sendErrorMessage(res, statusCode, error);
    }
  }

  // Send a message with RBAC validation
  async sendMessage(req, res) {
    try {
      const { id: userId, role: userRole } = req.userData;
      const { conversationId } = req.params;
      const { content, messageType = "text", replyTo = null } = req.body;

      // Validate content
      if (!content || content.trim() === "") {
        return send.sendErrorMessage(
          res,
          400,
          new Error("Message content is required")
        );
      }

      const message = await MessagingService.sendMessage(
        conversationId,
        userId,
        userRole,
        { content, messageType, replyTo }
      );

      // Emit to conversation participants
      socketManager.emitToConversation(conversationId, "new_message", {
        conversationId,
        message: message.toObject(),
      });

      return send.sendResponseMessage(
        res,
        201,
        message,
        "Message sent successfully"
      );
    } catch (error) {
      console.error("Send message error:", error);
      const statusCode = error.message.includes("Access denied") ? 403 : 500;
      return send.sendErrorMessage(res, statusCode, error);
    }
  }

  // Mark messages as read
  async markAsRead(req, res) {
    try {
      const { id: userId, role: userRole } = req.userData;
      const { conversationId } = req.params;

      // Verify access to conversation
      const { canAccess } = await MessagingService.canAccessConversation(
        conversationId,
        userId,
        userRole
      );

      if (!canAccess) {
        return send.sendErrorMessage(res, 403, new Error("Access denied"));
      }

      await MessagingService.markConversationAsRead(conversationId, userId);

      // Notify other participants
      socketManager.emitToConversation(conversationId, "messages_read", {
        conversationId: conversationId,
        readBy: userId,
        readAt: new Date(),
      });

      return send.sendResponseMessage(
        res,
        200,
        { readAt: new Date() },
        "Messages marked as read"
      );
    } catch (error) {
      console.error("Mark as read error:", error);
      return send.sendErrorMessage(res, 500, error);
    }
  }

  // Get staff and admin users for direct messaging
  async getStaffAndAdminUsers(req, res) {
    try {
      const { id: userId, role: userRole } = req.userData;

      const users = await MessagingService.getMessagingUsers(userId, userRole);

      return send.sendResponseMessage(
        res,
        200,
        { users },
        "Users fetched successfully"
      );
    } catch (error) {
      console.error("Get staff and admin users error:", error);
      const statusCode = error.message.includes("Access denied") ? 403 : 500;
      return send.sendErrorMessage(res, statusCode, error);
    }
  }

  // Get conversation statistics (admin only)
  async getStats(req, res) {
    try {
      const { role: userRole } = req.userData;

      const stats = await MessagingService.getMessagingStats(userRole);

      return send.sendResponseMessage(
        res,
        200,
        stats,
        "Statistics fetched successfully"
      );
    } catch (error) {
      console.error("Get stats error:", error);
      const statusCode = error.message.includes("Access denied") ? 403 : 500;
      return send.sendErrorMessage(res, statusCode, error);
    }
  }

  // Delete a conversation (admin only)
  async deleteConversation(req, res) {
    try {
      const { role: userRole } = req.userData;
      const { conversationId } = req.params;

      if (userRole !== "admin") {
        return send.sendErrorMessage(
          res,
          403,
          new Error("Access denied. Admin privileges required.")
        );
      }

      await MessagingService.deleteConversation(conversationId);

      // Notify participants
      socketManager.emitToConversation(conversationId, "conversation_deleted", {
        conversationId,
        deletedAt: new Date(),
      });

      return send.sendResponseMessage(
        res,
        200,
        { deletedAt: new Date() },
        "Conversation deleted successfully"
      );
    } catch (error) {
      console.error("Delete conversation error:", error);
      return send.sendErrorMessage(res, 500, error);
    }
  }

  // Archive a conversation
  async archiveConversation(req, res) {
    try {
      const { id: userId, role: userRole } = req.userData;
      const { conversationId } = req.params;

      const result = await MessagingService.archiveConversation(
        conversationId,
        userId,
        userRole
      );

      return send.sendResponseMessage(
        res,
        200,
        result,
        "Conversation archived successfully"
      );
    } catch (error) {
      console.error("Archive conversation error:", error);
      const statusCode = error.message.includes("Access denied") ? 403 : 500;
      return send.sendErrorMessage(res, statusCode, error);
    }
  }

  // Search messages (admin/staff only)
  async searchMessages(req, res) {
    try {
      const { role: userRole } = req.userData;
      const { query, page = 1, limit = 20 } = req.query;

      if (userRole === "customer") {
        return send.sendErrorMessage(
          res,
          403,
          new Error("Access denied. Admin or staff privileges required.")
        );
      }

      const results = await MessagingService.searchMessages(query, userRole, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return send.sendResponseMessage(
        res,
        200,
        results,
        "Search completed successfully"
      );
    } catch (error) {
      console.error("Search messages error:", error);
      return send.sendErrorMessage(res, 500, error);
    }
  }

  // Staff-specific: Get all conversations accessible by staff
  async getStaffConversations(req, res) {
    try {
      const { id: userId, role: userRole } = req.userData;
      const { status = "active", page = 1, limit = 20 } = req.query;

      const conversations = await MessagingService.getConversationsForUser(
        userId,
        userRole,
        { status, page: parseInt(page), limit: parseInt(limit) }
      );

      return send.sendResponseMessage(
        res,
        200,
        {
          conversations,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: conversations.length,
          },
        },
        "Staff conversations fetched successfully"
      );
    } catch (error) {
      console.error("Get staff conversations error:", error);
      return send.sendErrorMessage(res, 500, error);
    }
  }

  // Admin-specific: Get all conversations accessible by admin
  async getAdminConversations(req, res) {
    try {
      const { id: userId, role: userRole } = req.userData;
      const { status = "active", page = 1, limit = 20 } = req.query;

      const conversations = await MessagingService.getConversationsForUser(
        userId,
        userRole,
        { status, page: parseInt(page), limit: parseInt(limit) }
      );

      return send.sendResponseMessage(
        res,
        200,
        {
          conversations,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: conversations.length,
          },
        },
        "Admin conversations fetched successfully"
      );
    } catch (error) {
      console.error("Get admin conversations error:", error);
      return send.sendErrorMessage(res, 500, error);
    }
  }

  // Get all staff members for admin to message
  async getStaffList(req, res) {
    try {
      const { role: userRole } = req.userData;

      // Only admins can get staff list
      if (userRole !== "admin") {
        return send.sendErrorMessage(
          res,
          403,
          "Access denied: Admin role required"
        );
      }

      const staffMembers = await MessagingService.getStaffList();

      return send.sendResponseMessage(
        res,
        200,
        { staffMembers },
        "Staff list fetched successfully"
      );
    } catch (error) {
      console.error("Get staff list error:", error);
      return send.sendErrorMessage(res, 500, error);
    }
  }

  // Create or get direct conversation between admin and staff
  async createDirectConversation(req, res) {
    try {
      const { id: adminId, role: userRole } = req.userData;
      const { staffId } = req.body;

      // Only admins can create direct conversations
      if (userRole !== "admin") {
        return send.sendErrorMessage(
          res,
          403,
          "Access denied: Admin role required"
        );
      }

      if (!staffId) {
        return send.sendErrorMessage(res, 400, "Staff ID is required");
      }

      const conversation = await MessagingService.createOrGetDirectConversation(
        adminId,
        staffId
      );

      return send.sendResponseMessage(
        res,
        200,
        { conversation },
        "Direct conversation created successfully"
      );
    } catch (error) {
      console.error("Create direct conversation error:", error);
      return send.sendErrorMessage(res, 500, error.message);
    }
  }
}

module.exports = new MessagingController();
