const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const AdminOnly = require("../middleware/AdminAuth");
const UserAuth = require("../middleware/User-Guard");

router.post("/login", UserController.userLogin);
router.post("/register", UserController.userRegister);

// Email verification routes
router.post("/verify-email", UserController.verifyEmail);
router.post("/resend-verification", UserController.resendVerificationEmail);

// Protected user routes
router.get("/profile", UserAuth, UserController.getCurrentUser);
router.put("/profile", UserAuth, UserController.updateProfile);
router.put("/profile/picture", UserAuth, UserController.updateProfilePicture);

router.get("/admin/users", AdminOnly, UserController.getAllUsers);
router.get("/admin/users/:id", UserController.getUserbyId);

module.exports = router;
