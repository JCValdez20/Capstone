import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const GoogleCallbackHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      console.log("🔒 GOOGLE CALLBACK - Already processed, skipping...");
      return;
    }

    const handleGoogleCallback = async () => {
      const success = searchParams.get("success");
      const error = searchParams.get("error");

      console.log("🎬 GOOGLE CALLBACK HANDLER - Starting...", {
        success,
        error,
      });

      if (error) {
        navigate(`/login?error=${encodeURIComponent(error)}`);
        return;
      }

      if (success === "true") {
        try {
          hasProcessed.current = true;
          console.log("🔐 GOOGLE CALLBACK - Marked as processed");

          // Check auth to get user data from cookies
          const user = await checkAuth();

          if (user) {
            // Remove query params from URL
            window.history.replaceState(
              {},
              document.title,
              "/auth/callback/google"
            );

            console.log("✅ GOOGLE CALLBACK - User authenticated:", user);
            console.log("✅ GOOGLE CALLBACK - Navigating to dashboard");
            navigate("/dashboard", { replace: true });
          } else {
            console.error("❌ Google auth callback - No user found");
            navigate("/login?error=auth_failed");
          }
        } catch (err) {
          console.error("❌ Google auth callback error:", err);
          navigate("/login?error=auth_failed");
        }
      } else {
        console.log("❌ GOOGLE CALLBACK - Missing success parameter");
        navigate("/login?error=missing_auth_data");
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, checkAuth]);

  return null;
};

export default GoogleCallbackHandler;
