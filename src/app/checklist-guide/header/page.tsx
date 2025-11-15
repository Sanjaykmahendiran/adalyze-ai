import Link from "next/link";
import Image from "next/image";
import adalyzeLogo from "@/assets/ad-logo.webp";

export default function ChecklistHeader() {
  return (
    <header
      className="
        flex items-center justify-between 
        px-4 sm:px-6 md:px-10 py-3 
        sticky top-0 z-50
        bg-[#171717]/80
        backdrop-blur-md
        border-b border-white/20
        
      "
    >
      {/* Logo Section */}
      <Link
        href="/"
        className="flex items-center flex-shrink-0 min-w-0 h-12 sm:h-10 md:h-12 lg:h-12 w-auto max-w-[200px] sm:max-w-[220px] md:max-w-[240px] lg:max-w-full"
      >
        <Image
          src={adalyzeLogo}
          alt="Adalyze AI Logo"
          className="object-contain w-full h-full"
          priority
          draggable={false}
        />
      </Link>

     
    </header>
  );
}
