const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const BookingController = require("../controllers/BookingController");
const Auth = require("../middleware/auth");
const Roles = require("../middleware/roles");

// Admin login route
router.post("/login", UserController.adminLogin);

// Protected admin routes (require admin authentication)
router.get("/dashboard", Roles.staffOrAdmin(), (req, res) => {
  res.status(200).json({
    message: "Admin dashboard accessed successfully",
    admin: req.user,
  });
});

// User management routes (Admin + Staff access)
router.get("/users", Roles.staffOrAdmin(), UserController.getAllUsers);
router.get("/users/:id", Roles.staffOrAdmin(), UserController.getUserById);
router.put("/users/:id", Roles.staffOrAdmin(), UserController.updateUser);
router.delete("/users/:id", Roles.admin(), UserController.deleteUser); // Admin only

// Staff management routes (Admin only)
router.post("/staff", Roles.admin(), UserController.createStaffAccount);
router.get("/staff", Roles.admin(), UserController.getAllStaff);
router.put("/staff/:staffId", Roles.admin(), UserController.updateStaffAccount);
router.delete(
  "/staff/:staffId",
  Roles.admin(),
  UserController.deleteStaffAccount
);
router.put(
  "/staff/:staffId/reset-password",
  Roles.admin(),
  UserController.resetStaffPassword
);

// Booking management routes (Admin + Staff access)
router.get("/bookings", Roles.staffOrAdmin(), BookingController.getAllBookings);
router.get("/bookings/test", Roles.staffOrAdmin(), async (req, res) => {
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
  Roles.staffOrAdmin(),
  BookingController.getBookingStats
);
router.put(
  "/bookings/:id/status",
  Roles.staffOrAdmin(), // Staff can also update booking status
  BookingController.updateBookingStatus
);
router.put(
  "/bookings/:id",
  Roles.staffOrAdmin(),
  BookingController.updateBooking
);
router.delete("/bookings/:id", Roles.admin(), BookingController.cancelBooking); // Admin only

module.exports = router;
