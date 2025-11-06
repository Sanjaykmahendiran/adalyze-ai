import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { trackEvent } from "@/lib/eventTracker"
interface FAQItem {
  faq_id: number;
  question: string;
  answer: string;
  category: string;
  status: number;
  created_date: string;
}

const FAQSection: React.FC<{ ButtonText: string, category: string }> = ({ ButtonText, category = "General" }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const accordionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Fetch FAQ data from API
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=prefaqlist&category=${category}`);

        if (!response.ok) {
          throw new Error('Failed to fetch FAQs');
        }

        const data: FAQItem[] = await response.json();
        setFaqs(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching FAQs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  // Intersection Observer for scroll animations (both directions)
  useEffect(() => {
    if (faqs.length === 0) return;

    const observers: IntersectionObserver[] = [];

    accordionRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                // Add to visible items with stagger delay
                setTimeout(() => {
                  setVisibleItems((prev) => {
                    if (!prev.includes(index)) {
                      return [...prev, index];
                    }
                    return prev;
                  });
                }, index * 100);
              } else {
                // Remove from visible items when scrolling out of view
                setVisibleItems((prev) => prev.filter((i) => i !== index));
              }
            });
          },
          {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
          }
        );

        observer.observe(ref);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [faqs]);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getAnimationStyle = (index: number) => {
    const isVisible = visibleItems.includes(index);

    let opacity = 0.1;
    let scale = 0.75;

    if (isVisible) {
      opacity = 1;
      scale = 1;
    } else if (index === 0) {
      opacity = 0.98893;
      scale = 1.0957;
    } else if (index === 1) {
      opacity = 0.640918;
      scale = 0.960357;
    } else if (index === 2) {
      opacity = 0.251794;
      scale = 0.809031;
    }

    return {
      opacity,
      transform: `scale(${scale})`,
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  return (
    <section className="relative px-[8%] py-20 block ">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="flex flex-col">
            <div className="mb-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#db4900] bg-[#171717] mb-4">
                <HelpCircle className="w-4 h-4 text-[#db4900]" />
                <span className="text-[#db4900] uppercase text-sm font-medium">questions</span>
              </div>

              {/* Title */}
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                In case you missed anything
              </h2>

              {/* CTA Button */}
              <button className="inline-flex items-center gap-2 text-lg text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 bg-[#db4900] hover:bg-orange-700"
                onClick={() => {
                  trackEvent("LP_FAQ_button_clicked", window.location.href);
                }}
              >
                {ButtonText}
              </button>
            </div>
          </div>

          {/* Right Column - Accordion */}
          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#db4900]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-950 border border-red-800 rounded-lg p-6 text-center">
                <p className="text-red-400 font-medium">Failed to load FAQs</p>
                <p className="text-red-500 text-sm mt-2">{error}</p>
              </div>
            ) : faqs.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
                <p className="text-zinc-400">No FAQs available at the moment.</p>
              </div>
            ) : (
              faqs.map((faq, index) => (
                <div
                  key={faq.faq_id}
                  ref={(el) => { accordionRefs.current[index] = el; }}
                  style={getAnimationStyle(index)}
                  className="rounded-lg bg-black transition-all duration-300 hover:bg-[#db4900]/20 origin-top"
                >
                  <button
                    onClick={() => {
                      toggleAccordion(index);
                      trackEvent("LP_FAQ_button_clicked", window.location.href);
                    }}
                    className="w-full flex items-start justify-between p-6 text-left"
                  >
                    <h5
                      className={`text-lg font-semibold pr-4 transition-colors duration-200 ${openIndex === index ? "text-[#db4900]" : "text-white/80"
                        }`}
                    >
                      {index + 1}. {faq.question}
                    </h5>
                    <ChevronDown
                      className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${openIndex === index
                        ? "rotate-180 text-[#db4900]"
                        : "text-white/80"
                        }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                      }`}
                  >
                    <p className="px-6 pb-6 text-white/80 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;