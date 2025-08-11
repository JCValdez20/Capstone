const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const BookingController = require("../controllers/BookingController");
const adminAuth = require("../middleware/AdminAuth");

// Admin login route
router.post("/login", UserController.adminLogin);

// Admin creation route (for creating new admins)
// router.post("/create", UserController.createAdmin);

// Protected admin routes (require admin authentication)
router.get("/dashboard", adminAuth, (req, res) => {
  res.status(200).json({
    message: "Admin dashboard accessed successfully",
    admin: req.user,
  });
});

// User management routes
router.get("/users", adminAuth, UserController.getAllUsers);
router.get("/users/:id", adminAuth, UserController.getUserById);
router.put("/users/:id", adminAuth, UserController.updateUser);
router.delete("/users/:id", adminAuth, UserController.deleteUser);

// Booking management routes
router.get("/bookings", adminAuth, BookingController.getAllBookings);
router.get("/bookings/test", adminAuth, async (req, res) => {
  try {
    const Booking = require("../models/Booking");
    const bookings = await Booking.find().limit(5);
    res.json({
      message: "Test route",
      count: bookings.length,
      bookings: bookings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/bookings/stats", adminAuth, BookingController.getBookingStats);
router.put(
  "/bookings/:id/status",
  adminAuth,
  BookingController.updateBookingStatus
);
router.put("/bookings/:id", adminAuth, BookingController.updateBooking);
router.delete("/bookings/:id", adminAuth, BookingController.cancelBooking);

module.exports = router;
