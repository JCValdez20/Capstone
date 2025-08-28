const Conversation = require("../models/Conversation");
const Messages = require("../models/Messages");
const User = require("../models/User");
const Booking = require("../models/Booking");

/**
 * Messaging Service with RBAC Integration
 * Handles all messaging-related business logic with role-based permissions
 */
class MessagingService {
  /**
   * Get conversations based on user role and permissions
   */
  static async getConversationsForUser(userId, userRole, options = {}) {
    const { status = "active", page = 1, limit = 20 } = options;

    let conversations;

    switch (userRole) {
      case "admin":
        // Admins see only their direct conversations with staff
        conversations = await this.getAdminConversations(
          userId,
          status,
          page,
          limit
        );
        break;

      case "staff":
        // Staff can see conversations they're part of + customer conversations
        conversations = await this.getStaffAccessibleConversations(
          userId,
          status,
          page,
          limit
        );
        break;

      case "customer":
        // Customers can only see their own conversations
        conversations = await this.getCustomerConversations(
          userId,
          status,
          page,
          limit
        );
        break;

      default:
        throw new Error("Invalid user role");
    }

    // Add unread counts and online status
    return await this.enrichConversationsWithMetadata(conversations, userId);
  }

  /**
   * Get conversations for admin - focused on admin-staff communications
   */
  static async getAllConversations(status, page, limit) {
    return await Conversation.find({
      status,
      conversationType: "direct",
      "participants.role": { $in: ["admin", "staff"] },
    })
      .populate(
        "participants.user",
        "first_name last_name email roles profilePic"
      )
      .populate("relatedBooking", "service date timeSlot status")
      .populate("lastMessage.sender", "first_name last_name roles")
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
  }

  /**
   * Get admin-specific conversations (admin-staff direct messages only)
   */
  static async getAdminConversations(adminId, status, page, limit) {

    const conversations = await Conversation.find({
      status,
      conversationType: "direct",
      "participants.user": adminId,
    })
      .populate(
        "participants.user",
        "first_name last_name email roles profilePic"
      )
      .populate("relatedBooking", "service date timeSlot status")
      .populate("lastMessage.sender", "first_name last_name roles")
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);


    // Filter to ensure we only return conversations between admin and staff
    const filtered = conversations.filter((conv) => {
      const participantRoles = conv.participants
        .map((p) => p.user?.roles)
        .filter(Boolean);
      return (
        participantRoles.includes("admin") && participantRoles.includes("staff")
      );
    });

