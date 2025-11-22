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

// Unified login endpoint (no role checking - accepts all users)
const UserController = require("../controllers/UserController");
router.post("/login", UserController.login);

// Get current user profile (protected - requires valid JWT)
router.get("/me", TokenVerify(), AuthController.me);

// Refresh access token (no auth required - uses refresh token in body)
router.post("/refresh", AuthController.refreshTokens);

// Logout endpoint (client-side handled)
router.post("/logout", AuthController.logout);

// Google OAuth routes
router.get("/login/failed", AuthController.loginFailed);
router.get("/google/callback", AuthController.googleCallback);
router.get("/google", AuthController.googleAuth);

module.exports = router;
