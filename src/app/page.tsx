"use client"

import React, { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { ChevronUp } from "lucide-react"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import Testimonials from "@/components/landing-page/testimonials-section"
import CreateBetter from "@/components/landing-page/createBetter"
import FeaturesSection from "@/components/landing-page/features"
import CTASection from "@/components/landing-page/cta-section"

const LandingPageHeader = dynamic(() => import("@/components/landing-page/landing-header-section"), { ssr: false })
const SocialProofSection = dynamic(() => import("@/components/landing-page/social-proof-section"), { ssr: false })
const OldWayNewWay = dynamic(() => import("@/components/landing-page/oldway-newway"), { ssr: false })
const FAQSection = dynamic(() => import("@/components/landing-page/faq-section"), { ssr: false })
const WorkflowSection = dynamic(() => import("@/components/landing-page/workflow"), { ssr: false })
const LandingPageFooter = dynamic(() => import("@/components/landing-page/landing-page-footer"), { ssr: false })
const FloatingChat = dynamic(() => import("@/components/landing-page/floating-chat"), { ssr: false })

const LandingPage = () => {
  useFetchUserDetails();

  const heroRef = useRef<HTMLDivElement | null>(null);
  const [translateY, setTranslateY] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const direction = currentY > lastScrollY ? "down" : "up";

      setShowScrollToTop(currentY > window.innerHeight);

      if (isHeroVisible) {
        setTranslateY(prev => {
          if (direction === "down") {
            return 0; // slide down out of view
          } else {
            return 100; // slide up into view
          }
        });
      }

      setScrollY(currentY);
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isHeroVisible]);

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

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen">
      <LandingPageHeader />

      {/* Hero Section */}
      <div ref={heroRef} className="relative text-center mt-20 mb-10 overflow-hidden h-[140px] md:h-[180px]">
        <div className="flex items-center justify-center text-6xl md:text-9xl font-bold">
          <span className="text-gray-300 mr-6">Ship</span>
          <span
            className="bg-gradient-to-r from-[#db4900] via-[#ff6a00] to-[#ffc100] bg-clip-text text-transparent inline-block transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateY(${translateY}%)`,
            }}
          >
            faster
          </span>
        </div>
      </div>

      {/* Other Sections */}
      <SocialProofSection />
      <OldWayNewWay />
      <FeaturesSection />
      <CreateBetter />
      <WorkflowSection />
      <Testimonials />
      <FAQSection />
      <CTASection />
      <LandingPageFooter />
      <FloatingChat />

      {/* Scroll to Top */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-14 right-4 bg-white text-black p-2 rounded-full shadow-lg hover:bg-primary-dark"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default LandingPage;
