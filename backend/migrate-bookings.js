/**
 * MIGRATION SCRIPT: Populate services array for existing bookings
 * 
 * This script updates old bookings that only have a 'service' field
 * to include the new 'services' array, 'totalDuration', and 'endTime' fields.
 * 
 * USAGE:
 * 1. Make sure your MongoDB is running
 * 2. Update the MongoDB connection string if needed
 * 3. Run: node backend/migrate-bookings.js
 * 
 * SAFE TO RUN: This script only updates bookings that don't have a 'services' array
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./src/models/Booking');
const { 
  SERVICE_CATALOG, 
  calculateEndTime,
  timeStringToHours 
} = require('./src/config/services');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/washup';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Calculate end time for a booking
 */
function calculateBookingEndTime(timeSlot, duration) {
  try {
    const result = calculateEndTime(timeSlot, duration);
    return result.valid ? result.endTime : null;
  } catch (error) {
    console.error(`Error calculating end time for ${timeSlot}:`, error);
    return null;
  }
}

/**
 * Get duration for a service (defaults to 1 hour for unknown services)
 */
function getServiceDuration(serviceName) {
  if (SERVICE_CATALOG[serviceName]) {
    return SERVICE_CATALOG[serviceName].duration;
  }
  
  console.warn(`${colors.yellow}⚠ Unknown service: ${serviceName}, defaulting to 1 hour${colors.reset}`);
  return 1; // Default to 1 hour for unknown services
}

/**
 * Main migration function
 */
async function migrateBookings() {
  try {
    console.log(`${colors.cyan}Connecting to MongoDB...${colors.reset}`);
    await mongoose.connect(MONGODB_URI);
    console.log(`${colors.green}✓ Connected to MongoDB${colors.reset}\n`);

    // Find bookings without services array
    const bookingsToMigrate = await Booking.find({
      $or: [
        { services: { $exists: false } },
        { services: { $size: 0 } }
      ]
    });

    console.log(`${colors.blue}Found ${bookingsToMigrate.length} bookings to migrate${colors.reset}\n`);

    if (bookingsToMigrate.length === 0) {
      console.log(`${colors.green}✓ No bookings need migration${colors.reset}`);
      await mongoose.disconnect();
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const booking of bookingsToMigrate) {
      try {
        // Get the service name
        const serviceName = booking.service;
        
        if (!serviceName) {
          console.log(`${colors.yellow}⚠ Skipping booking ${booking._id}: No service name${colors.reset}`);
          errorCount++;
          continue;
        }

        // Get duration for the service
        const duration = getServiceDuration(serviceName);

        // Create services array
        const servicesArray = [{
          name: serviceName,
          duration: duration
        }];

        // Calculate end time
        const endTime = calculateBookingEndTime(booking.timeSlot, duration);

        // Update booking
        booking.services = servicesArray;
        booking.totalDuration = duration;
        
        if (endTime) {
          booking.endTime = endTime;
        } else {
          console.log(`${colors.yellow}⚠ Could not calculate end time for booking ${booking._id}${colors.reset}`);
        }

        await booking.save();
        
        successCount++;
        console.log(`${colors.green}✓${colors.reset} Migrated: ${booking._id} | ${serviceName} (${duration}h) | ${booking.timeSlot}${endTime ? ` - ${endTime}` : ''}`);

      } catch (error) {
        errorCount++;
        errors.push({ bookingId: booking._id, error: error.message });
        console.log(`${colors.red}✗${colors.reset} Error migrating ${booking._id}: ${error.message}`);
      }
    }

    // Summary
    console.log(`\n${colors.cyan}════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}Migration Summary:${colors.reset}`);
    console.log(`  Total bookings: ${bookingsToMigrate.length}`);
    console.log(`  ${colors.green}✓ Successful: ${successCount}${colors.reset}`);
    console.log(`  ${colors.red}✗ Failed: ${errorCount}${colors.reset}`);
    
    if (errors.length > 0) {
      console.log(`\n${colors.red}Errors:${colors.reset}`);
      errors.forEach(err => {
        console.log(`  ${err.bookingId}: ${err.error}`);
      });
    }

    console.log(`${colors.cyan}════════════════════════════════════════${colors.reset}\n`);

    await mongoose.disconnect();
    console.log(`${colors.green}✓ Migration complete and database disconnected${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}✗ Migration failed:${colors.reset}`, error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

/**
 * Verify migration (dry run)
 */
async function verifyMigration() {
  try {
    console.log(`${colors.cyan}Connecting to MongoDB for verification...${colors.reset}`);
    await mongoose.connect(MONGODB_URI);

    // Count bookings with services array
    const withServices = await Booking.countDocuments({
      services: { $exists: true, $not: { $size: 0 } }
    });

    // Count bookings without services array
    const withoutServices = await Booking.countDocuments({
      $or: [
        { services: { $exists: false } },
        { services: { $size: 0 } }
      ]
    });

    // Count total bookings
    const total = await Booking.countDocuments();

    console.log(`\n${colors.blue}Migration Status:${colors.reset}`);
    console.log(`  Total bookings: ${total}`);
    console.log(`  ${colors.green}✓ Migrated: ${withServices}${colors.reset}`);
    console.log(`  ${colors.yellow}⚠ Need migration: ${withoutServices}${colors.reset}`);
    
    if (withoutServices === 0) {
      console.log(`\n${colors.green}✓ All bookings have been migrated!${colors.reset}`);
    } else {
      console.log(`\n${colors.yellow}Run migration to update ${withoutServices} bookings${colors.reset}`);
    }

    await mongoose.disconnect();

  } catch (error) {
    console.error(`${colors.red}✗ Verification failed:${colors.reset}`, error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Command line interface
const command = process.argv[2];

if (command === 'verify' || command === '--verify' || command === '-v') {
  console.log(`${colors.yellow}`);
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     BOOKING MIGRATION VERIFICATION             ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(colors.reset);
  verifyMigration();
} else if (command === 'help' || command === '--help' || command === '-h') {
  console.log(`
${colors.cyan}BOOKING MIGRATION SCRIPT${colors.reset}

${colors.yellow}USAGE:${colors.reset}
  node backend/migrate-bookings.js [command]

${colors.yellow}COMMANDS:${colors.reset}
  (no command)    Run the migration
  verify, -v      Verify migration status without making changes
  help, -h        Show this help message

${colors.yellow}DESCRIPTION:${colors.reset}
  This script migrates old bookings to the new multi-service format by:
  - Adding a 'services' array based on the 'service' field
  - Adding 'totalDuration' field
  - Calculating and adding 'endTime' field

${colors.yellow}SAFETY:${colors.reset}
  - Only updates bookings without a 'services' array
  - Safe to run multiple times
  - Does not modify bookings that are already migrated

${colors.yellow}EXAMPLES:${colors.reset}
  node backend/migrate-bookings.js          ${colors.blue}# Run migration${colors.reset}
  node backend/migrate-bookings.js verify   ${colors.blue}# Check status${colors.reset}
  `);
} else {
  console.log(`${colors.yellow}`);
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     BOOKING MIGRATION TO MULTI-SERVICE         ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(colors.reset);
  migrateBookings();
}
