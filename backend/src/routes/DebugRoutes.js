const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Debug route to check token contents
router.get("/check-token", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET_KEY);
    
    return res.json({
      success: true,
      decoded,
      standardized: {
        id: decoded.id || decoded.userId,
        userId: decoded.id || decoded.userId,
        email: decoded.email,
        roles: decoded.roles || decoded.role,
        role: decoded.roles || decoded.role,
        first_name: decoded.first_name,
        last_name: decoded.last_name,
      }
    });
  } catch (error) {
    return res.json({ 
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
