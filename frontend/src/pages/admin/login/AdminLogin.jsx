import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import adminService from "@/services/adminService";
import { toast } from "sonner";
import { Shield, Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check if admin/staff is already logged in and redirect
  useEffect(() => {
    const checkAuthStatus = () => {
      if (adminService.isAuthenticated()) {
        const currentUser = adminService.getCurrentAdmin();
        const redirectPath =
          currentUser?.roles === "admin"
            ? "/admin/dashboard"
            : "/staff/dashboard";
        toast.info("Already logged in", {
          description: "Redirecting to dashboard...",
        });
        navigate(redirectPath, { replace: true });
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await adminService.login(
        formData.email,
        formData.password
      );

      // Check if the logged in user is admin or staff
      const userRole = response.user.role || response.user.roles;
      if (userRole !== "admin" && userRole !== "staff") {
        setError("Access denied. Admin or Staff privileges required.");
        adminService.logout(); // Clean up any stored data
        toast.error("Access denied", {
          description:
            "Admin or Staff privileges required to access this area.",
        });
        return;
      }

      const isAdmin = userRole === "admin";
      toast.success(`${isAdmin ? "Admin" : "Staff"} login successful`, {
        description: `Welcome to the ${isAdmin ? "admin" : "staff"} dashboard!`,
      });

      // Redirect based on role
      const redirectPath = isAdmin ? "/admin/dashboard" : "/staff/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
      toast.error("Login failed", {
        description:
          error.message || "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email && formData.password;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Management Portal
          </h1>
          <p className="text-gray-600">BookUp MotMot Administration</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-8">
            <div className="text-center">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Sign in to access your dashboard
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-200 bg-red-50"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@washup.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="pl-10 h-12 border-gray-200 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-red-500 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-blue-800 font-medium">
                      Security Notice
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      This is a restricted area. All activities are monitored.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-6">
              <Button
                type="submit"
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Sign in as Admin
                  </div>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Need help? Contact your system administrator
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
            <span>Secure Connection</span>
            <span>•</span>
            <span>Protected Access</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
