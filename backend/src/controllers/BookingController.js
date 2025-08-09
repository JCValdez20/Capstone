const Booking = require("../models/Booking");
const send = require("../utils/Response");

// Helper function to update timestamps
const updateTimestamp = (bookingData) => {
  bookingData.updatedAt = new Date();
  return bookingData;
};

// Get available time slots for a date - REAL-TIME AVAILABILITY
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.params;
    
    const selectedDate = new Date(date);

    // All possible time slots - 9 AM to 9 PM
    const allSlots = [
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
    ];

    // 🔥 KEY LOGIC: Only slots with ACTIVE bookings are unavailable
    // Cancelled and no-show bookings DON'T block slots
    const bookedSlots = await Booking.find({
      date: selectedDate,
      status: { $in: ["pending", "confirmed", "completed"] }, // 🎯 ONLY these statuses block slots
    }).distinct("timeSlot");

    // Available slots = All slots MINUS actively booked slots
    const availableSlots = allSlots.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    return send.sendResponseMessage(
      res,
      200,
      {
        date: selectedDate,
        availableSlots,
        bookedSlots,
        totalSlots: allSlots.length,
        availableCount: availableSlots.length,
      },
      "Available slots retrieved successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

// Create a new booking - PREVENTS DOUBLE BOOKING
exports.createBooking = async (req, res) => {
  try {
    const { service, date, time, timeSlot, notes, vehicle, specialInstructions } = req.body;
    const userId = req.userData.id;

    // Handle both 'time' and 'timeSlot' field names for compatibility
    const selectedTimeSlot = time || timeSlot;
    
    if (!selectedTimeSlot) {
      return send.sendErrorMessage(res, 400, "Time slot is required");
    }

    if (!service) {
      return send.sendErrorMessage(res, 400, "Service is required");
    }

    if (!date) {
      return send.sendErrorMessage(res, 400, "Date is required");
    }

    // Validate date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return send.sendErrorMessage(
        res,
        400,
        "Cannot book appointments in the past"
      );
    }

    // 🔥 CRITICAL: Check if time slot is already booked by ACTIVE bookings only
    const existingBooking = await Booking.findOne({
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      status: { $in: ["pending", "confirmed", "completed"] }, // 🎯 Only active bookings block slots
    });

    if (existingBooking) {
      return send.sendErrorMessage(res, 409, "Time slot is already booked");
    }

    // Create booking data with timestamp
    const bookingData = updateTimestamp({
      user: userId,
      service,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      vehicle: vehicle || 'motorcycle', // Default to motorcycle if not provided
      notes: notes || specialInstructions || "",
      status: "pending",
      createdAt: new Date(),
    });

    const booking = await Booking.create(bookingData);
    
    return send.sendResponseMessage(
      res,
      201,
      booking,
      "Booking created successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.userData.id;
    
    const bookings = await Booking.find({ user: userId })
      .sort({ date: -1, createdAt: -1 });
      // Remove populate to avoid schema issues
    
    return send.sendResponseMessage(
      res,
      200,
      bookings,
      "Bookings retrieved successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

// Get all bookings (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const { status, date, limit = 50, page = 1 } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (date) {
      const selectedDate = new Date(date);
      query.date = selectedDate;
    }
    
    const skip = (page - 1) * parseInt(limit);
    
    const bookings = await Booking.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
      // Remove populate to avoid schema issues
    
    const total = await Booking.countDocuments(query);
    
    return send.sendResponseMessage(
      res,
      200,
      {
        bookings,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: total
        }
      },
      "Bookings retrieved successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

// Cancel booking (User) - FREES UP THE SLOT IMMEDIATELY
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userData.id;

    const booking = await Booking.findOne({ _id: id, user: userId });

    if (!booking) {
      return send.sendErrorMessage(res, 404, "Booking not found");
    }

    if (booking.status !== "pending" && booking.status !== "confirmed") {
      return send.sendErrorMessage(res, 400, "Cannot cancel this booking");
    }

    // 🔥 WHEN CANCELLED: Status changes to 'cancelled'
    // This automatically makes the time slot AVAILABLE again!
    const updatedData = updateTimestamp({ status: "cancelled" });

    Object.assign(booking, updatedData);
    await booking.save();

    return send.sendResponseMessage(
      res,
      200,
      booking,
      "Booking cancelled successfully - Time slot is now available"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

// Update booking status (Admin only) - MANAGES SLOT AVAILABILITY
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return send.sendErrorMessage(res, 404, "Booking not found");
    }

    const previousStatus = booking.status;

    // Update with timestamp logic in controller
    const updatedData = updateTimestamp({
      status,
      notes: notes || booking.notes,
    });

    const updatedBooking = await Booking.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });
    // Remove populate to avoid schema issues

    // 🔥 AVAILABILITY LOGIC EXPLANATION:
    let message = `Booking ${status} successfully`;

    if (status === "cancelled" || status === "no-show") {
      message += " - Time slot is now available for booking";
    } else if (
      (previousStatus === "cancelled" || previousStatus === "no-show") &&
      (status === "pending" || status === "confirmed")
    ) {
      message += " - Time slot is now occupied";
    }

    return send.sendResponseMessage(res, 200, updatedBooking, message);
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

// Get booking stats with availability information
exports.getBookingStats = async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const serviceStats = await Booking.aggregate([
      {
        $group: {
          _id: "$service",
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate availability stats
    const today = new Date();
    const todayBookings = await Booking.find({
      date: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1
        ),
      },
      status: { $in: ["pending", "confirmed", "completed"] },
    });

    const totalSlotsToday = 13; // 9 AM to 9 PM = 13 slots
    const bookedSlotsToday = todayBookings.length;
    const availableSlotsToday = totalSlotsToday - bookedSlotsToday;

    return send.sendResponseMessage(
      res,
      200,
      {
        statusStats: stats,
        serviceStats,
        todayAvailability: {
          total: totalSlotsToday,
          booked: bookedSlotsToday,
          available: availableSlotsToday,
          occupancyRate: ((bookedSlotsToday / totalSlotsToday) * 100).toFixed(
            1
          ),
        },
      },
      "Booking statistics retrieved successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};
