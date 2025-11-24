// Service Configuration with Durations and Combination Rules

const SERVICE_CATALOG = {
  "UV Graphene Ceramic Coating": {
    duration: 4, // 4 hours (average of 3-5 hours)
    category: "coating",
    price: null, // Add pricing if needed
  },
  "Powder Coating": {
    duration: 2,
    category: "coating",
    price: null,
  },
  "Moto/Oto VIP": {
    duration: 3,
    category: "package",
    includes: ["interior", "engine"],
    price: null,
  },
  "Full Moto/Oto SPA": {
    duration: 4,
    category: "package",
    includes: ["interior", "engine", "premium"],
    price: null,
  },
  "Modernized Interior Detailing": {
    duration: 2,
    category: "detailing",
    type: "interior",
    price: null,
  },
  "Modernized Engine Detailing": {
    duration: 1,
    category: "detailing",
    type: "engine",
    price: null,
  },
};

// Service combination rules
const INCOMPATIBLE_COMBINATIONS = [
  // Coating conflicts
  ["UV Graphene Ceramic Coating", "Powder Coating"],

  // Powder Coating cannot be with detailing packages
  ["Powder Coating", "Moto/Oto VIP"],
  ["Powder Coating", "Full Moto/Oto SPA"],

  // Package overlaps - VIP conflicts
  ["Moto/Oto VIP", "Full Moto/Oto SPA"],
  ["Moto/Oto VIP", "Modernized Interior Detailing"],
  ["Moto/Oto VIP", "Modernized Engine Detailing"],

  // Package overlaps - SPA conflicts
  ["Full Moto/Oto SPA", "Modernized Interior Detailing"],
  ["Full Moto/Oto SPA", "Modernized Engine Detailing"],
];

// Valid combinations (for reference)
const COMPATIBLE_COMBINATIONS = [
  ["UV Graphene Ceramic Coating", "Modernized Interior Detailing"],
  ["UV Graphene Ceramic Coating", "Modernized Engine Detailing"],
  ["Modernized Interior Detailing", "Modernized Engine Detailing"],
];

// Shop operating hours
const SHOP_HOURS = {
  open: 9, // 9:00 AM
  close: 21, // 9:00 PM
  totalHours: 12, // 12 hours total
};

/**
 * Get service duration
 */
function getServiceDuration(serviceName) {
  const service = SERVICE_CATALOG[serviceName];
  if (!service) {
    throw new Error(`Unknown service: ${serviceName}`);
  }
  return service.duration;
}

/**
 * Calculate total duration for multiple services
 */
function calculateTotalDuration(serviceNames) {
  return serviceNames.reduce((total, serviceName) => {
    return total + getServiceDuration(serviceName);
  }, 0);
}

/**
 * Validate service combinations
 * Returns { valid: boolean, error: string | null }
 */
function validateServiceCombination(serviceNames) {
  // Single service is always valid
  if (serviceNames.length === 1) {
    return { valid: true, error: null };
  }

  // Check for incompatible combinations
  for (const incompatiblePair of INCOMPATIBLE_COMBINATIONS) {
    const hasFirst = serviceNames.includes(incompatiblePair[0]);
    const hasSecond = serviceNames.includes(incompatiblePair[1]);

    if (hasFirst && hasSecond) {
      return {
        valid: false,
        error: `"${incompatiblePair[0]}" cannot be combined with "${incompatiblePair[1]}"`,
      };
    }
  }

  // Check if total duration fits within shop hours
  const totalDuration = calculateTotalDuration(serviceNames);
  if (totalDuration > SHOP_HOURS.totalHours) {
    return {
      valid: false,
      error: `Total service duration (${totalDuration} hours) exceeds maximum shop hours (${SHOP_HOURS.totalHours} hours)`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Convert time string to hours (24-hour format)
 * Example: "9:00 AM" -> 9, "1:00 PM" -> 13
 */
function timeStringToHours(timeStr) {
  const [time, period] = timeStr.split(" ");
  let [hours] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours;
}

/**
 * Convert hours to time string
 * Example: 9 -> "9:00 AM", 13 -> "1:00 PM"
 */
function hoursToTimeString(hours) {
  const period = hours >= 12 ? "PM" : "AM";
  let displayHours = hours % 12;
  if (displayHours === 0) displayHours = 12;

  return `${displayHours}:00 ${period}`;
}

/**
 * Calculate end time based on start time and duration
 * Returns { valid: boolean, endTime: string | null, error: string | null }
 */
function calculateEndTime(startTimeStr, durationHours) {
  try {
    const startHours = timeStringToHours(startTimeStr);
    const endHours = startHours + durationHours;

    // Check if end time exceeds shop closing
    if (endHours > SHOP_HOURS.close) {
      return {
        valid: false,
        endTime: null,
        error: `Booking would end at ${hoursToTimeString(
          endHours
        )}, which is after shop closing time (9:00 PM)`,
      };
    }

    return {
      valid: true,
      endTime: hoursToTimeString(endHours),
      error: null,
    };
  } catch (error) {
    return {
      valid: false,
      endTime: null,
      error: error.message || "Failed to calculate end time",
    };
  }
}

/**
 * Check if time range overlaps with existing bookings
 */
function checkTimeOverlap(startTime, endTime, existingBookings) {
  const newStart = timeStringToHours(startTime);
  const newEnd = timeStringToHours(endTime);

  for (const booking of existingBookings) {
    const bookingStart = timeStringToHours(booking.timeSlot);
    const bookingEnd = timeStringToHours(booking.endTime);

    // Check for overlap: (StartA < EndB) and (EndA > StartB)
    if (newStart < bookingEnd && newEnd > bookingStart) {
      return true; // Overlap found
    }
  }

  return false; // No overlap
}

/**
 * Generate available time slots for given services and date
 */
function generateAvailableSlots(serviceNames, date, existingBookings) {
  const totalDuration = calculateTotalDuration(serviceNames);
  const availableSlots = [];

  // Iterate through each hour from shop open to close
  for (let hour = SHOP_HOURS.open; hour < SHOP_HOURS.close; hour++) {
    const startTime = hoursToTimeString(hour);

    // Calculate end time for this slot
    const endTimeResult = calculateEndTime(startTime, totalDuration);

    // If end time calculation failed or exceeds shop hours, stop checking
    if (!endTimeResult.valid) {
      break;
    }

    // Check if this time slot overlaps with any existing booking
    const hasOverlap = checkTimeOverlap(
      startTime,
      endTimeResult.endTime,
      existingBookings
    );

    if (!hasOverlap) {
      availableSlots.push({
        startTime,
        endTime: endTimeResult.endTime,
        duration: totalDuration,
      });
    }
  }

  return availableSlots;
}

/**
 * Get all available services
 */
function getAllServices() {
  return Object.keys(SERVICE_CATALOG);
}

/**
 * Get service details
 */
function getServiceDetails(serviceName) {
  return SERVICE_CATALOG[serviceName] || null;
}

module.exports = {
  SERVICE_CATALOG,
  INCOMPATIBLE_COMBINATIONS,
  COMPATIBLE_COMBINATIONS,
  SHOP_HOURS,
  getServiceDuration,
  calculateTotalDuration,
  validateServiceCombination,
  calculateEndTime,
  checkTimeOverlap,
  generateAvailableSlots,
  timeStringToHours,
  hoursToTimeString,
  getAllServices,
  getServiceDetails,
};
