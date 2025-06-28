const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
} = require("../controllers/authController"); // Import controller function

router.post("/register", register); // Route for registration
router.post("/login", login); // Route for login
router.post("/forgot-password", forgotPassword);

module.exports = router; // Export for use in server.js
