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

    // Return ALL user data from database (excluding password)
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.roles,
        roles: user.roles,
        profilePic: user.profilePic || "", // This will include any updated profilePic
        isGoogleUser: user.isGoogleUser || false,
      },
    });
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if user is an admin
    if (user.roles !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin privileges required." });
    }

    if (!(await argon2.verify(user.password, password))) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        roles: user.roles,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "8h", // Longer session for admin
      }
    );

    // Return ALL user data from database (excluding password)
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.roles,
        roles: user.roles,
        profilePic: user.profilePic || "", // This will include any updated profilePic
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
// exports.createAdmin = async (req, res) => {
//   const { first_name, last_name, email, password, roles } = req.body;

//   try {
//     const hash = await argon2.hash(password, 10);
//     const Admin = await User.create({
//       first_name,
//       last_name,
//       email,
//       password: hash,
//       roles: roles || "admin", // Default to 'admin' if roles not provided
//     });

//     return send.sendResponseMessage(
//       res,
//       201,
//       Admin,
//       "Admin created successfully "
//     );
//   } catch (error) {
//     return send.sendErrorMessage(res, 500, error);
//   }
// };

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

// Admin function aliases for consistency with AdminRoutes
exports.getUserById = exports.getUserbyId;

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If updating password, hash it
    if (updateData.password) {
      updateData.password = await argon2.hash(updateData.password);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return send.sendErrorMessage(res, 404, new Error("User not found"));
    }

    return send.sendResponseMessage(
      res,
      200,
      updatedUser,
      "User updated successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return send.sendErrorMessage(res, 404, new Error("User not found"));
    }

    return send.sendResponseMessage(
      res,
      200,
      { id: deletedUser._id },
      "User deleted successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.userData.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return send.sendErrorMessage(res, 404, new Error("User not found"));
    }

    return send.sendResponseMessage(
      res,
      200,
      user,
      "Current user retrieved successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userData.id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.roles;
    delete updateData.email; // Email updates might need separate verification

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return send.sendErrorMessage(res, 404, new Error("User not found"));
    }

    return send.sendResponseMessage(
      res,
      200,
      updatedUser,
      "Profile updated successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    const userId = req.userData.id;
    const { profilePic } = req.body;

    if (!profilePic) {
      return send.sendErrorMessage(
        res,
        400,
        new Error("Profile picture URL is required")
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return send.sendErrorMessage(res, 404, new Error("User not found"));
    }

    return send.sendResponseMessage(
      res,
      200,
      updatedUser, // Return the full user object
      "Profile picture updated successfully"
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};
