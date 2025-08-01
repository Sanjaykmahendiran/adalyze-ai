"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/app/login/_components/GoogleSign-In";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const {
    register: resetRegister,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordFormData>();

  const togglePasswordType = () => {
    setPasswordType((prevType) => (prevType === "password" ? "text" : "password"));
  };

  // Handle the actual form submission
  const handleFormSubmit = async (data: LoginFormData) => {
    await onSubmit(data);
  };

  return (
    <div className="w-full max-w-md mx-auto">

      {showResetPassword ? (
        <>
          <h2 className="text-lg font-bold text-center mb-4 text-white">Reset your password</h2>

          {step === "initial" && (
            <>
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Enter email</label>
                <div className="relative flex items-center border border-gray-600 rounded-md shadow-sm bg-[#1a1a1a]">
                  <input
                    type="email"
                    className="w-full bg-transparent px-3 py-2 text-sm focus:outline-none rounded-md text-white placeholder-gray-400"
                    {...resetRegister("email", {
                      required: "Please enter your email",
                    })}
                  />
                  <span className="mr-4 text-gray-400">|</span>
                  <button
                    type="button"
                    className="text-sm mr-4 font-medium text-orange-500 hover:text-orange-400"
                  >
                    Send code
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
                  className="w-full px-3 bg-[#1a1a1a] py-2 text-sm border border-gray-600 rounded-md text-white placeholder-gray-400"
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

              <Button className="w-full text-white mt-6 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700">
                Verify OTP
              </Button>

              <p className="text-sm mt-4 flex justify-center text-gray-300">
                Already have an account?
                <span
                  className="hover:underline pl-1 text-orange-500 cursor-pointer"
                  onClick={() => setShowResetPassword(false)}
                >
                  Login
                </span>
              </p>
            </>
          )}

          {step === "resetPassword" && (
            <>
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Email</label>
                <input
                  type="email"
                  className="w-full px-3 bg-[#1a1a1a] py-2 text-sm border border-gray-600 rounded-md text-white placeholder-gray-400"
                  {...resetRegister("email", {
                    required: "Please enter your email",
                  })}
                />
                {resetErrors.email && (
                  <p className="text-xs text-red-400">{resetErrors.email.message}</p>
                )}
              </div>

              {/* New Password Field */}
              <div className="space-y-2 mt-2">
                <label className="text-sm font-medium text-gray-200">New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-[#1a1a1a] text-sm border border-gray-600 rounded-md text-white placeholder-gray-400"
                  {...resetRegister("newPassword", {
                    required: "Please enter your new password",
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
                  className="w-full px-3 py-2 bg-[#1a1a1a] text-sm border border-gray-600 rounded-md text-white placeholder-gray-400"
                  {...resetRegister("confirmPassword", {
                    required: "Please confirm your password",
                  })}
                />
                {resetErrors.confirmPassword && (
                  <p className="text-xs text-red-400">{resetErrors.confirmPassword.message}</p>
                )}
              </div>

              <Button className="w-full text-white mt-6 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700">
                Submit
              </Button>

              <p className="text-sm mt-4 flex justify-center text-gray-300">
                Already have an account?
                <span
                  className="hover:underline pl-1 text-orange-500 cursor-pointer"
                  onClick={() => setShowResetPassword(false)}
                >
                  Login
                </span>
              </p>
            </>
          )}

          {step === "success" && (
            <div className="text-center">
              <p className="text-green-400 font-medium">Password changed successfully!</p>
              <p className="mt-2 text-gray-300">Redirecting to login...</p>
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
                className="w-full px-4 py-3 bg-[#1a1a1a] text-white text-sm rounded-md placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
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
                  className="w-full px-4 py-3 text-sm bg-[#1a1a1a] text-white rounded-md placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
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
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-300" />
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
                className="text-sm text-gray-400 hover:text-gray-300 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-white "
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Please wait" : "Login to Your Account"}
            </Button>

            <GoogleSignInButton />

            <div className="text-center">
              <Link
                href="/register"
                className="text-sm text-gray-400 flex justify-center"
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