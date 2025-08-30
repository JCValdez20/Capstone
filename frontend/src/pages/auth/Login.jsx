import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Link,
  useNavigate,
  // useSearchParams,
  useLocation,
} from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";

import loginImage from "../../assets/login-page-image.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [searchParams] = useSearchParams();

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for verification success message (only once)
    const state = location.state;
    if (state?.verified && state?.message) {
      // Use setTimeout to ensure only one toast appears
      const timeoutId = setTimeout(() => {
        toast.success("Email Verified!", {
          description: state.message,
        });
      }, 100);

      // Clear the state immediately to prevent multiple toasts
      window.history.replaceState({}, document.title);

      return () => clearTimeout(timeoutId);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success("Welcome back!", {
          description: "Successfully logged in. Redirecting to dashboard...",
        });
        navigate("/dashboard");
      } else {
        // Check if email verification is required
        if (result.requiresVerification) {
          navigate("/verify-email", {
            state: { email: email },
          });
          return;
        }

        setError(result.message);
        toast.error("Login failed", {
          description:
            result.message || "Please check your credentials and try again.",
        });
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      toast.error("Login error", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google auth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
        <div className="w-full max-w-[360px]">
          <div className="text-2xl md:text-3xl font-black text-red-600 mb-4 text-center lg:text-left">
            BookUp MotMot
          </div>

          <Card className="border-none shadow-none">
            <CardContent className="space-y-3 py-2">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-1 mb-4">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  Welcome Back
                </h1>
                <p className="text-sm md:text-base text-gray-500">
                  Enter your email and password to access your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="h-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 block">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="h-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium text-gray-700"
                  >
                    Remember Me
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-9 bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">
                    Or Login With
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-9 gap-2"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <FcGoogle className="h-5 w-5" />
                <span>Continue with Google</span>
              </Button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Don't Have An Account?{" "}
                <Link
                  to="/register"
                  className="text-red-600 hover:text-red-500 font-medium"
                >
                  Register Now
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 relative p-2">
        <div className="relative w-full h-full overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/20 z-10 rounded-lg" />
          <img
            src={loginImage}
            alt="Login Background"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-x-0 bottom-8 flex flex-col items-start p-8 z-20">
            <h2 className="text-2xl lg:text-3xl font-bold italic text-white mb-2 drop-shadow-lg">
              Effortlessly manage bookings
            </h2>
            <p className="text-sm lg:text-base italic text-gray-200 opacity-90">
              Access your WashUp MotMot dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
