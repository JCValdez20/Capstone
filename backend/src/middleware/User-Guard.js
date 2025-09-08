const jwt = require("jsonwebtoken");
const send = require("../utils/Response");
const JwtService = require("../utils/JwtService");

/**
 * Efficient Role-Based Authentication Middleware using JWT from HttpOnly cookies
 * @param {string|string[]|null} allowedRoles - Roles allowed access (null = any authenticated user)
 * @returns {Function} Express middleware
 */
module.exports = (allowedRoles = null) => {
  return (req, res, next) => {
    try {
      // Extract token from HttpOnly cookie
      const { accessToken } = JwtService.extractTokensFromCookies(req);

      if (!accessToken) {
        return send.sendErrorMessage(
          res,
          401,
          new Error("Access token not found")
        );
      }

      // Verify and extract user data
      const decoded = JwtService.verifyAccessToken(accessToken);
      const userRole = decoded.roles || decoded.role || "customer";

      // Set standardized user data
      req.userData = {
        id: decoded.id,
        userId: decoded.id,
        email: decoded.email,
        roles: userRole,
        first_name: decoded.first_name,
        last_name: decoded.last_name,
      };

      // Role-based authorization (if roles specified)
      if (allowedRoles) {
        const roles = Array.isArray(allowedRoles)
          ? allowedRoles
          : [allowedRoles];

        const hasAccess =
          roles.includes(userRole) ||
          (userRole === "admin" && !roles.includes("customer")); // Admin has access except when specifically requiring customer role

        if (!hasAccess) {
          return send.sendErrorMessage(res, 403, new Error("Access denied"));
        }
      }

      next();
    } catch (error) {
      const message =
        error.name === "TokenExpiredError"
          ? "Access token expired"
          : "Invalid access token";
      return send.sendErrorMessage(res, 401, new Error(message));
    }
  };
};
