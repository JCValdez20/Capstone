const express = require("express");
const router = express.Router();
const MessagingController = require("../controllers/MessagingController");
const AdminAuth = require("../middleware/AdminAuth");

// Get all conversations for the authenticated admin
router.get("/conversations", AdminAuth, MessagingController.getConversations);

// Get or create a conversation for a specific booking
router.get(
  "/conversations/booking/:bookingId",
  AdminAuth,
  MessagingController.getOrCreateConversation
);

// Get or create a direct conversation between admin/staff users
router.get(
  "/conversations/direct/:targetUserId",
  AdminAuth,
  MessagingController.getOrCreateDirectConversation
);

// Get all admin/staff users for direct messaging
router.get(
  "/staff-admin-users",
  AdminAuth,
  MessagingController.getStaffAndAdminUsers
);

// Get messages in a conversation
router.get(
  "/conversations/:conversationId/messages",
  AdminAuth,
  MessagingController.getMessages
);

// Send a message in a conversation
router.post(
  "/conversations/:conversationId/messages",
  AdminAuth,
  MessagingController.sendMessage
);

// Mark conversation as read
router.put(
  "/conversations/:conversationId/read",
  AdminAuth,
  MessagingController.markAsRead
);

// Get messaging statistics (admin only)
router.get("/stats", AdminAuth, MessagingController.getStats);

module.exports = router;
