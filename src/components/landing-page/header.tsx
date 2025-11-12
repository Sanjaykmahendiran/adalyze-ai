"use client"

import { useState, useEffect, useMemo } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, CircleArrowRight, TicketPercent } from "lucide-react"
import { Button } from "../ui/button"
import { AnimatePresence, motion } from "framer-motion"
import loginlogo from "@/assets/ad-logo.webp"
import { trackEvent } from "@/lib/eventTracker"

// API type definitions
type ApiMenuItem = {
  menu_id: number
  parent_id: number
  name: string
  link: string
  badge_text: string | null
  menu_type: string
  target: "_self" | "_blank" | string
  sort_order: number
  visibility: "both" | "public" | "private" | string
  status: number
  created_date?: string
  modified_date?: string
  children?: ApiMenuItem[]
}

// UI menu shape used by the component
type UIMenuItem = {
  name: string
  href: string
  badge_text?: string | null
  hasDropdown?: boolean
  dropdownItems?: { name: string; href: string; badge_text?: string | null }[]
}

// Transform API payload into UI-friendly items, using link from API response
const toNavigationItems = (items: ApiMenuItem[]): UIMenuItem[] => {
  return items
    .filter(
      (i) =>
        i &&
        typeof i === "object" &&
        i.menu_type === "header" &&
        i.status === 1 &&
        (i.visibility === "both" || i.visibility === "public" || !i.visibility)
    )
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((i) => {
      const hasDropdown = Array.isArray(i.children) && i.children.length > 0
      return {
        name: i.name,
        href: i.link || "#",
        badge_text: i.badge_text,
        hasDropdown,
        dropdownItems: hasDropdown
          ? [...(i.children ?? [])]
            .filter((c) => c && typeof c === "object" && c.status === 1)
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((c) => ({
              name: c.name,
              href: c.link || "#",
              badge_text: c.badge_text,
            }))
          : undefined,
      }
    })
}

// Module-level singleton to prevent duplicate API calls across all Header instances
let menuFetchPromise: Promise<UIMenuItem[]> | null = null
let menuCache: UIMenuItem[] | null = null

const fetchMenuData = async (): Promise<UIMenuItem[]> => {
  // Return cached data if available
  if (menuCache) {
    return menuCache
  }

  // Return existing promise if fetch is already in progress
  if (menuFetchPromise) {
    return menuFetchPromise
  }

  // Create new fetch promise
  menuFetchPromise = (async () => {
    try {
      const res = await fetch("https://adalyzeai.xyz/App/tapi.php?gofor=menulist", {
        cache: "no-store",
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: unknown = await res.json()
      if (!Array.isArray(data)) return []

      // Filter out any non-object entries like stray strings
      const rawItems: ApiMenuItem[] = (data as unknown[]).filter(
        (it): it is ApiMenuItem => typeof it === "object" && it !== null
      )
      const uiItems = toNavigationItems(rawItems)
      menuCache = uiItems
      return uiItems
    } catch (error) {
      console.error("Error fetching menu data:", error)
      return []
    } finally {
      // Clear promise after completion (but keep cache)
      menuFetchPromise = null
    }
  })()

  return menuFetchPromise
}

// Enhanced custom hook for detecting scroll direction and top position
const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up")
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isAtTop, setIsAtTop] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsAtTop(currentScrollY <= 10)
      if (Math.abs(currentScrollY - lastScrollY) > 5) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setScrollDirection("down")
        } else if (currentScrollY < lastScrollY) {
          setScrollDirection("up")
        }
        setLastScrollY(currentScrollY)
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return { scrollDirection, isAtTop }
}

