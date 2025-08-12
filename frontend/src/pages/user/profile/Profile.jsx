import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import {
  Camera,
  User,
  Mail,
  Edit3,
  Save,
  X,
  Shield,
  Upload,
  CheckCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const { user, updateUserData } = useAuth();
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    profilePic: "",
    roles: "",
    isGoogleUser: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const hasLoadedProfile = useRef(false); // Track if we've loaded profile

  // Load user data on component mount
  useEffect(() => {
    // Only load once, and only if we have a user and haven't loaded yet
    if (!user || hasLoadedProfile.current) {
      return;
    }

    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        hasLoadedProfile.current = true; // Mark as loaded

        console.log("📋 LOADING PROFILE DATA...");

        // First, initialize with data from context if available
        setProfileData({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          profilePic: user.profilePic || "",
          roles: user.role || user.roles || "",
          isGoogleUser: user.isGoogleUser || false,
        });
        setImagePreview(user.profilePic || "");

        // ONLY fetch from API if we don't have essential data
        if (!user.first_name || !user.last_name || !user.email) {
          console.log("📋 FETCHING MISSING PROFILE DATA FROM API...");
          const response = await userService.getCurrentUser();
          if (response.success) {
            console.log("📋 PROFILE DATA LOADED FROM API");
            setProfileData(response.data);
            setImagePreview(response.data.profilePic || "");
          }
        } else {
          console.log("📋 USING PROFILE DATA FROM CONTEXT (SKIP API CALL)");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data");

        // Fallback to user context data if API fails
        setProfileData({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          profilePic: user.profilePic || "",
          roles: user.role || user.roles || "",
          isGoogleUser: user.isGoogleUser || false,
        });
        setImagePreview(user.profilePic || "");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user?.email]); // Only depend on email which doesn't change frequently

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validate the file
      userService.validateImageFile(file);

      setIsLoading(true);

      // Convert to base64 with compression
      const base64Image = await userService.fileToBase64(file, 400, 0.8);

      // Update profile picture
      const response = await userService.updateProfilePicture(base64Image);

      if (response.success) {
        console.log("✅ PROFILE PIC UPDATE SUCCESS:", response.data);
        
        const updatedUserData = response.data;

        // Update local state
        setImagePreview(updatedUserData.profilePic || "");
        setProfileData((prev) => ({
          ...prev,
          profilePic: updatedUserData.profilePic || "",
        }));

        // Create COMPLETELY NEW user object for context
        const newUser = {
          ...user, // Start with existing user data
          profilePic: updatedUserData.profilePic,
          // Keep all other fields exactly as they are
          first_name: updatedUserData.first_name || user.first_name,
          last_name: updatedUserData.last_name || user.last_name,
          name: updatedUserData.name || user.name,
          email: updatedUserData.email || user.email,
          role: updatedUserData.role || user.role,
          roles: updatedUserData.roles || user.roles,
        };

        console.log("🎯 CALLING updateUserData for profilePic with:", newUser);

        // Update context immediately
        updateUserData(newUser);

        toast.success("Profile picture updated successfully!");
      } else {
        throw new Error(response.message || "Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to update profile picture");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const updateData = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
      };

      console.log("🚀 SENDING UPDATE:", updateData);

      const response = await userService.updateProfile(updateData);

      if (response.success) {
        console.log("✅ UPDATE SUCCESS:", response.data);
        
        const updatedUserData = response.data;
        
        // Update local profile state
        setProfileData(updatedUserData);
        
        // Create COMPLETELY NEW user object for context
        const newUser = {
          ...user, // Start with existing user data
          first_name: updatedUserData.first_name,
          last_name: updatedUserData.last_name,
          name: `${updatedUserData.first_name} ${updatedUserData.last_name}`,
          // Keep all other fields
          email: updatedUserData.email || user.email,
          profilePic: updatedUserData.profilePic || user.profilePic,
          role: updatedUserData.role || updatedUserData.roles || user.role,
          roles: updatedUserData.roles || updatedUserData.role || user.roles,
        };
        
        console.log("🎯 CALLING updateUserData with:", newUser);
        
        // Update context - this should trigger Sidebar re-render
        updateUserData(newUser);
        
        setIsEditing(false);
        toast.success("Profile updated successfully!");
        
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to original data
    setProfileData((prev) => ({
      ...prev,
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
    }));
    setIsEditing(false);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  if (isLoading && !profileData.email) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="h-6 w-6 text-primary/60" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-900">
              Loading profile...
            </p>
            <p className="text-sm text-gray-500">
              Please wait while we fetch your information
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <User className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Profile Settings
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Manage your personal information and account preferences
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Picture Card */}
          <Card className="lg:col-span-1 overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Camera className="h-5 w-5 text-blue-600" />
                </div>
                Profile Picture
              </CardTitle>
              <CardDescription className="text-sm">
                Upload and manage your profile image
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center space-y-6">
              <div className="relative inline-block group">
                <div className="relative">
                  <Avatar className="h-40 w-40 mx-auto ring-4 ring-white shadow-2xl transition-all duration-300 group-hover:ring-primary/20">
                    <AvatarImage
                      src={imagePreview}
                      alt={`${profileData.first_name} ${profileData.last_name}`}
                      className="object-cover transition-all duration-300 group-hover:scale-105"
                    />
                    <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(
                        profileData.first_name,
                        profileData.last_name
                      )}
                    </AvatarFallback>
                  </Avatar>

                  {/* Upload Overlay */}
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Upload className="h-6 w-6 mx-auto mb-1" />
                      <p className="text-xs font-medium">Change Photo</p>
                    </div>
                  </div>
                </div>

                {/* Camera Button */}
                <Button
                  size="lg"
                  className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 border-4 border-white transition-all duration-300 hover:scale-110"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Click the camera icon or hover over your photo to upload a
                    new image
                  </p>

                  <div className="text-xs text-gray-400 space-y-1">
                    <p>• Supported formats: JPG, PNG, GIF</p>
                    <p>• Maximum size: 5MB</p>
                    <p>• Recommended: 400x400px</p>
                  </div>
                </div>

                {/* Account Badges */}
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Account Type
                    </span>
                    <Badge
                      variant={
                        profileData.isGoogleUser ? "default" : "secondary"
                      }
                      className="px-3 py-1"
                    >
                      {profileData.isGoogleUser ? (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          Google
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Local
                        </div>
                      )}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Role
                    </span>
                    <Badge
                      variant="outline"
                      className="px-3 py-1 capitalize font-medium"
                    >
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {profileData.roles}
                      </div>
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Form */}
          <Card className="lg:col-span-2 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center justify-center gap-3 lg:justify-start">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Edit3 className="h-5 w-5 text-green-600" />
                </div>
                Personal Information
              </CardTitle>
              <CardDescription className="text-center lg:text-left">
                Update your personal details and account preferences
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* First Name */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="first_name"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                    >
                      <User className="h-4 w-4 text-blue-500" />
                      First Name
                    </Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={profileData.first_name || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing || isLoading}
                      className="h-12 transition-all duration-200 border-2 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter your first name"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="last_name"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                    >
                      <User className="h-4 w-4 text-blue-500" />
                      Last Name
                    </Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={profileData.last_name || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing || isLoading}
                      className="h-12 transition-all duration-200 border-2 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                  >
                    <Mail className="h-4 w-4 text-purple-500" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email || ""}
                      onChange={handleInputChange}
                      disabled={
                        !isEditing || isLoading || profileData.isGoogleUser
                      }
                      className="h-12 transition-all duration-200 border-2 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter your email address"
                    />
                    {profileData.isGoogleUser && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Shield className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {profileData.isGoogleUser && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <p className="text-sm text-red-700 font-medium">
                        Email cannot be changed for Google accounts
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t-2 border-gray-100">
                  {!isEditing ? (
                    <Button
                      type="button"
                      size="lg"
                      onClick={() => setIsEditing(true)}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Edit3 className="h-5 w-5 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        size="lg"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                        className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
