/**
 * Migration script to add senderRole field to existing messages
 * This helps fix the issue where same user's messages sent in different role contexts
 * were not being properly attributed
 */

const mongoose = require('mongoose');
const Messages = require('../src/models/Messages');
const User = require('../src/models/User');
require('dotenv').config();

async function migrateSenderRoles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all messages without senderRole
    const messagesWithoutRole = await Messages.find({ 
      senderRole: { $exists: false } 
    }).populate('sender', 'roles');

    console.log(`Found ${messagesWithoutRole.length} messages without senderRole`);

    let updated = 0;
    for (const message of messagesWithoutRole) {
      if (message.sender && message.sender.roles) {
        // Set senderRole to the user's current role
        // Note: This is a best guess since we don't know the historical role context
        await Messages.updateOne(
          { _id: message._id },
          { $set: { senderRole: message.sender.roles } }
        );
        updated++;
      } else {
        // Default to customer if no role found
        await Messages.updateOne(
          { _id: message._id },
          { $set: { senderRole: 'customer' } }
        );
        updated++;
      }
    }

    console.log(`Updated ${updated} messages with senderRole`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Migration completed');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateSenderRoles();
}

module.exports = migrateSenderRoles;
