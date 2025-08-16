const express = require("express");
const router = express.Router();
const MessagingController = require("../controllers/MessagingController");
const UserGuard = require("../middleware/User-Guard");

// Get all conversations for the authenticated user
router.get("/conversations", UserGuard, MessagingController.getConversations);

// Get or create a conversation for a specific booking
router.get(
  "/conversations/booking/:bookingId",
  UserGuard,
  MessagingController.getOrCreateConversation
);

// Get messages in a conversation
router.get(
  "/conversations/:conversationId/messages",
  UserGuard,
  MessagingController.getMessages
);

// Send a message in a conversation
router.post(
  "/conversations/:conversationId/messages",
  UserGuard,
  MessagingController.sendMessage
);

// Mark conversation as read
router.put(
  "/conversations/:conversationId/read",
  UserGuard,
  MessagingController.markAsRead
);

// Get messaging statistics (admin only)
router.get("/stats", UserGuard, MessagingController.getStats);

module.exports = router;
