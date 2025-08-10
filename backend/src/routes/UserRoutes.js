const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const AdminOnly = require("../middleware/AdminAuth");
const UserAuth = require("../middleware/User-Guard");

router.post("/login", UserController.userLogin);
router.post("/register", UserController.userRegister);

// Protected user routes
router.get("/profile", UserAuth, UserController.getCurrentUser);
router.put("/profile", UserAuth, UserController.updateProfile);
router.put("/profile/picture", UserAuth, UserController.updateProfilePicture);

router.get("/admin/users", AdminOnly, UserController.getAllUsers);
router.get("/admin/users/:id", UserController.getUserbyId);
// router.post("/admin/create", UserController.createAdmin);

module.exports = router;
