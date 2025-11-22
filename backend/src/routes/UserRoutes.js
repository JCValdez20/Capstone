const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const UserGuard = require("../middleware/User-Guard");

// Login moved to /auth/login for unified authentication
router.post("/register", UserController.userRegister);

// Email verification routes
router.post("/verify-email", UserController.verifyEmail);
router.post("/resend-verification", UserController.resendVerificationEmail);

// Protected user routes
router.get("/profile", UserGuard(), UserController.getCurrentUser);
router.put("/profile", UserGuard(), UserController.updateProfile);

router.get("/admin/users", UserGuard("admin"), UserController.getAllUsers);
router.get("/admin/users/:id", UserGuard("admin"), UserController.getUserbyId);

module.exports = router;
