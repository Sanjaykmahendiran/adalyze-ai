"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import toast from "react-hot-toast"
import loginlogo from "@/assets/ad-logo.png"
import AuthLoginForm from "@/app/login/_components/auth-login-form"
import Background from "@/assets/register-page-image.png"

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  status: string;
  user?: {
    user_id: number;
    mobileno: string;
    password: string;
    otp: string | null;
    otp_status: string;
    email: string;
    name: string;
    city: string;
    role: string;
    imgname: string | null;
    company: string;
    source: string;
    package_id: number | null;
    coupon_id: number | null;
    payment_status: number;
    created_date: string;
    modified_date: string;
    register_level_status: string | null;
    emailver_status: number;
    status: number;
  };
  message?: string;
}

const LoginPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)

    try {
      // Construct the API URL with parameters
      const apiUrl = `https://adalyzeai.xyz/App/api.php?gofor=login&email=${encodeURIComponent(data.email)}&password=${encodeURIComponent(data.password)}`

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const result: LoginResponse = await response.json()

      if (result.status === 'success' && result.user) {
        // Store user_id in cookies
        Cookies.set('userId', result.user.user_id.toString(), {
          expires: 7,
        })
        // Show success message
        toast.success('Login successful!')

        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        // Handle login failure
        toast.error(result.message || 'Login failed. Please check your credentials.')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
                    alt="Qualifit"
                    draggable={false}
                  />
                </div>
              </div>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Login to Your Account</h1>
                <p className="text-gray-300 text-sm">Your Own Digital Campaign</p>
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
        <div className="hidden xl:block w-1/2">
          <div className="hidden md:block relative w-full h-screen overflow-hidden">
            <Image
              src={Background}
              alt="Background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0" /> {/* Semi-transparent white overlay */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage