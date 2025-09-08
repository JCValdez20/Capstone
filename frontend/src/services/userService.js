import axios from "./axios";

// Update user profile (first_name, last_name only)
export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put("/user/profile", profileData);
    return {
      success: true,
      data: response.data,
      message: response.data.message || "Profile updated successfully",
    };
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update profile",
      error: error.response?.data || error.message,
    };
  }
};

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await axios.get("/user/profile");
    return {
      success: true,
      data: response.data,
      user: response.data.data,
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to get user profile",
      error: error.response?.data || error.message,
    };
  }
};
