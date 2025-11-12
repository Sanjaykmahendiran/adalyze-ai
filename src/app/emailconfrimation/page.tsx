"use client";

import Link from "next/link";
import Image from "next/image";
import loginlogo from "@/assets/ad-logo.webp";
import Cookies from "js-cookie";

export default function EmailConfirmationPage() {
    const Email = Cookies.get("email");

    return (
        <div className="loginwrapper bg-[#121212] flex justify-center items-center min-h-screen px-4 sm:px-6">
            <div className="w-full max-w-xl sm:max-w-2xl p-8 sm:p-12 bg-[#1a1a1a] rounded-2xl shadow-md shadow-black/50 text-center">
                
                {/* Logo */}
                <div className="flex justify-center mb-6 sm:mb-8">
                    <div className="w-[120px] sm:w-[160px] h-[50px] sm:h-[60px] relative">
                        <Image
                            src={loginlogo}
                            fill
                            sizes="(max-width: 640px) 120px, 160px"
                            style={{ objectFit: "contain" }}
                            alt="Adalyze AI"
                            draggable={false}
                        />
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">
                    Confirm your e-mail address
                </h1>

                {/* Email info */}
                <p className="text-gray-300 text-sm sm:text-base">A confirmation email was sent to</p>
                <p className="text-white font-semibold text-base sm:text-lg mb-2 sm:mb-3 break-all">{Email}</p>
                <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">Not your email address?</p>

                <div className="border-t border-[#db4900] mb-4 sm:mb-6" />

                {/* Re-register */}
                <p className="text-gray-200 text-sm sm:text-base mb-2 sm:mb-4">
                    Please{" "}
                    <Link href="/register" className="text-[#db4900] hover:underline">
                        click here
                    </Link>{" "}
                    to sign up again with the correct email address.
                </p>

                {/* Spam info */}
                <p className="text-gray-200 text-sm sm:text-base mb-2 sm:mb-4">
                    Don&apos;t see the confirmation e-mail in your inbox? Please check
                    your spam folder.
                </p>

                {/* Support */}
                <p className="text-gray-300 text-sm sm:text-base">
                    Still not? Send mail to{" "}
                    <a
                        href="mailto:support@adalyze.app"
                        className="text-[#db4900] hover:underline break-all"
                    >
                        support@adalyze.app
                    </a>
                </p>
            </div>
        </div>
    );
}
