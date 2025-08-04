const jwt = require("jsonwebtoken");
const { sendErrorMessage } = require("../utils/Response");
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded.roles !== "admin") {
      return sendErrorMessage(
        res,
        403,
        new Error("Access denied. Admins only.")
      );
    }
    req.userData = decoded;
    next();
  } catch (error) {
    return sendErrorMessage(res, 401, new Error("Authentication failed"));
  }
};
