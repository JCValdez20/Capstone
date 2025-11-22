// middleware/authGuard.js
const send = require("../utils/Response");
const jwt = require("jsonwebtoken");

module.exports = (allowedRoles = null) => {
  return async (req, res, next) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return send.sendErrorMessage(
          res,
          401,
          new Error("Access token not found")
        );
      }

      const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
      const accessTokenSecret =
        process.env.JWT_ACCESS_SECRET ||
        process.env.SECRET_KEY ||
        "ACCESS_SECRET";
      const decoded = jwt.verify(accessToken, accessTokenSecret);

      // Normalize roles to array
      const userRoles = Array.isArray(decoded.roles)
        ? decoded.roles
        : decoded.roles
        ? [decoded.roles]
        : ["customer"];

      req.userData = {
        id: decoded.id,
        email: decoded.email,
        roles: userRoles,
        first_name: decoded.first_name,
        last_name: decoded.last_name,
      };

      // If allowedRoles supplied, check intersection
      if (allowedRoles) {
        const allowed = Array.isArray(allowedRoles)
          ? allowedRoles
          : [allowedRoles];
        const hasAccess = userRoles.some((r) => allowed.includes(r));
        if (!hasAccess) {
          return send.sendErrorMessage(res, 403, new Error("Access denied"));
        }
      }

      return next();
    } catch (err) {
      // Distinguish expired token so frontend can attempt refresh
      if (err && err.name === "TokenExpiredError") {
        return send.sendErrorMessage(
          res,
          401,
          new Error("Access token expired")
        );
      }
      return send.sendErrorMessage(res, 401, new Error("Invalid access token"));
    }
  };
};
