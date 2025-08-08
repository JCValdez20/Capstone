const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const AdminOnly = require("../middleware/AdminAuth");

router.post("/login", UserController.userLogin);
router.post("/register", UserController.userRegister);

router.get("/admin/users", AdminOnly, UserController.getAllUsers);
router.get("/admin/users/:id", UserController.getUserbyId);
// router.post("/admin/create", UserController.createAdmin);

module.exports = router;
