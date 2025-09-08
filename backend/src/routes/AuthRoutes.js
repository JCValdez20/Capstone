const express = require("express");
const router = express.Router();
const TokenVerify = require("../middleware/User-Guard");
const AuthController = require("../controllers/AuthController");

// Token verification endpoint (protected)
router.get("/user-verification", TokenVerify(), (req, res) => {
  res.json({
    success: true,
    user: req.userData,
  });
});

// Get current user profile (protected)
router.get("/me", AuthController.me);

// Refresh access token
router.post("/refresh", AuthController.refreshToken);

// Logout endpoint
router.post("/logout", AuthController.logout);

// Google OAuth routes
router.get("/login/success", AuthController.loginSuccess);
router.get("/login/failed", AuthController.loginFailed);
router.get("/google/callback", AuthController.googleCallback);
router.get("/google", AuthController.googleAuth);

module.exports = router;
