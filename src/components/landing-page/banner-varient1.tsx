"use client";

import React, { useEffect, useState } from 'react';
import { Play, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { trackEvent } from "@/lib/eventTracker";
import { Squares } from "./squares-background";
import Header from "./header";
import Sample1 from "@/assets/1-sample.webp";
import Sample2 from "@/assets/2-sample.webp";
import Sample3 from "@/assets/3-sample.webp";
import Sample4 from "@/assets/4-sample.webp";
import Sample5 from "@/assets/5-sample.webp";
import cart from "@/assets/Landing-page/ecomm-variant/cart.webp";
import OfferTag from "@/assets/Landing-page/ecomm-variant/offer-tag.webp";
import { StaticImageData } from 'next/image';

interface CounterBoxProps {
  value: string;
  suffix: string;
  label: string;
  duration: number;
}

const CounterBox: React.FC<CounterBoxProps> = ({ value, suffix, label, duration }) => (
  <div
    className="transform transition-all hover:scale-105 text-center"
    data-aos="fade-left"
    data-aos-duration={duration}
  >
    <h3 className="text-3xl sm:text-4xl font-bold text-white mb-1">
      {value}{suffix}
    </h3>
    <p className="text-sm sm:text-base text-white/80">{label}</p>
  </div>
);

interface ServiceCardProps {
  image: StaticImageData;
  alt: string;
  duration: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ image, alt, duration }) => (
  <div
    className="relative group transform transition-all hover:scale-110 hover:z-10"
    data-aos="fade-up"
    data-aos-duration={duration}
  >
    <div className="w-62 h-82 rounded-full overflow-hidden shadow-xl border-4 border-white">
      <img
        src={image.src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  </div>
);

const CriminalDefenseHero: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const servicesSectionRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showVideoModal) {
        setShowVideoModal(false);
      }
    };
    
    if (showVideoModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showVideoModal]);

  useEffect(() => {
    let rafId: number;
    let lastScrollPosition = window.scrollY;
    let baseOffset = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollPosition;
      const direction = scrollDelta > 0 ? "down" : "up";

      if (servicesSectionRef.current) {
        const rect = servicesSectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const sectionTop = rect.top;

        if (sectionTop < windowHeight * 2 && sectionTop > -rect.height) {
          const deltaMultiplier = 0.5;
          const offsetChange =
            direction === "up"
              ? Math.abs(scrollDelta) * deltaMultiplier
              : -Math.abs(scrollDelta) * deltaMultiplier;

          baseOffset += offsetChange;
          baseOffset = Math.max(-150, Math.min(150, baseOffset));
          setParallaxOffset(baseOffset);
        } else if (baseOffset !== 0) {
          baseOffset = 0;
          setParallaxOffset(0);
        }
      }

      lastScrollPosition = currentScrollY;
    };

    const optimizedScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", optimizedScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", optimizedScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-slow-spin { animation: slow-spin 8s linear infinite; }
      `}</style>

      {/* HERO SECTION */}
      <div className="relative min-h-screen overflow-hidden flex flex-col bg-[#171717]">
        {/* Background */}
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(219,73,0,0.3)] via-[rgba(255,102,0,0.2)] to-[rgba(255,150,50,0.1)] blur-md" />
          <Squares
            direction="diagonal"
            speed={0.5}
            squareSize={isMobile ? 20 : 40}
            borderColor="#1a1a1a"
            hoverFillColor="#0d0d0d"
          />
        </div>

        {/* Header */}
        <Header />

        {/* Content */}
        <div className="container mx-auto relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 md:px-10 py-10 sm:py-16 lg:py-20 mt-10 pt-30 sm:pt-32 md:pt-36 lg:pt-28">
          <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl gap-10">

            {/* Left Decorative */}
            <div className="hidden lg:flex justify-center lg:justify-start w-full lg:w-2/12" data-aos="fade-right" data-aos-duration={800}>
              <img src={OfferTag.src} alt="Offer" className="animate-slow-spin w-24 sm:w-32 md:w-40" />
            </div>

            {/* Center Text */}
            <div className="text-center lg:text-center w-full lg:w-8/12 ">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight" data-aos="fade-up" data-aos-duration={800}>
                Smarter E-Commerce Ads,{" "}
                <span className="relative inline-block">
                  <img src={cart.src} alt="cart" className="hidden lg:inline-block absolute -top-10 -right-20 w-16 h-16" />
                </span>
                Higher{" "}
                <button 
                  onClick={() => {
                    setShowVideoModal(true);
                    trackEvent("LP_Play_Video_button_clicked", window.location.href);
                  }}
                  className="inline-flex items-center gap-2 align-middle bg-primary hover:bg-primary/80 px-5 py-2 sm:px-6 sm:py-3 rounded-full transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
                >
                  <span className="bg-white rounded-full p-2">
                    <Play className="w-4 h-4 text-primary fill-primary" />
                  </span>
                  <span className="font-semibold">Play</span>
                </button>{" "}
                Conversions
              </h1>

              <p className="text-gray-300 text-base sm:text-lg mb-8 max-w-2xl mx-auto" data-aos="fade-up" data-aos-duration={1000}>
                Transform your e-commerce ad performance with AI-driven analysis. Adalyze AI scans your creatives, identifies weak spots, and predicts CTR impact — helping you launch high-performing product campaigns that actually convert.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center" data-aos="fade-up" data-aos-duration={1200}>
                <Button
                  onClick={() => {
                    window.open("/register", "_blank", "noopener,noreferrer");
                    trackEvent("LP_Start_Free_Trial_button_clicked", window.location.href);
                  }}
                  className="flex items-center justify-center text-base sm:text-lg py-4 sm:py-5 cursor-pointer text-white font-semibold  rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  Try Adalyze AI Free
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
                </Button>
              </div>
            </div>

            {/* Right Counter */}
            <div className="w-full lg:w-2/12 flex justify-center lg:justify-end">
              <div className="space-y-6 sm:space-y-10 text-center lg:text-right">
                <CounterBox value="89" suffix="%" label="CTR Improvement" duration={800} />
                <CounterBox value="1.2" suffix="K+" label="Ad Campaigns Analyzed" duration={1000} />
                <CounterBox value="35" suffix="%" label="Reduced Ad Spend" duration={1200} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SERVICES SECTION (Hidden on Mobile) */}
      <div
        ref={servicesSectionRef}
        className="py-16 hidden md:block"
        style={{
          transform: `translate3d(0, ${parallaxOffset}px, 0)`,
          willChange: "transform",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center items-center gap-0 -space-x-8 md:-space-x-12 lg:-space-x-16">
              <ServiceCard image={Sample1} alt="Service 1" duration={600} />
              <ServiceCard image={Sample2} alt="Service 2" duration={800} />
              <ServiceCard image={Sample3} alt="Service 3" duration={1000} />
              <ServiceCard image={Sample4} alt="Service 4" duration={1200} />
              <ServiceCard image={Sample5} alt="Service 5" duration={1400} />
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4  md:pt-20"
          onClick={() => setShowVideoModal(false)}
        >
          <div 
            className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-all"
              aria-label="Close video"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Video player */}
            <video
              className="w-full h-full"
              controls
              autoPlay
              src="https://adalyze.app/uploads/video.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </>
  );
};

export default CriminalDefenseHero;

