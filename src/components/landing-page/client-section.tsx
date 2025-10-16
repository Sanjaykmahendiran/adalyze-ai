'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AwardIcon } from "lucide-react";
import { LazyLoadSection } from '@/components/lazy-load-section';
import { motion } from 'framer-motion';

interface Client {
  client_id: number;
  client_name: string;
  logo_url: string | null;
  website_url: string | null;
}

export default function ClientSection() {
  const [count, setCount] = useState(0)
  const countRef = useRef<HTMLSpanElement>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Fetch dynamic client list
    const fetchClients = async () => {
      try {
        const res = await fetch("https://adalyzeai.xyz/App/api.php?gofor=clientslist")
        const data: Client[] = await res.json()
        setClients(data.filter(c => c.logo_url !== null))
      } catch (err) {
        console.error("Error fetching clients:", err)
      }
    }
    fetchClients()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateCount()
        }
      },
      { threshold: 0.5 }
    )

    if (countRef.current) observer.observe(countRef.current)

    return () => {
      if (countRef.current) observer.unobserve(countRef.current)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) observer.disconnect();
    };
  }, []);

  const animateCount = () => {
    const end = 120000 // Example: number of campaigns analyzed
    const duration = 2000
    const start = performance.now()

    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }

  // Split clients into two rows for scrolling
  const firstRow = clients.slice(0, Math.ceil(clients.length / 2))
  const secondRow = clients.slice(Math.ceil(clients.length / 2))

  return (
    <section className="py-12 md:py-14 bg-[#171717] text-white" ref={containerRef}>
      <div className="container px-4 md:px-6 mx-auto text-center max-w-7xl">
        {/* Badge */}
        <div className="inline-flex items-center border-2 border-[#FF6154] rounded-xl px-3 py-2 text-[#FF6154] bg-[#1A1A1A] mb-12">
          <AwardIcon className="w-6 h-6 mr-2 text-white fill-[gold]" stroke="currentColor" />
          <div className="flex flex-col items-start justify-start gap-1">
            <div className="text-[10px] font-thin uppercase leading-tight text-gray-300">
              AdalyzeAI Platform
            </div>
            <div className="text-sm font-bold leading-tight text-white">
              Trusted by Leading Brands
            </div>
          </div>
        </div>

        {/* Counter */}
        <h3 className="mb-2">
          <span
            ref={countRef}
            className="text-8xl font-bold bg-gradient-to-r from-[#db4900] via-[#ff7c1f] to-[#ffb347] bg-clip-text text-transparent"
          >
            {count.toLocaleString()}
          </span>
          <span className="text-8xl font-bold bg-gradient-to-r from-[#db4900] via-[#ff7c1f] to-[#ffb347] bg-clip-text text-transparent">
            +
          </span>

        </h3>

        <p className="text-xl sm:text-2xl md:text-4xl font-semibold mb-12 sm:mb-16 text-white">
          Ad campaigns analyzed across industries
        </p>

        {/* Scrolling Rows */}
        <div className="space-y-8">
          {/* Row 1: scroll left */}
          <LazyLoadSection className="overflow-hidden h-[40px] sm:h-[48px] lg:h-[64px]">
            <div className="overflow-hidden">
              <div className="flex animate-scroll-left space-x-12 w-max">
                {[...firstRow, ...firstRow].map((company, i) => (
                  <div key={i} className="flex items-center justify-center px-4">
                    {company.logo_url ? (
                      <Image
                        src={company.logo_url}
                        alt={company.client_name}
                        width={160}
                        height={32}
                        sizes="(max-width: 768px) 120px, (max-width: 1024px) 160px, 200px"
                        quality={70}
                        loading="lazy"
                        className="h-[40px] sm:h-[48px] lg:h-[64px] w-auto object-contain opacity-80"
                      />
                    ) : (
                      <span className="text-sm text-gray-300">{company.client_name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </LazyLoadSection>

          {/* Row 2: scroll right */}
          <LazyLoadSection className="overflow-hidden h-[40px] sm:h-[48px] lg:h-[64px]">
            <div className="overflow-hidden">
              <div className="flex animate-scroll-right space-x-12 w-max">
                {[...secondRow, ...secondRow].map((company, i) => (
                  <div key={i} className="flex items-center justify-center px-4">
                    {company.logo_url ? (
                      <Image
                        src={company.logo_url}
                        alt={company.client_name}
                        width={160}
                        height={32}
                        sizes="(max-width: 768px) 120px, (max-width: 1024px) 160px, 200px"
                        quality={70}
                        loading="lazy"
                        className="h-[40px] sm:h-[48px] lg:h-[64px] w-auto object-contain opacity-80"
                      />
                    ) : (
                      <span className="text-sm text-gray-300">{company.client_name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </LazyLoadSection>
        </div>
      </div>

      {/* Scroll Animations */}
      <style jsx>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        @keyframes scrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }

        .animate-scroll-left {
          animation: scrollLeft 40s linear infinite;
        }

        .animate-scroll-right {
          animation: scrollRight 40s linear infinite;
        }

        @media (max-width: 640px) {
          .animate-scroll-left { animation-duration: 60s; }
          .animate-scroll-right { animation-duration: 60s; }
        }
      `}</style>

                  <motion.div
                className="max-w-screen-xl mx-auto border-t border-[#db4900]/40 mt-16"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
            />
            
    </section>
  )
}
