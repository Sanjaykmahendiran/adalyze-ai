"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/app/login/_components/GoogleSign-In";
import toast from "react-hot-toast";

interface LoginFormData {
  email: string;
  password: string;
}

interface ResetPasswordFormData {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

interface AuthLoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  loading: boolean;
}

const AuthLoginForm = ({ onSubmit, loading }: AuthLoginFormProps) => {
  const router = useRouter();
  const [passwordType, setPasswordType] = useState("password");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [step, setStep] = useState<"initial" | "resetPassword" | "success">("initial");
  const [resetLoading, setResetLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const {
    register: resetRegister,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    watch: watchReset,
    getValues: getResetValues,
  } = useForm<ResetPasswordFormData>();

  const togglePasswordType = () => {
    setPasswordType((prevType) => (prevType === "password" ? "text" : "password"));
  };

  // Handle the actual form submission
  const handleFormSubmit = async (data: LoginFormData) => {
    await onSubmit(data);
  };

  // Send OTP for password reset
  const handleSendCode = async () => {
    const email = getResetValues("email");
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }

    setResetLoading(true);
    try {
      const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=forgot_otp&email=${encodeURIComponent(email)}`);
      const result = await response.json();

      if (result.status === 'success') {
        toast.success("Verification code sent to your email!");
        setCodeSent(true);
      } else {
        toast.error(result.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error('Send code error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const email = getResetValues("email");
    const otp = getResetValues("verificationCode");

    if (!email || !otp) {
      toast.error("Please fill in all required fields");
      return;
    }

    setResetLoading(true);
    try {
      const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=forgot_verify_otp&email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
      const result = await response.json();

      if (result.status === 'success') {
        toast.success("OTP verified successfully!");
        setVerifiedEmail(email);
        setStep("resetPassword");
      } else {
        toast.error(result.message || "Invalid verification code");
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  // Update password
  const handleUpdatePassword = async (data: ResetPasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setResetLoading(true);
    try {
      const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=updatepassword&email=${encodeURIComponent(verifiedEmail)}&password=${encodeURIComponent(data.newPassword)}&confirmpassword=${encodeURIComponent(data.confirmPassword)}`);
      const result = await response.json();

      if (result.status === 'success') {
        toast.success("Password updated successfully!");
        setStep("success");
        // Redirect to login after 2 seconds
        setTimeout(() => {
          setShowResetPassword(false);
          setStep("initial");
          setCodeSent(false);
          setVerifiedEmail("");
        }, 2000);
      } else {
        toast.error(result.message || "Failed to update password");
      }
    } catch (error) {
      console.error('Update password error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto ">
      {showResetPassword ? (
        <>
          <h2 className="text-lg font-bold text-center mb-4 text-white">Reset your password</h2>

          {step === "initial" && (
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Enter email</label>
                <div className="relative flex items-center  rounded-md shadow-sm bg-black">
                  <input
                    type="email"
                    className="w-full  px-3 py-2 text-sm focus:outline-none rounded-md text-white placeholder-white/50"
                    {...resetRegister("email", {
                      required: "Please enter your email",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                  />
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={resetLoading}
                    className="text-sm px-2 font-medium text-orange-500 hover:text-orange-400 whitespace-nowrap disabled:opacity-50"
                  >
                    {resetLoading ? "Sending..." : codeSent ? "Resend" : "Send code"}
                  </button>
                </div>
                {resetErrors.email && (
                  <p className="text-xs text-red-400">{resetErrors.email.message}</p>
                )}
              </div>

              {/* Verification Code Field */}
              <div className="space-y-2 mt-3">
                <label className="text-sm font-medium text-gray-200">Verification code</label>
                <input
                  type="text"
                  className="w-full px-3 bg-black py-2 text-sm  rounded-md text-white placeholder-white/50"
                  {...resetRegister("verificationCode", {
                    required: "Verification code is required",
                  })}
                  placeholder="Enter code"
                />
                {resetErrors.verificationCode && (
                  <p className="text-xs text-red-400 mt-1">
                    {resetErrors.verificationCode.message}
                  </p>
                )}
              </div>

              <Button
                type="button"
                onClick={handleVerifyOTP}
                disabled={resetLoading}
                className="w-full text-white mt-6"
              >
                {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {resetLoading ? "Verifying..." : "Verify OTP"}
              </Button>

              <p className="text-sm mt-4 flex justify-center text-gray-300">
                Already have an account?
                <span
                  className="hover:underline pl-1 text-orange-500 cursor-pointer"
                  onClick={() => {
                    setShowResetPassword(false);
                    setStep("initial");
                    setCodeSent(false);
                    setVerifiedEmail("");
                  }}
                >
                  Login
                </span>
              </p>
            </form>
          )}

          {step === "resetPassword" && (
            <form onSubmit={handleResetSubmit(handleUpdatePassword)}>
              {/* Email Field (Read-only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Email</label>
                <input
                  type="email"
                  value={verifiedEmail}
                  readOnly
                  className="w-full px-3 bg-black py-2 text-sm  rounded-md text-gray-300 cursor-not-allowed"
                />
              </div>

              {/* New Password Field */}
              <div className="space-y-2 mt-2">
                <label className="text-sm font-medium text-gray-200">New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-black text-sm  rounded-md text-white placeholder-white/50"
                  {...resetRegister("newPassword", {
                    required: "Please enter your new password",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                />
                {resetErrors.newPassword && (
                  <p className="text-xs text-red-400">{resetErrors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2 mt-2">
                <label className="text-sm font-medium text-gray-200">Confirm Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-black text-sm  rounded-md text-white placeholder-white/50"
                  {...resetRegister("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => {
                      const newPassword = watchReset("newPassword");
                      return value === newPassword || "Passwords do not match";
                    }
                  })}
                />
                {resetErrors.confirmPassword && (
                  <p className="text-xs text-red-400">{resetErrors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={resetLoading}
                className="w-full text-white mt-6 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700"
              >
                {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {resetLoading ? "Updating..." : "Update Password"}
              </Button>

              <p className="text-sm mt-4 flex justify-center text-gray-300">
                Already have an account?
                <span
                  className="hover:underline pl-1 text-orange-500 cursor-pointer"
                  onClick={() => {
                    setShowResetPassword(false);
                    setStep("initial");
                    setCodeSent(false);
                    setVerifiedEmail("");
                  }}
                >
                  Login
                </span>
              </p>
            </form>
          )}

          {step === "success" && (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <p className="text-green-400 font-medium text-lg mb-2">Password Reset Successful!</p>
              <p className="text-gray-300">Your password has been updated successfully.</p>
              <p className="mt-2 text-gray-400 text-sm">Redirecting to login...</p>
            </div>
          )}
        </>
      ) : (
        <>
          <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
            {/* Email Field */}
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 bg-black text-white text-sm rounded-md placeholder-white/50 focus:outline-none focus:border-orange-500 transition-colors"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={passwordType}
                  placeholder="Password"
                  className="w-full px-4 py-3 text-sm bg-black text-white rounded-md placeholder-white/50 focus:outline-none focus:border-orange-500 transition-colors"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                />
                <div
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                  onClick={togglePasswordType}
                >
                  {passwordType === "password" ? (
                    <Eye className="h-4 w-4 text-gray-300 hover:text-gray-300" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-300 hover:text-gray-300" />
                  )}
                </div>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-sm text-white/70 hover:text-gray-300 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-white cursor-pointer"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Please wait" : "Login to Your Account"}
            </Button>

            <GoogleSignInButton onSubmit={(userData: any) => onSubmit(userData)} />

            <div className="text-center">
              <Link
                href="/register"
                className="text-sm text-gray-300 flex justify-center"
              >
                <span className="pr-1">Don't have an account?</span>
                <span className="hover:underline pl-1 text-primary">Register Now</span>
              </Link>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default AuthLoginForm;