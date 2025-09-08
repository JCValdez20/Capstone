const jwt = require("jsonwebtoken");

class JwtService {
  constructor() {
    this.accessTokenSecret =
      process.env.JWT_ACCESS_SECRET || process.env.SECRET_KEY;
    this.refreshTokenSecret =
      process.env.JWT_REFRESH_SECRET || process.env.SECRET_KEY + "_REFRESH";
    this.accessTokenExpiry = "30m"; // Updated to 30 minutes
    this.refreshTokenExpiry = "7d";
  }

  /**
   * Generate JWT tokens for a user
   * @param {Object} user - User object
   * @returns {Object} - { accessToken, refreshToken }
   */
  generateTokens(user) {
    const payload = {
      id: user._id || user.id,
      email: user.email,
      roles: user.roles || user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
    });

    const refreshToken = jwt.sign(
      { id: payload.id, email: payload.email },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiry }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify access token
   * @param {string} token - JWT token
   * @returns {Object} - Decoded payload
   */
  verifyAccessToken(token) {
    return jwt.verify(token, this.accessTokenSecret);
  }

  /**
   * Verify refresh token
   * @param {string} token - JWT refresh token
   * @returns {Object} - Decoded payload
   */
  verifyRefreshToken(token) {
    return jwt.verify(token, this.refreshTokenSecret);
  }

  /**
   * Set JWT cookies in response
   * @param {Object} res - Express response object
   * @param {string} accessToken - Access token
   * @param {string} refreshToken - Refresh token
   */
  setTokenCookies(res, accessToken, refreshToken) {
    const isProduction = process.env.NODE_ENV === "production";

    // Access token cookie (30 minutes)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: "strict",
      maxAge: 30 * 60 * 1000, // 30 minutes
      path: "/",
    });

    // Refresh token cookie (7 days)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });
  }

  /**
   * Clear authentication cookies
   * @param {Object} res - Express response object
   */
  clearTokenCookies(res) {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
  }

  /**
   * Extract tokens from request cookies
   * @param {Object} req - Express request object
   * @returns {Object} - { accessToken, refreshToken }
   */
  extractTokensFromCookies(req) {
    return {
      accessToken: req.cookies?.accessToken,
      refreshToken: req.cookies?.refreshToken,
    };
  }
}

module.exports = new JwtService();