export default function Header() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [bannerManuallyDismissed, setBannerManuallyDismissed] = useState(false)

  const { scrollDirection, isAtTop } = useScrollDirection()

  // Banner is visible only when user is at the top and not manually dismissed
  const isBannerVisible = showBanner && !bannerManuallyDismissed && isAtTop

  // No fallback: start empty and render only what the API returns
  const [navigationItems, setNavigationItems] = useState<UIMenuItem[]>([])

  // Smooth-scroll only for anchor links on the homepage
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href?.startsWith("#")) return
    e.preventDefault()
    const sectionId = href.replace("#", "")
    if (window.location.pathname === "/") {
      const target = document.getElementById(sectionId)
      if (target) {
        const offset = 80 // header height offset
        const top = target.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: "smooth" })
      }
    } else {
      router.push(`/#${sectionId}`)
    }
  }

  // Fetch menu list from API using singleton pattern to prevent duplicate calls
  useEffect(() => {
    let cancelled = false
    fetchMenuData().then((items) => {
      if (!cancelled) {
        setNavigationItems(items)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

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
    setBannerManuallyDismissed(true)
  }

  return (
    <>
      {/* Banner - Enhanced responsive design with scroll-based visibility */}
      <AnimatePresence>
        {isBannerVisible && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 z-50 overflow-hidden w-full bg-gradient-to-r from-[#db4900] via-[#e65c00] to-[#db4900] text-white py-1.5 sm:py-2 md:py-3 px-2 sm:px-4 lg:px-6"
          >
            <div className="absolute inset-0 z-0">
              <div
                className="absolute inset-0 bg-white/10 blur-md animate-slide skew-x-12"
                style={{ animation: "slide 6s linear infinite" }}
              />
            </div>

            <div className="container relative z-10 mx-auto flex flex-row gap-1 sm:gap-2 md:gap-3 text-xs sm:text-sm md:text-base lg:text-base justify-center items-center w-full max-w-7xl">
              <div className="flex items-center justify-center flex-1 min-w-0">
                <TicketPercent className="mr-1 sm:mr-2 flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <p className="font-medium text-white text-center truncate">
                  <span className="font-bold">50% OFF:</span>
                  <span className="hidden sm:inline md:inline"> Unlock the full power of </span>
                  <span className="font-bold mx-1">Adalyze AI</span>
                  <span className="hidden md:inline">at half price. Limited-time offer!</span>
                  <span className="hidden sm:inline md:hidden">- Limited time!</span>
                  <span className="sm:hidden">- Limited!</span>
                </p>
              </div>

              <a
                onClick={() => { window.open("/register", "_blank", "noopener,noreferrer"); trackEvent("LP_Banner_RB", window.location.href); }}
                className="flex-shrink-0 hover:scale-110 transition-transform duration-200"
                aria-label="Get 50% off"
              >
                <CircleArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </a>

              <button
                onClick={closeBanner}
                className="flex-shrink-0 text-white hover:text-gray-200 transition-colors duration-200 ml-1 sm:ml-2 cursor-pointer"
                aria-label="Close banner"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Enhanced responsive positioning and spacing */}
      <header
        className={`w-full fixed left-0 right-0 z-999 px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 bg-black/20 backdrop-blur-md border-b border-white/10 transition-all duration-300
          ${isBannerVisible ? "top-[32px] sm:top-[40px] md:top-[48px]" : "top-0"}`}
      >
        <div className="container mx-auto flex items-center justify-between max-w-7xl">
          {/* Logo - Enhanced responsive sizing */}
          <Link
            href="/"
            className="flex items-center flex-shrink-0 min-w-0 z-50 h-12 sm:h-10 md:h-12 lg:h-12 w-auto max-w-[200px] sm:max-w-[220px] md:max-w-[240px] lg:max-w-full"
          >
            <Image
              src={loginlogo || "/placeholder.svg"}
              alt="Adalyze AI Logo"
              className="object-contain w-full h-full"
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
                    <button className="flex items-center gap-1 text-white hover:text-[#db4900] transition-colors duration-200 font-medium text-sm xl:text-base py-2 whitespace-nowrap relative">
                      {item.name}
                      {item.badge_text && (
                        <span className="absolute -top-1 -right-5 bg-[#db4900] text-white text-[10px] px-1 py-0.5 rounded-full font-medium min-w-[16px] h-4 flex items-center justify-center">
                          {item.badge_text}
                        </span>
                      )}
                      <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                    </button>
                    {/* Desktop Dropdown - Enhanced positioning */}
                    <div className="absolute top-full left-0 mt-1 w-48 xl:w-52 bg-black/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                      <div className="py-2">
                        {item.dropdownItems?.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className="block px-4 py-2 text-sm xl:text-base text-white hover:text-[#db4900] hover:bg-white/5 transition-colors duration-200 relative"
                          >
                            <div className="flex items-center gap-2">
                              {dropdownItem.name}
                              {dropdownItem.badge_text && (
                                <span className="absolute -top-1 -right-5 bg-[#db4900] text-white text-[10px] px-1 py-0.5 rounded-full font-medium min-w-[16px] h-4 flex items-center justify-center">
                                  {dropdownItem.badge_text}
                                </span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                    className="flex items-center gap-1 text-white hover:text-[#db4900] transition-colors duration-200 font-medium text-sm xl:text-base py-2 whitespace-nowrap relative"
                  >
                    {item.name}
                    {item.badge_text && (
                      <span className="absolute -top-1 -right-5 bg-[#db4900] text-white text-[10px] px-1 py-0.5 rounded-full font-medium min-w-[16px] h-4 flex items-center justify-center">
                        {item.badge_text}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Auth Buttons - Enhanced responsive sizing */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 2xl:gap-4 flex-shrink-0">
            <Button
              asChild
              variant="ghost"
              className="text-white hover:text-[#db4900] hover:bg-white/10 px-3 xl:px-4 2xl:px-5 py-2 rounded-lg text-sm xl:text-base font-medium transition-all duration-200 whitespace-nowrap"
              onClick={() => {
                trackEvent("LP_Direct_Login_button_clicked", window.location.href)
              }}
            >
              <a href="/login" target="_blank" rel="noopener noreferrer">
                Login
              </a>
            </Button>

            <Button
              asChild
              onClick={() => {
                trackEvent("LP_Direct_Register_button_clicked", window.location.href)
              }}
              className="bg-[#db4900] hover:bg-[#b8400a] text-white px-4 xl:px-6 2xl:px-7 py-2 rounded-lg text-sm xl:text-base font-medium transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              <a href="/register" target="_blank" rel="noopener noreferrer">
                Register
              </a>
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
              {isMobileMenuOpen ? (
                <div className="bg-[#171717] rounded-lg p-1">
                  <X className="w-6 h-6 " />
                </div>
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
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
                    style={{ top: isBannerVisible ? "36px" : "0px" }}
                  />

                  {/* Menu */}
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0  w-[90vw] bg-black backdrop-blur-md border border-[#171717] rounded-lg shadow-xl z-40 max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-100px)] overflow-y-auto"
                  >
                    <div className="py-2 space-y-2">
                      {navigationItems.map((item) => (
                        <div key={item.name} >
                          {item.hasDropdown ? (
                            <div className="bg-white/10 transition-colors duration-200 mx-2 rounded-lg">
                              <button
                                onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                                className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-white transition-colors duration-200 font-medium text-sm sm:text-base relative"
                              >
                                <div className="flex items-center gap-2">
                                  {item.name}
                                  {item.badge_text && (
                                    <span className="absolute top-1 right-8 lg:top-0 lg:-right-5 bg-[#db4900] text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium min-w-[16px] h-4 flex items-center justify-center">
                                      {item.badge_text}
                                    </span>
                                  )}
                                </div>
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${isResourcesOpen ? "rotate-180" : ""
                                    }`}
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
                                        className="block px-6 sm:px-8 py-2.5 sm:py-3 text-white/80 transition-colors duration-200 text-sm sm:text-base relative"
                                        onClick={() => {
                                          setIsMobileMenuOpen(false)
                                          setIsResourcesOpen(false)
                                        }}
                                      >
                                        <div className="flex items-center gap-2">
                                          {dropdownItem.name}
                                          {dropdownItem.badge_text && (
                                            <span className="absolute top-1 right-2 lg:top-0 lg:-right-5 bg-[#db4900] text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium min-w-[16px] h-4 flex items-center justify-center">
                                              {dropdownItem.badge_text}
                                            </span>
                                          )}
                                        </div>
                                      </Link>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ) : (
                            <Link
                              href={item.href}
                              className="block px-3 sm:px-4 py-2.5 sm:py-3 text-white/80 mx-2 rounded-lg bg-white/10 transition-colors duration-200 font-medium text-sm sm:text-base relative"
                              onClick={(e) => {
                                handleSmoothScroll(e, item.href)
                                setIsMobileMenuOpen(false)
                                setIsResourcesOpen(false)
                              }}
                            >
                              <div className="flex items-center gap-2 ">
                                {item.name}
                                {item.badge_text && (
                                  <span className="absolute top-1 right-2 lg:top-0 lg:-right-5 bg-[#db4900] text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium min-w-[16px] h-4 flex items-center justify-center">
                                    {item.badge_text}
                                  </span>
                                )}
                              </div>
                            </Link>
                          )}
                        </div>
                      ))}

                      {/* Mobile Auth Buttons */}
                      <div className="px-3 sm:px-4 pt-3 sm:pt-4 border-t border-white/10 mt-2 space-y-2.5 sm:space-y-3 pb-2">
                        <Button
                          asChild
                          variant="outline"
                          className="w-full text-white px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200"
                          onClick={() => {
                            setIsMobileMenuOpen(false)
                            trackEvent("LP_Direct_Login_button_clicked", window.location.href)
                          }}
                        >
                          <a href="/login" target="_blank" rel="noopener noreferrer">
                            Login
                          </a>
                        </Button>

                        <Button
                          asChild
                          className="w-full bg-[#db4900] hover:bg-[#b8400a] text-white px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 shadow-lg"
                          onClick={() => {
                            setIsMobileMenuOpen(false)
                            trackEvent("LP_Direct_Register_button_clicked", window.location.href)
                          }}
                        >
                          <a href="/register" target="_blank" rel="noopener noreferrer">
                            Register
                          </a>
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
