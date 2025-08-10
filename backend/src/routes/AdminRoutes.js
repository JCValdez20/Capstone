const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const BookingController = require("../controllers/BookingController");
const adminAuth = require("../middleware/AdminAuth");

// Admin login route
router.post("/login", UserController.adminLogin);

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
router.get("/bookings/stats", adminAuth, BookingController.getBookingStats);
router.put(
  "/bookings/:id/status",
  adminAuth,
  BookingController.updateBookingStatus
);
router.delete("/bookings/:id", adminAuth, BookingController.cancelBooking);

module.exports = router;
