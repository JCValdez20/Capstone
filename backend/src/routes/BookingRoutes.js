const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/BookingController");
const userGuard = require("../middleware/User-Guard");

// Customer routes - require authentication
router.post("/create", userGuard("customer"), BookingController.createBooking);
router.get(
  "/my-bookings",
  userGuard("customer"),
  BookingController.getUserBookings
);
router.patch(
  "/cancel/:id",
  userGuard("customer"),
  BookingController.cancelBooking
);

// Public routes - no authentication required
router.get("/available-slots/:date", BookingController.getAvailableSlots);

// Note: Admin/Staff booking management routes are in AdminRoutes.js for better organization

module.exports = router;
