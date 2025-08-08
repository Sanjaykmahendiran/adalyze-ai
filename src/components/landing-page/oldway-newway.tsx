import React from 'react';
import Image from 'next/image';
import workflow1 from "@/assets/old-way.jpg";
import workflow2 from "@/assets/New-way.jpg";
import workflow3 from "@/assets/step3.png";
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const WorkflowSection = () => {
  const router = useRouter();
  const steps = [
    {
      stepNumber: "01",
      title: "Before Adalyze: Creative Guesswork",
      image: workflow1,
      alt: "Struggling with ad results",
      features: [
        "No clear feedback or performance score",
        "Wasted budget on low-performing ads",
        "Time-consuming manual analysis"
      ]
    },
    {
      stepNumber: "02",
      title: "After Adalyze AI: Data-Driven Clarity",
      image: workflow2,
      alt: "AI-enhanced ad analysis and insights",
      features: [
        "Instant AI-powered performance score",
        "Actionable creative insights",
        "Data-backed optimization suggestions"
      ]
    }
  ];


  return (
    <section className="relative py-20 mt-6 mb-6">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center py-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
            How Adalyze Works – <span className='text-[#db4900]'>Smart, Data-Driven Optimization</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            From uploading your ad to iterating with AI feedback — turn every creative into a high-performing campaign with Adalyze.
          </p>
        </div>

        {/* Updated Steps Container */}
        <div className="relative mt-10">
          {steps.map((step, index) => (
            <div
              key={index}
              className="sticky top-30 gap-10 flex items-center justify-center"
              style={{ zIndex: index + 1 }}
            >
              <div
                className="relative rounded-3xl overflow-hidden mt-10 w-full max-w-6xl mx-auto h-[600px]"
              >
                {/* Full Background Image Container */}
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={step.image || "/placeholder.svg"}
                    alt={step.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 1200px"
                  />
                  {/* Dark overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/40"></div>
                </div>

                {/* Text Content Container */}
                <div className="relative z-10 h-full flex items-center justify-start pl-8 md:pl-16">
                  <div className="bg-[#121212] backdrop-blur-sm rounded-2xl p-8 md:p-10 max-w-lg shadow-2xl border border-white/20">

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#db4900] to-[#b71c1c] bg-clip-text text-transparent leading-tight">
                      {step.title}
                    </h2>

                    {/* Feature highlights */}
                    <div className="space-y-3 mt-6">
                      {step.features?.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-2xl">✨</span>
                          <span className="text-gray-200 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
      </div>
    </section>
  );
};

export default WorkflowSection;