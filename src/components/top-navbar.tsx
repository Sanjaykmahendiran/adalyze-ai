"use client";

import Link from "next/link";
import Image from "next/image";
import {X, Copy, Check, FileImage, Infinity, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import useLogout from "@/hooks/useLogout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import logo from "@/assets/ad-logo.webp";
import UpgradePopup from "@/components/UpgradePopup";

interface TopNavbarProps {
  userDetails: any;
}

export const TopNavbar = ({ userDetails }: TopNavbarProps) => {
  const router = useRouter();
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Ensure theme is set on mount if undefined
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('adalyze-theme');
      if (!storedTheme) {
        localStorage.setItem('adalyze-theme', 'dark');
        setTheme('dark');
      } else if (storedTheme !== theme) {
        setTheme(storedTheme as 'light' | 'dark');
      }
    }
  }, []);

  // Ensure theme is properly applied on mount and when theme changes
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const root = document.documentElement;
      const storedTheme = localStorage.getItem('adalyze-theme') || 'dark';
      const currentTheme = theme || storedTheme || "dark"; // Default to dark if undefined
      
      if (currentTheme === "dark") {
        root.classList.add("dark");
        if (storedTheme !== 'dark') {
          localStorage.setItem('adalyze-theme', 'dark');
        }
      } else {
        root.classList.remove("dark");
        if (storedTheme !== 'light') {
          localStorage.setItem('adalyze-theme', 'light');
        }
      }
    }
  }, [theme, mounted, setTheme]);

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
            {/* Theme Toggle */}
            {mounted && (
              <div className="flex items-center gap-2">
                <Moon className={`w-4 h-4 transition-colors ${theme === "dark" || !theme ? "text-primary" : "text-muted-foreground"}`} />
                <Switch
                  checked={theme === "light"}
                  onCheckedChange={(checked) => {
                    // Fixed: checked = light (switch ON means light theme), unchecked = dark (switch OFF means dark theme)
                    const newTheme = checked ? "light" : "dark";
                    setTheme(newTheme);
                    // Ensure class is applied immediately and persisted
                    const root = document.documentElement;
                    if (newTheme === "dark") {
                      root.classList.add("dark");
                      localStorage.setItem('adalyze-theme', 'dark');
                    } else {
                      root.classList.remove("dark");
                      localStorage.setItem('adalyze-theme', 'light');
                    }
                  }}
                  aria-label="Toggle theme"
                />
                <Sun className={`w-4 h-4 transition-colors ${theme === "light" ? "text-primary" : "text-muted-foreground"}`} />
              </div>
            )}

            {/* Ads Credits */}
            <div
              onClick={() => {
                if (Number(userDetails?.ads_limit) === 0) {
                  router.push("/pro")
                }
              }}
              className={`border border-primary px-2 py-1 flex items-center gap-1 rounded-full transition-all duration-300 group max-w-[160px] sm:max-w-none 
                       ${Number(userDetails?.ads_limit) === 0 ? "hover:bg-primary/10 cursor-pointer" : ""}
                        `}
            >
              <FileImage className="w-4 h-4 text-primary group-hover:text-[#ff5722] transition-colors" />
              <span className="truncate whitespace-nowrap text-xs sm:text-sm text-primary font-medium group-hover:text-[#ff5722] flex items-center gap-1">
                {Number(userDetails?.ads_limit) === 0 ? (
                  <span className="text-foreground font-semibold">Add Credits</span>
                ) : (
                  <>
                    <span>Ads Credits:</span>
                    <span className="text-foreground font-semibold flex items-center gap-1">
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
                  <AvatarFallback className="bg-orange-500 text-foreground text-sm font-medium">U</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm sm:text-base font-medium text-foreground">
                    {userDetails?.name || "User Name"}
                  </span>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48 bg-card">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-card border border-primary rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
              onClick={() => setReferralOpen(false)}
            >
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </button>

            {/* Header */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-primary">Refer a Friend & Earn!</h2>
              <p className="text-sm text-muted-foreground">
                Share your referral link with friends and earn{" "}
                <span className="font-semibold text-green-600">30% commission</span>
              </p>
            </div>

            {/* Referral Link */}
            <div className="mt-2 p-3 bg-secondary rounded-md flex items-center justify-between gap-2">
              <span className="text-sm break-all">{referralLink}</span>
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>

            {/* Footer */}
            <p className="text-xs text-muted-foreground mt-2">
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
