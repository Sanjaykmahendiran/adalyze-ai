'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

const testimonialData = [
  {
    mainQuote: "Andalye helped me launch a beautiful site in minutes. It’s the most seamless design experience I’ve ever had.",
    author: {
      name: "Neha Varma",
      title: "Founder, StartupNest",
      image: "https://randomuser.me/api/portraits/women/6.jpg"
    },
    reviews: [
      {
        text: "Andalye’s interface is smooth and intuitive. I created a full website with just one prompt. The customization tools are incredibly powerful and flexible.",
        name: "Ravi Patel",
        rating: 5
      },
      {
        text: "The best AI design tool out there. I’ve tried many platforms, but Andalye stands out for its simplicity and creative output. Love how fast it gets things done.",
        name: "Lena Schmidt",
        rating: 5
      },
      {
        text: "Quick setup and amazing results. Andalye saved me hours of work and the outcome was better than what I expected from traditional dev routes.",
        name: "Carlos Mendes",
        rating: 5
      }
    ]
  },
  {
    mainQuote: "With Andalye, it feels like I have a full design team working alongside me – at a fraction of the cost.",
    author: {
      name: "Ishaan Desai",
      title: "Product Manager, Launchly",
      image: "https://randomuser.me/api/portraits/women/5.jpg"
    },
    reviews: [
      {
        text: "Andalye changed how I think about launching products. I can test ideas and create polished landing pages instantly. It’s a game-changer for solo founders.",
        name: "Priya Khanna",
        rating: 5
      },
      {
        text: "Everything just works. From prompt to page, Andalye delivers clean, modern, and responsive designs. It's like magic for people who don't code.",
        name: "Tom Nguyen",
        rating: 5
      },
      {
        text: "Super easy to learn, and the support team is top-notch. I’ve used Andalye for multiple client projects and it's now my go-to platform.",
        name: "Melissa Ray",
        rating: 5
      }
    ]
  },
  {
    mainQuote: "Andalye has redefined speed and quality in web development. From idea to live site, it’s just minutes.",
    author: {
      name: "Aarav Mehta",
      title: "Design Lead, Visionary",
      image: "https://randomuser.me/api/portraits/men/7.jpg"
    },
    reviews: [
      {
        text: "Impressive design intelligence. Andalye generates layouts that actually follow good UX practices – something I rarely see in other tools.",
        name: "Sophie Tan",
        rating: 5
      },
      {
        text: "Fits perfectly into our agency workflow. We now prototype faster, iterate better, and deliver on time every time thanks to Andalye.",
        name: "Marcus Lee",
        rating: 5
      },
      {
        text: "The value is unmatched. Andalye cuts down dev costs and still gives our clients premium-quality web pages. Total win.",
        name: "Elena Petrova",
        rating: 5
      }
    ]
  }
]

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonialData.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonialData.length) % testimonialData.length)
  }

  const currentTestimonial = testimonialData[currentIndex]

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      
      {/* ✅ Static Main Section Heading */}
      <h2 className="text-center text-4xl md:text-5xl font-bold text-primary mb-12 leading-tight">
        What our customers say
      </h2>

      {/* ✅ Carousel Quote from Current Index */}
      <div className="text-center mb-12">
        <h3 className="text-2xl md:text-3xl text-white font-medium mb-8 leading-tight">
          "{currentTestimonial.mainQuote}"
        </h3>

        {/* Author Profile */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="relative">
            <Image
              src={currentTestimonial.author.image || "/placeholder.svg"}
              alt={currentTestimonial.author.name}
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
          </div>
          <div className="text-left">
            <h4 className="text-xl font-semibold text-white">
              {currentTestimonial.author.name}
            </h4>
            <p className="text-gray-300 flex items-center gap-2">
              {currentTestimonial.author.title}
              {currentTestimonial.author.name === "Jijo Sunny" && (
                <span className="text-2xl">☕</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {currentTestimonial.reviews.map((review, index) => (
          <div key={index} className="space-y-4">
            <p className="text-gray-300 leading-relaxed">{review.text}</p>

            <div className="space-y-2">
              <h4 className="font-semibold text-white">{review.name}</h4>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className="w-4 h-4 fill-[#db4900] text-[#db4900]"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-white">
                  {review.rating}/5 Rating
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center gap-4 mt-12">
        <Button
          variant="outline"
          size="icon"
          onClick={prevTestimonial}
          className="rounded-full h-12 w-12 border-gray-600"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </Button>

        <div className="flex gap-2">
          {testimonialData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={nextTestimonial}
          className="rounded-full h-12 w-12 border-gray-600"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </Button>
      </div>
    </div>
  )
}
