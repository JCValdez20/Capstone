import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const GoogleCallbackHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      console.log("🔒 GOOGLE CALLBACK - Already processed, skipping...");
      return;
    }

    const handleGoogleCallback = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const error = searchParams.get("error");

      console.log("🎬 GOOGLE CALLBACK HANDLER - Starting...", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        error,
      });

      if (error) {
        navigate(`/login?error=${encodeURIComponent(error)}`);
        return;
      }

      if (accessToken && refreshToken) {
        try {
          hasProcessed.current = true;
          console.log("🔐 GOOGLE CALLBACK - Marked as processed");

          // Decode token to get user info
          const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
          const user = {
            id: tokenPayload.id,
            email: tokenPayload.email,
            first_name: tokenPayload.first_name,
            last_name: tokenPayload.last_name,
            name: tokenPayload.name,
            roles: tokenPayload.roles,
            isVerified: tokenPayload.isVerified,
          };

          // Store tokens and user in localStorage via context
          login(accessToken, refreshToken, user);

          // Remove query params from URL
          window.history.replaceState(
            {},
            document.title,
            "/auth/callback/google"
          );

          console.log("✅ GOOGLE CALLBACK - User authenticated:", user);

          // Navigate based on role
          if (user.roles.includes("admin")) {
            console.log("✅ GOOGLE CALLBACK - Navigating to admin dashboard");
            navigate("/admin/dashboard", { replace: true });
          } else if (user.roles.includes("staff")) {
            console.log("✅ GOOGLE CALLBACK - Navigating to staff dashboard");
            navigate("/staff/dashboard", { replace: true });
          } else {
            console.log("✅ GOOGLE CALLBACK - Navigating to user dashboard");
            navigate("/dashboard", { replace: true });
          }
        } catch (err) {
          console.error("❌ Google auth callback error:", err);
          navigate("/login?error=auth_failed");
        }
      } else {
        console.log("❌ GOOGLE CALLBACK - Missing tokens");
        navigate("/login?error=missing_auth_data");
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, login]);

  return null;
};

export default GoogleCallbackHandler;
