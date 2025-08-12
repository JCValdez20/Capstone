import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { userService } from "../services/userService";

const GoogleCallbackHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, updateUserData } = useAuth();
  const hasProcessed = useRef(false); // Prevent multiple executions

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) {
      console.log("🔒 GOOGLE CALLBACK - Already processed, skipping...");
      return;
    }

    const handleGoogleCallback = async () => {
      const token = searchParams.get("token");
      const userParam = searchParams.get("user");
      const error = searchParams.get("error");

      console.log("🎬 GOOGLE CALLBACK HANDLER - Starting...", {
        token: !!token,
        userParam: !!userParam,
        error,
      });

      if (error) {
        navigate(`/login?error=${encodeURIComponent(error)}`);
        return;
      }

      if (token && userParam) {
        try {
          hasProcessed.current = true; // Mark as processed FIRST
          console.log("🔐 GOOGLE CALLBACK - Marked as processed");

          const user = JSON.parse(decodeURIComponent(userParam));

          console.log("🚀 GOOGLE AUTH CALLBACK - User:", user);

          // First, do initial login to set auth state
          const loginResult = await login(token, user, true);

          if (loginResult.success && user.hasProfilePic) {
            try {
              console.log("🖼️ FETCHING PROFILE PICTURE...");
              const response = await userService.getCurrentUser();
              const userData = response.data;

              if (userData.profilePic) {
                console.log("🎯 UPDATING WITH PROFILE PIC");

                // Update user with profile picture
                const updatedUser = {
                  ...user,
                  profilePic: userData.profilePic,
                };

                updateUserData(updatedUser);
              }
            } catch (profileError) {
              console.error("❌ Profile picture fetch failed:", profileError);
              // Continue without profile picture
            }
          }

          // Remove query params from URL
          window.history.replaceState(
            {},
            document.title,
            "/auth/callback/google"
          );

          console.log("✅ GOOGLE CALLBACK - Navigating to dashboard");
          // Navigate to dashboard
          navigate("/dashboard", { replace: true });
        } catch (err) {
          console.error("❌ Google auth callback error:", err);
          navigate("/login?error=invalid_user_data");
        }
      } else {
        console.log("❌ GOOGLE CALLBACK - Missing auth data");
        navigate("/login?error=missing_auth_data");
      }
    };

    handleGoogleCallback();
  }, []); // Empty dependency array - only run once on mount

  return null; // Or <LoadingSpinner />
};

export default GoogleCallbackHandler;
