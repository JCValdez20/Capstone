const express = require("express");
const router = express.Router();
const MessagingController = require("../controllers/MessagingController");
const StaffAuth = require("../middleware/StaffAuth");

// Get all conversations for the authenticated staff
router.get("/conversations", StaffAuth, MessagingController.getConversations);

// Get or create a conversation for a specific booking
router.get(
  "/conversations/booking/:bookingId",
  StaffAuth,
  MessagingController.getOrCreateConversation
);

// Get or create a direct conversation between admin/staff users
router.get(
  "/conversations/direct/:targetUserId",
  StaffAuth,
  MessagingController.getOrCreateDirectConversation
);

// Get all admin/staff users for direct messaging
router.get(
  "/staff-admin-users",
  StaffAuth,
  MessagingController.getStaffAndAdminUsers
);

// Get messages in a conversation
router.get(
  "/conversations/:conversationId/messages",
  StaffAuth,
  MessagingController.getMessages
);

// Send a message in a conversation
router.post(
  "/conversations/:conversationId/messages",
  StaffAuth,
  MessagingController.sendMessage
);

// Mark conversation as read
router.put(
  "/conversations/:conversationId/read",
  StaffAuth,
  MessagingController.markAsRead
);

// Get messaging statistics (staff access)
router.get("/stats", StaffAuth, MessagingController.getStats);

module.exports = router;
