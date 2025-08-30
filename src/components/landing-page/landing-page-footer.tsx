"use client"

import Link from "next/link"
import { Facebook, Linkedin, Twitter, Youtube, Instagram } from "lucide-react"
import { useRouter } from "next/navigation"

const LandingPageFooter = () => {
  const router = useRouter()

  return (
    <footer className="bg-black text-white py-8 sm:py-10 px-4 sm:px-6 md:px-12 border-t border-[#2b2b2b]">
      <div className="mx-4 sm:mx-6 lg:mx-10 flex flex-col md:flex-row justify-between gap-8 sm:gap-12">
        {/* Left Section: Social + Links */}
        <div className="flex flex-col items-center md:items-start gap-4 sm:gap-6 w-full">
          {/* Social Media Icons */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4">
            <Link href="https://www.facebook.com/adalyzeai" aria-label="Facebook">
              <Facebook className="w-5 h-5 sm:w-6 sm:h-6 hover:text-gray-300 transition" />
            </Link>
            <Link href="https://x.com/adalyzeai" aria-label="Twitter">
              <Twitter className="w-5 h-5 sm:w-6 sm:h-6 hover:text-gray-300 transition" />
            </Link>
            <Link href="https://www.youtube.com/@adalyzeai" aria-label="YouTube">
              <Youtube className="w-5 h-5 sm:w-6 sm:h-6 hover:text-gray-300 transition" />
            </Link>
            <Link href="https://www.instagram.com/adalyzeai" aria-label="Instagram">
              <Instagram className="w-5 h-5 sm:w-6 sm:h-6 hover:text-gray-300 transition" />
            </Link>
            <Link href="https://www.linkedin.com/company/adalyzeai" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 hover:text-gray-300 transition" />
            </Link>
          </div>

          {/* Bottom Links */}
          <div className="flex flex-wrap justify-center md:justify-start items-center text-xs gap-3 sm:gap-4 md:gap-8 text-center md:text-left">
            <div>© {new Date().getFullYear()} Adalyze AI. All rights reserved.</div>
            <Link href="/privacypolicy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/returnpolicy" className="hover:underline">
              Return Policy
            </Link>
            <Link href="/termsandconditions" className="hover:underline">
              Terms of Use
            </Link>
          </div>
        </div>

        {/* Right Section: Contact & Buttons */}
        <div className="text-center md:text-right w-full">
          <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">Contact</h3>
          <a href="mailto:support@adalyze.ai" className="text-sm hover:text-primary block mb-4 sm:mb-6">
            support@adalyze.ai
          </a>
        </div>
      </div>
    </footer>
  )
}

export default LandingPageFooter
