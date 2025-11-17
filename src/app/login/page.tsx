"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Cookies from "js-cookie"
import toast from "react-hot-toast"
import loginlogo from "@/assets/ad-logo.webp"
import AuthLoginForm from "@/app/login/_components/auth-login-form"
import { login } from "@/services/authService"
import { trackEvent } from "@/lib/eventTracker"
import RegistrationStep2Form from "../register/_components/RegistrationStep2Form";

interface LoginFormData {
  token?: string;
  nouptoken?: string;
  email?: string;
  password?: string;
}


const LoginPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const [showStep2, setShowStep2] = useState(false);
  const [userIdStep2, setUserIdStep2] = useState("");
  const [emailStep2, setEmailStep2] = useState("");
  const [sourceFromParams, setSourceFromParams] = useState("");
  const [referralCode, setReferralCode] = useState("");


  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      let loginData;

      if (data.token) {
        loginData = await login({ google_token: data.token });
      } else if (data.nouptoken) {
        loginData = await login({ nouptoken: data.nouptoken });
      } else {
        loginData = await login(data);
      }

          Cookies.set("userId", user.user_id.toString(), { expires: 7 });
          Cookies.set("email", user.email, { expires: 7 });
          Cookies.set("authToken", loginData.token, { expires: 7 });
          Cookies.set("refreshToken", loginData.refresh_token, { expires: 30 });
          
          let eventName = "Login_completed";
          if (data.token) eventName = "google_login_completed"; 
          else if (data.nouptoken) eventName = "email_confirmation_login_completed";
      if (loginData.status === "success" && loginData.user) {
        const user = loginData.user;

        // Check if registration is incomplete (customize fields as needed)
        if ((!user.name || !user.type || !user.city) && (data.token || data.nouptoken)) {
          setShowStep2(true);
          setEmailStep2(user.email);
          setUserIdStep2(user.user_id.toString());
          setSourceFromParams(""); // pass/derive if you need more context from params or response
          setReferralCode(""); // pass from URL if needed (optionally set from searchParams)
          setLoading(false);
          return;
        }

        Cookies.set("userId", user.user_id.toString(), { expires: 7 });
        Cookies.set("email", user.email, { expires: 7 });
        let eventName = "Login_completed";
        if (data.token) eventName = "google_login_completed";
        else if (data.nouptoken) eventName = "email_confirmation_login_completed";

        trackEvent(eventName, window.location.href, user.email);
        toast.success("Login successful!");

        // ✅ Get redirect page param (if exists)
        const redirectPage = searchParams.get("page");

        if (redirectPage) {
          router.push(`/${redirectPage}`);
          return; // ✅ stop further routing logic
        }

        // ✅ Default logic (as before)
        if (user.payment_status === 0) {
          if (user.fretra_status === 1) {
            router.push("/dashboard");
          } else {
            router.push("/pricing");
          }
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error(loginData.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (searchParams) {
      const getToken = searchParams.get("token");
      if (getToken) {
        onSubmit({ nouptoken: getToken });
      }
    }
  }, []);


  return (
    <div className="min-h-screen relative">
      <div className="flex min-h-screen">
        {/* Left Side (Login Form) */}
        <div className="w-full xl:w-1/2 flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-12 ">
          <div className="flex-grow flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="w-[180px]  h-[50px] sm:h-[60px] relative overflow-hidden">
                  <Image
                    src={loginlogo || "/placeholder.svg"}
                    layout="fill"
                    objectFit="contain"
                    alt="Adalyze AI"
                    draggable={false}
                  />
                </div>
              </div>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Login to Your Account</h1>
                <p className="text-gray-300 text-sm">Turn every ad into an opportunity</p>
              </div>
              <div className="mt-8">
                {showStep2 ? (
                  <RegistrationStep2Form
                    email={emailStep2}
                    userId={userIdStep2}
                    sourceFromParams={sourceFromParams}
                    referralCode={referralCode}
                    onComplete={() => {
                      setShowStep2(false);
                      toast.success("Registration completed!");
                      setTimeout(() => router.push("/emailconfrimation"), 1500);
                    }}
                  />
                ) : (
                  <AuthLoginForm onSubmit={onSubmit} loading={loading} />
                )}
              </div>

              <div className="text-xs text-center mt-4 mb-4">
                By continuing, you agree to Adalyze AI&apos;s{" "}
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold hover:underline pr-1"
                  href="/termsandconditions"
                >
                  Terms and conditions
                </Link>
                &nbsp;and&nbsp;
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold hover:underline pl-1"
                  href="/privacypolicy"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (LoginCarousel) */}
        <div className="hidden xl:block w-1/2 bg-black">
          <div className="hidden md:block relative w-full h-screen overflow-hidden">
            <video
              src="https://adalyze.app/uploads/Login-Video.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0" />
          </div>
        </div>

      </div>
    </div>
  )
}

export default LoginPage