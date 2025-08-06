const express = require("express");
const router = express.Router();
const TokenVerify = require("../middleware/User-Guard");
const AuthController = require("../controllers/AuthController");

router.get("/user-verification", TokenVerify, (req, res) => {
  res.json({
    user: req.userData,
  });
});

router.get("/login/success", AuthController.loginSuccess);
router.get("/login/failed", AuthController.loginFailed);
router.get("/google/callback", AuthController.googleCallback);
router.get("/google", AuthController.googleAuth);
router.get("/logout", AuthController.googleLogout);

module.exports = router;
