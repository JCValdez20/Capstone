const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const Auth = require("../middleware/auth");
const Roles = require("../middleware/roles");

router.post("/login", UserController.userLogin);
router.post("/register", UserController.userRegister);

// Email verification routes
router.post("/verify-email", UserController.verifyEmail);
router.post("/resend-verification", UserController.resendVerificationEmail);

// Protected user routes
router.get("/profile", Roles.anyAuth(), UserController.getCurrentUser);
router.put("/profile", Roles.anyAuth(), UserController.updateProfile);
router.put(
  "/profile/picture",
  Roles.anyAuth(),
  UserController.updateProfilePicture
);

router.get("/admin/users", Roles.admin(), UserController.getAllUsers);
router.get("/admin/users/:id", UserController.getUserbyId);

module.exports = router;
