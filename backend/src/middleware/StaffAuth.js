const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Response = require("../utils/Response");

const StaffAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return Response.error(res, "Access denied. No token provided.", 401);
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return Response.error(res, "Access denied. Invalid token format.", 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return Response.error(res, "Invalid token. User not found.", 401);
      }

      // Check if user is staff or admin
      if (user.roles !== "staff" && user.roles !== "admin") {
        return Response.error(
          res,
          "Access denied. Staff or Admin privileges required.",
          403
        );
      }

      req.user = {
        userId: user._id,
        email: user.email,
        role: user.roles,
        first_name: user.first_name,
        last_name: user.last_name,
      };

      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return Response.error(res, "Invalid or expired token.", 401);
    }
  } catch (error) {
    console.error("Staff auth middleware error:", error);
    return Response.error(res, "Authentication server error.", 500);
  }
};

module.exports = StaffAuth;
