const express = require("express");
const router = express.Router();
const MessagingController = require("../controllers/MessagingController");
const Auth = require("../middleware/auth");
const Roles = require("../middleware/roles");

router.get(
  "/conversations",
  Roles.anyAuth(),
  MessagingController.getConversations
);

// Get or create a conversation for a specific booking
router.get(
  "/conversations/booking/:bookingId",
  Roles.anyAuth(),
  MessagingController.getOrCreateConversation
);

// Get or create a direct conversation (admin/staff only)
router.get(
  "/conversations/direct/:targetUserId",
  Roles.staffOrAdmin(),
  MessagingController.getOrCreateDirectConversation
);

// Get all admin/staff users for direct messaging (admin/staff only)
router.get(
  "/staff-admin-users",
  Roles.staffOrAdmin(),
  MessagingController.getStaffAndAdminUsers
);

// Get messages in a conversation
router.get(
  "/conversations/:conversationId/messages",
  Roles.anyAuth(),
  MessagingController.getMessages
);

// Send a message in a conversation
router.post(
  "/conversations/:conversationId/messages",
  Roles.anyAuth(),
  MessagingController.sendMessage
);

// Mark conversation as read
router.put(
  "/conversations/:conversationId/read",
  Roles.anyAuth(),
  MessagingController.markAsRead
);

// Archive conversation (all users can archive their own conversations)
router.put(
  "/conversations/:conversationId/archive",
  Roles.anyAuth(),
  MessagingController.archiveConversation
);

// Search messages (admin/staff only)
router.get("/search", Roles.staffOrAdmin(), MessagingController.searchMessages);

// Get messaging statistics (admin only)
router.get("/stats", Roles.admin(), MessagingController.getStats);

// Delete conversation (admin only)
router.delete(
  "/conversations/:conversationId",
  Roles.admin(),
  MessagingController.deleteConversation
);

// ==============================================
// STAFF-SPECIFIC ROUTES
// ==============================================

// Staff conversations (all conversations they can access)
router.get(
  "/staff/conversations",
  Roles.staff(),
  MessagingController.getStaffConversations
);

// Staff get messages
router.get(
  "/staff/conversations/:conversationId/messages",
  Roles.staff(),
  MessagingController.getMessages
);

// Staff send message
router.post(
  "/staff/conversations/:conversationId/messages",
  Roles.staff(),
  MessagingController.sendMessage
);

// Staff mark as read
router.put(
  "/staff/conversations/:conversationId/read",
  Roles.staff(),
  MessagingController.markAsRead
);

// Staff get admin users
router.get(
  "/staff/staff-admin-users",
  Roles.staff(),
  MessagingController.getStaffAndAdminUsers
);

// ==============================================
// ADMIN-SPECIFIC ROUTES
// ==============================================

// Admin conversations (all conversations)
router.get(
  "/admin/conversations",
  Roles.admin(),
  MessagingController.getAdminConversations
);

// Admin get messages
router.get(
  "/admin/conversations/:conversationId/messages",
  Roles.admin(),
  MessagingController.getMessages
);

// Admin send message
router.post(
  "/admin/conversations/:conversationId/messages",
  Roles.admin(),
  MessagingController.sendMessage
);

// Admin mark as read
router.put(
  "/admin/conversations/:conversationId/read",
  Roles.admin(),
  MessagingController.markAsRead
);

// Admin get staff users
router.get(
  "/admin/staff-admin-users",
  Roles.admin(),
  MessagingController.getStaffAndAdminUsers
);

// Admin get staff list for messaging
router.get(
  "/admin/staff-list",
  Roles.admin(),
  MessagingController.getStaffList
);

// Admin create direct conversation with staff
router.post(
  "/admin/direct-conversation",
  Roles.admin(),
  MessagingController.createDirectConversation
);

// Admin statistics
router.get("/admin/stats", Roles.admin(), MessagingController.getStats);

module.exports = router;
