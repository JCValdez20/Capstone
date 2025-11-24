import axios from "./axios";

class BookingService {
  // Create a new booking
  async createBooking(bookingData) {
    try {
      const response = await axios.post("/bookings/create", bookingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get user's bookings
  async getUserBookings(params = {}) {
    try {
      const response = await axios.get("/bookings/my-bookings", {
        params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get available time slots for a date
  async getAvailableSlots(date, services = []) {
    try {
      const formattedDate =
        typeof date === "string" ? date : date.toISOString().split("T")[0];

      const params = services.length > 0 
        ? { services: JSON.stringify(services) }
        : {};

      const response = await axios.get(
        `/bookings/available-slots/${formattedDate}`,
        { params }
      );

      const data = response.data.data || {};
      
      // If services were provided, return duration-aware slots
      if (services.length > 0 && data.availableSlots) {
        return {
          slots: data.availableSlots,
          totalDuration: data.totalDuration,
          services: data.services
        };
      }

      // Legacy format for backward compatibility
      const availableSlots = data.availableSlots || [];
      return availableSlots.map((slot) => ({ time: slot }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Validate service combination
  async validateServices(services) {
    try {
      const response = await axios.post('/bookings/validate-services', { services });
      return response.data.data;
    } catch (error) {
      // Return structured error response instead of throwing
      const errorMessage = error.response?.data?.message || error.message || "Validation failed";
      return {
        valid: false,
        error: errorMessage,
        services: [],
        totalDuration: 0
      };
    }
  }

  // Get services catalog
  async getServicesCatalog() {
    try {
      const response = await axios.get('/bookings/services-catalog');
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId, cancellationReason = "") {
    try {
      const response = await axios.patch(`/bookings/cancel/${bookingId}`, {
        cancellationReason,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin/Staff: Get all bookings
  async getAllBookings(params = {}) {
    try {
      const response = await axios.get("/admin/bookings", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin/Staff: Update booking status
  async updateBookingStatus(
    bookingId,
    status,
    notes = "",
    rejectionReason = ""
  ) {
    try {
      const payload = {
        status,
        notes,
      };

      // Only include rejectionReason if provided (for rejected status)
      if (rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      const response = await axios.put(
        `/admin/bookings/${bookingId}/status`,
        payload
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin/Staff: Update entire booking
  async updateBooking(bookingId, bookingData) {
    try {
      const response = await axios.put(
        `/admin/bookings/${bookingId}`,
        bookingData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin/Staff: Get booking statistics
  async getBookingStats() {
    try {
      const response = await axios.get("/admin/bookings/stats");
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
        totalAvailable: response.data.availableCount,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Helper method to get slot status
  getSlotStatus(availableSlots, bookedSlots, timeSlot) {
    if (availableSlots.includes(timeSlot)) return "available";
    if (bookedSlots.includes(timeSlot)) return "booked";
    return "unknown";
  }

  // Error handling
  handleError(error) {
    if (error.response?.status === 403) {
      const message = error.response.data?.message || "Access forbidden";
      if (message.includes("verify your email")) {
        return new Error(
          "Please verify your email address before making bookings. Check your email for the verification code."
        );
      }
      if (message.includes("Admin users cannot") || message.includes("admin")) {
        return new Error(
          "Admin users cannot create bookings. Please log in with a customer account."
        );
      }
      if (message.includes("Staff users cannot") || message.includes("staff")) {
        return new Error(
          "Staff users cannot create bookings. Please log in with a customer account."
        );
      }
      if (message.includes("Access denied")) {
        return new Error(
          "You don't have permission to create bookings. Please log in with a customer account."
        );
      }
      return new Error(message);
    }

    if (error.response?.status === 401) {
      const message = error.response.data?.message || "Authentication failed";
      if (message.includes("log in again")) {
        return new Error(
          "Your session has expired. Please log in again to continue."
        );
      }
      return new Error("Your session has expired. Please log in again.");
    }

    if (error.response?.status === 404) {
      const message = error.response.data?.message || "Not found";
      if (message.includes("User not found")) {
        return new Error("Session expired. Please log in again to continue.");
      }
      return new Error(message);
    }

    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error(error.message || "An unexpected error occurred");
  }
}

const bookingService = new BookingService();

export { bookingService };
export default bookingService;
