require("dotenv").config();
const send = require("../utils/Response");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
  passport.authenticate(
    "google",
    {
      session: false, // Disable session creation - we use JWT instead
      failureRedirect: "/auth/login/failed",
    },
    async (err, user, info) => {
      try {
        // Handle authentication errors
        if (err) {
          console.error("Google OAuth error:", err);
          const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
          return res.redirect(`${clientUrl}/login?error=auth_error`);
        }

        // Handle authentication failure (no user)
        if (!user) {
          console.error("Google OAuth failed: No user returned");
          const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
          return res.redirect(`${clientUrl}/login?error=auth_failed`);
        }

        // Generate JWT tokens (role is in payload)
        // Generate tokens directly
        const accessTokenSecret =
          process.env.JWT_ACCESS_SECRET ||
          process.env.SECRET_KEY ||
          "ACCESS_SECRET";
        const refreshTokenSecret =
          process.env.JWT_REFRESH_SECRET ||
          (process.env.SECRET_KEY || "ACCESS_SECRET") + "_REFRESH";

        const roles = Array.isArray(user.roles)
          ? user.roles
          : user.roles
          ? [user.roles]
          : ["customer"];

        const payload = {
          id: user._id || user.id,
          email: user.email,
          roles,
          first_name: user.first_name,
          last_name: user.last_name,
        };

        const accessToken = jwt.sign(payload, accessTokenSecret, {
          expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
        });

        const refreshToken = jwt.sign(
          { id: payload.id, roles },
          refreshTokenSecret,
          { expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d" }
        );

        // Redirect to frontend with tokens in URL params
        const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
        res.redirect(
          `${clientUrl}/auth/callback/google?accessToken=${encodeURIComponent(
            accessToken
          )}&refreshToken=${encodeURIComponent(refreshToken)}`
        );
      } catch (error) {
        console.error("Google auth callback error:", error);
        const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
        res.redirect(`${clientUrl}/login?error=server_error`);
      }
    }
  )(req, res, next);
};

/**
 * Initiate Google OAuth
 */
exports.googleAuth = (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false, // Disable session creation - we use JWT instead
  })(req, res, next);
};

/**
 * Refresh access token using refresh token
 * CRITICAL: Must reload user from DB to get latest roles
 */
// controllers/authController.js (add/replace refresh logic)

exports.refreshTokens = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return send.sendErrorMessage(
        res,
        401,
        new Error("Refresh token not found")
      );
    }

    let decoded;
    try {
      const refreshTokenSecret =
        process.env.JWT_REFRESH_SECRET ||
        (process.env.SECRET_KEY || "ACCESS_SECRET") + "_REFRESH";
      decoded = jwt.verify(refreshToken, refreshTokenSecret);
    } catch (err) {
      return send.sendErrorMessage(
        res,
        401,
        new Error("Invalid or expired refresh token")
      );
    }

    // Best practice: reload user from DB to get current roles/permissions/status
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return send.sendErrorMessage(res, 401, new Error("User not found"));
    }

    // Regenerate tokens using current DB user (ensures roles are accurate)
    // Generate new tokens directly
    const accessTokenSecret =
      process.env.JWT_ACCESS_SECRET ||
      process.env.SECRET_KEY ||
      "ACCESS_SECRET";
    const refreshTokenSecret =
      process.env.JWT_REFRESH_SECRET ||
      (process.env.SECRET_KEY || "ACCESS_SECRET") + "_REFRESH";

    const roles = Array.isArray(user.roles)
      ? user.roles
      : user.roles
      ? [user.roles]
      : ["customer"];

    const payload = {
      id: user._id || user.id,
      email: user.email,
      roles,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    const newAccessToken = jwt.sign(payload, accessTokenSecret, {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
    });

    const newRefreshToken = jwt.sign(
      { id: payload.id, roles },
      refreshTokenSecret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d" }
    );

    // Return tokens and user object in JSON
    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        roles: Array.isArray(user.roles) ? user.roles : [user.roles],
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

exports.logout = async (req, res) => {
  try {
    // With localStorage JWT, logout is handled client-side
    // Server just acknowledges the logout
    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (err) {
    return send.sendErrorMessage(res, 500, err);
  }
};

/**
 * Get current user profile
 */
exports.me = async (req, res) => {
  try {
    // User data already decoded and attached by middleware
    const user = await User.findById(req.userData.id).select(
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
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
