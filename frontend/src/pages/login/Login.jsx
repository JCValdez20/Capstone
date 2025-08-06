import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
        <div className="w-full max-w-[360px]">
          <div className="text-2xl md:text-3xl font-black text-red-600 mb-8">
            BookUp MotMot
          </div>

          <Card className="border-none shadow-none">
            <CardContent className="space-y-4 py-4">
              <div className="space-y-2 mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  Welcome Back
                </h1>
                <p className="text-sm md:text-base text-gray-500">
                  Enter your email and password to access your account.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="h-10"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium text-gray-700"
                  >
                    Remember Me
                  </label>
                </div>
              </div>

              <Button className="w-full h-10 bg-red-600 hover:bg-red-700">
                Log In
              </Button>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">
                    Or Login With
                  </span>
                </div>
              </div>

              <Button variant="outline" className="w-full h-10 gap-2">
                <FcGoogle className="h-5 w-5" />
                <span>Continue with Google</span>
              </Button>

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

      <div className="hidden lg:flex lg:flex-1 relative p-2">
        <div className="relative w-full h-full overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/20 z-10 rounded-lg" />
          <img
            src="/src/assets/login-page-image.jpg"
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
  