import React from 'react';
import Image from 'next/image';
import workflow1 from "@/assets/step1.png";
import workflow2 from "@/assets/step2.png";
import workflow3 from "@/assets/step3.png";

const WorkflowSection = () => {
    const steps = [
        {
            stepNumber: "01",
            title: "Upload Your Ad",
            description: "Submit your ad creative—image, video, or copy—from any platform for instant AI evaluation.",
            image: workflow1,
            alt: "Upload ad creative"
        },
        {
            stepNumber: "02",
            title: "AI Performance Analysis",
            description: "Adalyze assesses your ad against benchmarks, generates a performance score, and surfaces key weaknesses.",
            image: workflow2,
            alt: "AI analyzing ad performance"
        },
        {
            stepNumber: "03",
            title: "Optimize & Iterate",
            description: "Receive tailored recommendations, apply improvements, and re-run analysis to continuously boost effectiveness.",
            image: workflow3,
            alt: "Ad optimization loop"
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

                {/* Steps Container */}
                <div className="relative  mt-10">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="sticky top-30 gap-10 flex items-center justify-center"
                            style={{ zIndex: index + 1 }}
                        >
                            <div
                                className={`relative rounded-2xl overflow-visible mt-10 bg-[#121212] border border-[#2b2b2b]/50 p-8 md:p-12 w-full max-w-5xl mx-auto ${index === 1 ? 'md:flex-row-reverse' : ''
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    {/* Text Content */}
                                    <div className={`flex-1 text-white ${index === 1 ? 'md:pl-8' : 'md:pr-8'}`}>
                                        <h3 className="text-xl font-medium opacity-80 mb-8">
                                            Step: {step.stepNumber}
                                        </h3>
                                        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#db4900] to-[#b71c1c] bg-clip-text  text-transparent">
                                            {step.title}
                                        </h2>
                                        <p className="text-lg opacity-90 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Image */}
                                    <div className="flex-shrink-0 relative z-50 hidden md:block">
                                        <div className="relative w-80 h-80 md:w-120 md:h-110 overflow-visible">
                                           
                                                <Image
                                                    src={step.image}
                                                    alt={step.alt}
                                                    fill
                                                    className="object-contain"
                                                    sizes="(max-width: 768px) 256px, 288px"
                                                />
                                            
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default WorkflowSection;
