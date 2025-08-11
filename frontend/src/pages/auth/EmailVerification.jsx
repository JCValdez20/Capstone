import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Clock, RefreshCcw } from "lucide-react";
import axios from "@/services/axios";

const EmailVerification = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [developmentMode, setDevelopmentMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const justRegistered = location.state?.justRegistered || false;

  // Check if we're in development mode based on registration response
  useEffect(() => {
    if (justRegistered && location.state?.developmentMode) {
      setDevelopmentMode(true);
    }
  }, [justRegistered, location.state]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP submission
  const handleSubmit = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    // Prevent multiple simultaneous requests
    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("/user/verify-email", {
        email,
        otp,
      });

      if (response.data.verified) {
        toast.success("Email verified successfully!", {
          description: "You can now log in to your account.",
        });
        navigate("/login", {
          state: {
            verified: true,
            message: "Email verified successfully! You can now log in.",
          },
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Verification failed";
      setError(errorMessage);
      toast.error("Verification failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    // Prevent multiple simultaneous requests
    if (isResending) return;

    setIsResending(true);
    setError("");

    try {
      const response = await axios.post("/user/resend-verification", { email });

      toast.success("Verification code sent!", {
        description: response.data.developmentMode
          ? "Check the backend console for your verification code."
          : "Please check your email for the new code.",
      });

      // Update development mode state
      if (response.data.developmentMode) {
        setDevelopmentMode(true);
      }

      // Reset timer
      setTimeLeft(600);
      setCanResend(false);
      setOtp(""); // Clear current OTP
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to resend code";
      setError(errorMessage);
      toast.error("Resend failed", {
        description: errorMessage,
      });
    } finally {
      setIsResending(false);
    }
  };

  // Remove auto-submit to prevent multiple verification attempts

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invalid Access</CardTitle>
            <CardDescription>
              Please register or login first to access email verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate("/register")}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Go to Register
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-red-600" />
          </div>

          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verify Your Email
            </CardTitle>
            <CardDescription className="mt-2">
              We've sent a 6-digit verification code to:
              <br />
              <span className="font-medium text-gray-700">{email}</span>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {developmentMode && (
            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Development Mode</span>
              </div>
              Check your backend console for the 6-digit verification code.
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="text-center">
              <label className="text-sm font-medium text-gray-700 block mb-3">
                Enter Verification Code
              </label>

              <div className="flex justify-center items-center w-full">
                <InputOTP
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    setError(""); // Clear error when user types
                  }}
                  maxLength={6}
                  className="flex justify-center items-center gap-4"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                  </InputOTPGroup>
                  <div className="text-2xl font-bold text-gray-400 px-2">-</div>
                  <InputOTPGroup>
                    <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || otp.length !== 6}
                className={`w-full ${
                  otp.length === 6
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-400 cursor-not-allowed"
                } transition-colors duration-200`}
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>
              {otp.length < 6 && (
                <p className="text-xs text-gray-500 mt-2">
                  Enter all 6 digits to verify
                </p>
              )}
            </div>
          </div>

          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {timeLeft > 0 ? (
                <span>Code expires in {formatTime(timeLeft)}</span>
              ) : (
                <span className="text-red-600">Code expired</span>
              )}
            </div>

            <div className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              <Button
                variant="link"
                onClick={handleResend}
                disabled={!canResend || isResending}
                className="p-0 h-auto font-medium text-red-600 hover:text-red-700"
              >
                {isResending ? (
                  <>
                    <RefreshCcw className="w-3 h-3 mr-1 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend code"
                )}
              </Button>
            </div>
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="text-sm"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
