const jwt = require("jsonwebtoken");
const send = require("../utils/Response");

module.exports = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return send.sendErrorMessage(
        res,
        401,
        new Error("No authorization header provided")
      );
    }

    const authHeader = req.headers.authorization;
    if (!authHeader.startsWith("Bearer ")) {
      return send.sendErrorMessage(
        res,
        401,
        new Error("Invalid authorization header format")
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return send.sendErrorMessage(res, 401, new Error("No token provided"));
    }

    // Use JWT_SECRET to be consistent with other middleware
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || process.env.SECRET_KEY
    );

    // Standardize user data format across all middleware
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
    if (error.name === "JsonWebTokenError") {
      return send.sendErrorMessage(res, 401, new Error("Invalid token"));
    } else if (error.name === "TokenExpiredError") {
      return send.sendErrorMessage(res, 401, new Error("Token expired"));
    }
    return send.sendErrorMessage(res, 401, new Error("Authentication failed"));
  }
};
