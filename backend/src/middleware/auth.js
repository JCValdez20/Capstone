const jwt = require("jsonwebtoken");
const { sendErrorMessage } = require("../utils/Response");

/**
 * Authentication Middleware - Handles JWT token verification
 * Extracts and verifies JWT tokens, standardizes user data
 */
class Auth {
  /**
   * Basic authentication - verifies JWT token and extracts user data
   * @returns {Function} Express middleware
   */
  static authenticate() {
    return async (req, res, next) => {
      try {
        // Extract and validate token
        const token = this.extractToken(req);
        if (!token) {
          return sendErrorMessage(
            res,
            401,
            new Error("Authentication required")
          );
        }

        // Verify and decode token
        const decoded = this.verifyToken(token);
        if (!decoded) {
          return sendErrorMessage(
            res,
            401,
            new Error("Invalid or expired token")
          );
        }

        // Standardize user data across all middleware
        req.userData = this.standardizeUserData(decoded);

        next();
      } catch (error) {
        console.error("Authentication Error:", error);
        return sendErrorMessage(res, 401, new Error("Authentication failed"));
      }
    };
  }

  /**
   * Extract JWT token from request headers
   * @param {Object} req - Express request object
   * @returns {string|null} JWT token or null
   */
  static extractToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.split(" ")[1];
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object|null} Decoded token or null
   */
  static verifyToken(token) {
    try {
      return jwt.verify(
        token,
        process.env.JWT_SECRET || process.env.SECRET_KEY
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Standardize user data format across all middleware
   * @param {Object} decoded - Decoded JWT payload
   * @returns {Object} Standardized user data
   */
  static standardizeUserData(decoded) {
    // More robust role detection
    const userRole = decoded.roles || decoded.role || "customer"; // Default to customer

    return {
      id: decoded.id || decoded.userId,
      userId: decoded.id || decoded.userId,
      email: decoded.email,
      roles: userRole,
      role: userRole,
      first_name: decoded.first_name,
      last_name: decoded.last_name,
    };
  }

  /**
   * Check if user is authenticated (used in combination with roles middleware)
   * @param {Object} req - Express request object
   * @returns {boolean} Authentication status
   */
  static isAuthenticated(req) {
    return req.userData && req.userData.id;
  }
}

module.exports = Auth;
