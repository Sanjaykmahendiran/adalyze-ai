"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  UploadCloud,
  Split,
  MonitorPlay,
  Zap,
  BookOpen,
  LifeBuoy,
} from "lucide-react";

type MenuItem = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
};

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: UploadCloud, label: "Upload", href: "/upload" },
  { icon: Split, label: "A/B Test", href: "/ab-test" },
  { icon: MonitorPlay, label: "MyAds", href: "/my-ads" },
  { icon: Zap, label: "Pro", href: "/pro" },
  { icon: BookOpen, label: "Guide", href: "/guide" },
  { icon: LifeBuoy, label: "Support", href: "/support" },
];

type SidebarProps = {
  isCollapsed?: boolean;
};

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [pathname]);

  const handleClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="w-full p-4 space-y-4">
      {menuItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Button
            key={item.label}
            ref={isActive ? activeItemRef : null}
            onClick={() => handleClick(item.href)}
            variant="ghost"
            className={`w-full text-base justify-start h-10 ${isCollapsed ? "px-3" : "px-4"}
                        rounded-lg cursor-pointer
                        ${isActive
                ? "bg-[#db4900]/30 font-semibold text-primary hover:bg-[#db4900] hover:text-white group"
                : "text-gray-400 hover:bg-[#121212] hover:text-[#db4900] group"}
                     `}
          >
            <item.icon
              className={`${isCollapsed ? "mx-auto" : "mr-3"} h-5 w-5
                        ${isActive
                  ? "text-primary group-hover:text-white"
                  : "text-gray-400 group-hover:text-[#db4900]"}
                  `}
            />
            {!isCollapsed && item.label}
          </Button>

        );
      })}
    </div>
  );
}
