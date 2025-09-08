require("dotenv").config();
const send = require("../utils/Response");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const JwtService = require("../utils/JwtService");
const User = require("../models/User");

/**
 * Handle successful Google OAuth login
 */
exports.loginSuccess = async (req, res) => {
  try {
    if (!req.user) throw new Error("No user found");

    // Generate JWT tokens
    const { accessToken, refreshToken } = JwtService.generateTokens(req.user);

    // Set HttpOnly cookies
    JwtService.setTokenCookies(res, accessToken, refreshToken);

    // Redirect to frontend without exposing tokens in URL
    const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
    res.redirect(`${clientUrl}/auth/callback/google?success=true`);
  } catch (error) {
    console.error("Google auth success error:", error);
    const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
    res.redirect(`${clientUrl}/login?error=auth_failed`);
  }
};

/**
 * Handle failed Google OAuth login
 */
exports.loginFailed = async (req, res) => {
  try {
    const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
    res.redirect(`${clientUrl}/login?error=login_failed`);
  } catch (error) {
    const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
    res.redirect(`${clientUrl}/login?error=server_error`);
  }
};

/**
 * Google OAuth callback
 */
exports.googleCallback = (req, res, next) => {
  passport.authenticate("google", {
    successRedirect: "/auth/login/success",
    failureRedirect: "/auth/login/failed",
  })(req, res, next);
};

/**
 * Initiate Google OAuth
 */
exports.googleAuth = (req, res, next) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
};

/**
 * Refresh access token using refresh token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = JwtService.extractTokensFromCookies(req);

    // If no refresh token cookie exists, user is not logged in
    if (!refreshToken) {
      return res.status(200).json({
        success: true,
        loggedIn: false,
        message: "No refresh token found",
      });
    }

    // Verify refresh token
    const decoded = JwtService.verifyRefreshToken(refreshToken);

    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      // Clear invalid cookies and return 401
      JwtService.clearTokenCookies(res);
      return res.status(401).json({
        success: false,
        loggedIn: false,
        message: "User not found",
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } =
      JwtService.generateTokens(user);

    // Set new cookies
    JwtService.setTokenCookies(res, accessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      loggedIn: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Token refresh error:", error);

    // Clear invalid cookies
    JwtService.clearTokenCookies(res);

    return res.status(401).json({
      success: false,
      loggedIn: false,
      message:
        error.name === "TokenExpiredError"
          ? "Refresh token expired"
          : "Invalid refresh token",
    });
  }
};

/**
 * Get current user profile
 */
exports.me = async (req, res) => {
  try {
    const { accessToken } = JwtService.extractTokensFromCookies(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token not found",
      });
    }

    // Verify access token
    const decoded = JwtService.verifyAccessToken(accessToken);

    // Get fresh user data from database
    const user = await User.findById(decoded.id).select(
      "-password -verificationToken -verificationTokenExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        roles: user.roles,
        first_name: user.first_name,
        last_name: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        isGoogleUser: user.isGoogleUser || false,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);

    const message =
      error.name === "TokenExpiredError"
        ? "Access token expired"
        : "Invalid access token";

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

/**
 * Logout user - clear cookies
 */
exports.logout = (req, res) => {
  try {
    // Clear authentication cookies
    JwtService.clearTokenCookies(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
