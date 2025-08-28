const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/BookingController");
const Auth = require("../middleware/auth");
const Roles = require("../middleware/roles");

// User routes
router.post("/create", Roles.anyAuth(), BookingController.createBooking);
router.get("/my-bookings", Roles.anyAuth(), BookingController.getUserBookings);
router.get("/available-slots/:date", BookingController.getAvailableSlots);
router.patch("/cancel/:id", Roles.anyAuth(), BookingController.cancelBooking);

// Admin routes
router.get("/all", Roles.admin(), BookingController.getAllBookings);
router.patch(
  "/update-status/:id",
  Roles.admin(),
  BookingController.updateBookingStatus
);
router.get("/stats", Roles.admin(), BookingController.getBookingStats);
router.post(
  "/initialize-conversations",
  Roles.admin(),
  BookingController.initializeConversations
);

module.exports = router;
