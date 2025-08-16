const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Reference to conversation
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true, // Direct index declaration
    },

    // Message sender
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    // Message content
    content: {
      type: String,
      required: true,
      maxlength: [2000, "Message content cannot exceed 2000 characters"],
      trim: true, // Automatically trim whitespace
    },

    // Message type
    messageType: {
      type: String,
      enum: {
        values: ["text", "image", "file", "system"],
        message: "Invalid message type: {VALUE}",
      },
      default: "text",
    },

    // Optimized attachment structure (single attachment)
    attachment: {
      type: {
        filename: {
          type: String,
          required: function () {
            return this.messageType !== "text";
          },
        },
        originalName: String,
        mimetype: String,
        size: {
          type: Number,
          min: [0, "File size cannot be negative"],
        },
        url: String,
      },
      default: null,
    },

    // Simplified read tracking - store only unread users for efficiency
    unreadBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],

    // Reply to another message (optional)
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Messages",
      default: null,
    },

    // Simplified reactions structure
    reactions: {
      type: Map,
      of: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
          },
          addedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: new Map(),
    },

    // Soft delete with TTL for cleanup
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
      expires: 2592000, // 30 days TTL for deleted messages
    },

    // Edit tracking
    editHistory: [
      {
        content: String,
        editedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    // Schema options
    timestamps: true, // Automatically handles createdAt and updatedAt
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Clean up the output
        delete ret.__v;
        delete ret.unreadBy;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Compound indexes for optimal query performance
messageSchema.index({ conversation: 1, createdAt: -1 }); // Main chat queries
messageSchema.index({ conversation: 1, isDeleted: 1, createdAt: -1 }); // Active messages only
messageSchema.index({ sender: 1, createdAt: -1 }); // User's message history
messageSchema.index({ conversation: 1, unreadBy: 1 }); // Unread message queries
// Note: deletedAt index is automatically created by the TTL expires property

// Virtual for read status
messageSchema.virtual("isRead").get(function () {
  return this.unreadBy.length === 0;
});

// Virtual for edit status
messageSchema.virtual("isEdited").get(function () {
  return this.editHistory && this.editHistory.length > 0;
});

// Virtual for latest edit date
messageSchema.virtual("lastEditedAt").get(function () {
  if (this.editHistory && this.editHistory.length > 0) {
    return this.editHistory[this.editHistory.length - 1].editedAt;
  }
  return null;
});

// Pre-save middleware for optimizations
messageSchema.pre("save", function (next) {
  // If this is a new message, populate unreadBy with all conversation participants except sender
  if (this.isNew && !this.isDeleted) {
    // This will be handled by the controller to avoid circular dependencies
    // Just ensure the message is properly structured
    this.content = this.content.trim();
  }
  next();
});

// Instance method to mark as read by user
messageSchema.methods.markAsReadBy = function (userId) {
  this.unreadBy = this.unreadBy.filter(
    (id) => id.toString() !== userId.toString()
  );
  return this.save();
};

// Instance method to mark as unread by user
messageSchema.methods.markAsUnreadBy = function (userId) {
  if (!this.unreadBy.includes(userId)) {
    this.unreadBy.push(userId);
  }
  return this.save();
};

// Instance method to soft delete
messageSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.unreadBy = []; // Clear unread tracking
  return this.save();
};

// Instance method to edit message with history
messageSchema.methods.editContent = function (newContent, editedBy) {
  // Store previous content in history
  if (!this.editHistory) {
    this.editHistory = [];
  }

  this.editHistory.push({
    content: this.content,
    editedAt: new Date(),
  });

  this.content = newContent.trim();
  return this.save();
};

// Instance method to add reaction
messageSchema.methods.addReaction = function (emoji, userId) {
  if (!this.reactions.has(emoji)) {
    this.reactions.set(emoji, []);
  }

  const emojiReactions = this.reactions.get(emoji);
  const existingReaction = emojiReactions.find(
    (r) => r.user.toString() === userId.toString()
  );

  if (!existingReaction) {
    emojiReactions.push({
      user: userId,
      addedAt: new Date(),
    });
    this.reactions.set(emoji, emojiReactions);
  }

  return this.save();
};

// Instance method to remove reaction
messageSchema.methods.removeReaction = function (emoji, userId) {
  if (this.reactions.has(emoji)) {
    const emojiReactions = this.reactions.get(emoji);
    const filteredReactions = emojiReactions.filter(
      (r) => r.user.toString() !== userId.toString()
    );

    if (filteredReactions.length === 0) {
      this.reactions.delete(emoji);
    } else {
      this.reactions.set(emoji, filteredReactions);
    }
  }

  return this.save();
};

// Static method to find messages with optimized queries
messageSchema.statics.findByConversation = function (
  conversationId,
  page = 1,
  limit = 50,
  options = {}
) {
  const { includeDeleted = false, userId = null, markAsRead = true } = options;

  const query = { conversation: conversationId };

  if (!includeDeleted) {
    query.isDeleted = false;
  }

  const messagesQuery = this.find(query)
    .populate("sender", "first_name last_name email role profilePic")
    .populate({
      path: "replyTo",
      select: "content sender createdAt messageType",
      populate: {
        path: "sender",
        select: "first_name last_name",
      },
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean({ virtuals: true }); // Use lean for better performance

  return messagesQuery;
};

// Static method to get unread count efficiently
messageSchema.statics.getUnreadCount = function (conversationId, userId) {
  return this.countDocuments({
    conversation: conversationId,
    isDeleted: false,
    unreadBy: userId,
  });
};

// Static method to mark all conversation messages as read
messageSchema.statics.markAllAsReadByUser = function (conversationId, userId) {
  return this.updateMany(
    {
      conversation: conversationId,
      isDeleted: false,
      unreadBy: userId,
    },
    {
      $pull: { unreadBy: userId },
    }
  );
};

// Static method to get conversation statistics
messageSchema.statics.getConversationStats = function (conversationId) {
  return this.aggregate([
    {
      $match: {
        conversation: new mongoose.Types.ObjectId(conversationId),
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$conversation",
        totalMessages: { $sum: 1 },
        totalUnread: { $sum: { $size: "$unreadBy" } },
        lastMessageAt: { $max: "$createdAt" },
        messageTypes: { $push: "$messageType" },
        participants: { $addToSet: "$sender" },
      },
    },
  ]);
};

// Static method for bulk operations
messageSchema.statics.bulkMarkAsRead = function (messageIds, userId) {
  return this.updateMany(
    { _id: { $in: messageIds }, unreadBy: userId },
    { $pull: { unreadBy: userId } }
  );
};

// Static method to cleanup old deleted messages
messageSchema.statics.cleanupDeletedMessages = function (daysOld = 30) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    isDeleted: true,
    deletedAt: { $lt: cutoffDate },
  });
};

module.exports = mongoose.model("Messages", messageSchema);
