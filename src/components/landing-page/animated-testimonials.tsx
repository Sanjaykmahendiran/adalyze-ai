"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
  className,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
  className?: string;
}) => {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const hasValidImage = (src: string) => {
    return src && src.trim() !== '';
  };

  return (
    <div className={cn("max-w-sm md:max-w-5xl mx-auto pt-20", className)}>
      {/* Mobile Layout */}
      <div className="block md:hidden">
        <div className="flex flex-col items-center space-y-6">
          {/* Mobile Image Slider with Preview */}
          <div className="relative w-full max-w-sm">
            <div className="flex items-center justify-center relative">
              {/* Previous Image (Left Side) */}
              <div
                className="absolute left-0 z-10 cursor-pointer"
                onClick={handlePrev}
              >
                <div className="relative w-20 h-20 overflow-hidden">
                  {hasValidImage(testimonials[(active - 1 + testimonials.length) % testimonials.length].src) ? (
                    <Image
                      src={testimonials[(active - 1 + testimonials.length) % testimonials.length].src}
                      alt={testimonials[(active - 1 + testimonials.length) % testimonials.length].name}
                      width={80}
                      height={80}
                      draggable={false}
                      className="h-full w-full rounded-full object-cover object-center opacity-60 hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-primary flex items-center justify-center opacity-60 hover:opacity-80 transition-opacity">
                      <span className="text-white font-bold text-lg">
                        {getInitials(testimonials[(active - 1 + testimonials.length) % testimonials.length].name)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Image (Center) */}
              <div className="relative h-32 w-32 z-20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    {hasValidImage(testimonials[active].src) ? (
                      <Image
                        src={testimonials[active].src}
                        alt={testimonials[active].name}
                        width={128}
                        height={128}
                        draggable={false}
                        className="h-full w-full rounded-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-primary flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">
                          {getInitials(testimonials[active].name)}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next Image (Right Side) */}
              <div
                className="absolute right-0 z-10 cursor-pointer"
                onClick={handleNext}
              >
                <div className="relative w-20 h-20 overflow-hidden">
                  {hasValidImage(testimonials[(active + 1) % testimonials.length].src) ? (
                    <Image
                      src={testimonials[(active + 1) % testimonials.length].src}
                      alt={testimonials[(active + 1) % testimonials.length].name}
                      width={80}
                      height={80}
                      draggable={false}
                      className="h-full w-full rounded-full object-cover object-center opacity-60 hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-primary flex items-center justify-center opacity-60 hover:opacity-80 transition-opacity">
                      <span className="text-white font-bold text-lg">
                        {getInitials(testimonials[(active + 1) % testimonials.length].name)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Content */}
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="text-center"
          >
            <h3 className="text-xl font-bold text-primary mb-2">
              {testimonials[active].name}
            </h3>
            <p className="text-sm text-white mb-4">
              {testimonials[active].designation}
            </p>
            <motion.p className="text-sm text-gray-300 leading-relaxed text-center text-justify tracking-normal leading-relaxed">
              {testimonials[active].quote.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                  animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>

          {/* Mobile Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={handlePrev}
              className="h-10 w-10 rounded-full bg-[#2b2b2b] flex items-center justify-center group/button hover:bg-[#3b3b3b] transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-foreground group-hover/button:rotate-12 transition-transform duration-300" />
            </button>
            <button
              onClick={handleNext}
              className="h-10 w-10 rounded-full bg-[#2b2b2b] flex items-center justify-center group/button hover:bg-[#3b3b3b] transition-colors"
            >
              <ArrowRight className="h-5 w-5 text-foreground group-hover/button:-rotate-12 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <div className="relative h-80 w-full">
              <AnimatePresence>
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.src}
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                      z: -100,
                      rotate: randomRotateY(),
                    }}
                    animate={{
                      opacity: isActive(index) ? 1 : 0.7,
                      scale: isActive(index) ? 1 : 0.95,
                      z: isActive(index) ? 0 : -100,
                      rotate: isActive(index) ? 0 : randomRotateY(),
                      zIndex: isActive(index)
                        ? 90 // active card stays on top
                        : testimonials.length - index, // others stack below
                      y: isActive(index) ? [0, -80, 0] : 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      z: 100,
                      rotate: randomRotateY(),
                    }}
                    transition={{
                      duration: 0.4,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 origin-bottom"
                  >
                    {hasValidImage(testimonial.src) ? (
                      <Image
                        src={testimonial.src}
                        alt={testimonial.name}
                        width={400}
                        height={400}
                        draggable={false}
                        className="h-full w-full rounded-3xl object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full rounded-3xl bg-primary flex items-center justify-center">
                        <span className="text-white font-bold text-4xl">
                          {getInitials(testimonial.name)}
                        </span>
                      </div>
                    )}
                  </motion.div>

                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex justify-between flex-col py-4">
            <motion.div
              key={active}
              initial={{
                y: 20,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -20,
                opacity: 0,
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            >
              <h3 className="text-2xl font-bold text-primary">
                {testimonials[active].name}
              </h3>
              <p className="text-sm text-white">
                {testimonials[active].designation}
              </p>
              <motion.p className="text-base text-gray-300 mt-4 mb-8">
                {testimonials[active].quote.split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{
                      filter: "blur(10px)",
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                      delay: 0.02 * index,
                    }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </motion.p>
            </motion.div>
            <div className="flex gap-4 pt-12 md:pt-0 justify-center">
              <button
                onClick={handlePrev}
                className="h-7 w-7 rounded-full bg-[#2b2b2b] flex items-center justify-center group/button"
              >
                <ArrowLeft className="h-5 w-5 text-foreground group-hover/button:rotate-12 transition-transform duration-300" />
              </button>
              <button
                onClick={handleNext}
                className="h-7 w-7 rounded-full bg-[#2b2b2b] flex items-center justify-center group/button"
              >
                <ArrowRight className="h-5 w-5 text-foreground group-hover/button:-rotate-12 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};