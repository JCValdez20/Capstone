const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/BookingController');
const UserGuard = require('../middleware/User-Guard');
const AdminAuth = require('../middleware/AdminAuth');

// User routes
router.post('/create', UserGuard, BookingController.createBooking);
router.get('/my-bookings', UserGuard, BookingController.getUserBookings);
router.get('/available-slots/:date', BookingController.getAvailableSlots);
router.patch('/cancel/:id', UserGuard, BookingController.cancelBooking);

// Admin routes
router.get('/all', AdminAuth, BookingController.getAllBookings);
router.patch('/update-status/:id', AdminAuth, BookingController.updateBookingStatus);
router.get('/stats', AdminAuth, BookingController.getBookingStats);

module.exports = router;
