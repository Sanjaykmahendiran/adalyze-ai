'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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

export default function ClientSection({ category, counter, CounterText }: { category: string, counter: number, CounterText: string }) {
  const [count, setCount] = useState(0)
  const countRef = useRef<HTMLSpanElement>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Helper function to validate and normalize logo URLs (handles various lengths/formats)
  const validateLogoUrl = (url: string | null): string | null => {
    if (!url || typeof url !== 'string') return null;
    
    // Trim whitespace and validate URL format
    const trimmedUrl = url.trim();
    if (trimmedUrl.length === 0) return null;
    
    // Handle various URL formats: absolute, relative, with/without protocol
    try {
      // If it's already a valid URL, return as is
      if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://') || trimmedUrl.startsWith('//')) {
        return trimmedUrl;
      }
      // If it's a relative path starting with /, return as is
      if (trimmedUrl.startsWith('/')) {
        return trimmedUrl;
      }
      // If it looks like a URL without protocol, add https://
      if (trimmedUrl.includes('.')) {
        return `https://${trimmedUrl}`;
      }
      // Otherwise, assume it's a relative path
      return trimmedUrl;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // Fetch dynamic client list
    const fetchClients = async () => {
      try {
        const url = category
          ? `https://adalyzeai.xyz/App/tapi.php?gofor=clientslist&category=${encodeURIComponent(category)}`
          : `https://adalyzeai.xyz/App/tapi.php?gofor=clientslist`;
        const response = await fetch(url)
        const data = await response.json()
        // Validate and filter clients with valid logo URLs (handles URLs of any length/format)
        const validClients = data
          .map((c: Client) => ({
            ...c,
            logo_url: validateLogoUrl(c.logo_url)
          }))
          .filter((c: Client) => c.logo_url !== null)
        setClients(validClients)
      } catch (err) {
        console.error("Error fetching clients:", err)
      }
    }
    fetchClients()
  }, [])

  const animateCount = useCallback(() => {
    // Handle counter values with 2-6 digits (or any number of digits like 120000)
    // Parse counter - handle both string and number types
    const parsedCounter = typeof counter === 'string' 
      ? parseInt(counter, 10) 
      : Number(counter);
    const end = Math.max(0, isNaN(parsedCounter) ? 0 : parsedCounter)
    
    // If counter is 0 or invalid, set it immediately
    if (end === 0) {
      setCount(0)
      return
    }
    
    const duration = 2000
    const start = performance.now()

    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1)
      // Ensure we reach the exact end value, regardless of digit count (2, 3, 4, 5, 6, or more digits)
      const currentCount = Math.floor(progress * end)
      setCount(currentCount)
      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        // Ensure final value matches exactly (e.g., 120000)
        setCount(end)
      }
    }

    requestAnimationFrame(step)
  }, [counter])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateCount()
          observer.disconnect() // Only animate once
        }
      },
      { threshold: 0.5 }
    )

    if (countRef.current) {
      // Check if element is already visible (in case it loads in viewport)
      const rect = countRef.current.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0
      
      if (isVisible) {
        // If already visible, animate immediately
        animateCount()
      } else {
        // Otherwise, observe for when it comes into view
        observer.observe(countRef.current)
      }
    }

    return () => {
      if (countRef.current) observer.unobserve(countRef.current)
      observer.disconnect()
    }
  }, [animateCount])

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

  // Split clients into two rows for scrolling
  // If 8 or fewer logos, show only in first line
  // If more than 8 logos, show in two lines
  const showTwoRows = clients.length > 8
  const firstRow = showTwoRows 
    ? clients.slice(0, Math.ceil(clients.length / 2))
    : clients
  const secondRow = showTwoRows 
    ? clients.slice(Math.ceil(clients.length / 2))
    : []

  return (
    <section className="py-12 md:py-14 bg-[#171717] text-white" ref={containerRef}>
      <div className="container px-4 md:px-6 mx-auto text-center max-w-7xl">
        {/* Badge */}
        <div className="inline-flex items-center border-2 border-[#FF6154] rounded-xl px-3 py-2 text-[#FF6154] bg-[#1A1A1A] mb-12">
          <AwardIcon className="w-6 h-6 mr-2 text-white fill-[gold]" stroke="currentColor" />
          <div className="flex flex-col items-start justify-start gap-1">
            <h2 className="text-[10px] font-thin uppercase leading-tight text-gray-300">
              Adalyze AI Platform
            </h2>
            <h2 className="text-sm font-bold leading-tight text-white">
              Trusted by Leading Brands
            </h2>
          </div>
        </div>

        {/* Counter */}
        <h3 className="mb-2">
          <span
            ref={countRef}
            className="text-7xl sm:text-8xl xl:text-9xl font-bold bg-gradient-to-r from-[#db4900] via-[#ff7c1f] to-[#ffb347] bg-clip-text text-transparent"
          >
            {count.toLocaleString()}
          </span>
          <span className="text-7xl sm:text-8xl xl:text-9xl font-bold bg-gradient-to-r from-[#db4900] via-[#ff7c1f] to-[#ffb347] bg-clip-text text-transparent">
            +
          </span>

        </h3>

        <p className="text-xl sm:text-2xl md:text-4xl font-semibold mb-12 sm:mb-16 text-white">
          {CounterText}
        </p>

        {/* Scrolling Rows */}
        <div className="space-y-8">
          {/* Row 1: scroll left */}
          <LazyLoadSection className="overflow-hidden h-[40px] sm:h-[48px] lg:h-[64px]">
            <div className="overflow-hidden">
              <div className="flex animate-scroll-left space-x-12 w-max">
                {[...firstRow, ...firstRow].map((company, i) => {
                  const uniqueKey = `${company.client_id}-${i}`;
                  const hasError = imageErrors.has(company.client_id);
                  return (
                    <div key={uniqueKey} className="flex items-center justify-center px-4">
                      {company.logo_url && !hasError ? (
                        <Image
                          src={company.logo_url}
                          alt={company.client_name}
                          width={160}
                          height={32}
                          sizes="(max-width: 768px) 120px, (max-width: 1024px) 160px, 200px"
                          loading="lazy"
                          className="h-[40px] sm:h-[48px] lg:h-[64px] w-auto object-contain opacity-80"
                          onError={() => {
                            setImageErrors(prev => new Set([...prev, company.client_id]));
                          }}
                        />
                      ) : (
                        <span className="text-sm text-gray-300 whitespace-nowrap">{company.client_name}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </LazyLoadSection>

          {/* Row 2: scroll right - Only show if more than 8 logos */}
          {showTwoRows && (
            <LazyLoadSection className="overflow-hidden h-[40px] sm:h-[48px] lg:h-[64px]">
              <div className="overflow-hidden">
                <div className="flex animate-scroll-right space-x-12 w-max">
                  {[...secondRow, ...secondRow].map((company, i) => {
                    const uniqueKey = `${company.client_id}-${i}`;
                    const hasError = imageErrors.has(company.client_id);
                    return (
                      <div key={uniqueKey} className="flex items-center justify-center px-4">
                        {company.logo_url && !hasError ? (
                          <Image
                            src={company.logo_url}
                            alt={company.client_name}
                            width={160}
                            height={32}
                            sizes="(max-width: 768px) 120px, (max-width: 1024px) 160px, 200px"
                            loading="lazy"
                            className="h-[40px] sm:h-[48px] lg:h-[64px] w-auto object-contain opacity-80"
                            onError={() => {
                              setImageErrors(prev => new Set([...prev, company.client_id]));
                            }}
                          />
                        ) : (
                          <span className="text-sm text-gray-300 whitespace-nowrap">{company.client_name}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </LazyLoadSection>
          )}
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
