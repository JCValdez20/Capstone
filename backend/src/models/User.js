const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email address",
    ],
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
  roles: {
    type: String,
    required: true,
    enum: ["customer", "admin"],
  },
  profilePic: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Users", userSchema);
