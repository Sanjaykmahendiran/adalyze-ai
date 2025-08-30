"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  Split,
  MonitorPlay,
  Zap,
  X,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";

type NavItem = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  path: string;
};

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: MonitorPlay, label: "MyAds", path: "/my-ads" },
  { icon: UploadCloud, label: "Upload", path: "/upload" },
    { icon: Split, label: "A/B Test", path: "/ab-test" },
  { icon: Zap, label: "Pro", path: "/pro" },
];

export function BottomMenu() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#000000] via-[#000000]/95 to-transparent z-50 h-24">
        <div className="relative z-10 h-full flex items-center justify-center pt-2">
          <div className="flex items-center justify-between w-full max-w-md px-6">
            {/* Left items */}
            <div className="flex items-center gap-8">
              {navItems.slice(0, 2).map((item) => {
                const isActive = pathname === item.path;
                return (
                  <div key={item.path} className="flex flex-col items-center">
                    <button
                      onClick={() => router.push(item.path)}
                      className="flex flex-col items-center transition-all duration-200"
                    >
                      <item.icon
                        className={`h-6 w-6 stroke-[2] ${
                          isActive ? "text-[#db4900]" : "text-gray-300"
                        }`}
                      />
                      <span
                        className={`text-[10px] mt-1 ${
                          isActive
                            ? "text-[#db4900] font-medium"
                            : "text-gray-300"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Center Upload Button */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-0 z-20">
              <motion.button
                onClick={() => router.push("/upload")}
                className="w-14 h-14 rounded-full bg-[#db4900] flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                whileTap={{ scale: 0.95 }}
              >
                <UploadCloud className="h-6 w-6 text-white stroke-[2.5]" />
              </motion.button>
            </div>

            {/* Right items */}
            <div className="flex items-center gap-8">
              {navItems.slice(3).map((item) => {
                const isActive = pathname === item.path;
                return (
                  <div key={item.path} className="flex flex-col items-center">
                    <button
                      onClick={() => router.push(item.path)}
                      className="flex flex-col items-center transition-all duration-200"
                    >
                      <item.icon
                        className={`h-6 w-6 stroke-[2] ${
                          isActive
                            ? "text-[#db4900] fill-[#db4900]"
                            : "text-gray-300"
                        }`}
                        fill={isActive ? "currentColor" : "none"}
                      />
                      <span
                        className={`text-[10px] mt-1 ${
                          isActive
                            ? "text-[#db4900] font-medium"
                            : "text-gray-300"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
