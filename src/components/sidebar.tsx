"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  Split,
  MonitorPlay,
  Zap,
  BookOpen,
  LifeBuoy,
  User,
  Building2,
} from "lucide-react";

type MenuItem = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
};

const Type1MenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: UploadCloud, label: "Upload", href: "/upload" },
  { icon: Split, label: "A/B Test", href: "/ab-test" },
  { icon: MonitorPlay, label: "MyAds", href: "/my-ads" },
  { icon: Zap, label: "Pro", href: "/pro" },
  { icon: BookOpen, label: "Guide", href: "/guide" },
  { icon: LifeBuoy, label: "Support", href: "/support" },
  { icon: User, label: "Account", href: "/myaccount" },
];

const Type2MenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Building2, label: "Brands", href: "/brands" },
  { icon: UploadCloud, label: "Upload", href: "/upload" },
  { icon: Split, label: "A/B Test", href: "/ab-test" },
  { icon: MonitorPlay, label: "MyAds", href: "/my-ads" },
  { icon: Zap, label: "Pro", href: "/pro" },
  { icon: BookOpen, label: "Guide", href: "/guide" },
  { icon: LifeBuoy, label: "Support", href: "/support" },
  { icon: User, label: "Account", href: "/myaccount" },
];

interface SidebarProps {
  userDetails: any;
}

export function Sidebar({ userDetails }: SidebarProps) {
  const pathname = usePathname();
  const asideRef = useRef<HTMLDivElement | null>(null);

  const isActive = (href: string) => {
    const baseHref = href.split("?")[0];
    if (!pathname) return false;
    if (baseHref === "/") return pathname === "/";
    return pathname === baseHref || pathname.startsWith(`${baseHref}/`);
  };

  return (
    <aside
      ref={asideRef}
      className="flex flex-col items-center relative overflow-y-auto w-full px-1 py-1 bg-black"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {(userDetails?.type === "2" ? Type2MenuItems : Type1MenuItems).map(({ href, icon: Icon, label }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`group w-full flex flex-col items-center justify-center p-2 mb-1 font-medium rounded-md
            ${active
                ? "active-link text-white bg-[#db4900]/30"
                : "text-gray-300 hover:bg-[#121212] hover:text-[#db4900]"
              }`}
          >
            <Icon
              className={`h-6 w-6 ${active
                ? "text-[#db4900]"
                : "text-gray-300 group-hover:text-[#db4900]"} `}
              strokeWidth={active ? 2 : 1}
            />
            <span className="text-[11px] pt-[0.3rem] text-center font-semibold">
              {label}
            </span>
          </Link>
        );
      })}
    </aside>
  );
}
