"use client"
import { useState } from "react";
import Image from "next/image";
import { Sidebar } from "@/components/sidebar";
import { BottomMenu } from "@/components/bottom-menu";
import logo from "@/assets/ad-logo.png"
import iconLogo from "@/assets/ad-icon-logo.png";
import { TopNavbar } from "@/components/top-navbar";
import { ReactNode } from "react";
import Link from "next/link";

interface UserLayoutProps {
  children: ReactNode;
  userDetails: any
}

export default function UserLayout({ children, userDetails }: UserLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex relative">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div
        className={`hidden md:flex fixed inset-y-0 left-0 flex-col ${
          isSidebarCollapsed ? "w-20" : "w-60"
        } bg-[#000000] border-r border-[#121212] z-50 print:hidden transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-center h-16 px-4 border-b border-[#121212]">
          <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : ""}`}>
            <Link href={"/dashboard"}>
              {isSidebarCollapsed ? (
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold">
                  <Image src={iconLogo} width={85} height={85} alt="Logo" />
                </div>
              ) : (
                <Image src={logo} width={180} height={40} alt="Logo" />
              )}
            </Link>
          </div>
        </div>
        <div className="flex flex-col flex-1 relative scroll-container thin-scrollbar">
          <Sidebar isCollapsed={isSidebarCollapsed} />
        </div>
      </div>

      {/* Mobile Bottom Menu - Only visible on mobile */}
      <div className="md:hidden">
        <BottomMenu />
      </div>

      {/* Main content */}
      <div className={`flex flex-col flex-1 h-screen ${
        isSidebarCollapsed ? "md:ml-20" : "md:ml-60"
      } transition-all duration-300 ease-in-out`}>
        {/* TopNavbar */}
        <div className={`fixed top-0 ${
          isSidebarCollapsed ? "md:left-20" : "md:left-60"
        } left-0 right-0 flex items-center justify-between h-16 px-4 bg-[#000000] z-40 print:hidden transition-all duration-300 border-b border-[#121212] ease-in-out`}>
          <TopNavbar onMenuClick={toggleSidebar} userDetails={userDetails} />
        </div>

        {/* Content - Add bottom padding on mobile for bottom menu */}
        <div className="flex-1 pt-16 pb-0 md:pb-0 mb-16 md:mb-0">
          {children}
        </div>
      </div>
    </div>
  );
}