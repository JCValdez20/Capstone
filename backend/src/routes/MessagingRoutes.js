const express = require("express");
const router = express.Router();
const MessagingController = require("../controllers/MessageController");
const userGuard = require("../middleware/User-Guard");

// Only admin and staff can access messaging routes
router.get(
  "/users",
  userGuard(["admin", "staff"]),
  MessagingController.getUserMessaging
);
router.get(
  "/:id",
  userGuard(["admin", "staff"]),
  MessagingController.getMessages
);
router.post(
  "/send/:id",
  userGuard(["admin", "staff"]),
  MessagingController.sendMessage
);

module.exports = router;
