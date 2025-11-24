const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users", // Changed from "User" to "Users" to match the model registration
    required: true,
  },

  // Service Details - Can be single or multiple services
  services: {
    type: [{
      name: {
        type: String,
        enum: [
          "UV Graphene Ceramic Coating",
          "Powder Coating",
          "Moto/Oto VIP",
          "Full Moto/Oto SPA",
          "Modernized Interior Detailing",
          "Modernized Engine Detailing",
        ],
        required: true,
      },
      duration: {
        type: Number, // Duration in hours
        required: true,
      },
    }],
    required: true,
    validate: {
      validator: function(services) {
        return services && services.length > 0;
      },
      message: 'At least one service must be selected'
    }
  },

  // Legacy service field for backward compatibility
  service: {
    type: String,
    enum: [
      "UV Graphene Ceramic Coating",
      "Powder Coating",
      "Moto/Oto VIP",
      "Full Moto/Oto SPA",
      "Modernized Interior Detailing",
      "Modernized Engine Detailing",
    ],
    required: false,
  },

  // Total duration in hours (calculated from services)
  totalDuration: {
    type: Number,
    required: true,
  },

  // Booking Details - 9 AM to 9 PM daily
  date: {
    type: Date,
    required: true,
  },

  // Start time slot
  timeSlot: {
    type: String,
    required: true,
    enum: [
      "9:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "1:00 PM",
      "2:00 PM",
      "3:00 PM",
      "4:00 PM",
      "5:00 PM",
      "6:00 PM",
      "7:00 PM",
      "8:00 PM",
      "9:00 PM",
    ],
  },

  // End time (calculated based on start time + duration)
  endTime: {
    type: String,
    required: true,
  },

  // Status Management
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "no-show",
      "rejected",
    ],
    default: "pending",
  },

  // Vehicle Type
  vehicle: {
    type: String,
    enum: ["motorcycle", "automobile"],
    required: true,
    default: "motorcycle",
  },

  // Additional Information
  notes: {
    type: String,
    maxlength: 500,
  },

  // Rejection reason - required when status is rejected
  rejectionReason: {
    type: String,
    maxlength: 500,
  },

  // Cancellation reason - provided when customer cancels
  cancellationReason: {
    type: String,
    maxlength: 500,
  },

  // Track who updated the booking
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: false,
  },

  // Update history - track all status changes
  statusHistory: [
    {
      status: {
        type: String,
        enum: [
          "pending",
          "confirmed",
          "completed",
          "cancelled",
          "no-show",
          "rejected",
        ],
        required: true,
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: false,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      reason: {
        type: String,
        maxlength: 500,
      },
      notes: {
        type: String,
        maxlength: 500,
      },
    },
  ],

  // Metadata - NO pre-save middleware
  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ date: 1, timeSlot: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
