import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";


const Login = () => {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left Section - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo Section */}

          <div className="text-3xl font-black text-red-600 mb-6 italic">
            BookUp MotMot
          </div>

          {/* Welcome Text */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-gray-500">
              Enter your email and password to access your account.
            </p>
          </div>

          {/* Login Form */}
          <Card className="border-none shadow-none">
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="border-gray-200"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-500">
                    Remember Me
                  </Label>
                </div>
              </div>

              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                Log In
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or Login With
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" className="w-full max-w-sm">
                  <FaGoogle className="mr-2 h-5 w-5" />
                  Continue with Google
                </Button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-6">
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

      {/* Right Section - Image */}
      <div className="hidden lg:flex lg:flex-1 relative p-4">
        <div className="relative w-full h-full overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/20 z-10 rounded-lg" />
          <img
            src="/src/assets/login-page-image.jpg"
            alt="Login Background"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-x-0 bottom-8 flex flex-col items-start p-12 z-20">
            <h2 className="text-4xl font-bold italic text-white mb-2 drop-shadow-lg">
              Effortlessly manage your bookings and appointments
            </h2>
            <p className="text-lg italic text-gray-200 opacity-90">
              Log in to access your WashUp MotMot dashboard and manage your
              services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
