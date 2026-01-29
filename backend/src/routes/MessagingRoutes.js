const express = require("express");
const router = express.Router();
const MessagingController = require("../controllers/MessageController");
const userGuard = require("../middleware/User-Guard");

// All authenticated users can access messaging
router.get(
  "/users",
  userGuard(["admin", "staff", "customer"]),
  MessagingController.getUserMessaging
);
router.get(
  "/:id",
  userGuard(["admin", "staff", "customer"]),
  MessagingController.getMessages
);
router.post(
  "/send/:id",
  userGuard(["admin", "staff", "customer"]),
  MessagingController.sendMessage
);

module.exports = router;
