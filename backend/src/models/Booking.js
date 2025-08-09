const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Service Details - Based on your image
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
    required: true,
  },

  // Booking Details - 9 AM to 9 PM daily
  date: {
    type: Date,
    required: true,
  },

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

  // Status Management
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled", "no-show"],
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
