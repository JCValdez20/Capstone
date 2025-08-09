// const mongoose = require("mongoose");

// const conversationSchema = new mongoose.Schema({
//   // Participants
//   participants: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   ],

//   // Latest Message Preview
//   lastMessage: {
//     content: String,
//     sender: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     timestamp: {
//       type: Date,
//       default: Date.now,
//     },
//   },

//   // Unread Counts per participant
//   unreadCount: {
//     type: Map,
//     of: Number,
//     default: {},
//   },

//   // Related Booking (if conversation started from booking)
//   relatedBooking: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Booking",
//     default: null,
//   },

//   // Metadata
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },

//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Indexes
// conversationSchema.index({ participants: 1 });
// conversationSchema.index({ "lastMessage.timestamp": -1 });
// conversationSchema.index({ relatedBooking: 1 });

// module.exports = mongoose.model("Conversation", conversationSchema);
