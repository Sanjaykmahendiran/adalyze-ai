"use client"
import Link from "next/link"
import Image from "next/image"
import { Menu, Bell, X, Copy, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { useRouter } from "next/navigation"
import useLogout from "@/hooks/useLogout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import logo from "@/assets/ad-logo.png"

interface TopNavbarProps {
  onMenuClick?: () => void,
  userDetails: any
}

export const TopNavbar = ({ onMenuClick, userDetails }: TopNavbarProps) => {
  const router = useRouter()
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false)
  const [hasNotifications, setHasNotifications] = useState(true)
  const [referralOpen, setReferralOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const referralLink = `https://adalyzeai.top/register?referral_code=${userDetails?.referral_code || ""}`

  const handleMenuClick = () => {
    setMenuOpen(!menuOpen)
    if (onMenuClick) onMenuClick()
  }

  const handleNotificationClick = () => {
    setHasNotifications(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <>
      <style jsx>{`
        @keyframes ring {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(10deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(8deg); }
          40% { transform: rotate(-6deg); }
          50% { transform: rotate(6deg); }
          60% { transform: rotate(-4deg); }
          70% { transform: rotate(4deg); }
          80% { transform: rotate(-2deg); }
          90% { transform: rotate(2deg); }
          100% { transform: rotate(0deg); }
        }
        
        .bell-ring {
          animation: ring 2s ease-in-out infinite;
          transform-origin: 50% 4px;
        }
        
        .bell-ring:hover {
          animation: ring 0.5s ease-in-out infinite;
        }
      `}</style>

      <div className="w-full">
        <div className="flex items-center justify-between w-full py-3">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={handleMenuClick}
              className="hidden md:block text-gray-200 hover:text-gray-700 transition-colors p-1"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo on mobile */}
            <Link href="/dashboard" className="md:hidden">
              <Image src={logo} width={92} height={52} alt="Logo" className="object-cover" />
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Notification */}
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="text-gray-200 hover:text-gray-700 transition-colors p-1 relative"
              >
                <Bell className={`h-5 w-5 ${hasNotifications ? "bell-ring" : ""}`} />
                {hasNotifications && (
                  <>
                    <span className="absolute -top-0 -right-0 h-3 w-3 bg-red-500 rounded-full animate-ping"></span>
                    <span className="absolute -top-0 -right-0 h-3 w-3 bg-red-500 rounded-full"></span>
                  </>
                )}
              </button>
            </div>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-3 rounded-lg transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userDetails?.imgname || "https://github.com/shadcn.png"} alt="User" />
                  <AvatarFallback className="bg-orange-500 text-white text-sm font-medium">U</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-200">{userDetails?.name || "User Name"}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/guide")}>Guide</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/support")}>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setReferralOpen(true)}>Refer a friend</DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link href="/">
                  <DropdownMenuItem onClick={logout} className="text-red-600">Logout</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Referral Popup */}
      <Dialog open={referralOpen} onOpenChange={setReferralOpen}>
        <DialogContent className="max-w-md bg-[#121212] border-none shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-primary"> Refer a Friend & Earn!</DialogTitle>
            <DialogDescription className="text-sm text-gray-300">
              Share your referral link with friends and earn <span className="font-semibold text-green-600">30% commission</span> on their subscription.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 p-3 bg-[#2b2b2b] rounded-md flex items-center justify-between">
            <span className="text-sm break-all">{referralLink}</span>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>

          <p className="text-xs text-gray-300 mt-2">
            Invite your friends and watch your rewards grow 🚀
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TopNavbar
