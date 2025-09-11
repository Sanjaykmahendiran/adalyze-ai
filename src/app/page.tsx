"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ChevronUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import LoginChatCard from "@/components/landing-page/login-chat-card";
import ChatIcon from "@/assets/Chat-icon-suggesto.png";
import ClientSection from "@/components/landing-page/client-section";

// Dynamic sections: SSR only where safe, disable SSR for browser-only code
const LandingPageHeader = dynamic(() => import("@/components/landing-page/landing-header-section"), { ssr: true });
const SocialProofSection = dynamic(() => import("@/components/landing-page/social-proof-section"), { ssr: false });
const OldWayNewWay = dynamic(() => import("@/components/landing-page/oldway-newway"), { ssr: false });
const FeaturesSection = dynamic(() => import("@/components/landing-page/features"), { ssr: false });
const CTASection = dynamic(() => import("@/components/landing-page/cta-section"), { ssr: false });
const Testimonials = dynamic(() => import("@/components/landing-page/testimonials"), { ssr: false });
const FAQSection = dynamic(() => import("@/components/landing-page/faq-section"), { ssr: false });
const WorkflowSection = dynamic(() => import("@/components/landing-page/workflow"), { ssr: false });
const LandingPageFooter = dynamic(() => import("@/components/landing-page/landing-page-footer"), { ssr: false });
const PromotionalPopup = dynamic(() => import("@/components/landing-page/promotional-card"), { ssr: false });
const CaseStudySection = dynamic(() => import("@/components/landing-page/case-study-section"), { ssr: false });
const BlogSection = dynamic(() => import("@/components/landing-page/blog-section"), { ssr: false });

const LandingPage = () => {
  const prefersReducedMotion = useReducedMotion();

  // Refs
  const heroRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  // UI state
  const [translateY, setTranslateY] = useState(0);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [showPromotionalPopup, setShowPromotionalPopup] = useState(false);
  const [hasShownPromotionalPopup, setHasShownPromotionalPopup] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Smooth hash scrolling
  useEffect(() => {
    const scrollToHash = () => {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (!hash) return;
      const sectionId = decodeURIComponent(hash.slice(1));
      const target = document.getElementById(sectionId);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash, { passive: true });
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  // Scroll handling (rAF + passive)
  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY || 0;
        const lastY = lastScrollYRef.current;
        const scrollingDown = currentY > lastY;

        // Show back-to-top after one viewport
        setShowScrollToTop(currentY > window.innerHeight);

        // Hero word slide (reduced motion = no transform)
        if (isHeroVisible && !prefersReducedMotion) {
          setTranslateY(scrollingDown ? 0 : 100);
        } else {
          setTranslateY(0);
        }

        // Trigger promo popup entering workflow
        if (!hasShownPromotionalPopup) {
          const section = document.getElementById("workflow");
          if (section) {
            const { top } = section.getBoundingClientRect();
            if (top <= window.innerHeight / 2) {
              setShowPromotionalPopup(true);
              setHasShownPromotionalPopup(true);
            }
          }
        }

        lastScrollYRef.current = currentY;
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHeroVisible, prefersReducedMotion, hasShownPromotionalPopup]);

  // Observe hero visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.3,
      }
    );

    const el = heroRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, []);

  // Chat open/close handlers
  const toggleChat = useCallback(() => {
    setIsChatOpen((v) => !v);
  }, []);

  useEffect(() => {
    if (!isChatOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(e.target as Node)) {
        setIsChatOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsChatOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isChatOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden lg:overflow-x-visible">
      {/* Header */}
      <LandingPageHeader />

      {/* Hero */}
      <div
        ref={heroRef}
        className="relative text-center mt-6 sm:mt-4 md:mt-6 lg:mt-20 mb-4 sm:mb-4 md:mb-4 overflow-hidden min-h-[80px] sm:min-h-[100px] md:min-h-[120px] lg:min-h-[140px] xl:min-h-[180px]"
      >
        <div className="flex items-center justify-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold px-2 sm:px-4">
          <span className="text-gray-300 mr-2 sm:mr-3 md:mr-4 lg:mr-6">Boost</span>
          <span
            className="bg-gradient-to-r from-[#db4900] via-[#ff6a00] to-[#ffc100] bg-clip-text text-transparent inline-block transition-transform duration-300 ease-in-out will-change-transform"
            style={{
              transform: prefersReducedMotion ? "none" : `translateY(${translateY}%)`,
            }}
          >
            Impact
          </span>
        </div>
      </div>

      {/* Sections */}
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

      {/* Floating controls */}
      <div className="fixed bottom-4 right-4 flex flex-col items-end gap-3 z-50">
        {/* Chat toggle */}
        <AnimatePresence>
          {!isChatOpen && (
            <motion.button
              key="chat-toggle"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 12 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={toggleChat}
              className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-white touch-manipulation"
              aria-label="Open Info Assistant chat"
            >
              <Image
                src={ChatIcon}
                alt="Chat"
                width={56}
                height={56}
                className="w-14 h-14"
                priority
              />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat panel */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              key="chat-panel"
              ref={chatRef}
              className="fixed bottom-20 right-2 w-[90vw] sm:w-[350px] md:w-[380px] max-w-sm z-50"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <LoginChatCard onClose={toggleChat} />
            </motion.div>
          )}
        </AnimatePresence>

     {/* Back to top */}
<AnimatePresence>
  {showScrollToTop && (
    <motion.button
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
      onClick={scrollToTop}
      className="flex items-center justify-center bg-[#1f1f21] hover:bg-[#1f1f21]/80 text-white p-2 sm:p-4 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#db4900] focus:ring-opacity-50 active:scale-95 transform min-w-[48px] min-h-[48px] sm:min-w-[52px] sm:min-h-[52px]"
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
    </motion.button>
  )}
</AnimatePresence>

      </div>

      {/* Promotional Popup */}
      {showPromotionalPopup && <PromotionalPopup />}
    </div>
  );
};

export default LandingPage;
