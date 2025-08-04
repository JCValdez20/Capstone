const express = require("express");
const router = express.Router();
const TokenVerify = require("../middleware/User-Guard");

router.get("/user-verification", TokenVerify, (req, res) => {
  res.json({
    user: req.userData,
  });
});

module.exports = router;
