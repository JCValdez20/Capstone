const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  // Participants (customer and admin)
  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
      role: {
        type: String,
        enum: ["customer", "admin", "staff"],
        required: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // Related Booking (conversation context) - Optional for direct conversations
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: false,
  },

  // Conversation Type
  conversationType: {
    type: String,
    enum: ["booking", "direct"],
    default: "booking",
  },

  // Conversation Status
  status: {
    type: String,
    enum: ["active", "closed", "archived"],
    default: "active",
  },

  // Latest Message Preview
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },

  // Unread Counts per participant
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map(),
  },

  // Conversation Title (optional, can be auto-generated)
  title: {
    type: String,
    default: function () {
      return `Booking #${this.relatedBooking}`;
    },
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance
conversationSchema.index({ "participants.user": 1 });
conversationSchema.index({ relatedBooking: 1 });
conversationSchema.index({ "lastMessage.timestamp": -1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ createdAt: -1 });

// Compound index for finding conversations by participant and status
conversationSchema.index({ "participants.user": 1, status: 1 });

// Pre-save middleware to update timestamps
conversationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to add participant
conversationSchema.methods.addParticipant = function (userId, role) {
  const existingParticipant = this.participants.find(
    (p) => p.user.toString() === userId.toString()
  );

  if (!existingParticipant) {
    this.participants.push({
      user: userId,
      role: role,
      joinedAt: new Date(),
    });
  }

  return this.save();
};

// Instance method to increment unread count
conversationSchema.methods.incrementUnreadCount = function (userId) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
  return this.save();
};

// Instance method to reset unread count
conversationSchema.methods.resetUnreadCount = function (userId) {
  this.unreadCount.set(userId.toString(), 0);
  return this.save();
};

// Static method to find conversations by user
conversationSchema.statics.findByUser = function (userId, status = "active") {
  return this.find({
    "participants.user": userId,
    status: status,
  })
    .populate("participants.user", "first_name last_name email roles")
    .populate("relatedBooking", "service date timeSlot status")
    .populate("lastMessage.sender", "first_name last_name")
    .sort({ "lastMessage.timestamp": -1 });
};

module.exports = mongoose.model("Conversation", conversationSchema);
