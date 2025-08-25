const Conversation = require("../models/Conversation");
const Messages = require("../models/Messages");
const Booking = require("../models/Booking");
const User = require("../models/User");
const socketManager = require("../utils/SocketManager");
const send = require("../utils/Response");

class MessagingController {
  // Get all conversations for a user
  async getConversations(req, res) {
    try {
      const userId = req.userData.id;
      const { status = "active", page = 1, limit = 20 } = req.query;

      const conversations = await Conversation.findByUser(userId, status)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      // Debug: Log conversation participants data
      console.log(
        "📤 SENDING CONVERSATIONS:",
        conversations.slice(0, 1).map((conv) => ({
          id: conv._id,
          participants: conv.participants.map((p) => ({
            userId: p.user?._id,
            userEmail: p.user?.email,
            userName: `${p.user?.first_name} ${p.user?.last_name}`,
            userRoles: p.user?.roles,
            participantRole: p.role,
          })),
        }))
      );

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

      // Debug: Log conversation data being sent
      console.log(
        "📤 SENDING CONVERSATIONS:",
        conversationsWithUnread.map((conv) => ({
          id: conv._id,
          participants: conv.participants?.map((p) => ({
            userId: p.user?._id,
            userName: `${p.user?.first_name} ${p.user?.last_name}`,
            role: p.role,
            userObject: p.user ? "EXISTS" : "MISSING",
          })),
        }))
      );

      return send.sendResponseMessage(
        res,
        200,
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
      return send.sendErrorMessage(res, 500, error);
    }
  }

  // Get or create a conversation for a booking
  async getOrCreateConversation(req, res) {
    try {
      const userId = req.userData.id;
      const userRole = req.userData.roles;
      const { bookingId } = req.params;

      // Check if booking exists
      const booking = await Booking.findById(bookingId).populate("user");
      if (!booking) {
        return send.sendErrorMessage(res, 404, new Error("Booking not found"));
      }

      // Check if user has permission to access this booking
      if (
        userRole !== "admin" &&
        userRole !== "staff" &&
        booking.user._id.toString() !== userId
      ) {
        return send.sendErrorMessage(res, 403, new Error("Access denied"));
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
        const participants = [
          {
            user: booking.user._id,
            role: "customer",
          },
        ];

        // Only add staff/admin if they're not the same as the customer
        if (userId !== booking.user._id.toString()) {
          participants.push({
            user: userId,
            role: userRole,
          });
        }

        conversation = new Conversation({
          participants: participants,
          relatedBooking: bookingId,
          conversationType: "booking",
          status: "active",
        });

        await conversation.save();
        await conversation.populate([
          {
            path: "participants.user",
            select: "first_name last_name email role profilePic",
          },
          {
            path: "relatedBooking",
            select: "service date timeSlot status",
          },
        ]);
      } else {
        // If conversation exists, make sure current user is a participant
        const isParticipant = conversation.participants.some(
          (p) => p.user._id.toString() === userId
        );

        if (!isParticipant && userId !== booking.user._id.toString()) {
          // Add current user as participant if they're not already and not the customer
          conversation.participants.push({
            user: userId,
            role: userRole,
          });
          await conversation.save();
          await conversation.populate([
            {
              path: "participants.user",
              select: "first_name last_name email role profilePic",
            },
          ]);
        }
      }

      return send.sendResponseMessage(
        res,
        200,
        conversation,
        "Conversation fetched successfully"
      );
    } catch (error) {
      console.error("Get or create conversation error:", error);
      return send.sendErrorMessage(res, 500, error);
    }
  }

  // Get or create direct conversation (admin-staff)
  async getOrCreateDirectConversation(req, res) {
    try {
      const userId = req.userData.id;
      const userRole = req.userData.roles;
      const { targetUserId } = req.params;

      // Check if user has permission (only admin and staff can have direct conversations)
      if (userRole !== "admin" && userRole !== "staff") {
        return send.sendErrorMessage(res, 403, new Error("Access denied"));
      }

      // Check if participant exists and is admin or staff
      const participant = await User.findById(targetUserId);
      if (
        !participant ||
        (participant.role !== "admin" && participant.role !== "staff")
      ) {
        return send.sendErrorMessage(
          res,
          404,
          new Error("Participant not found or invalid role")
        );
      }

      // Check if conversation already exists
      let conversation = await Conversation.findOne({
        conversationType: "direct",
        $and: [
          { "participants.user": userId },
          { "participants.user": targetUserId },
        ],
      })
        .populate(
          "participants.user",
          "first_name last_name email role profilePic"
        )
        .populate("lastMessage.sender", "first_name last_name");

      if (!conversation) {
        // Create new conversation
        conversation = new Conversation({
          participants: [
            {
              user: userId,
              role: userRole,
            },
            {
              user: targetUserId,
              role: participant.role,
            },
          ],
          conversationType: "direct",
          status: "active",
        });

        await conversation.save();
        await conversation.populate([
          {
            path: "participants.user",
            select: "first_name last_name email role profilePic",
          },
        ]);
      }

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

  // Get messages for a conversation
  async getMessages(req, res) {
    try {
      const userId = req.userData.id;
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      // Check if conversation exists and user is participant
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return send.sendErrorMessage(
          res,
          404,
          new Error("Conversation not found")
        );
      }

      const isParticipant = conversation.participants.some(
        (p) => p.user.toString() === userId
      );

      if (!isParticipant) {
        return send.sendErrorMessage(res, 403, new Error("Access denied"));
      }

      // Get messages
      const messages = await Messages.findByConversation(
        conversationId,
        parseInt(page),
        parseInt(limit)
      );

      // Debug: Log message sender data
      console.log(
        "📤 SENDING MESSAGES:",
        messages.slice(0, 3).map((msg) => ({
          id: msg._id,
          content: msg.content.substring(0, 30) + "...",
          senderId: msg.sender?._id,
          senderName: `${msg.sender?.first_name} ${msg.sender?.last_name}`,
          senderRole: msg.sender?.roles,
          senderExists: !!msg.sender,
        }))
      );

      // Mark messages as read
      await Messages.markAllAsReadByUser(conversationId, userId);

      // Notify other participants that messages were read
      socketManager.emitToConversation(conversationId, "messages_read", {
        conversationId: conversationId,
        readBy: userId,
        readAt: new Date(),
      });

      return send.sendResponseMessage(
        res,
        200,
        {
          messages: messages.reverse(),
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
      return send.sendErrorMessage(res, 500, error);
    }
  }

  // Send a message
  async sendMessage(req, res) {
    try {
      const userId = req.userData.id;
      const { conversationId } = req.params;
      const { content, messageType = "text", replyTo = null } = req.body;

      if (!content || content.trim() === "") {
        return send.sendErrorMessage(
          res,
          400,
          new Error("Message content is required")
        );
      }

      // Check if conversation exists and user is participant
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return send.sendErrorMessage(
          res,
          404,
          new Error("Conversation not found")
        );
      }

      const isParticipant = conversation.participants.some(
        (p) => p.user.toString() === userId
      );

      if (!isParticipant) {
        return send.sendErrorMessage(res, 403, new Error("Access denied"));
      }

      // Create message with unreadBy field set to all other participants
      const message = new Messages({
        conversation: conversationId,
        sender: userId,
        content: content.trim(),
        messageType,
        replyTo: replyTo,
        unreadBy: conversation.participants
          .filter((p) => p.user.toString() !== userId)
          .map((p) => p.user),
      });

      await message.save();
      await message.populate("sender", "first_name last_name roles profilePic");

      if (replyTo) {
        await message.populate("replyTo", "content sender createdAt");
      }

      // Update conversation last message
      conversation.lastMessage = {
        sender: userId,
        content: content.trim(),
        messageType: messageType,
        timestamp: message.createdAt,
      };
      conversation.updatedAt = new Date();
      await conversation.save();

      // Emit to all participants in the conversation room via socket
      console.log(
        `📤 Emitting new_message to conversation room: conversation_${conversationId}`
      );
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
      return send.sendErrorMessage(res, 500, error);
    }
  }

  // Mark messages as read
  async markAsRead(req, res) {
    try {
      const userId = req.userData.id;
      const { conversationId } = req.params;

      // Check if conversation exists and user is participant
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return send.sendErrorMessage(
          res,
          404,
          new Error("Conversation not found")
        );
      }

      const isParticipant = conversation.participants.some(
        (p) => p.user.toString() === userId
      );

      if (!isParticipant) {
        return send.sendErrorMessage(res, 403, new Error("Access denied"));
      }

      // Mark all messages as read
      await Messages.markAllAsReadByUser(conversationId, userId);

      // Notify other participants
      socketManager.emitToConversation(conversationId, "messages_read", {
        conversationId: conversationId,
        readBy: userId,
        readAt: new Date(),
      });

      return send.sendResponseMessage(res, 200, {}, "Messages marked as read");
    } catch (error) {
      console.error("Mark as read error:", error);
      return send.sendErrorMessage(res, 500, error);
    }
  }

  // Get staff and admin users for direct messaging
  async getStaffAndAdminUsers(req, res) {
    try {
      const userId = req.userData.id;
      const userRole = req.userData.roles;

      // Only allow admin and staff to see this list
      if (userRole !== "admin" && userRole !== "staff") {
        return send.sendErrorMessage(res, 403, new Error("Access denied"));
      }

      // Get all admin and staff users except current user
      const users = await User.find({
        _id: { $ne: userId },
        role: { $in: ["admin", "staff"] },
        isActive: true,
      }).select("first_name last_name email role profilePic isOnline");

      // Add online status
      const usersWithStatus = users.map((user) => ({
        ...user.toObject(),
        isOnline: socketManager.isUserOnline(user._id),
      }));

      return send.sendResponseMessage(
        res,
        200,
        usersWithStatus,
        "Users fetched successfully"
      );
    } catch (error) {
      console.error("Get staff and admin users error:", error);
      return send.sendErrorMessage(res, 500, error);
    }
  }

  // Get conversation statistics (for admins)
  async getStats(req, res) {
    try {
      const userRole = req.userData.roles;

      if (userRole !== "admin") {
        return send.sendErrorMessage(res, 403, new Error("Access denied"));
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

      return send.sendResponseMessage(
        res,
        200,
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
      return send.sendErrorMessage(res, 500, error);
    }
  }

  // Delete a conversation (admin only)
  async deleteConversation(req, res) {
    try {
      const userId = req.userData.id;
      const userRole = req.userData.roles;
      const { conversationId } = req.params;

      // Check if conversation exists and user is participant
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return send.sendErrorMessage(
          res,
          404,
          new Error("Conversation not found")
        );
      }

      const isParticipant = conversation.participants.some(
        (p) => p.user.toString() === userId
      );

      if (!isParticipant) {
        return send.sendErrorMessage(res, 403, new Error("Access denied"));
      }

      // Only admin can delete conversations
      if (userRole !== "admin") {
        return send.sendErrorMessage(
          res,
          403,
          new Error("Only admin can delete conversations")
        );
      }

      // Delete all messages in the conversation
      await Messages.deleteMany({ conversation: conversationId });

      // Delete the conversation
      await Conversation.findByIdAndDelete(conversationId);

      return send.sendResponseMessage(
        res,
        200,
        null,
        "Conversation deleted successfully"
      );
    } catch (error) {
      console.error("Delete conversation error:", error);
      return send.sendErrorMessage(res, 500, error);
    }
  }
}

module.exports = new MessagingController();
