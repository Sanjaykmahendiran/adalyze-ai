  "use client"
  import { useState, useEffect } from "react"
  import type React from "react"

  import { useRouter } from "next/navigation"
  import Link from "next/link"
  import Image from "next/image"
  import { Menu, X, ChevronDown, CircleArrowRight, TicketPercent } from "lucide-react"
  import { Button } from "../ui/button"
  import { AnimatePresence, motion } from "framer-motion"
  import loginlogo from "@/assets/ad-logo.png"

  export default function Header() {
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isResourcesOpen, setIsResourcesOpen] = useState(false)
    const [showBanner, setShowBanner] = useState(true)

    const navigationItems = [
      { name: "Features", href: "#features" },
      { name: "Why us?", href: "#why-us" },
      { name: "Pricing", href: "/pricing?page=dashboard" },
      {
        name: "Resources",
        href: "#",
        hasDropdown: true,
        dropdownItems: [
          { name: "Blog", href: "/blog" },
          { name: "Case Studies", href: "/case-study" },
          { name: "FAQ", href: "#faq" },
        ],
      },
      { name: "Affiliate Program", href: "/affiliate-program" },
    ]

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return; // <-- only scroll for anchor links

    e.preventDefault();
    const sectionId = href.replace("#", "");

    if (window.location.pathname === "/") {
      const target = document.getElementById(sectionId);
      if (target) {
        const offset = 80; // adjust this value for your header height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    } else {
      router.push(`/#${sectionId}`);
    }
  };



    // Close menu on resize and outside click
    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth >= 1024) {
          setIsMobileMenuOpen(false)
          setIsResourcesOpen(false)
        }
      }

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element
        if (isMobileMenuOpen && !target.closest(".mobile-menu-container")) {
          setIsMobileMenuOpen(false)
          setIsResourcesOpen(false)
        }
      }

      window.addEventListener("resize", handleResize)
      document.addEventListener("mousedown", handleClickOutside)

      return () => {
        window.removeEventListener("resize", handleResize)
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [isMobileMenuOpen])

    const closeBanner = () => {
      setShowBanner(false)
    }

    return (
      <>
        {/* Banner - Enhanced responsive design */}
        {showBanner && (
          <div className="fixed top-0 left-0 right-0 z-50 overflow-hidden w-full bg-gradient-to-r from-[#db4900] via-[#e65c00] to-[#db4900] text-white py-1.5 sm:py-2 md:py-3 px-2 sm:px-4 lg:px-6">
            <div className="absolute inset-0 z-0">
              <div
                className="absolute inset-0 bg-white/10 blur-md animate-slide skew-x-12"
                style={{
                  animation: "slide 6s linear infinite",
                }}
              ></div>
            </div>

            <div className="container relative z-10 mx-auto flex flex-row gap-1 sm:gap-2 md:gap-3 text-xs sm:text-sm md:text-base lg:text-base justify-center items-center w-full max-w-7xl">
              <div className="flex items-center justify-center flex-1 min-w-0">
                <TicketPercent className="mr-1 sm:mr-2 flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <p className="font-medium text-white text-center truncate">
                  <span className="font-bold">50% OFF:</span>
                  <span className="hidden sm:inline md:inline"> Unlock the full power of </span>
                  <span className="font-bold mx-1">AdalyzeAI</span>
                  <span className="hidden md:inline">at half price. Limited-time offer!</span>
                  <span className="hidden sm:inline md:hidden">- Limited time!</span>
                  <span className="sm:hidden">- Limited!</span>
                </p>
              </div>

              <a
                href="/register"
                className="flex-shrink-0 hover:scale-110 transition-transform duration-200"
                aria-label="Get 50% off"
              >
                <CircleArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </a>

              <button
                onClick={closeBanner}
                className="flex-shrink-0 text-white hover:text-gray-200 transition-colors duration-200 ml-1 sm:ml-2"
                aria-label="Close banner"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <style jsx>{`
              @keyframes slide {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
          </div>
        )}

        {/* Header - Enhanced responsive positioning and spacing */}
        <header
          className={`w-full fixed left-0 right-0 z-40 px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 bg-black/20 backdrop-blur-md border-b border-white/10 transition-all duration-300
          ${showBanner ? "top-[32px] sm:top-[40px] md:top-[48px]" : "top-0"}`}
        >
          <div className="container mx-auto flex items-center justify-between max-w-7xl">
            {/* Logo - Enhanced responsive sizing */}
            <Link href="/" className="flex items-center flex-shrink-0 min-w-0 z-50">
              <Image
                src={loginlogo || "/placeholder.svg"}
                alt="Adalyze Logo"
                className="object-contain h-6 sm:h-8 md:h-10 lg:h-12 w-auto max-w-[100px] sm:max-w-[120px] md:max-w-[140px] lg:max-w-full"
                priority
                draggable={false}
              />
            </Link>

            {/* Desktop Navigation - Enhanced responsive spacing */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 2xl:space-x-8">
              {navigationItems.map((item) => (
                <div key={item.name} className="relative group">
                  {item.hasDropdown ? (
                    <div className="relative">
                      <button className="flex items-center gap-1 text-white hover:text-[#db4900] transition-colors duration-200 font-medium text-sm xl:text-base py-2 whitespace-nowrap">
                        {item.name}
                        <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                      </button>
                      {/* Desktop Dropdown - Enhanced positioning */}
                      <div className="absolute top-full left-0 mt-1 w-48 xl:w-52 bg-black/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                        <div className="py-2">
                          {item.dropdownItems?.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              href={dropdownItem.href}
                              className="block px-4 py-2 text-sm xl:text-base text-white hover:text-[#db4900] hover:bg-white/5 transition-colors duration-200"
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={(e) => handleSmoothScroll(e, item.href)}
                      className="text-white hover:text-[#db4900] transition-colors duration-200 font-medium text-sm xl:text-base py-2 whitespace-nowrap"
                    >
                      {item.name}
                    </Link>

                  )}
                </div>
              ))}
            </nav>

            {/* Desktop Auth Buttons - Enhanced responsive sizing */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3 2xl:gap-4 flex-shrink-0">
              <Button
                onClick={() => router.push("/login")}
                variant="ghost"
                className="text-white hover:text-[#db4900] hover:bg-white/10 px-3 xl:px-4 2xl:px-5 py-2 rounded-lg text-sm xl:text-base font-medium transition-all duration-200 whitespace-nowrap"
              >
                Login
              </Button>
              <Button
                onClick={() => router.push("/register")}
                className="bg-[#db4900] hover:bg-[#b8400a] text-white px-4 xl:px-6 2xl:px-7 py-2 rounded-lg text-sm xl:text-base font-medium transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                Register
              </Button>
            </div>

            {/* Mobile Menu Button - Enhanced responsive design */}
            <div className="lg:hidden mobile-menu-container relative">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen)
                  setIsResourcesOpen(false)
                }}
                className="p-1.5 sm:p-2 text-white hover:text-[#db4900] transition-colors duration-200 z-50 relative"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>

              {/* Mobile Menu Items - Enhanced responsive design */}
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
                      style={{ top: showBanner ? "36px" : "0px" }}
                    />

                    {/* Menu */}
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-64 sm:w-72 md:w-80 bg-black/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-40 max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-100px)] overflow-y-auto"
                    >
                      <div className="py-2">
                        {navigationItems.map((item) => (
                          <div key={item.name}>
                            {item.hasDropdown ? (
                              <div>
                                <button
                                  onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                                  className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-white hover:text-[#db4900] hover:bg-white/5 transition-colors duration-200 font-medium text-sm sm:text-base"
                                >
                                  {item.name}
                                  <ChevronDown
                                    className={`w-4 h-4 transition-transform ${isResourcesOpen ? "rotate-180" : ""}`}
                                  />
                                </button>
                                {/* Mobile Dropdown */}
                                <AnimatePresence>
                                  {isResourcesOpen && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="bg-white/5 border-t border-white/10 overflow-hidden"
                                    >
                                      {item.dropdownItems?.map((dropdownItem) => (
                                        <Link
                                          key={dropdownItem.name}
                                          href={dropdownItem.href}
                                          className="block px-6 sm:px-8 py-2.5 sm:py-3 text-gray-300 hover:text-[#db4900] hover:bg-white/5 transition-colors duration-200 text-sm sm:text-base"
                                          onClick={() => {
                                            setIsMobileMenuOpen(false)
                                            setIsResourcesOpen(false)
                                          }}
                                        >
                                          {dropdownItem.name}
                                        </Link>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ) : (
                              <Link
                                href={item.href}
                                className="block px-3 sm:px-4 py-2.5 sm:py-3 text-white hover:text-[#db4900] hover:bg-white/5 transition-colors duration-200 font-medium text-sm sm:text-base"
                                onClick={(e) => {
                                  handleSmoothScroll(e, item.href)
                                  setIsMobileMenuOpen(false)
                                  setIsResourcesOpen(false)
                                }}
                              >
                                {item.name}
                              </Link>
                            )}
                          </div>
                        ))}

                        {/* Mobile Auth Buttons - Enhanced responsive spacing */}
                        <div className="px-3 sm:px-4 pt-3 sm:pt-4 border-t border-white/10 mt-2 space-y-2.5 sm:space-y-3 pb-2">
                          <Button
                            onClick={() => {
                              router.push("/login")
                              setIsMobileMenuOpen(false)
                            }}
                            variant="ghost"
                            className="w-full text-white hover:text-[#db4900] hover:bg-white/10 px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200"
                          >
                            Login
                          </Button>
                          <Button
                            onClick={() => {
                              router.push("/register")
                              setIsMobileMenuOpen(false)
                            }}
                            className="w-full bg-[#db4900] hover:bg-[#b8400a] text-white px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 shadow-lg"
                          >
                            Register
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
      </>
    )
  }
