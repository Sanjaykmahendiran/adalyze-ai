"use client";

import { Play, Pause, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import loginlogo from "@/assets/ad-logo.png";
import bgbanner from "@/assets/bgbanner.jpg";
import { Button } from "../ui/button";
import { Arrow } from "@radix-ui/react-select";
import { motion } from "framer-motion";
import { Squares } from "../squares-background";
import image1 from "@/assets/b-1.png";
import image2 from "@/assets/b-2.png";
import image3 from "@/assets/b-3.png";
import image4 from "@/assets/b-4.png";

const words = [
  "Ad Performance Score",
  "AI Feedback",
  "Creative Optimization",
  "Platform Insights",
];

export default function LandingPageHeader() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('down');
  const [lastScrollY, setLastScrollY] = useState(0);

  // Typewriter effect
  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout;
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
  }, [charIndex, wordIndex]);

  // Handle mobile menu resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Intersection observer for video
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Video play/pause toggle
  const togglePlay = async () => {
    if (videoRef.current) {
      try {
        if (videoRef.current.paused) {
          await videoRef.current.play();
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      } catch (error) {
        console.error("Error toggling video playback:", error);
      }
    }
  };

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [isInView]);

  // Video controls visibility
  const handleMouseEnter = () => setShowControls(true);
  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }

      setScrollY(currentScrollY);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <main className="flex flex-col min-h-screen items-center overflow-x-hidden">
      <div className="relative w-full flex flex-col items-center overflow-hidden">

        {/* === Background Gradient + Squares === */}
        <div className="absolute top-0 left-0 w-full h-[90%] md:h-[80%] z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(219,73,0,0.3)] via-[rgba(255,102,0,0.2)] to-[rgba(255,150,50,0.1)] blur-md" />
          <Squares
            direction="diagonal"
            speed={0.5}
            squareSize={40}
            borderColor="#1a1a1a"
            hoverFillColor="#0d0d0d"
          />
        </div>


        {/* === Overlay Layer === */}
        <div className="absolute inset-0 z-0" />

        {/* === Header === */}
        <header className="w-full sticky top-0 z-30 px-4 py-3 overflow-hidden">
          <div className="container mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center flex-shrink-0 min-w-0">
              <Image
                src={loginlogo}
                alt="Adalyze Logo"
                className="object-contain h-12 w-auto max-w-full"
                priority
                draggable={false}
              />
            </Link>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push("/login")}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
              >
                <span className="hidden xs:inline sm:inline">Login</span>
                <span className="xs:hidden sm:hidden">Sign In</span>
              </Button>
              <Button
                onClick={() => router.push("/register")}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                variant="outline"
              >
                <span className="hidden xs:inline sm:inline">Register</span>
                <span className="xs:hidden sm:hidden">Sign Up</span>
              </Button>
            </div>
          </div>
        </header>

        {/* === Hero Content === */}
        <div className="relative z-10 w-full container mx-auto px-4 pt-16 sm:pt-20 pb-10 sm:pb-16 flex flex-col items-center">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-4 rounded-full bg-[#db4900]/10 text-[#db4900] font-medium text-xs sm:text-base">
            AI-Powered Ad Analysis
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white text-center leading-tight max-w-full">
            <div className="break-words">
              Optimize Ads with Real-Time{" "}
              <span className="text-primary font-semibold">AI Insights</span>
            </div>
            <div className="mt-2 break-words">
              <span className="bg-gradient-to-r from-orange-300 via-[#db4900] to-yellow-400 bg-clip-text text-transparent font-semibold inline-block">
                {text}
                <span className={`${isTyping ? "animate-pulse" : "opacity-0"}`}>|</span>
              </span>
            </div>
          </h1>

          <p className="text-base sm:text-xl text-gray-300 text-center mx-auto max-w-3xl mt-6 px-2">
            Adalyze scores your ads across platforms, pinpoints weak spots with
            AI feedback, and gives clear steps to improve performance before
            you launch.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mt-8 px-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <div className="flex flex-col items-center space-y-2 sm:space-y-3 mt-4">
                <Button
                  onClick={() => router.push("/login")}
                  className="flex items-center gap-2 px-8 py-6 text-white text-lg font-semibold rounded-lg transition-colors"
                >
                  Analyze Your Ad
                </Button>
              </div>
            </motion.div>
          </motion.div>

          {/* === Video Section with Floating Images === */}
          <div className="w-full max-w-6xl mx-auto mt-12 sm:mt-16 relative z-10 px-12 sm:px-24">
            <div className="relative flex items-center justify-center w-full">

              {/* === Floating Images Behind Video (Lower Z-Index) === */}
              {/* Top Left Image */}
              <motion.div
                key={`top-left-${scrollDirection}`}
                initial={{
                  opacity: 0.3, // Start with some visibility instead of 0
                  y: 100,
                  x: -50,
                  scale: 0.6,
                  rotate: -30,
                }}
                animate={{
                  opacity: scrollDirection === 'down' ? 1 : 0.3, // Never goes to 0
                  y: scrollDirection === 'down' ? 0 : 100,
                  x: scrollDirection === 'down' ? 0 : -50,
                  scale: scrollDirection === 'down' ? 1 : 0.6,
                  rotate: scrollDirection === 'down' ? -15 : -30,
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute -top-20 -left-24 sm:-top-34 sm:-left-52 z-5 pointer-events-none"
              >
                <div className="relative">
                  <img
                    src={image3.src}
                    alt="Floating Image 1"
                    className="w-32 h-32 sm:w-48 sm:h-48 lg:w-56 lg:h-56 object-cover rounded-3xl shadow-2xl border-2 border-white/20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 rounded-3xl" />
                </div>
              </motion.div>

              {/* Top Right Image */}
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
                  opacity: scrollDirection === 'down' ? 1 : 0.3,
                  y: scrollDirection === 'down' ? 0 : 100,
                  x: scrollDirection === 'down' ? 0 : 50,
                  scale: scrollDirection === 'down' ? 1 : 0.6,
                  rotate: scrollDirection === 'down' ? 12 : 30,
                }}
                transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                className="absolute -top-16 -right-20 sm:-top-30 sm:-right-58 z-5 pointer-events-none"
              >
                <div className="relative">
                  <img
                    src={image1.src}
                    alt="Floating Image 2"
                    className="w-32 h-32 sm:w-48 sm:h-48 lg:w-56 lg:h-56 object-cover rounded-3xl shadow-2xl border-2 border-white/20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 rounded-3xl" />
                </div>
              </motion.div>

              {/* Bottom Left Image */}
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
                  opacity: scrollDirection === 'down' ? 1 : 0.3,
                  y: scrollDirection === 'down' ? 0 : -100,
                  x: scrollDirection === 'down' ? 0 : -50,
                  scale: scrollDirection === 'down' ? 1 : 0.6,
                  rotate: scrollDirection === 'down' ? 8 : 20,
                }}
                transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                className="absolute -bottom-16 -left-36 sm:-bottom-0 sm:-left-52 z-5 pointer-events-none"
              >
                <div className="relative">
                  <img
                    src={image2.src}
                    alt="Floating Image 3"
                    className="w-30 h-30 sm:w-44 sm:h-44 lg:w-52 lg:h-52 object-cover rounded-3xl shadow-2xl border-2 border-white/20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 rounded-3xl" />
                </div>
              </motion.div>

              {/* Bottom Right Image */}
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
                  opacity: scrollDirection === 'down' ? 1 : 0.3,
                  y: scrollDirection === 'down' ? 0 : -100,
                  x: scrollDirection === 'down' ? 0 : 50,
                  scale: scrollDirection === 'down' ? 1 : 0.6,
                  rotate: scrollDirection === 'down' ? -10 : -20,
                }}
                transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                className="absolute -bottom-20 -right-44 sm:-bottom-0 sm:-right-62 z-5 pointer-events-none"
              >
                <div className="relative">
                  <img
                    src={image4.src}
                    alt="Floating Image 4"
                    className="w-36 h-36 sm:w-52 sm:h-52 lg:w-60 lg:h-60 object-cover rounded-3xl shadow-2xl border-2 border-white/20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 rounded-3xl" />
                </div>
              </motion.div>

              {/* === Video Container (Higher Z-Index - In Front) === */}
              <div
                ref={videoContainerRef}
                className="relative w-full group cursor-pointer flex items-center justify-center overflow-hidden aspect-video rounded-3xl z-20 shadow-2xl bg-black/20 backdrop-blur-sm"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={togglePlay}
              >
                {isInView ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover rounded-3xl"
                      poster="https://suggesto.top/uploads/thumbnail.webp"
                      playsInline
                      preload="metadata"
                      src="https://suggesto.top/uploads/video.mp4"
                    />
                    <div
                      className={`absolute inset-0 flex bg-black/30 items-center justify-center transition-all duration-300 ${showControls || !isPlaying ? "opacity-100" : "opacity-0"
                        } rounded-3xl`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay();
                        }}
                        className="bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-4 transition-all duration-200 transform hover:scale-110"
                        aria-label={isPlaying ? "Pause video" : "Play video"}
                      >
                        {isPlaying ? (
                          <Pause className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-8 h-8 text-white ml-1" />
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full aspect-video bg-black/10 animate-pulse rounded-3xl" />
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Extra animation keyframes */}
        <style jsx>{`
          @keyframes slide {
            0% {
              transform: translateX(-100%) skewX(12deg);
            }
            100% {
              transform: translateX(100%) skewX(12deg);
            }
          }
          .animate-slide {
            animation: slide 6s linear infinite;
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(var(--rotation));
            }
            50% {
              transform: translateY(-10px) rotate(var(--rotation));
            }
          }
          
          .float-animation {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      </div>

    </main>
  );
}
