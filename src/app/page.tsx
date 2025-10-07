"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ChevronUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import LoginChatCard from "@/components/landing-page/login-chat-card";
import ChatIcon from "@/assets/Chat-icon-suggesto.png";
import Counter from "@/components/landing-page/counter";

// Dynamic sections
const LandingPageHeader = dynamic(() => import("@/components/landing-page/landing-header-section"), { ssr: true });
const ClientSection = dynamic(() => import("@/components/landing-page/client-section"), { ssr: false });
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
const CounterSection = dynamic(() => import("@/components/landing-page/CounterSection"), { ssr: false });
const ForWhom = dynamic(() => import("@/components/landing-page/for-whom"), { ssr: false });

const LandingPage = () => {
  const prefersReducedMotion = useReducedMotion();

  // UI state
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showPromotionalPopup, setShowPromotionalPopup] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const chatRef = useRef<HTMLDivElement | null>(null);
  const tickingRef = useRef(false);

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

  // Scroll handling (back to top)
  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY || 0;
        setShowScrollToTop(currentY > window.innerHeight);
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Chat toggle
  const toggleChat = useCallback(() => setIsChatOpen((v) => !v), []);

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
      {/* Sections */}
      <ClientSection />
      <OldWayNewWay />
      {/* <SocialProofSection /> */}
      < ForWhom />
      <FeaturesSection />
      <Counter />
      {/* <CounterSection /> */}
      <WorkflowSection />
      <Testimonials />
      <CaseStudySection />
      <FAQSection />
      {/* <BlogSection /> */}
      <CTASection />
      <LandingPageFooter />

      {/* Floating controls */}
      <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 flex flex-col items-end gap-3 z-50">
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
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-white touch-manipulation"
              aria-label="Open Info Assistant chat"
            >
              <Image src={ChatIcon} alt="Chat" width={56} height={56} className="w-full h-full" priority />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat panel */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              key="chat-panel"
              ref={chatRef}
              className="fixed bottom-20 right-2 w-[92vw] sm:w-[360px] md:w-[400px] max-w-sm z-50"
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
              className="flex items-center justify-center bg-[#1f1f21] hover:bg-[#1f1f21]/80 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#db4900] focus:ring-opacity-50 active:scale-95 transform min-w-[44px] min-h-[44px] sm:min-w-[52px] sm:min-h-[52px]"
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
