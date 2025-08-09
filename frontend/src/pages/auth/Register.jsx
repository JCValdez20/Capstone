import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: "customer", // Default to customer
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.last_name.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Remove confirmPassword from the data sent to backend
      const { confirmPassword, ...registrationData } = formData;
      
      const result = await register(registrationData);
      if (result.success) {
        toast.success("Registration successful!", {
          description: "Your account has been created. Please log in to continue.",
        });
        navigate("/login", { 
          state: { message: "Registration successful! Please log in." }
        });
      } else {
        setError(result.message);
        toast.error("Registration failed", {
          description: result.message || "Please check your information and try again.",
        });
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      toast.error("Registration error", {
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
        <div className="w-full max-w-[400px]">
          <div className="text-2xl md:text-3xl font-black text-red-600 mb-3 text-center lg:text-left">
            BookUp MotMot
          </div>

          <Card className="border-none shadow-none">
            <CardContent className="space-y-2 py-2">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-1 mb-3">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  Create Account
                </h1>
                <p className="text-sm md:text-base text-gray-500">
                  Join BookUp MotMot to start managing your motorcycle wash bookings.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 block">
                      First Name *
                    </label>
                    <Input
                      type="text"
                      name="first_name"
                      placeholder="Enter first name"
                      className="h-8"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 block">
                      Last Name *
                    </label>
                    <Input
                      type="text"
                      name="last_name"
                      placeholder="Enter last name"
                      className="h-8"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 block">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="h-8"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 block">
                    Password *
                  </label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Create a password (min. 8 characters)"
                    className="h-8"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 block">
                    Confirm Password *
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    className="h-8"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="pt-1">
                  <Button
                    type="submit"
                    className="w-full h-9 bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </form>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">
                    Or Register With
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

              <p className="text-center text-sm text-gray-500 mt-3">
                Already Have An Account?{" "}
                <Link
                  to="/login"
                  className="text-red-600 hover:text-red-500 font-medium"
                >
                  Log In
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
            src="/src/assets/login-page-image.jpg"
            alt="Register Background"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-x-0 bottom-8 flex flex-col items-start p-8 z-20">
            <h2 className="text-2xl lg:text-3xl font-bold italic text-white mb-2 drop-shadow-lg">
              Join our community
            </h2>
            <p className="text-sm lg:text-base italic text-gray-200 opacity-90">
              Start your journey with WashUp MotMot today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
