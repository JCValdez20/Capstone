const Conversation = require("../models/Conversation");
const Messages = require("../models/Messages");
const Booking = require("../models/Booking");
const socketManager = require("../utils/SocketManager");
const Response = require("../utils/Response");

class MessagingController {
  // Get all conversations for a user
  async getConversations(req, res) {
    try {
      const userId = req.user.userId;
      const { status = "active", page = 1, limit = 20 } = req.query;

      const conversations = await Conversation.findByUser(userId, status)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      // Get unread counts for each conversation
      const conversationsWithUnread = await Promise.all(
        conversations.map(async (conv) => {
          const unreadCount = await Messages.getUnreadCount(conv._id, userId);
          return {
            ...conv.toObject(),
            unreadCount: unreadCount,
            isOnline: conv.participants.some(
              (p) =>
                p.user._id.toString() !== userId &&
                socketManager.isUserOnline(p.user._id)
            ),
          };
        })
      );

      return Response.success(
        res,
        {
          conversations: conversationsWithUnread,
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
      return Response.error(res, "Failed to fetch conversations", 500);
    }
  }

  // Get or create a conversation for a booking
  async getOrCreateConversation(req, res) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role || req.user.roles;
      const { bookingId } = req.params;

      // Check if booking exists
      const booking = await Booking.findById(bookingId).populate("user");
      if (!booking) {
        return Response.error(res, "Booking not found", 404);
      }

      // Check if user has permission to access this booking
      if (userRole !== "admin" && booking.user._id.toString() !== userId) {
        return Response.error(res, "Access denied", 403);
      }

      // Check if conversation already exists
      let conversation = await Conversation.findOne({
        relatedBooking: bookingId,
      })
        .populate(
          "participants.user",
          "first_name last_name email role profilePic"
        )
        .populate("relatedBooking", "service date timeSlot status")
        .populate("lastMessage.sender", "first_name last_name");

      if (!conversation) {
        // Create new conversation
        conversation = new Conversation({
          participants: [
            {
              user: booking.user._id,
              role: "customer",
            },
          ],
          relatedBooking: bookingId,
          title: `Booking: ${booking.service} - ${new Date(
            booking.date
          ).toLocaleDateString()}`,
        });

        // Add admin if current user is admin
        if (userRole === "admin") {
          conversation.participants.push({
            user: userId,
            role: "admin",
          });
        }

        await conversation.save();
        await conversation.populate(
          "participants.user",
          "first_name last_name email role profilePic"
        );
        await conversation.populate(
          "relatedBooking",
          "service date timeSlot status"
        );
      } else {
        // Add current user if they're not already a participant
        const isParticipant = conversation.participants.some(
          (p) => p.user._id.toString() === userId
        );

        if (!isParticipant) {
          await conversation.addParticipant(userId, userRole);
          await conversation.populate(
            "participants.user",
            "first_name last_name email role profilePic"
          );
        }
      }

      return Response.success(
        res,
        { conversation },
        "Conversation retrieved successfully"
      );
    } catch (error) {
      console.error("Get/create conversation error:", error);
      return Response.error(res, "Failed to get conversation", 500);
    }
  }

