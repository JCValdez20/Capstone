const jwt = require("jsonwebtoken");
const send = require("../utils/Response");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.userData = decoded;

    next();
  } catch (error) {
    return send.sendErrorMessage(res, 401, new Error("Authentication failed"));
  }
};
