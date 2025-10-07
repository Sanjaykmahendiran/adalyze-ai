'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CounterItem {
    number: number;
    suffix: string;
    title: string;
}

export const CounterSection: React.FC = () => {
    const [animatedValues, setAnimatedValues] = useState<number[]>([0, 0, 0, 0]);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    const counterItems: CounterItem[] = [
        { number: 1500, suffix: "+", title: "Ads Reviewed" },
        { number: 85, suffix: "%", title: "AI Feedback Accuracy" },
        { number: 30, suffix: "%", title: "Avg CTR Boost" },
        { number: 5, suffix: "+", title: "Platforms Supported" }
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setAnimatedValues([0, 0, 0, 0]);
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => {
            if (sectionRef.current) observer.unobserve(sectionRef.current);
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const animationDuration = 2000;
        const frameRate = 60;
        const totalFrames = Math.ceil(animationDuration / (1000 / frameRate));

        const intervals = counterItems.map((item, index) => {
            let currentFrame = 0;

            const interval = setInterval(() => {
                const progress = currentFrame / totalFrames;
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const currentValue = Math.ceil(easedProgress * item.number);

                setAnimatedValues(prev => {
                    const newValues = [...prev];
                    newValues[index] = currentValue;
                    return newValues;
                });

                currentFrame++;
                if (currentFrame > totalFrames) clearInterval(interval);
            }, 1000 / frameRate);

            return interval;
        });

        return () => {
            intervals.forEach(interval => clearInterval(interval));
        };
    }, [isVisible]);

    return (
        <section
            ref={sectionRef}
            className="py-16 bg-gradient-to-r from-[#0d0d0d] to-[#1a1a1a] mb-16"
        >
            <div className="container mx-auto px-4">
                <div className="relative flex flex-col sm:flex-row sm:flex-wrap xl:flex-nowrap items-center justify-center gap-8 sm:gap-12 xl:gap-0">
                    {counterItems.map((item, index) => (
                        <div
                            key={index}
                            className="relative flex-1 text-center min-w-0 max-w-xs xl:max-w-none"
                        >
                            {index < counterItems.length - 1 && (
                                <div className="hidden xl:block absolute top-1/2 -right-12 w-24 h-px bg-gray-700 transform -translate-y-1/2 z-0" />
                            )}

                            <div className="relative z-10 px-4">
                                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-none mb-2">
                                    {animatedValues[index]}{item.suffix}
                                </div>
                                <div className="text-gray-300 text-sm sm:text-base lg:text-lg">
                                    {item.title}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CounterSection;
