const User = require("../models/User");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const send = require("../utils/Response");

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const verifyPassword = await argon2.verify(existingUser.password, password);
    if (verifyPassword) {
      const token = jwt.sign({ id: existingUser._id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      return res.status(200).json({
        token,
        user: {
          id: existingUser._id,
          first_name: existingUser.first_name,
          last_name: existingUser.last_name,

          email: existingUser.email,
          role: existingUser.roles,
        },
      });
    } else {
      return res.status(400).json({ message: "Invalid Password" });
    }
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

exports.userRegister = async (req, res) => {
  const { first_name, last_name, email, password, roles } = req.body;
  try {
    const hash = await argon2.hash(password, 10);
    const newUser = await User.create({
      // Mongoose's create()
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
