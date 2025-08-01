"use client"
import Link from "next/link"
import { Menu, Search, Bell, Maximize, Minimize, X, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,  
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { useRouter } from "next/navigation"
import useLogout from "@/hooks/useLogout";


interface TopNavbarProps {
  onMenuClick?: () => void,
  userDetails: any
}

export const TopNavbar = ({ onMenuClick, userDetails }: TopNavbarProps) => {
  const router = useRouter()
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false)
  const [hasNotifications, setHasNotifications] = useState(true)


  const handleMenuClick = () => {
    setMenuOpen(!menuOpen)
    if (onMenuClick) onMenuClick()
  }

  const handleNotificationClick = () => {
    setHasNotifications(false)
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
        <div className="flex items-center justify-between w-full px-6 py-3">
          {/* Left section - Menu */}
          <div className="flex items-center">
            <button onClick={handleMenuClick} className="text-gray-200 hover:text-gray-700 transition-colors p-1">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">

            {/* Notification bell with ringing animation */}
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="text-gray-200 hover:text-gray-700 transition-colors p-1 relative"
              >
                <Bell className={`h-5 w-5 ${hasNotifications ? "bell-ring" : ""}`} />
                {hasNotifications && (
                  <span className="absolute -top-0 -right-0 h-3 w-3 bg-red-500 rounded-full animate-ping"></span>
                )}
                {hasNotifications && <span className="absolute -top-0 -right-0 h-3 w-3 bg-red-500 rounded-full"></span>}
              </button>
            </div>


            {/* User profile */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-3 rounded-lg p-2 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userDetails?.imgname || "https://github.com/shadcn.png"} alt="User" />
                  <AvatarFallback className="bg-orange-500 text-white text-sm font-medium">MJ</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-200">{userDetails?.name || "User Name"}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link href="/">
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-red-600">Logout</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </div>
    </>
  )
}

export default TopNavbar
