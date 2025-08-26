const express = require("express");
const router = express.Router();
const MessagingController = require("../controllers/EnhancedMessagingController");
const RBACMiddleware = require("../middleware/RBACMiddleware");

// RBAC shortcuts for messaging permissions
const customerAuth = RBACMiddleware.authorize(['customer']);
const staffAuth = RBACMiddleware.authorize(['staff']);
const adminAuth = RBACMiddleware.authorize(['admin']);
const staffAdminAuth = RBACMiddleware.authorize(['admin', 'staff']);
const allRoles = RBACMiddleware.authorize(['admin', 'staff', 'customer']);

// Get all conversations for the authenticated customer
router.get("/conversations", allRoles, MessagingController.getConversations); // Temporarily allow all roles

// Get or create a conversation for a specific booking
router.get(
  "/conversations/booking/:bookingId",
  allRoles, // All roles can access booking conversations with proper checks
  MessagingController.getOrCreateConversation
);

// Get or create a direct conversation (admin/staff only)
router.get(
  "/conversations/direct/:targetUserId",
  staffAdminAuth,
  MessagingController.getOrCreateDirectConversation
);

// Get all admin/staff users for direct messaging (admin/staff only)
router.get(
  "/staff-admin-users",
  staffAdminAuth,
  MessagingController.getStaffAndAdminUsers
);

// Get messages in a conversation
router.get(
  "/conversations/:conversationId/messages",
  allRoles,
  MessagingController.getMessages
);

// Send a message in a conversation
router.post(
  "/conversations/:conversationId/messages",
  allRoles,
  MessagingController.sendMessage
);

// Mark conversation as read
router.put(
  "/conversations/:conversationId/read",
  allRoles,
  MessagingController.markAsRead
);

// Archive conversation (all users can archive their own conversations)
router.put(
  "/conversations/:conversationId/archive",
  allRoles,
  MessagingController.archiveConversation
);

// Search messages (admin/staff only)
router.get(
  "/search",
  staffAdminAuth,
  MessagingController.searchMessages
);

// Get messaging statistics (admin only)
router.get("/stats", adminAuth, MessagingController.getStats);

// Delete conversation (admin only)
router.delete(
  "/conversations/:conversationId",
  adminAuth,
  MessagingController.deleteConversation
);

// ==============================================
// STAFF-SPECIFIC ROUTES
// ==============================================

// Staff conversations (all conversations they can access)
router.get("/staff/conversations", staffAuth, MessagingController.getStaffConversations);

// Staff get messages
router.get(
  "/staff/conversations/:conversationId/messages",
  staffAuth,
  MessagingController.getMessages
);

// Staff send message
router.post(
  "/staff/conversations/:conversationId/messages",
  staffAuth,
  MessagingController.sendMessage
);

// Staff mark as read
router.put(
  "/staff/conversations/:conversationId/read",
  staffAuth,
  MessagingController.markAsRead
);

// Staff get admin users
router.get(
  "/staff/staff-admin-users",
  staffAuth,
  MessagingController.getStaffAndAdminUsers
);

// ==============================================
// ADMIN-SPECIFIC ROUTES  
// ==============================================

// Admin conversations (all conversations)
router.get("/admin/conversations", adminAuth, MessagingController.getAdminConversations);

// Admin get messages
router.get(
  "/admin/conversations/:conversationId/messages",
  adminAuth,
  MessagingController.getMessages
);

// Admin send message
router.post(
  "/admin/conversations/:conversationId/messages",
  adminAuth,
  MessagingController.sendMessage
);

// Admin mark as read
router.put(
  "/admin/conversations/:conversationId/read",
  adminAuth,
  MessagingController.markAsRead
);

// Admin get staff users
router.get(
  "/admin/staff-admin-users",
  adminAuth,
  MessagingController.getStaffAndAdminUsers
);

// Admin statistics
router.get("/admin/stats", adminAuth, MessagingController.getStats);

module.exports = router;
