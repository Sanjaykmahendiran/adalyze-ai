"use client"

import Link from "next/link"
import { Facebook, Linkedin, Twitter, Instagram } from "lucide-react"

const LandingPageFooter = () => {

  return (
    <footer className="bg-black text-white py-8 sm:py-10 px-4 sm:px-6 md:px-12 border-t border-[#2b2b2b]">
      <div className="mx-4 sm:mx-6 lg:mx-2 flex flex-col md:flex-row justify-between ">
        {/* Left Section: Social + Links */}
        <div className="flex flex-col items-center md:items-start gap-4 sm:gap-6 w-full">
          {/* Social Media Icons */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4">
            <Link href="https://www.facebook.com/profile.php?id=61579156799875" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook className="w-5 h-5 sm:w-6 sm:h-6 hover:text-gray-300 transition" />
            </Link>
            <Link href="https://x.com/adalyzeai" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <Twitter className="w-5 h-5 sm:w-6 sm:h-6 hover:text-gray-300 transition" />
            </Link>
            <Link href="https://www.instagram.com/adalyzeai" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram className="w-5 h-5 sm:w-6 sm:h-6 hover:text-gray-300 transition" />
            </Link>
            <Link href="https://www.linkedin.com/company/adalyze-ai/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 hover:text-gray-300 transition" />
            </Link>
          </div>

          {/* Bottom Links */}
          <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-start items-center text-sm gap-3 sm:gap-4 md:gap-8 text-center md:text-left">
            <Link href="/privacypolicy" className="hover:underline whitespace-nowrap">
              Privacy Policy
            </Link>
            <Link href="/returnpolicy" className="hover:underline whitespace-nowrap">
              Return Policy
            </Link>
            <Link href="/termsandconditions" className="hover:underline whitespace-nowrap">
              Terms of Use
            </Link>
            <Link href="/aboutus" className="hover:underline whitespace-nowrap">
              About
            </Link>
            <Link href="/cookie-policy" className="hover:underline whitespace-nowrap">
              Cookie Policy
            </Link>
            <Link href="/affiliate-program" className="hover:underline whitespace-nowrap">
              Affiliate program
            </Link>
          </div>


        </div>

        {/* Right Section: Contact & Buttons */}
        <div className="text-center md:text-right w-full md:mr-10">
          <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">Contact</h3>
          {/* Obfuscated email to protect from spam harvesters */}
          <a 
            href="mailto:support@adalyze.app" 
            className="text-sm hover:text-primary block mb-4 sm:mb-6"
            onClick={(e) => {
              // Additional protection: decode on click (base64 encoded mailto link)
              e.preventDefault();
              window.location.href = atob('bWFpbHRvOnN1cHBvcnRAYWRhbHl6ZS5hcHA=');
            }}
            onMouseEnter={(e) => {
              // Decode email on hover for better UX
              const link = e.currentTarget;
              if (link.textContent && link.textContent.includes('@')) {
                link.textContent = atob('c3VwcG9ydEBhZGFseXplLmFwcA==');
              }
            }}
          >
            <span className="[unicode-bidi:bidi-override;direction:rtl]">ppa.ezylada@tropus</span>
          </a>
        </div>
      </div>
      <div className=" text-center text-xs sm:text-sm mt-2">
        © {new Date().getFullYear()} Techades Ebiz Arena. Adalyze AI is a product of Techades.
      </div>
    </footer>
  )
}

export default LandingPageFooter
