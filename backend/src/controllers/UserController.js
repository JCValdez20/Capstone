const User = require("../models/User");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const send = require("../utils/Response");
const EmailService = require("../utils/EmailService");

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

    // Check if user's email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Email not verified",
        requiresVerification: true,
        email: user.email,
      });
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
        isVerified: user.isVerified,
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
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is an admin or staff
    if (user.roles !== "admin" && user.roles !== "staff") {
      return res
        .status(403)
        .json({
          message: "Access denied. Admin or Staff privileges required.",
        });
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
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hash = await argon2.hash(password, 10);

    // Generate OTP and set expiration (10 minutes)
    const otp = EmailService.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password: hash,
      roles,
      isVerified: false,
      verificationToken: otp,
      verificationTokenExpires: otpExpires,
    });

    // Send verification email
    const emailResult = await EmailService.sendVerificationEmail(
      email,
      first_name,
      otp
    );

    if (!emailResult.success) {
      // If email fails, we should still create the user but inform about the issue
      // Silent error handling for cleaner logs
    } else if (emailResult.development) {
      // Development mode - code sent successfully
    }

    return send.sendResponseMessage(
      res,
      201,
      {
        id: newUser._id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        requiresVerification: true,
        developmentMode: emailResult.development || false,
      },
      emailResult.development
        ? "User registered successfully. Check backend console for verification code."
        : "User registered successfully. Please check your email for verification code."
    );
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};
// exports.createAdmin = async (req, res) => {
//   const { first_name, last_name, email, password, roles } = req.body;

//   try {
//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return send.sendErrorMessage(
//         res,
//         400,
//         new Error("Email already registered")
//       );
//     }

//     const hash = await argon2.hash(password, 10);
//     const Admin = await User.create({
//       first_name,
//       last_name,
//       email,
//       password: hash,
//       roles: roles || "admin", // Default to 'admin' if roles not provided
//       isVerified: true, // Admin users are automatically verified
//       verificationToken: undefined, // No verification token needed
//       verificationTokenExpires: undefined, // No expiration needed
//     });

//     return send.sendResponseMessage(
//       res,
//       201,
//       {
//         id: Admin._id,
//         first_name: Admin.first_name,
//         last_name: Admin.last_name,
//         email: Admin.email,
//         roles: Admin.roles,
//         isVerified: Admin.isVerified,
//       },
//       "Admin created successfully and verified"
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

    // Safety check: Ensure we're not updating admin profiles through user routes
    if (req.userData.roles === "admin") {
      return send.sendErrorMessage(
        res,
        403,
        new Error("Admin profiles must be updated through admin routes")
      );
    }

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

    // Safety check: Ensure we're not updating admin profiles through user routes
    if (req.userData.roles === "admin") {
      return send.sendErrorMessage(
        res,
        403,
        new Error("Admin profiles must be updated through admin routes")
      );
    }

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

// Email verification endpoint
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Check if OTP is valid and not expired
    if (!user.verificationToken || user.verificationToken !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (new Date() > user.verificationTokenExpires) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Update user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Send welcome email
    await EmailService.sendWelcomeEmail(user.email, user.first_name);

    return res.status(200).json({
      message: "Email verified successfully",
      verified: true,
    });
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new OTP and set expiration
    const otp = EmailService.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationToken = otp;
    user.verificationTokenExpires = otpExpires;
    await user.save();

    // Send verification email
    const emailResult = await EmailService.sendVerificationEmail(
      email,
      user.first_name,
      otp
    );

    if (!emailResult.success && !emailResult.development) {
      return res.status(500).json({
        message: "Failed to send verification email",
      });
    }

    return res.status(200).json({
      message: emailResult.development
        ? "Verification code generated. Check backend console."
        : "Verification email sent successfully",
      developmentMode: emailResult.development || false,
    });
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

// Admin only: Create staff account
exports.createStaffAccount = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await argon2.hash(password);

    // Create staff user
    const staffUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      roles: "staff",
      isVerified: true, // Staff accounts are pre-verified
    });

    await staffUser.save();

    // Send welcome email to staff
    const emailResult = await EmailService.sendStaffWelcomeEmail(
      email,
      first_name,
      password // Send temporary password
    );

    return res.status(201).json({
      message: "Staff account created successfully",
      staff: {
        id: staffUser._id,
        first_name: staffUser.first_name,
        last_name: staffUser.last_name,
        email: staffUser.email,
        roles: staffUser.roles,
        isVerified: staffUser.isVerified,
      },
      emailSent: emailResult.success,
    });
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

// Admin only: Get all staff accounts
exports.getAllStaff = async (req, res) => {
  try {
    const staffMembers = await User.find({ roles: "staff" })
      .select("-password -verificationToken -verificationTokenExpires")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Staff members retrieved successfully",
      staff: staffMembers,
      total: staffMembers.length,
    });
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

// Admin only: Update staff account
exports.updateStaffAccount = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { first_name, last_name, email, isActive } = req.body;

    const staff = await User.findById(staffId);
    if (!staff || staff.roles !== "staff") {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== staff.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update staff data
    const updateData = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (email) updateData.email = email;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    const updatedStaff = await User.findByIdAndUpdate(staffId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -verificationToken -verificationTokenExpires");

    return res.status(200).json({
      message: "Staff account updated successfully",
      staff: updatedStaff,
    });
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

// Admin only: Delete staff account
exports.deleteStaffAccount = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await User.findById(staffId);
    if (!staff || staff.roles !== "staff") {
      return res.status(404).json({ message: "Staff member not found" });
    }

    await User.findByIdAndDelete(staffId);

    return res.status(200).json({
      message: "Staff account deleted successfully",
      deletedStaff: {
        id: staff._id,
        first_name: staff.first_name,
        last_name: staff.last_name,
        email: staff.email,
      },
    });
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};

// Admin only: Reset staff password
exports.resetStaffPassword = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const staff = await User.findById(staffId);
    if (!staff || staff.roles !== "staff") {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Hash new password
    const hashedPassword = await argon2.hash(newPassword);

    staff.password = hashedPassword;
    await staff.save();

    // Send email notification
    const emailResult = await EmailService.sendPasswordResetNotification(
      staff.email,
      staff.first_name,
      newPassword
    );

    return res.status(200).json({
      message: "Staff password reset successfully",
      emailSent: emailResult.success,
    });
  } catch (error) {
    return send.sendErrorMessage(res, 500, error);
  }
};
