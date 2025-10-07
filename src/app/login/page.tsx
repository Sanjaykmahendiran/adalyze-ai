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

      if (loginData.status === "success" && loginData.user) {
        const user = loginData.user;
        Cookies.set("userId", user.user_id.toString(), { expires: 7 });

        toast.success("Login successful!");

        if (user.payment_status === 0) {
          if (user.fretra_status === 1) {
            router.push("/dashboard"); // Allowed even if unpaid
          } else {
            router.push("/pricing"); // Unpaid and fretra_status not 1
          }
        } else {
          router.push("/dashboard"); // Paid users
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
  }, [searchParams]);


  return (
    <div className="min-h-screen relative">
      <div className="flex min-h-screen">
        {/* Left Side (Login Form) */}
        <div className="w-full xl:w-1/2 flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-12 ">
          <div className="flex-grow flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="w-[120px] sm:w-[150px] h-[50px] sm:h-[60px] relative overflow-hidden">
                  <Image
                    src={loginlogo || "/placeholder.svg"}
                    layout="fill"
                    objectFit="contain"
                    alt="Adalyze"
                    draggable={false}
                  />
                </div>
              </div>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Login to Your Account</h1>
                <p className="text-gray-300 text-sm">Change Your Own Digital Campaign to Turn every ad into an opportunity</p>
              </div>
              <div className="mt-8">
                {/* Auth form with API integration */}
                <AuthLoginForm onSubmit={onSubmit} loading={loading} />
              </div>

              <div className="text-xs text-center mt-4 mb-4">
                By continuing, you agree to Adalyze&apos;s{" "}
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