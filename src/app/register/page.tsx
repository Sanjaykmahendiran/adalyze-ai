"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import loginlogo from "@/assets/ad-logo.png"
import RegistrationForm from "./_components/registration-form"
import LoginCarousel from "@/components/carousel/login-carousel"
import Background from "@/assets/register-page-image.png";

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="flex flex-grow flex-col xl:flex-row">
        {/* Left Side (Register Form) */}
        <div className="w-full xl:w-1/2 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-4 xl:py-0  min-h-screen xl:min-h-0">
          <div className="w-full max-w-md xl:mt-0">
            {/* Logo - Reduced space above */}
            <div className="flex justify-center mb-2 mt-2">
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
              <h1 className="text-2xl font-bold text-white mb-2">Create Your Account</h1>
              <p className="text-gray-300 text-sm">Your Own Digital Campaign</p>
            </div>
            <div className="mt-4 sm:mt-4">
              <RegistrationForm />
            </div>

            {/* Terms and Conditions */}
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

export default RegisterPage

