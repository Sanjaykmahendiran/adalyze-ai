"use client";

import { Play, Pause } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Squares } from "./squares-background";
import image1 from "@/assets/Landing-page/b-1.webp";
import image2 from "@/assets/Landing-page/b-2.webp";
import image3 from "@/assets/Landing-page/b-3.webp";
import image4 from "@/assets/Landing-page/b-4.webp";
import Header from "./header";
import { trackEvent } from "@/lib/eventTracker";

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
}

interface LandingPageHeaderProps {
  bannerData: BannerData | null;
  isLoading: boolean;
}

export default function LandingPageHeader({ bannerData, isLoading }: LandingPageHeaderProps) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState("down");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  // New state and refs for auto-hide functionality
  const [isMouseOverVideo, setIsMouseOverVideo] = useState(false);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mouseMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get typewriter words from bannerData prop
  const words = bannerData
    ? [bannerData.typeword3, bannerData.typeword1, bannerData.typeword4, bannerData.typeword2]
    : ["Loading..."];

  // Set up viewport height tracking for mobile with proper calculations
  useEffect(() => {
    const updateViewportHeight = () => {
      const height = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(height);
    };

    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateViewportHeight);
    }

    return () => {
      window.removeEventListener("resize", updateViewportHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updateViewportHeight);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Typewriter effect (unchanged)
  useEffect(() => {
    if (!bannerData) return;

    const currentWord = words[wordIndex];
    let timeout: NodeJS.Timeout;
    if (charIndex < currentWord.length) {
      setIsTyping(true);
      timeout = setTimeout(() => {
        setText((prev) => prev + currentWord.charAt(charIndex));
        setCharIndex((prev) => prev + 1);
      }, 50);
    } else {
      setIsTyping(false);
      timeout = setTimeout(() => {
        setText("");
        setCharIndex(0);
        setWordIndex((prev) => (prev + 1) % words.length);
        setIsTyping(true);
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, wordIndex, bannerData]); // words derives from bannerData

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        setIsResourcesOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (isMobileMenuOpen && !event.target.closest(".mobile-menu-container")) {
        setIsMobileMenuOpen(false);
        setIsResourcesOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Auto-hide controls functionality (unchanged)
  const startHideControlsTimer = () => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
  };

  const handleMouseMove = () => {
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying) {
      mouseMoveTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  };

  const togglePlay = async () => {
    if (videoRef.current) {
      try {
        if (videoRef.current.paused) {
          await videoRef.current.play();
          setIsPlaying(true);
          startHideControlsTimer();
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
          setShowControls(true);
          if (hideControlsTimeoutRef.current) {
            clearTimeout(hideControlsTimeoutRef.current);
          }
        }
      } catch (error) {
        console.error("Error toggling video playback:", error);
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
      startHideControlsTimer();
    };

    const handlePause = () => {
      setIsPlaying(false);
      setShowControls(true);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsMouseOverVideo(true);
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsMouseOverVideo(false);
    if (isPlaying) {
      startHideControlsTimer();
    }
  };

  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection("up");
      }

      setScrollY(currentScrollY);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  // Loading state (unchanged logic, now driven by props)
  if (isLoading || !bannerData) {
    return (
      <main className="flex flex-col min-h-screen items-center overflow-x-hidden">
        <div className="relative w-full flex flex-col items-center overflow-hidden">
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
          <Header />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-white text-xl"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen items-center overflow-x-hidden">
      <div className="relative w-full flex flex-col items-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[100%] z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(219,73,0,0.3)] via-[rgba(255,102,0,0.2)] to-[rgba(255,150,50,0.1)] blur-md" />
          <Squares
            direction="diagonal"
            speed={0.5}
            squareSize={isMobile ? 20 : 40}
            borderColor="#1a1a1a"
            hoverFillColor="#0d0d0d"
          />
        </div>

        <div className="absolute inset-0 z-0" />

        <Header />

        {isMobile ? (
          <div
            className="relative z-10 w-full flex flex-col mt-8"
            style={{
              minHeight: `${viewportHeight}px`, // total mobile viewport
            }}
          >
            {/* Content section - 80% viewport */}
            <div
              className="flex flex-col items-center justify-center sm:px-4"
              style={{
                minHeight: `${viewportHeight * 0.9}px`,
              }}
            >
              <div className="pt-24 sm:pt-28">
                <div className="flex items-center justify-center px-3 py-1 mb-3 rounded-full bg-[#db4900]/10 text-[#db4900] font-semibold text-base">
                  {bannerData.tagline}
                </div>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-[44px] font-bold tracking-tight text-white text-center leading-snug max-w-full mt-4"
              >
                <div className="leading-snug">
                  {bannerData.heading}{" "}
                  <span className="text-primary font-semibold block sm:inline mt- sm:mt-0">
                    {bannerData.subheading}
                  </span>
                </div>


                <div className="mt-4 px-2 mb-6">
                  <span className="bg-gradient-to-r from-orange-300 via-[#db4900] to-yellow-400 bg-clip-text text-transparent font-bold inline-block text-3xl">
                    {text}
                    <span className={`${isTyping ? "animate-pulse" : "opacity-0"}`}>|</span>
                  </span>
                </div>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="text-lg sm:text-lg text-gray-300 text-center mx-auto max-w-md mt-5 mb-6 px-3 leading-relaxed"
              >
                {bannerData.brief}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 80 }}
                className="flex flex-col items-center mt-6"
              >
                <Button
                  onClick={() => { window.open("/register", "_blank", "noopener,noreferrer"); trackEvent("LP_Banner_RB", window.location.href); }}
                  className="flex items-center cursor-pointer gap-2 px-6 py-6 text-white text-xl font-semibold rounded-lg transition-colors w-full sm:w-auto min-w-[200px]"
                >
                  {bannerData.pcta}
                </Button>
                <div className="flex items-center justify-center gap-2 mt-2 text-white/70 text-sm text-center">
                  <span>{bannerData.scta}</span>
                </div>
              </motion.div>

            </div>
          </div>


        ) : (
          <div className="relative z-10 w-full container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-28 lg:pt-32 xl:pt-38 pb-6 sm:pb-8 md:pb-12 lg:pb-16 flex flex-col items-center">
            <div className="pt-8">
              <div className="flex items-center justify-center px-3 py-0.5 mb-2 rounded-full bg-[#db4900]/10 text-[#db4900] font-medium text-sm">
                {bannerData.tagline}
              </div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-extrabold tracking-tight text-white text-center leading-tight max-w-full"
            >
              <div className="break-words px-1 sm:px-2 md:px-0">
                {bannerData.heading}{" "}
                <span className="text-primary font-semibold block sm:inline mt-1 sm:mt-0">
                  {bannerData.subheading}
                </span>
              </div>

              <div className="mt-2 sm:mt-3 break-words px-1 sm:px-2 md:px-0">
                <span className="bg-gradient-to-r from-orange-300 via-[#db4900] to-yellow-400 bg-clip-text text-transparent font-semibold inline-block text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl">
                  {text}
                  <span className={`${isTyping ? "animate-pulse" : "opacity-0"}`}>
                    |
                  </span>
                </span>
              </div>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 text-center mx-auto max-w-xl sm:max-w-2xl lg:max-w-3xl mt-3 sm:mt-4 md:mt-6 px-2 sm:px-4 md:px-2 leading-relaxed"
            >
              {bannerData.brief}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                type: "spring",
                stiffness: 80,
              }}
              viewport={{ once: true }}
              className="flex flex-col items-center mt-4 sm:mt-6 md:mt-8 px-2 sm:px-4"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex flex-col items-center space-y-2 sm:space-y-3 mt-2 sm:mt-4">
                  <Button
                    onClick={() => { window.open("/register", "_blank", "noopener,noreferrer"); trackEvent("LP_Banner_RB", window.location.href); }}
                    className="flex items-center cursor-pointer gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 lg:py-6 text-white text-sm sm:text-base md:text-lg font-semibold rounded-lg transition-colors w-full sm:w-auto min-w-[180px] sm:min-w-[200px]"
                  >
                    {bannerData.pcta}
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-2 mt-1 text-white/70 text-center text-xs sm:whitespace-nowrap">
                  <span>{bannerData.scta}</span>
                </div>
              </motion.div>
            </motion.div>

            <div className="w-full max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-6xl mx-auto mt-6 sm:mt-8 md:mt-12 lg:mt-16 relative z-10 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-24">
              <div className="relative flex items-center justify-center w-full">
                <>
                  <motion.div
                    key={`top-left-${scrollDirection}`}
                    initial={{
                      opacity: 0.3,
                      y: 100,
                      x: -50,
                      scale: 0.6,
                      rotate: -30,
                    }}
                    animate={{
                      opacity: scrollDirection === "down" ? 1 : 0.3,
                      y: scrollDirection === "down" ? 0 : 100,
                      x: scrollDirection === "down" ? 0 : -50,
                      scale: scrollDirection === "down" ? 1 : 0.6,
                      rotate: scrollDirection === "down" ? -15 : -30,
                    }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute -top-12 md:-top-16 lg:-top-20 xl:-top-34 -left-12 md:-left-16 lg:-left-24 xl:-left-52 z-5 pointer-events-none hidden md:block"
                  >
                    <div className="relative">
                      <img
                        src={image3.src || "/placeholder.svg"}
                        alt="Floating Image 1"
                        className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-48 xl:h-48 2xl:w-56 2xl:h-56 object-cover rounded-xl lg:rounded-2xl xl:rounded-3xl shadow-2xl border-2 border-white/20"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 rounded-xl lg:rounded-2xl xl:rounded-3xl" />
                    </div>
                  </motion.div>

                  <motion.div
                    key={`top-right-${scrollDirection}`}
                    initial={{
                      opacity: 0.3,
                      y: 100,
                      x: 50,
                      scale: 0.6,
                      rotate: 30,
                    }}
                    animate={{
                      opacity: scrollDirection === "down" ? 1 : 0.3,
                      y: scrollDirection === "down" ? 0 : 100,
                      x: scrollDirection === "down" ? 0 : 50,
                      scale: scrollDirection === "down" ? 1 : 0.6,
                      rotate: scrollDirection === "down" ? 12 : 30,
                    }}
                    transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                    className="absolute -top-8 md:-top-12 lg:-top-16 xl:-top-30 -right-8 md:-right-12 lg:-right-20 xl:-right-58 z-5 pointer-events-none hidden md:block"
                  >
                    <div className="relative">
                      <img
                        src={image1.src || "/placeholder.svg"}
                        alt="Floating Image 2"
                        className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-48 xl:h-48 2xl:w-56 2xl:h-56 object-cover rounded-xl lg:rounded-2xl xl:rounded-3xl shadow-2xl border-2 border-white/20"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 rounded-xl lg:rounded-2xl xl:rounded-3xl" />
                    </div>
                  </motion.div>

                  <motion.div
                    key={`bottom-left-${scrollDirection}`}
                    initial={{
                      opacity: 0.3,
                      y: -100,
                      x: -50,
                      scale: 0.6,
                      rotate: 20,
                    }}
                    animate={{
                      opacity: scrollDirection === "down" ? 1 : 0.3,
                      y: scrollDirection === "down" ? 0 : -100,
                      x: scrollDirection === "down" ? 0 : -50,
                      scale: scrollDirection === "down" ? 1 : 0.6,
                      rotate: scrollDirection === "down" ? 8 : 20,
                    }}
                    transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                    className="absolute -bottom-4 md:-bottom-8 lg:-bottom-16 xl:-bottom-0 -left-12 md:-left-20 lg:-left-36 xl:-left-52 z-5 pointer-events-none hidden md:block"
                  >
                    <div className="relative">
                      <img
                        src={image2.src || "/placeholder.svg"}
                        alt="Floating Image 3"
                        className="w-14 h-14 md:w-20 md:h-20 lg:w-30 lg:h-30 xl:w-44 xl:h-44 2xl:w-52 2xl:h-52 object-cover rounded-xl lg:rounded-2xl xl:rounded-3xl shadow-2xl border-2 border-white/20"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 rounded-xl lg:rounded-2xl xl:rounded-3xl" />
                    </div>
                  </motion.div>

                  <motion.div
                    key={`bottom-right-${scrollDirection}`}
                    initial={{
                      opacity: 0.3,
                      y: -100,
                      x: 50,
                      scale: 0.6,
                      rotate: -20,
                    }}
                    animate={{
                      opacity: scrollDirection === "down" ? 1 : 0.3,
                      y: scrollDirection === "down" ? 0 : -100,
                      x: scrollDirection === "down" ? 0 : 50,
                      scale: scrollDirection === "down" ? 1 : 0.6,
                      rotate: scrollDirection === "down" ? -10 : -20,
                    }}
                    transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                    className="absolute -bottom-8 md:-bottom-12 lg:-bottom-20 xl:-bottom-0 -right-16 md:-right-24 lg:-right-44 xl:-right-62 z-5 pointer-events-none hidden md:block"
                  >
                    <div className="relative">
                      <img
                        src={image4.src || "/placeholder.svg"}
                        alt="Floating Image 4"
                        className="w-18 h-18 md:w-28 md:h-28 lg:w-36 lg:h-36 xl:w-52 xl:h-52 2xl:w-60 2xl:h-60 object-cover rounded-xl lg:rounded-2xl xl:rounded-3xl shadow-2xl border-2 border-white/20"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 rounded-xl lg:rounded-2xl xl:rounded-3xl" />
                    </div>
                  </motion.div>
                </>

                <div
                  ref={videoContainerRef}
                  className="relative w-full group cursor-pointer flex items-center justify-center overflow-hidden aspect-video rounded-xl sm:rounded-2xl md:rounded-3xl z-20 shadow-2xl bg-black/20 backdrop-blur-sm"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                  onClick={togglePlay}
                >
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover rounded-xl sm:rounded-2xl md:rounded-3xl"
                    poster="https://adalyze.app/uploads/thumbnail.webp"
                    playsInline
                    preload="metadata"
                    {...({ fetchPriority: "high" } as React.VideoHTMLAttributes<HTMLVideoElement>)}
                  >
                    <source src="https://adalyze.app/uploads/video.mp4" type="video/mp4" />
                  </video>
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{
                      opacity: showControls ? 1 : 0
                    }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 flex items-center justify-center rounded-xl sm:rounded-2xl md:rounded-3xl"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-2 sm:p-3 md:p-4 transition-all duration-200 transform hover:scale-110"
                      aria-label={isPlaying ? "Pause video" : "Play video"}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                      ) : (
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white ml-0.5 sm:ml-1" />
                      )}
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
