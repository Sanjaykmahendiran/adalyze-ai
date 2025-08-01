"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { ArrowRight, ArrowLeft, Star } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import user1 from "@/assets/login-below/women1.webp"
import user2 from "@/assets/login-below/varma.webp"
import user3 from "@/assets/login-below/santhosh.webp"
import user4 from "@/assets/login-below/sanjay.webp"
import user5 from "@/assets/login-below/women2.webp"
import user6 from "@/assets/login-below/bhai.webp"
import { Button } from "../ui/button";
import { useRouter } from "next/navigation"

export default function TestimonialsSection() {
  const router = useRouter()
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: "trimSnaps",
  })

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setPrevBtnEnabled(emblaApi.canScrollPrev())
    setNextBtnEnabled(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    emblaApi.on("select", onSelect)

    let timeoutId: NodeJS.Timeout

    const autoScroll = () => {
      if (emblaApi && !isPaused) {
        emblaApi.scrollNext()
      }
      timeoutId = setTimeout(autoScroll, 4000)
    }

    timeoutId = setTimeout(autoScroll, 4000)

    return () => clearTimeout(timeoutId)
  }, [emblaApi, onSelect, isPaused])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const testimonials = [
    {
      name: "Lavanya",
      role: "Movie Enthusiast",
      title: "Love the Watch Room!",
      content:
        "Watching movies with friends in Suggesto’s Watch Room is amazing. It feels like a real theater experience—together from anywhere!",
      avatar: user1,
    },
    {
      name: "Varma",
      role: "Cinephile",
      title: "Spot-On Recommendations",
      content:
        "Suggesto’s AI suggestions are incredibly accurate. Every weekend, I have something new to watch that fits my mood perfectly.",
      avatar: user2,
    },
    {
      name: "Santhosh",
      role: "Film Blogger",
      title: "Game-Changer for Movie Nights",
      content:
        "Suggesto made planning movie nights easier. Our group uses it every Friday to pick the perfect film!",
      avatar: user3,
    },
    {
      name: "Sanjay Kumar",
      role: "Binge Watcher",
      title: "My Watch List is Smarter Now",
      content:
        "I used to forget what I wanted to watch. Now Suggesto keeps track and even reminds me about new releases!",
      avatar: user4,
    },
    {
      name: "Akila",
      role: "Family Viewer",
      title: "Great for All Ages",
      content:
        "We use Suggesto as a family. It gives age-appropriate and fun options for kids and adults. No more arguments!",
      avatar: user5,
    },
    {
      name: "Ibrahim",
      role: "Techie + Movie Buff",
      title: "AI at its Best!",
      content:
        "Suggesto’s tech blew me away. The AI learns what I like, and now I discover hidden gems regularly.",
      avatar: user6,
    },
  ]

  return (
    <section className="py-16">
      <div className="container px-4 mx-auto">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Left Section */}
            <div className="lg:w-[30%]">
              <div className="inline-block px-4 py-1.5 rounded-full border border-purple-100 bg-white text-primary text-sm font-medium mb-5">
                User Love
              </div>
              <h2 className="text-[1.75rem] leading-[1.15] font-bold mb-4">
                How Movie Lovers Enjoy Suggesto
              </h2>
              <p className="text-gray-400 mb-10">
                Discover how Suggesto transforms movie nights with AI-powered suggestions and community features.
              </p>

              <Button
                onClick={() => router.push("/download")}
                className="hidden sm:flex items-center gap-2 px-8 py-6 text-white text-lg font-semibold rounded-lg transition-colors"
              >
                Join Our Movie Club
                <ArrowRight className="h-5 w-5" />
              </Button>

              <div className="flex gap-3 mt-10">
                <button
                  onClick={scrollPrev}
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-all"
                  disabled={!prevBtnEnabled}
                >
                  <ArrowLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={scrollNext}
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-all"
                  disabled={!nextBtnEnabled}
                >
                  <ArrowRight className="h-5 w-5 text-primary" />
                </button>
              </div>
            </div>

            {/* Right Section - Testimonials */}
            <div className="lg:w-[70%]">
              <div
                className="overflow-hidden"
                ref={emblaRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="flex">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-4"
                    >
                      <div className="bg-[#2b2b2b] p-6 rounded-xl shadow-sm h-full">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 relative">
                            <Image
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              fill
                              className="rounded-full object-cover"
                              sizes="(max-width: 768px) 48px, 48px"
                              priority
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold">{testimonial.name}</h3>
                            <p className="text-sm text-gray-400">{testimonial.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-5 h-5 fill-yellow-500 text-yellow-500"
                            />
                          ))}
                        </div>
                        <h4 className="font-semibold mb-2">{testimonial.title}</h4>
                        <p className="text-gray-400">{testimonial.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Button */}
              <div className="mt-10 flex justify-center sm:hidden">
                <Button
                  onClick={() => router.push("/download")}
                  className="flex items-center gap-2 px-8 py-6 text-white text-lg font-semibold rounded-lg transition-colors"
                >
                  Join Our Movie Club
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
