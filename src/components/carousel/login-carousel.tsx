'use client';

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Background from "@/assets/carousel/bg.webp";
import Imageone from "@/assets/carousel/img-1.webp";
import Imagetwo from "@/assets/carousel/img-2.webp";
import Imagethree from "@/assets/carousel/img-3.webp";
import Imagefour from "@/assets/carousel/img-4.webp";
import Imagefive from "@/assets/carousel/img-5.webp";

const slides = [
  {
    image: Imageone,
    title: "Upload Your Resume for Analysis",
    description:
      "Upload your resume to AdalyzeAIfor scoring, analysis, and improvement tips to boost your visibility to recruiters.",
  },
  {
    image: Imagetwo,
    title: "Build ATS-Friendly Resumes Easily",
    description:
      "Use Adalyze’s AI Resume Builder to create optimized resumes that pass Applicant Tracking Systems and stand out.",
  },
  {
    image: Imagethree,
    title: "Tailored Interview Preparation Tools",
    description:
      "Access tailored tools like a Tell Me About Yourself generator, common questions, and a mock interview.",
  },
  {
    image: Imagefour,
    title: "Take Quizzes and Review FAQs",
    description:
      "AdalyzeAIcreates role-based quizzes and FAQs to help you prepare for interviews and job-specific challenges.",
  },
  {
    image: Imagefive,
    title: "Practice AI-Powered Mock Interviews",
    description:
      "Simulate interviews with real-time AI feedback on your answers, tone, and readiness to help you excel.",
  },
];

export default function LoginCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleNext = useCallback(() => {
    if (api) {
      api.scrollNext();
    }
  }, [api]);

  const handlePrevious = useCallback(() => {
    if (api) {
      api.scrollPrev();
    }
  }, [api]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [handleNext]);

  return (
    <div className="hidden md:block relative w-full h-screen overflow-hidden">
      <Image
        src={Background}
        alt="Background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0" /> {/* Semi-transparent white overlay */}
      <Carousel
        setApi={setApi}
        className="w-full h-full"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="h-screen">
              <div className="relative h-full flex flex-col items-center justify-between">
                {/* Image container taking up most of the space */}
                <div className="relative w-full h-[70%]">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    style={{
                      objectFit: "contain",
                      objectPosition: "center center",
                    }}
                    priority={index === 0}
                    quality={100}
                  />
                </div>
                {/* Content at the bottom left */}
                <div className="absolute bottom-16 left-16 max-w-xl z-10">
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#9963ea] to-[#6e66ed] bg-clip-text text-transparent">
                    {slide.title}
                  </h2>
                  <p className="text-sm text-[#2e2e2e]">{slide.description}</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Centered dots at the bottom */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === current ? "bg-[#9963ea] w-8" : "bg-gray-300"
              )}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <CarouselPrevious onClick={handlePrevious} className="absolute left-4 top-1/2 -translate-y-1/2 z-20" />
        <CarouselNext onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-20" />
      </Carousel>
    </div>
  );
}

