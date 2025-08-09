const jwt = require("jsonwebtoken");
const send = require("../utils/Response");

module.exports = (req, res, next) => {
  try {
    // Check if authorization header exists
    if (!req.headers.authorization) {
      return send.sendErrorMessage(res, 401, new Error("No authorization header provided"));
    }

    // Check if authorization header has the correct format
    const authHeader = req.headers.authorization;
    if (!authHeader.startsWith('Bearer ')) {
      return send.sendErrorMessage(res, 401, new Error("Invalid authorization header format"));
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return send.sendErrorMessage(res, 401, new Error("No token provided"));
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.userData = decoded;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return send.sendErrorMessage(res, 401, new Error("Invalid token"));
    } else if (error.name === 'TokenExpiredError') {
      return send.sendErrorMessage(res, 401, new Error("Token expired"));
    }
    return send.sendErrorMessage(res, 401, new Error("Authentication failed"));
  }
};
