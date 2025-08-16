const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Messages = require("../models/Messages");
const User = require("../models/User");
const Booking = require("../models/Booking");
const socketManager = require("../utils/SocketManager");

// Test endpoint to create a sample conversation and message
router.post("/test-messaging", async (req, res) => {
  try {
    // Find admin and regular users
    const admin = await User.findOne({ role: "admin" }).limit(1);
    const user = await User.findOne({ role: { $ne: "admin" } }).limit(1);

    if (!admin || !user) {
      return res.status(400).json({
        success: false,
        message:
          "Need at least one admin and one regular user to test messaging",
      });
    }

    // Find a booking to associate with the conversation
    const booking = await Booking.findOne({ user: user._id }).limit(1);

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: "Need at least one booking to test messaging",
      });
    }

    // Create a test conversation
    const conversation = new Conversation({
      participants: [
        { user: user._id, role: "customer" },
        { user: admin._id, role: "admin" },
      ],
      relatedBooking: booking._id,
      title: `Test Conversation - ${booking.service}`,
    });

    await conversation.save();

    // Create a test message
    const message = new Messages({
      conversation: conversation._id,
      sender: user._id,
      content: "Hello! I have a question about my booking.",
      messageType: "text",
    });

    await message.save();

    // Update conversation's last message
    conversation.lastMessage = {
      content: message.content,
      sender: user._id,
      messageType: message.messageType,
      timestamp: new Date(),
    };

    // Increment unread count for admin
    conversation.incrementUnreadCount(admin._id);
    await conversation.save();

    // Populate the conversation with user details
    await conversation.populate(
      "participants.user",
      "first_name last_name email role"
    );
    await conversation.populate(
      "relatedBooking",
      "service date timeSlot status"
    );

    return res.json({
      success: true,
      message: "Test conversation and message created successfully",
      data: {
        conversation,
        message,
        socketStatus: {
          isInitialized: socketManager.io !== null,
          onlineUsers: socketManager.getOnlineUsers(),
        },
      },
    });
  } catch (error) {
    console.error("Test messaging error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create test conversation",
      error: error.message,
    });
  }
});

// Test endpoint to check Socket.IO status
router.get("/socket-status", (req, res) => {
  return res.json({
    success: true,
    data: {
      isInitialized: socketManager.io !== null,
      onlineUsers: socketManager.getOnlineUsers(),
      connectedCount: socketManager.connectedUsers.size,
    },
  });
});

module.exports = router;
