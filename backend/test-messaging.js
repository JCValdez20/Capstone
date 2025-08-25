// Test script to verify messaging system with different user roles
// Run this with: node test-messaging.js

const mongoose = require("mongoose");
require("dotenv").config();

// Import models
require("./src/models/database");
const User = require("./src/models/User");
const Conversation = require("./src/models/Conversation");
const Messages = require("./src/models/Messages");

async function testMessagingSystem() {
  try {
    console.log("🔍 Testing messaging system...");

    // Find different user types
    const customer = await User.findOne({ roles: "customer" });
    const staff = await User.findOne({ roles: "staff" });
    const admin = await User.findOne({ roles: "admin" });

    console.log("\n📋 Available Users:");
    console.log(
      "Customer:",
      customer
        ? `${customer.first_name} ${customer.last_name} (${customer._id})`
        : "None found"
    );
    console.log(
      "Staff:",
      staff
        ? `${staff.first_name} ${staff.last_name} (${staff._id})`
        : "None found"
    );
    console.log(
      "Admin:",
      admin
        ? `${admin.first_name} ${admin.last_name} (${admin._id})`
        : "None found"
    );

    // Find a conversation to analyze
    const conversations = await Conversation.find()
      .populate("participants.user", "first_name last_name roles")
      .limit(3);

    console.log("\n💬 Sample Conversations:");
    for (let conv of conversations) {
      console.log(`\nConversation ID: ${conv._id}`);
      console.log("Participants:");
      for (let participant of conv.participants) {
        if (participant.user) {
          console.log(
            `  - ${participant.user.first_name} ${participant.user.last_name} (${participant.user.roles})`
          );
        }
      }

      // Get messages for this conversation
      const messages = await Messages.find({ conversation: conv._id })
        .populate("sender", "first_name last_name roles")
        .sort({ createdAt: -1 })
        .limit(3);

      console.log("Recent messages:");
      for (let msg of messages) {
        if (msg.sender) {
          console.log(
            `  - [${msg.sender.roles}] ${
              msg.sender.first_name
            }: "${msg.content.substring(0, 50)}..."`
          );
        }
      }
    }

    console.log("\n✅ Test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    process.exit(0);
  }
}

testMessagingSystem();
