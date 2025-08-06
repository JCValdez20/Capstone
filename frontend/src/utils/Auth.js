export const handleGoogleAuthCallback = async (searchParams, authContext) => {
  const token = searchParams.get("token");
  const userParam = searchParams.get("user");
  const error = searchParams.get("error");

  if (error) {
    return {
      success: false,
      message:
        error === "authentication_failed"
          ? "Google authentication failed"
          : "Login error occurred",
    };
  }

  if (token && userParam) {
    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      await authContext.login(token, user, true);
      return { success: true };
    } catch (err) {
      console.error("Error handling Google auth:", err);
      return { success: false, message: "Failed to process login" };
    }
  }

  return { success: false, message: "No authentication data found" };
};