  // Get messages in a conversation
  async getMessages(req, res) {
    try {
      const userId = req.user.userId;
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      // Check if user is participant in conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return Response.error(res, "Conversation not found", 404);
      }

      const isParticipant = conversation.participants.some(
        (p) => p.user.toString() === userId
      );

      if (!isParticipant) {
        return Response.error(res, "Access denied", 403);
      }

      // Get messages
      const messages = await Messages.findByConversation(
        conversationId,
        parseInt(page),
        parseInt(limit)
      );

      // Mark messages as read
      await Messages.markAllAsRead(conversationId, userId);
      await conversation.resetUnreadCount(userId);

      // Notify other participants that messages were read
      socketManager.emitToConversation(conversationId, "messages_read", {
        conversationId: conversationId,
        readBy: userId,
        readAt: new Date(),
      });

      return Response.success(
        res,
        {
          messages: messages.reverse(), // Reverse to get chronological order
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
      return Response.error(res, "Failed to fetch messages", 500);
    }
  }

  // Send a message
  async sendMessage(req, res) {
    try {
      const userId = req.user.userId;
      const { conversationId } = req.params;
      const { content, messageType = "text", replyTo = null } = req.body;

      if (!content || content.trim() === "") {
        return Response.error(res, "Message content is required", 400);
      }

      // Check if conversation exists and user is participant
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return Response.error(res, "Conversation not found", 404);
      }

      const isParticipant = conversation.participants.some(
        (p) => p.user.toString() === userId
      );

      if (!isParticipant) {
        return Response.error(res, "Access denied", 403);
      }

      // Create message
      const message = new Messages({
        conversation: conversationId,
        sender: userId,
        content: content.trim(),
        messageType: messageType,
        replyTo: replyTo,
      });

      await message.save();
      await message.populate(
        "sender",
        "first_name last_name email role profilePic"
      );

      if (replyTo) {
        await message.populate("replyTo", "content sender createdAt");
      }

      // Update conversation's last message
      conversation.lastMessage = {
        content: content.trim(),
        sender: userId,
        messageType: messageType,
        timestamp: new Date(),
      };

      // Increment unread count for other participants
      conversation.participants.forEach((participant) => {
        if (participant.user.toString() !== userId) {
          conversation.incrementUnreadCount(participant.user);
        }
      });

      await conversation.save();

      // Emit real-time message to conversation participants
      socketManager.emitToConversation(conversationId, "new_message", {
        message: message,
        conversationId: conversationId,
      });

      // Emit conversation update to all participants
      conversation.participants.forEach((participant) => {
        socketManager.emitToUser(participant.user, "conversation_updated", {
          conversationId: conversationId,
          lastMessage: conversation.lastMessage,
          updatedAt: conversation.updatedAt,
        });
      });

      return Response.success(res, { message }, "Message sent successfully");
    } catch (error) {
      console.error("Send message error:", error);
      return Response.error(res, "Failed to send message", 500);
    }
  }

  // Mark conversation as read
  async markAsRead(req, res) {
    try {
      const userId = req.user.userId;
      const { conversationId } = req.params;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return Response.error(res, "Conversation not found", 404);
      }

      const isParticipant = conversation.participants.some(
        (p) => p.user.toString() === userId
      );

      if (!isParticipant) {
        return Response.error(res, "Access denied", 403);
      }

      // Mark all messages as read and reset unread count
      await Messages.markAllAsRead(conversationId, userId);
      await conversation.resetUnreadCount(userId);

      // Notify other participants
      socketManager.emitToConversation(conversationId, "messages_read", {
        conversationId: conversationId,
        readBy: userId,
        readAt: new Date(),
      });

      return Response.success(res, {}, "Messages marked as read");
    } catch (error) {
      console.error("Mark as read error:", error);
      return Response.error(res, "Failed to mark as read", 500);
    }
  }

  // Get conversation statistics (for admins)
  async getStats(req, res) {
    try {
      const userRole = req.user.role || req.user.roles;

      if (userRole !== "admin") {
        return Response.error(res, "Access denied", 403);
      }

      const totalConversations = await Conversation.countDocuments();
      const activeConversations = await Conversation.countDocuments({
        status: "active",
      });
      const totalMessages = await Messages.countDocuments({ isDeleted: false });
      const todayMessages = await Messages.countDocuments({
        isDeleted: false,
        createdAt: {
          $gte: new Date().setHours(0, 0, 0, 0),
          $lt: new Date().setHours(23, 59, 59, 999),
        },
      });

      const onlineUsers = socketManager.getOnlineUsers();

      return Response.success(
        res,
        {
          stats: {
            totalConversations,
            activeConversations,
            totalMessages,
            todayMessages,
            onlineUsersCount: onlineUsers.length,
          },
        },
        "Stats fetched successfully"
      );
    } catch (error) {
      console.error("Get stats error:", error);
      return Response.error(res, "Failed to fetch stats", 500);
    }
  }
}

module.exports = new MessagingController();
