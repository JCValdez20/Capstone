const User = require("../models/User");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const send = require("../utils/Response");

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!(await argon2.verify(user.password, password))) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        name: user.name, // Add combined name
        email: user.email,
        role: user.role, // Standardized to singular
        isGoogleUser: user.isGoogleUser || false,
      },
    });
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

exports.userRegister = async (req, res) => {
  const { first_name, last_name, email, password, roles } = req.body;
  try {
    const hash = await argon2.hash(password, 10);
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password: hash,
      roles,
    });

    return send.sendResponseMessage(
      res,
      201,
      newUser,
      "User registered successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};
exports.createAdmin = async (req, res) => {
  const { first_name, last_name, email, password, roles } = req.body;

  try {
    const hash = await argon2.hash(password, 10);
    const Admin = await User.create({
      first_name,
      last_name,
      email,
      password: hash,
      roles: roles || "admin", // Default to 'admin' if roles not provided
    });

    return send.sendResponseMessage(
      res,
      201,
      Admin,
      "Admin created successfully "
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    return send.sendResponseMessage(
      res,
      200,
      users,
      "Users retrieved successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

exports.getUserbyId = async (req, res) => {
  try {
    const { _id } = req.params;
    const user = await User.findOne({ _id });

    if (!user) {
      return send.sendErrorMessage(res, 404, new Error("User not found"));
    }

    return send.sendResponseMessage(
      res,
      200,
      user,
      "User retrieved successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};
