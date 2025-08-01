"use client";

import React from "react";
import Image from "next/image";
import logo from "@/assets/ad-icon-logo.png";

interface SpinnerProps {
  showLogo?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ showLogo = true }) => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
    {showLogo && (
      <div className="mb-4">
        <Image
          src={logo}
          alt="Logo"
          width={80}
          height={80}
          className="object-contain"
          draggable={false}
        />
      </div>
    )}

    <svg className="animate-spin mr-1 h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);

export default Spinner;
