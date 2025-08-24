const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const BookingController = require("../controllers/BookingController");
const adminAuth = require("../middleware/AdminAuth");
const adminStaffAuth = require("../middleware/AdminStaffAuth");

// Admin login route
router.post("/login", UserController.adminLogin);

// Admin creation route (for creating new admins)
// router.post("/create", UserController.createAdmin);

// Protected admin routes (require admin authentication)
router.get("/dashboard", adminStaffAuth, (req, res) => {
  res.status(200).json({
    message: "Admin dashboard accessed successfully",
    admin: req.user,
  });
});

// User management routes (Admin + Staff access)
router.get("/users", adminStaffAuth, UserController.getAllUsers);
router.get("/users/:id", adminStaffAuth, UserController.getUserById);
router.put("/users/:id", adminStaffAuth, UserController.updateUser);
router.delete("/users/:id", adminAuth, UserController.deleteUser); // Admin only

// Staff management routes (Admin only)
router.post("/staff", adminAuth, UserController.createStaffAccount);
router.get("/staff", adminAuth, UserController.getAllStaff);
router.put("/staff/:staffId", adminAuth, UserController.updateStaffAccount);
router.delete("/staff/:staffId", adminAuth, UserController.deleteStaffAccount);
router.put(
  "/staff/:staffId/reset-password",
  adminAuth,
  UserController.resetStaffPassword
);

// Booking management routes (Admin + Staff access)
router.get("/bookings", adminStaffAuth, BookingController.getAllBookings);
router.get("/bookings/test", adminStaffAuth, async (req, res) => {
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
router.get(
  "/bookings/stats",
  adminStaffAuth,
  BookingController.getBookingStats
);
router.put(
  "/bookings/:id/status",
  adminStaffAuth, // Staff can also update booking status
  BookingController.updateBookingStatus
);
router.put("/bookings/:id", adminStaffAuth, BookingController.updateBooking);
router.delete("/bookings/:id", adminAuth, BookingController.cancelBooking); // Admin only

module.exports = router;
