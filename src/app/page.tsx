"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"

const LandingPageHeader = dynamic(() => import("@/components/landing-page/landing-header-section"), { ssr: true })
const SocialProofSection = dynamic(() => import("@/components/landing-page/social-proof-section"), { ssr: false })
const OldWayNewWay = dynamic(() => import("@/components/landing-page/oldway-newway"), { ssr: false })
const FeaturesSection = dynamic(() => import("@/components/landing-page/features"), { ssr: false })
const CTASection = dynamic(() => import("@/components/landing-page/cta-section"), { ssr: false })
const Testimonials = dynamic(() => import("@/components/landing-page/testimonials"), { ssr: false })
const FAQSection = dynamic(() => import("@/components/landing-page/faq-section"), { ssr: false })
const WorkflowSection = dynamic(() => import("@/components/landing-page/workflow"), { ssr: false })
const LandingPageFooter = dynamic(() => import("@/components/landing-page/landing-page-footer"), { ssr: false })
const FloatingChat = dynamic(() => import("@/components/landing-page/floating-chat"), { ssr: false })
const PromotionalPopup = dynamic(() => import("@/components/landing-page/promotional-card"), { ssr: false })
const CaseStudySection = dynamic(() => import("@/components/landing-page/case-study-section"), { ssr: false })
const BlogSection = dynamic(() => import("@/components/landing-page/blog-section"), { ssr: false })
const ClientSection = dynamic(() => import("@/components/landing-page/client-section"), { ssr: false })

const LandingPage = () => {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement | null>(null)
  const [translateY, setTranslateY] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const [isHeroVisible, setIsHeroVisible] = useState(false)
  const [showPromotionalPopup, setShowPromotionalPopup] = useState(false)
  const [hasShownPromotionalPopup, setHasShownPromotionalPopup] = useState(false)

  useEffect(() => {
    const scrollToHash = () => {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (!hash) return;

      const sectionId = hash.slice(1);
      const target = document.getElementById(sectionId);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    };

    scrollToHash(); // on initial load
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);


  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const direction = currentY > lastScrollY ? "down" : "up"

      setShowScrollToTop(currentY > window.innerHeight)

      if (isHeroVisible) {
        setTranslateY((prev) => {
          if (direction === "down") {
            return 0 // slide down out of view
          } else {
            return 100 // slide up into view
          }
        })
      }

      const section = document.getElementById("workflow")
      if (section) {
        const sectionTop = section.getBoundingClientRect().top
        if (sectionTop <= window.innerHeight / 2 && !hasShownPromotionalPopup) {
          setShowPromotionalPopup(true)
          setHasShownPromotionalPopup(true)
        }
      }
      setScrollY(currentY)
      setLastScrollY(currentY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY, isHeroVisible, hasShownPromotionalPopup])

  // Observe hero visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting)
      },
      {
        root: null,
        threshold: 0.3,
      },
    )

    if (heroRef.current) {
      observer.observe(heroRef.current)
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current)
      }
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="relative min-h-screen">
      {/* Main Header with Hero Content */}
      <LandingPageHeader />

      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative text-center mt-8 sm:mt-12 md:mt-16 lg:mt-20 mb-6 sm:mb-8 md:mb-10 overflow-hidden min-h-[80px] sm:min-h-[100px] md:min-h-[120px] lg:min-h-[140px] xl:min-h-[180px]"
      >
        <div className="flex items-center justify-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold px-2 sm:px-4">
          <span className="text-gray-300 mr-2 sm:mr-3 md:mr-4 lg:mr-6">Boost</span>
          <span
            className="bg-gradient-to-r from-[#db4900] via-[#ff6a00] to-[#ffc100] bg-clip-text text-transparent inline-block transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateY(${translateY}%)`,
            }}
          >
            Impact
          </span>
        </div>
      </div>

      {/* Other Sections */}
      <ClientSection />
      <SocialProofSection />
      <OldWayNewWay />
      <FeaturesSection />
      <WorkflowSection />
      <Testimonials />
      <CaseStudySection />
      <FAQSection />
      <BlogSection />
      <CTASection />
      <LandingPageFooter />
      <FloatingChat />

      {/* Promotional Popup */}
      {showPromotionalPopup && <PromotionalPopup />}

      {/* Scroll to Top */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-1 sm:bottom-1 md:bottom-1 lg:bottom-1 right-3 sm:right-4 md:right-6 bg-white text-black p-1 sm:p-2 rounded-full shadow-lg hover:bg-primary-dark z-50 transition-all duration-200 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4" />
        </button>
      )}
    </div>
  )
}

export default LandingPage
