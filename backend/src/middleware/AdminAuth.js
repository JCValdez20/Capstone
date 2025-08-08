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

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded.roles !== "admin") {
      return sendErrorMessage(
        res,
        403,
        new Error("Access denied. Admin privileges required.")
      );
    }
    
    req.user = decoded; // Using 'user' instead of 'userData' for consistency
    next();
  } catch (error) {
    return sendErrorMessage(res, 401, new Error("Authentication failed"));
  }
};