    return filtered;
  }

  /**
   * Get conversations accessible by staff
   */
  static async getStaffAccessibleConversations(userId, status, page, limit) {
    return await Conversation.find({
      status,
      $or: [
        // Direct staff participation
        { "participants.user": userId },
        // Booking-related conversations (staff can access all)
        { conversationType: "booking" },
      ],
    })
      .populate(
        "participants.user",
        "first_name last_name email roles profilePic"
      )
      .populate("relatedBooking", "service date timeSlot status")
      .populate("lastMessage.sender", "first_name last_name roles")
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
  }

  /**
   * Get conversations for customers
   */
  static async getCustomerConversations(userId, status, page, limit) {
    return await Conversation.find({
      status,
      "participants.user": userId,
    })
      .populate(
        "participants.user",
        "first_name last_name email roles profilePic"
      )
      .populate("relatedBooking", "service date timeSlot status")
      .populate("lastMessage.sender", "first_name last_name roles")
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
  }

  /**
   * Check if user can access conversation
   */
  static async canAccessConversation(conversationId, userId, userRole) {
    const conversation = await Conversation.findById(conversationId)
      .populate("participants.user")
      .populate("relatedBooking");

    if (!conversation) {
      return { canAccess: false, reason: "Conversation not found" };
    }

    // Admin can access all conversations
    if (userRole === "admin") {
      return { canAccess: true, conversation };
    }

    // Staff can access booking conversations and their own conversations
    if (userRole === "staff") {
      const isParticipant = conversation.participants.some(
        (p) => p.user && p.user._id.toString() === userId
      );
      const isBookingConversation = conversation.conversationType === "booking";

      if (isParticipant || isBookingConversation) {
        return { canAccess: true, conversation };
      }
    }

    // Customer can only access conversations they're part of
    if (userRole === "customer") {
      const isParticipant = conversation.participants.some(
        (p) => p.user && p.user._id.toString() === userId
      );

      if (isParticipant) {
        return { canAccess: true, conversation };
      }
    }

    return { canAccess: false, reason: "Access denied" };
  }

  /**
   * Create or get conversation with proper RBAC
   */
  static async createOrGetBookingConversation(bookingId, userId, userRole) {
    // Verify booking access
    const booking = await Booking.findById(bookingId).populate("user");
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Check permissions
    const canAccess = this.canAccessBooking(booking, userId, userRole);
    if (!canAccess) {
      throw new Error("Access denied to booking conversation");
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({ relatedBooking: bookingId })
      .populate(
        "participants.user",
        "first_name last_name email roles profilePic"
      )
      .populate("relatedBooking", "service date timeSlot status")
      .populate("lastMessage.sender", "first_name last_name roles");

    if (conversation) {
      return conversation;
    }

    // Create new conversation
    const participants = [{ user: booking.user._id, role: "customer" }];

    // Add staff/admin if they're not the customer
    if (userId !== booking.user._id.toString()) {
      participants.push({ user: userId, role: userRole });
    }

    conversation = new Conversation({
      participants,
      relatedBooking: bookingId,
      conversationType: "booking",
      status: "active",
    });

    await conversation.save();
    await conversation.populate([
      {
        path: "participants.user",
        select: "first_name last_name email roles profilePic",
      },
      { path: "relatedBooking", select: "service date timeSlot status" },
    ]);

    return conversation;
  }

  /**
   * Send message with RBAC validation
   */
  static async sendMessage(conversationId, senderId, senderRole, messageData) {
    // Verify conversation access
    const { canAccess, conversation } = await this.canAccessConversation(
      conversationId,
      senderId,
      senderRole
    );

    if (!canAccess) {
      throw new Error("Access denied to conversation");
    }

    // Create message
    const message = new Messages({
      conversation: conversationId,
      sender: senderId,
      senderRole: senderRole, // Track the role when message was sent
      content: messageData.content.trim(),
      messageType: messageData.messageType || "text",
      replyTo: messageData.replyTo || null,
      unreadBy: conversation.participants
        .filter((p) => p.user && p.user._id.toString() !== senderId)
        .map((p) => p.user._id),
    });

    await message.save();
    await message.populate("sender", "first_name last_name roles profilePic");

    // Update conversation
    await this.updateConversationLastMessage(conversation, message);

    return message;
  }

  /**
   * Get messages with RBAC validation
   */
  static async getMessages(conversationId, userId, userRole, options = {}) {
    // Verify access
    const { canAccess } = await this.canAccessConversation(
      conversationId,
      userId,
      userRole
    );
    if (!canAccess) {
      throw new Error("Access denied to conversation messages");
    }

    const { page = 1, limit = 50 } = options;

    const messages = await Messages.findByConversation(
      conversationId,
      page,
      limit
    );

    // Mark as read
    await Messages.markAllAsReadByUser(conversationId, userId);

    return messages.reverse();
  }

  /**
   * Helper: Check booking access permissions
   */
  static canAccessBooking(booking, userId, userRole) {
    if (userRole === "admin" || userRole === "staff") {
      return true;
    }

    if (userRole === "customer" && booking.user._id.toString() === userId) {
      return true;
    }

    return false;
  }

  /**
   * Helper: Enrich conversations with metadata
   */
  static async enrichConversationsWithMetadata(conversations, userId) {
    const socketManager = require("../utils/SocketManager");

    return await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Messages.getUnreadCount(conv._id, userId);

        return {
          ...conv.toObject(),
          unreadCount,
          isOnline: conv.participants.some(
            (p) =>
              p.user &&
              p.user._id &&
              p.user._id.toString() !== userId &&
              socketManager.isUserOnline(p.user._id)
          ),
        };
      })
    );
  }

  /**
   * Helper: Update conversation last message
   */
  static async updateConversationLastMessage(conversation, message) {
    conversation.lastMessage = {
      sender: message.sender._id,
      content: message.content,
      messageType: message.messageType,
      timestamp: message.createdAt,
    };
    conversation.updatedAt = new Date();
    await conversation.save();
  }

  /**
   * Get users for direct messaging with proper hierarchy:
   * - Admin can only message Staff
   * - Staff can message Admin (for escalation) and Customers (for support)
   * - Customers can only message through bookings (handled elsewhere)
   */
  static async getMessagingUsers(requesterId, requesterRole) {
    if (requesterRole !== "admin" && requesterRole !== "staff") {
      throw new Error("Access denied. Admin or staff privileges required.");
    }

    let query = { _id: { $ne: requesterId } };
    let selectFields = "first_name last_name email roles profilePic";

    if (requesterRole === "admin") {
      // Admin can only message staff members
      query.roles = "staff";
    } else if (requesterRole === "staff") {
      // Staff can message admin (for escalation) and customers (for support)
      query.roles = { $in: ["admin", "customer"] };
    }

    return await User.find(query).select(selectFields);
  }

  /**
   * Get messaging statistics (admin only)
   */
  static async getMessagingStats(userRole) {
    if (userRole !== "admin") {
      throw new Error("Access denied. Admin privileges required.");
    }

    const [totalConversations, totalMessages, activeConversations] =
      await Promise.all([
        Conversation.countDocuments(),
        Messages.countDocuments({ isDeleted: false }),
        Conversation.countDocuments({ status: "active" }),
      ]);

    return {
      totalConversations,
      totalMessages,
      activeConversations,
      timestamp: new Date(),
    };
  }

  /**
   * Verify direct messaging user
   */
  static async verifyDirectMessagingUser(targetUserId) {
    const user = await User.findById(targetUserId).select("roles");
    return user && (user.roles === "admin" || user.roles === "staff");
  }

  /**
   * Create or get direct conversation between admin/staff
   */
  static async createOrGetDirectConversation(userId, targetUserId, userRole) {
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      conversationType: "direct",
      "participants.user": { $all: [userId, targetUserId] },
    })
      .populate(
        "participants.user",
        "first_name last_name email roles profilePic"
      )
      .populate("lastMessage.sender", "first_name last_name roles");

    if (conversation) {
      return conversation;
    }

    // Create new direct conversation
    const participants = [
      { user: userId, role: userRole },
      { user: targetUserId, role: "staff" }, // Default to staff, will be updated
    ];

    // Get actual target user role
    const targetUser = await User.findById(targetUserId);
    participants[1].role = targetUser.roles;

    conversation = new Conversation({
      participants,
      conversationType: "direct",
      status: "active",
    });

    await conversation.save();
    await conversation.populate([
      {
        path: "participants.user",
        select: "first_name last_name email roles profilePic",
      },
    ]);

    return conversation;
  }

  /**
   * Mark conversation as read
   */
  static async markConversationAsRead(conversationId, userId) {
    return await Messages.markAllAsReadByUser(conversationId, userId);
  }

  /**
   * Delete conversation (admin only)
   */
  static async deleteConversation(conversationId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Soft delete - mark as deleted instead of removing
    conversation.status = "deleted";
    conversation.deletedAt = new Date();
    await conversation.save();

    // Also mark all messages as deleted
    await Messages.updateMany(
      { conversation: conversationId },
      {
        isDeleted: true,
        deletedAt: new Date(),
      }
    );

    return { deletedAt: conversation.deletedAt };
  }

  /**
   * Archive conversation
   */
  static async archiveConversation(conversationId, userId, userRole) {
    const { canAccess, conversation } = await this.canAccessConversation(
      conversationId,
      userId,
      userRole
    );

    if (!canAccess) {
      throw new Error("Access denied");
    }

    conversation.status = "archived";
    conversation.archivedAt = new Date();
    conversation.archivedBy = userId;
    await conversation.save();

    return {
      archivedAt: conversation.archivedAt,
      archivedBy: userId,
    };
  }

  /**
   * Search messages (admin/staff only)
   */
  static async searchMessages(query, userRole, options = {}) {
    if (userRole !== "admin" && userRole !== "staff") {
      throw new Error("Access denied. Admin or staff privileges required.");
    }

    const { page = 1, limit = 20 } = options;

    const searchCriteria = {
      content: { $regex: query, $options: "i" },
      isDeleted: false,
    };

    // Staff can only search their accessible conversations
    if (userRole === "staff") {
      // This would need to be enhanced to properly filter based on staff access
      // For now, we'll allow staff to search all non-deleted messages
    }

    const messages = await Messages.find(searchCriteria)
      .populate("sender", "first_name last_name roles")
      .populate("conversation", "participants relatedBooking conversationType")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Messages.countDocuments(searchCriteria);

    return {
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    };
  }

  /**
   * Get all staff members for admin to message
   */
  static async getStaffList() {

    try {
      const staffMembers = await User.find({ roles: "staff" })
        .select("_id first_name last_name email profilePic createdAt")
        .sort({ first_name: 1, last_name: 1 });


      return staffMembers;
    } catch (error) {
      console.error("❌ Error in getStaffList:", error);
      throw error;
    }
  }

  /**
   * Create or get direct conversation between admin and staff
   */
  static async createOrGetDirectConversation(adminId, staffId) {
    // Verify both users exist
    const [adminUser, staffUser] = await Promise.all([
      User.findById(adminId),
      User.findById(staffId),
    ]);

    if (!adminUser || adminUser.roles !== "admin") {
      throw new Error("Invalid admin user");
    }

    if (!staffUser || staffUser.roles !== "staff") {
      throw new Error("Invalid staff user");
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      conversationType: "direct",
      "participants.user": { $all: [adminId, staffId] },
    })
      .populate(
        "participants.user",
        "first_name last_name email roles profilePic"
      )
      .populate("lastMessage.sender", "first_name last_name roles");

    if (conversation) {
      return conversation;
    }

    // Create new direct conversation
    conversation = new Conversation({
      participants: [
        { user: adminId, role: "admin" },
        { user: staffId, role: "staff" },
      ],
      conversationType: "direct",
      status: "active",
      title: `Direct Message: ${adminUser.first_name} & ${staffUser.first_name}`,
    });

    await conversation.save();

    // Populate the conversation
    await conversation.populate([
      {
        path: "participants.user",
        select: "first_name last_name email roles profilePic",
      },
      { path: "lastMessage.sender", select: "first_name last_name roles" },
    ]);

    return conversation;
  }
}

module.exports = MessagingService;
