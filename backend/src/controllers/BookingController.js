const Booking = require("../models/Booking");
const User = require("../models/User"); // Import User model to ensure it's registered
const Conversation = require("../models/Conversation"); // Import Conversation model
const send = require("../utils/Response");
const socketManager = require("../utils/SocketManager");

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
    const {
      service,
      date,
      time,
      timeSlot,
      notes,
      vehicle,
      specialInstructions,
    } = req.body;
    const userId = req.userData.id;

    // Prevent admin users from creating bookings
    const user = await User.findById(userId);

    if (!user) {
      const userCount = await User.countDocuments();

      if (userCount === 0) {
        return send.sendErrorMessage(res, 404, "No users found in database");
      } else {
        // Check if there's a user with the same email but different ID
        const tokenEmail = req.userData.email;
        if (tokenEmail) {
          const userByEmail = await User.findOne({ email: tokenEmail });
          if (userByEmail && userByEmail._id.toString() !== userId) {
            return send.sendErrorMessage(
              res,
              401,
              "Token expired or invalid. Please log in again."
            );
          }
        }
      }

      return send.sendErrorMessage(res, 404, "User not found");
    }

    // Temporarily allow admin users to create bookings for testing
    // TODO: Re-enable this restriction for production
    /*
    if (user.roles === "admin") {
      return send.sendErrorMessage(
        res,
        403,
        "Admin users cannot create bookings. Only customers can make bookings."
      );
    }
    */

    // Check if user email is verified
    if (!user.isVerified) {
      return send.sendErrorMessage(
        res,
        403,
        "Please verify your email address before making bookings."
      );
    }

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
      vehicle: vehicle || "motorcycle", // Default to motorcycle if not provided
      notes: notes || specialInstructions || "",
      status: "pending",
      createdAt: new Date(),
    });

    const booking = await Booking.create(bookingData);

    // Automatically create a conversation for the booking
    try {
      const conversation = new Conversation({
        participants: [
          {
            user: userId,
            roles: "customer",
          },
        ],
        relatedBooking: booking._id,
        conversationType: "booking",
        status: "active",
      });

      await conversation.save();
      console.log(`✅ Conversation created for booking ${booking._id}`);
    } catch (conversationError) {
      // Don't fail the booking if conversation creation fails
      console.error(
        "⚠️ Failed to create conversation for booking:",
        conversationError
      );
    }

    // 🚀 REAL-TIME: Emit new booking notification to admin/staff
    try {
      const bookingWithUser = await Booking.findById(booking._id).populate('user', 'first_name last_name email');
      
      socketManager.emitToAdmins('new_booking_created', {
        bookingId: booking._id,
        customer: {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email
        },
        service: booking.service,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: booking.status,
        createdAt: booking.createdAt,
        booking: bookingWithUser
      });

      socketManager.emitToStaff('new_booking_created', {
        bookingId: booking._id,
        customer: {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email
        },
        service: booking.service,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: booking.status,
        createdAt: booking.createdAt,
        booking: bookingWithUser
      });

      console.log(`🔔 Real-time notification sent for new booking ${booking._id}`);
    } catch (socketError) {
      console.error('Socket.IO emission error:', socketError);
    }

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

    const bookings = await Booking.find({ user: userId }).sort({
      date: -1,
      createdAt: -1,
    });
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

    if (status && status !== "all") {
      query.status = status;
    }

    if (date) {
      const selectedDate = new Date(date);
      query.date = selectedDate;
    }

    const skip = (page - 1) * parseInt(limit);

    let bookings = await Booking.find(query)
      .populate("user", "first_name last_name email") // Populate user data
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Handle bookings with missing user data (assign to customers only)
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      const defaultUser = await User.findOne({ roles: "customer" });

      if (defaultUser) {
        for (let i = 0; i < bookings.length; i++) {
          if (!bookings[i].user) {
            // Update this booking with a valid customer user ID
            await Booking.findByIdAndUpdate(bookings[i]._id, {
              user: defaultUser._id,
              updatedAt: new Date(),
            });

            // Update the booking in our current result set
            bookings[i].user = {
              _id: defaultUser._id,
              first_name: defaultUser.first_name,
              last_name: defaultUser.last_name,
              email: defaultUser.email,
            };
          }
        }
      }
    }

    const total = await Booking.countDocuments(query);

    return send.sendResponseMessage(
      res,
      200,
      {
        bookings,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: total,
        },
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

// Update booking status (Admin/Staff only) - MANAGES SLOT AVAILABILITY
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, rejectionReason } = req.body;

    // Restrict admin/staff status updates to only: confirmed, completed, no-show, rejected
    const allowedStatuses = ["confirmed", "completed", "no-show", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return send.sendErrorMessage(
        res,
        400,
        new Error(
          `Invalid status. Admin/Staff can only update status to: ${allowedStatuses.join(
            ", "
          )}`
        )
      );
    }

    // Validate rejection reason is provided when rejecting a booking
    if (
      status === "rejected" &&
      (!rejectionReason || rejectionReason.trim() === "")
    ) {
      return send.sendErrorMessage(
        res,
        400,
        new Error("Rejection reason is required when rejecting a booking")
      );
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return send.sendErrorMessage(res, 404, new Error("Booking not found"));
    }

    const previousStatus = booking.status;

    // Add to status history
    const statusHistoryEntry = {
      status: status,
      updatedBy: req.userData.id || req.userData.userId, // Use req.userData from auth middleware
      updatedAt: new Date(),
      reason: status === "rejected" ? rejectionReason : undefined,
      notes: notes || undefined,
    };

    // Update with timestamp logic in controller
    const updatedData = updateTimestamp({
      status,
      notes: notes || booking.notes,
      rejectionReason:
        status === "rejected" ? rejectionReason : booking.rejectionReason,
      updatedBy: req.userData.id || req.userData.userId, // Use req.userData from auth middleware
      $push: { statusHistory: statusHistoryEntry },
    });

    const updatedBooking = await Booking.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    })
      .populate("user", "first_name last_name email")
      .populate("updatedBy", "first_name last_name email roles")
      .populate("statusHistory.updatedBy", "first_name last_name email roles");

    // 🔥 AVAILABILITY LOGIC EXPLANATION:
    let message = `Booking ${status} successfully`;

    if (
      status === "cancelled" ||
      status === "no-show" ||
      status === "rejected"
    ) {
      message += " - Time slot is now available for booking";
    } else if (
      (previousStatus === "cancelled" ||
        previousStatus === "no-show" ||
        previousStatus === "rejected") &&
      (status === "pending" || status === "confirmed")
    ) {
      message += " - Time slot is now occupied";
    }

    // Add who updated info to the message
    const updatedByUser =
      req.userData.first_name && req.userData.last_name
        ? `${req.userData.first_name} ${req.userData.last_name}`
        : req.userData.email;
    message += ` (Updated by: ${updatedByUser})`;

    // 🚀 REAL-TIME: Emit booking status update to all relevant users
    try {
      // Notify the customer who owns the booking
      if (updatedBooking.user) {
        socketManager.emitToUser(updatedBooking.user._id || updatedBooking.user, 'booking_status_updated', {
          bookingId: updatedBooking._id,
          status: updatedBooking.status,
          message: message,
          updatedBy: updatedByUser,
          updatedAt: new Date(),
          booking: updatedBooking
        });
      }

      // Notify all admin/staff users about the update
      socketManager.emitToAdmins('booking_status_updated', {
        bookingId: updatedBooking._id,
        status: updatedBooking.status,
        message: message,
        updatedBy: updatedByUser,
        updatedAt: new Date(),
        booking: updatedBooking
      });

      socketManager.emitToStaff('booking_status_updated', {
        bookingId: updatedBooking._id,
        status: updatedBooking.status,
        message: message,
        updatedBy: updatedByUser,
        updatedAt: new Date(),
        booking: updatedBooking
      });

      console.log(`🔔 Real-time notification sent for booking ${updatedBooking._id} status change to ${status}`);
    } catch (socketError) {
      console.error('Socket.IO emission error:', socketError);
      // Don't fail the request if socket emission fails
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

// Update entire booking (Admin only)
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating user assignment through this endpoint
    delete updateData.user;

    // Add timestamp
    updateData.updatedAt = new Date();

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("user", "first_name last_name email");

    if (!updatedBooking) {
      return send.sendErrorMessage(res, 404, new Error("Booking not found"));
    }

    return send.sendResponseMessage(
      res,
      200,
      updatedBooking,
      "Booking updated successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

// Initialize conversations for existing bookings (Utility endpoint)
exports.initializeConversations = async (req, res) => {
  try {
    // Find all bookings that don't have conversations
    const bookings = await Booking.find({}).populate(
      "user",
      "first_name last_name email roles"
    );

    const existingConversations = await Conversation.find({
      conversationType: "booking",
    }).distinct("relatedBooking");

    const bookingsWithoutConversations = bookings.filter(
      (booking) => !existingConversations.includes(booking._id.toString())
    );

    let createdCount = 0;
    let errorCount = 0;

    for (const booking of bookingsWithoutConversations) {
      try {
        const conversation = new Conversation({
          participants: [
            {
              user: booking.user._id,
              roles: "customer",
            },
          ],
          relatedBooking: booking._id,
          conversationType: "booking",
          status: "active",
        });

        await conversation.save();
        createdCount++;
        console.log(`✅ Conversation created for booking ${booking._id}`);
      } catch (conversationError) {
        errorCount++;
        console.error(
          `❌ Failed to create conversation for booking ${booking._id}:`,
          conversationError
        );
      }
    }

    return send.sendResponseMessage(
      res,
      200,
      {
        totalBookings: bookings.length,
        bookingsWithoutConversations: bookingsWithoutConversations.length,
        conversationsCreated: createdCount,
        errors: errorCount,
      },
      `Initialized ${createdCount} conversations for existing bookings`
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};
