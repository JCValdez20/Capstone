const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const BookingController = require("../controllers/BookingController");
const userGuard = require("../middleware/User-Guard");

// Admin login moved to /auth/login with role validation at middleware level

// Protected admin routes (require admin authentication)
router.get("/dashboard", userGuard(["admin", "staff"]), (req, res) => {
  res.status(200).json({
    message: "Admin dashboard accessed successfully",
    admin: req.userData,
  });
});

// User management routes (Admin + Staff access)
router.get("/users", userGuard(["admin", "staff"]), UserController.getAllUsers);
router.get(
  "/users/:id",
  userGuard(["admin", "staff"]),
  UserController.getUserById
);
router.put(
  "/users/:id",
  userGuard(["admin", "staff"]),
  UserController.updateUser
);
router.delete("/users/:id", userGuard("admin"), UserController.deleteUser); // Admin only

// Staff management routes (Admin only)
router.post("/staff", userGuard("admin"), UserController.createStaffAccount);
router.get("/staff", userGuard("admin"), UserController.getAllStaff);
router.put(
  "/staff/:staffId",
  userGuard("admin"),
  UserController.updateStaffAccount
);
router.delete(
  "/staff/:staffId",
  userGuard("admin"),
  UserController.deleteStaffAccount
);
router.put(
  "/staff/:staffId/reset-password",
  userGuard("admin"),
  UserController.resetStaffPassword
);

// Booking management routes (Admin + Staff access)
router.get(
  "/bookings",
  userGuard(["admin", "staff"]),
  BookingController.getAllBookings
);
router.get(
  "/bookings/test",
  userGuard(["admin", "staff"]),
  async (req, res) => {
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
  }
);
router.get(
  "/bookings/stats",
  userGuard(["admin", "staff"]),
  BookingController.getBookingStats
);
router.put(
  "/bookings/:id/status",
  userGuard(["admin", "staff"]), // Staff can also update booking status
  BookingController.updateBookingStatus
);
router.put(
  "/bookings/:id",
  userGuard(["admin", "staff"]),
  BookingController.updateBooking
);
router.delete(
  "/bookings/:id",
  userGuard("admin"),
  BookingController.cancelBooking
); // Admin only

module.exports = router;
