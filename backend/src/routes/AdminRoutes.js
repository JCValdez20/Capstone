const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const adminAuth = require("../middleware/AdminAuth");

// Admin login route
router.post("/login", UserController.adminLogin);

// Protected admin routes (require admin authentication)
router.get("/dashboard", adminAuth, (req, res) => {
  res.status(200).json({
    message: "Admin dashboard accessed successfully",
    admin: req.user
  });
});

// Get all users (admin only)
router.get("/users", adminAuth, UserController.getAllUsers);

// Get user by ID (admin only)
router.get("/users/:id", adminAuth, UserController.getUserById);

// Update user (admin only)
router.put("/users/:id", adminAuth, UserController.updateUser);

// Delete user (admin only)
router.delete("/users/:id", adminAuth, UserController.deleteUser);

module.exports = router;
