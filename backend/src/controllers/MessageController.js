const User = require("../models/User");
const Messages = require("../models/Messages");
const cloudinary = require("../config/cloudinary");
const { getReceiverSocketId } = require("../utils/Socket");

exports.getUserMessaging = async (req, res) => {
  try {
    const loggedInUserId = req.userData.id;
    const userRoles = Array.isArray(req.userData.roles)
      ? req.userData.roles
      : [req.userData.roles];

    console.log(
      "🔍 getUserMessaging called by user:",
      loggedInUserId,
      "Roles:",
      userRoles
    );

    let filteredUsers;

    // If customer: show all admin and staff users
    if (userRoles.includes("customer")) {
      filteredUsers = await User.find({
        _id: { $ne: loggedInUserId },
        roles: { $in: ["admin", "staff"] },
      }).select("-password");

      console.log(
        "👤 Customer view - returning admin/staff users:",
        filteredUsers.length
      );
    }
    // If admin or staff: show only customers who have message history with them
    else if (userRoles.includes("admin") || userRoles.includes("staff")) {
      // Get all unique customer IDs who have sent messages to this user
      const sentToMe = await Messages.find({
        receiverId: loggedInUserId,
      }).distinct("senderId");

      // Get all unique customer IDs who have received messages from this user
      const sentByMe = await Messages.find({
        senderId: loggedInUserId,
      }).distinct("receiverId");

      // Combine both lists and remove duplicates
      const allUserIds = [...new Set([...sentToMe, ...sentByMe])];

      console.log("💬 Admin/Staff view - message partners:", allUserIds.length);

      // Fetch user details - show all users (customers, staff, and admin)
      filteredUsers = await User.find({
        _id: { $in: allUserIds },
      }).select("-password");

      console.log(
        "👥 Admin/Staff view - all conversation partners:",
        filteredUsers.length
      );
    } else {
      filteredUsers = [];
    }

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUserForMessaging:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.userData.id;

    const messages = await Messages.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.userData.id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Messages({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // --- REALTIME FIX ---
    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);

    // Notify receiver
    if (receiverSocketId && global.io) {
      global.io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Notify sender
    if (senderSocketId && global.io) {
      global.io.to(senderSocketId).emit("newMessage", newMessage);
    }
    // ---------------------

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
