import axios from './axios';

class BookingService {
  // Create a new booking
  async createBooking(bookingData) {
    try {
      const response = await axios.post('/bookings/create', bookingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get user's bookings
  async getUserBookings(params = {}) {
    try {
      const response = await axios.get('/bookings/my-bookings', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get available time slots for a date
  async getAvailableSlots(date) {
    try {
      const formattedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      const response = await axios.get(`/bookings/available-slots/${formattedDate}`);
      
      // Transform the response to match frontend expectations
      const availableSlots = response.data.data?.availableSlots || [];
      return availableSlots.map(slot => ({ time: slot }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId) {
    try {
      const response = await axios.patch(`/bookings/cancel/${bookingId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin: Get all bookings
  async getAllBookings(params = {}) {
    try {
      const response = await axios.get('/bookings/all', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin: Update booking status
  async updateBookingStatus(bookingId, status, notes = '') {
    try {
      const response = await axios.patch(`/bookings/update-status/${bookingId}`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin: Get booking statistics
  async getBookingStats() {
    try {
      const response = await axios.get('/bookings/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Real-time slot checker (can be called periodically)
  async checkSlotAvailability(date, timeSlot) {
    try {
      const response = await this.getAvailableSlots(date);
      return {
        isAvailable: response.data.availableSlots.includes(timeSlot),
        alternativeSlots: response.data.availableSlots,
        totalAvailable: response.data.availableCount
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Helper method to get slot status
  getSlotStatus(availableSlots, bookedSlots, timeSlot) {
    if (availableSlots.includes(timeSlot)) return 'available';
    if (bookedSlots.includes(timeSlot)) return 'booked';
    return 'unknown';
  }

  // Error handling
  handleError(error) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error(error.message || 'An unexpected error occurred');
  }
}

const bookingService = new BookingService();

export { bookingService };
export default bookingService;
