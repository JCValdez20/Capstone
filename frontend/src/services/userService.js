import axios from "./axios";

export const userService = {
  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await axios.get("/user/profile");
      return {
        success: true,
        data: response.data.data, // Extract data from wrapper
        message: response.data.message,
      };
    } catch (error) {
      console.error("getCurrentUser error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get user profile"
      );
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await axios.put("/user/profile", profileData);
      return {
        success: true,
        data: response.data.data, // Extract data from wrapper
        message: response.data.message,
      };
    } catch (error) {
      console.error("updateProfile error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  },

  // Update profile picture
  updateProfilePicture: async (profilePic) => {
    try {
      console.log("Updating profile picture, length:", profilePic.length);
      const response = await axios.put("/user/profile/picture", { profilePic });
      console.log("Raw response:", response.data);
      return {
        success: true,
        data: response.data.data, // Extract data from wrapper
        message: response.data.message,
      };
    } catch (error) {
      console.error("updateProfilePicture error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update profile picture"
      );
    }
  },

  // Convert file to base64 with compression
  fileToBase64: (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };

      img.onerror = reject;

      // Create object URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Fallback simple base64 conversion
  fileToBase64Simple: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Validate image file
  validateImageFile: (file) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error("Please select a valid image file (JPEG, PNG, or GIF)");
    }

    if (file.size > maxSize) {
      throw new Error("File size must be less than 5MB");
    }

    return true;
  },
};
