"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const words = ["Impact", "Growth", "Success"]; // words that scroll

const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement | null>(null);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;

    const rect = heroRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Trigger next word when hero is centered in viewport
    if (rect.top < viewportHeight / 2 && rect.bottom > viewportHeight / 2) {
      const scrollThreshold = rect.height / words.length;
      if (scrollY > scrollThreshold * (currentWordIndex + 1)) {
        setCurrentWordIndex((prev) =>
          prev < words.length - 1 ? prev + 1 : prev
        );
      }
    }
  }, [scrollY, currentWordIndex]);

  return (
    <div
      ref={heroRef}
      className="relative flex items-center justify-center min-h-screen text-center"
    >
      {/* Fixed left word */}
      <div className="text-5xl sm:text-6xl md:text-7xl font-bold mr-4 text-gray-300">
        Boost
      </div>

      {/* Scroll/animated words */}
      <div className="overflow-hidden h-[80px] sm:h-[100px] md:h-[120px] flex items-center">
        {words.map((word, i) => (
          <motion.div
            key={word}
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: i === currentWordIndex ? 1 : 0,
              y: i === currentWordIndex ? 0 : -50,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#db4900] via-[#ff6a00] to-[#ffc100]"
          >
            {word}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
