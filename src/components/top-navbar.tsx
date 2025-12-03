"use client";

import Link from "next/link";
import Image from "next/image";
import {X, Copy, Check, FileImage, Infinity } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useLogout from "@/hooks/useLogout";
import { Button } from "@/components/ui/button";
import logo from "@/assets/ad-logo.webp";
import UpgradePopup from "@/components/UpgradePopup";

interface TopNavbarProps {
  userDetails: any;
}

export const TopNavbar = ({ userDetails }: TopNavbarProps) => {
  const router = useRouter();
  const logout = useLogout();
  const [referralOpen, setReferralOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);

  const referralLink = `https://adalyze.app/register?referral_code=${userDetails?.referral_code || ""}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleLogoutClick = () => {
    // Check if user should see upgrade popup
    if (userDetails?.fretra_status === 1 || Number(userDetails?.ads_limit) === 0) {
      setShowUpgradePopup(true);
    } else {
      logout();
    }
  };

  return (
    <>
      <div className="w-full px-0 sm:px-6">
        <div className="flex items-center justify-between w-full py-3">

          {/* Logo - only visible on mobile */}
          <div className="flex items-center h-10 md:hidden">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src={logo}
                alt="Adalyze AI Logo"
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Right section - visible on both mobile & desktop */}
          <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
            {/* Ads Credits */}
            <div
              onClick={() => {
                if (Number(userDetails?.ads_limit) === 0) {
                  router.push("/pro")
                }
              }}
              className={`border border-[#db4900] px-2 py-1 flex items-center gap-1 rounded-full transition-all duration-300 group max-w-[160px] sm:max-w-none 
                       ${Number(userDetails?.ads_limit) === 0 ? "hover:bg-[#db4900]/10 cursor-pointer" : ""}
                        `}
            >
              <FileImage className="w-4 h-4 text-[#db4900] group-hover:text-[#ff5722] transition-colors" />
              <span className="truncate whitespace-nowrap text-xs sm:text-sm text-[#db4900] font-medium group-hover:text-[#ff5722] flex items-center gap-1">
                {Number(userDetails?.ads_limit) === 0 ? (
                  <span className="text-white font-semibold">Add Credits</span>
                ) : (
                  <>
                    <span>Ads Credits:</span>
                    <span className="text-white font-semibold flex items-center gap-1">
                      {userDetails?.ads_limit === "unlimited" ? (
                        <>
                          {/* Mobile - Infinity Icon */}
                          <Infinity className="w-4 h-4 sm:hidden" />
                          {/* Desktop - Text */}
                          <span className="hidden sm:inline">Unlimited</span>
                        </>
                      ) : (
                        userDetails?.fretra_status === 1
                          ? "01"
                          : String(userDetails?.ads_limit ?? "").padStart(2, "0")
                      )}
                    </span>
                  </>
                )}
              </span>

            </div>


            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 sm:space-x-2 rounded-lg transition-colors">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                  <AvatarImage src={userDetails?.imgname || "https://github.com/shadcn.png"} alt="User" />
                  <AvatarFallback className="bg-orange-500 text-white text-sm font-medium">U</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm sm:text-base font-medium text-gray-200">
                    {userDetails?.name || "User Name"}
                  </span>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48 bg-black">
                <div className="md:hidden">
                  {userDetails?.type === "2" && userDetails?.payment_status === 1 && (
                    <DropdownMenuItem onClick={() => router.push("/brands")}>Brands</DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                </div>
                <DropdownMenuItem onClick={() => router.push("/myaccount")}>Account</DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="md:hidden">
                  <DropdownMenuItem onClick={() => router.push("/guide")}>Guide</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/support")}>Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
                <DropdownMenuItem onClick={() => setReferralOpen(true)}>Refer a friend</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogoutClick} className="text-red-600">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Referral Modal */}
      {referralOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-black border border-primary rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white/50 hover:text-white focus:outline-none cursor-pointer"
              onClick={() => setReferralOpen(false)}
            >
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </button>

            {/* Header */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-primary">Refer a Friend & Earn!</h2>
              <p className="text-sm text-gray-300">
                Share your referral link with friends and earn{" "}
                <span className="font-semibold text-green-600">30% commission</span>
              </p>
            </div>

            {/* Referral Link */}
            <div className="mt-2 p-3 bg-[#171717] rounded-md flex items-center justify-between gap-2">
              <span className="text-sm break-all">{referralLink}</span>
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>

            {/* Footer */}
            <p className="text-xs text-gray-300 mt-2">
              Invite your friends and watch your rewards grow 🚀
            </p>
          </div>
        </div>
      )}

      {/* Upgrade Popup */}
      <UpgradePopup
        isOpen={showUpgradePopup}
        onClose={() => setShowUpgradePopup(false)}
        onUpgrade={() => router.push("/pro")}
        onMaybeLater={() => logout()}
      />
    </>
  );
};

export default TopNavbar;
