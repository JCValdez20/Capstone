import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const GoogleCallbackHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    const error = searchParams.get("error");

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));

        // Store user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isGoogleUser", "true");

        // Remove query params from URL
        window.history.replaceState(
          {},
          document.title,
          "/auth/callback/google"
        );

        // Navigate to dashboard
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("Google callback error:", err);
        navigate("/login?error=invalid_user_data");
      }
    } else {
      navigate("/login?error=missing_auth_data");
    }
  }, [searchParams, navigate]);

  return null; // Or <LoadingSpinner />
};

export default GoogleCallbackHandler;
