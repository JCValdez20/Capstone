const jwt = require("jsonwebtoken");
const { sendErrorMessage } = require("../utils/Response");
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return sendErrorMessage(res, 401, new Error("No token provided"));
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return sendErrorMessage(res, 401, new Error("Invalid token format"));
    }

    // Use JWT_SECRET for consistency, fall back to SECRET_KEY
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || process.env.SECRET_KEY
    );

    if (decoded.roles !== "admin") {
      return sendErrorMessage(
        res,
        403,
        new Error("Access denied. Admin privileges required.")
      );
    }

    // Standardize user data format
    req.userData = {
      id: decoded.id,
      userId: decoded.id, // Provide both for compatibility
      email: decoded.email,
      roles: decoded.roles,
      role: decoded.roles,
      first_name: decoded.first_name,
      last_name: decoded.last_name,
    };

    next();
  } catch (error) {
    return sendErrorMessage(res, 401, new Error("Authentication failed"));
  }
};
