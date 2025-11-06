"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ChevronUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import LoginChatCard from "@/components/landing-page/login-chat-card";
import ChatIcon from "@/assets/Chat-icon-suggesto.png";
import { useSearchParams } from "next/navigation";
import EcommBanner from "@/components/landing-page/banner-varient1";
import BannerVarient2 from "@/components/landing-page/banner-varient2";

// Shared type for banner data (same shape as before)
interface BannerData {
  tagline: string;
  heading: string;
  subheading: string;
  brief: string;
  pcta: string;
  scta: string;
  trust_line: string;
  typeword1: string;
  typeword2: string;
  typeword3: string;
  typeword4: string;
  counter_content: string;
  metric_content1: string;
  metric_value1: number;
  metric_content2: string;
  metric_value2: number;
  metric_content3: string;
  metric_value3: number;
  metric_content4: string;
  metric_value4: number;
  counter: number;
}

// Dynamic sections
// Header continues to SSR; it now accepts props but UI/behavior remain unchanged
const LandingPageHeader = dynamic(() => import("@/components/landing-page/landing-header-section"),{ ssr: true });
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
const ForWhom = dynamic(() => import("@/components/landing-page/for-whom"), { ssr: false });
const AiAdMistakes = dynamic(() => import("@/components/landing-page/ai-ad-mistakes"), { ssr: false });
const PartnerLogos = dynamic(() => import("@/components/landing-page/PartnerLogos"), { ssr: false });
const Counter = dynamic(() => import("@/components/landing-page/lp-counter"), { ssr: false });


const LandingPage = () => {
  const prefersReducedMotion = useReducedMotion();

  // Banner data lifted here
  const searchParams = useSearchParams();
  const variant = searchParams.get("variant") || "";

  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [isLoadingBanner, setIsLoadingBanner] = useState(true);
  const [buttonText, setButtonText] = useState("");

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const baseUrl = "https://adalyzeai.xyz/App/api.php?gofor=livebanner";
        const url = variant && variant !== "default" ? `${baseUrl}&variant=${variant}` : baseUrl;
        const response = await fetch(url);
        const data = await response.json();
        setBannerData(data);
        setIsLoadingBanner(false);
        setButtonText(data.pcta);
      } catch (error) {
        console.error("Error fetching banner data:", error);
        setIsLoadingBanner(false);
      }
    };
    fetchBannerData();
  }, [variant]);

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
      const target = e.target as Element;

      // Check if the click is outside the chat component
      if (chatRef.current && !chatRef.current.contains(target)) {
        // Check if the click is on any Radix UI Select dropdown elements
        const isSelectDropdown = target?.closest('[data-radix-select-content]') ||
          target?.closest('[data-radix-popper-content-wrapper]') ||
          target?.closest('[data-radix-portal]') ||
          target?.closest('[data-slot="select-content"]') ||
          target?.closest('[role="listbox"]') ||
          target?.closest('[role="option"]') ||
          target?.closest('[data-state="open"]');

        // Don't close if clicking on Select dropdown elements
        if (!isSelectDropdown) {
          setIsChatOpen(false);
        }
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

  // Prevent horizontal scroll on medium screens without changing layout
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    const applyOverflowRule = () => {
      const width = window.innerWidth;
      // Tailwind md: 768px, lg: 1024px. Apply for >=768 and <1024
      const isMediumViewport = width >= 768 && width < 1024;
      if (isMediumViewport) {
        root.style.overflowX = "hidden";
        body.style.overflowX = "hidden";
      } else {
        root.style.overflowX = "";
        body.style.overflowX = "";
      }
    };

    applyOverflowRule();
    window.addEventListener("resize", applyOverflowRule, { passive: true });
    return () => {
      window.removeEventListener("resize", applyOverflowRule);
      // Cleanup: remove any style overrides
      root.style.overflowX = "";
      body.style.overflowX = "";
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden lg:overflow-x-visible">
      {variant === "Ecomm" ? (
        <EcommBanner />
      ) : (
        <LandingPageHeader bannerData={bannerData} isLoading={isLoadingBanner} />
      )}
      {/* <BannerVarient2 /> */}
      <PartnerLogos />
      {/* Sections (unchanged) */}
      <ClientSection category={variant} counter={bannerData?.counter || 0} CounterText={bannerData?.counter_content || ""} />
      <OldWayNewWay ButtonText={buttonText} />
      {!(variant) && <ForWhom />}
      <FeaturesSection />
      <Counter ButtonText={buttonText} metriccon1Description={bannerData?.metric_content1 || ""} metriccon1Value={bannerData?.metric_value1 || 0} metriccon2Description={bannerData?.metric_content2 || ""} metriccon2Value={bannerData?.metric_value2 || 0} metriccon3Description={bannerData?.metric_content3 || ""} metriccon3Value={bannerData?.metric_value3 || 0} metriccon4Description={bannerData?.metric_content4 || ""} metriccon4Value={bannerData?.metric_value4 || 0} />
      {/* <CounterSection /> */}
      <WorkflowSection />
      <AiAdMistakes category={variant} />
      <Testimonials category={variant} />
      <CaseStudySection category={variant} />
      <FAQSection ButtonText={buttonText} category={variant || "general"} />
      {/* <BlogSection /> */}
      <CTASection ButtonText={buttonText} />
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
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-white touch-manipulation cursor-pointer"
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
              className="fixed bottom-1 right-2 w-[92vw] sm:w-[360px] md:w-[400px] max-w-sm z-50"
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
