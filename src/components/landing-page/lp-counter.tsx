import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '../ui/button';
import { trackEvent } from "@/lib/eventTracker"

// Custom hook for intersection observer
const useInView = (options = {}) => {
    const [isInView, setIsInView] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { threshold: 0.1, ...options }
        );

        if (ref.current) observer.observe(ref.current);

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, []);

    return [ref, isInView];
};

// Animated Counter Component
const AnimatedCounter: React.FC<{
    target: number;
    suffix?: string;
    isActive: boolean;
    className?: string;
}> = ({ target, suffix = '', isActive, className = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isActive) return;

        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        const stepTime = duration / steps;

        // Determine decimal places from target value
        const decimalPlaces = target % 1 !== 0 ? (target.toString().split('.')[1]?.length || 0) : 0;

        let currentCount = 0;
        const timer = setInterval(() => {
            currentCount += increment;
            if (currentCount >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                // Preserve decimal places during animation
                const roundedValue = decimalPlaces > 0 
                    ? parseFloat(currentCount.toFixed(decimalPlaces))
                    : Math.floor(currentCount);
                setCount(roundedValue);
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [target, isActive]);

    const displayValue = target === count ? target : count;
    const formattedValue = target > 1000 ? `${displayValue}+` : displayValue + suffix;

    // Reserve width based on final formatted value
    const maxDigits = formattedValue.length;

    return (
        <span
            className={className + ' font-mono'}
            style={{ display: 'inline-block', width: `${maxDigits}ch`, textAlign: 'end' }}
        >
            {formattedValue}
        </span>
    );
};


interface MetricCardProps {
    id: string;
    title: string;
    description: string;
    metric: string | number;
    metricPosition?: 'left' | 'right';
    isHovered?: boolean;
    onHover?: (id: string) => void;
    onLeave?: () => void;
    isCounterActive?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
    id,
    title,
    description,
    metric,
    metricPosition = 'right',
    isHovered = false,
    onHover,
    onLeave,
    isCounterActive = false,
}) => {
    const renderMetric = () => {
        if (typeof metric === 'number') {
            return (
                <AnimatedCounter
                    target={metric}
                    isActive={isCounterActive}
                    className={`text-5xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold transition-colors duration-300 text-center sm:text-left ${isHovered ? 'text-white' : 'text-primary'} font-mono`}
                    style={{ minWidth: `5ch` }} // FIXED width for 5 characters
                />
            );
        }

        // Extract numeric value (including decimals) and suffix properly
        // Supports formats like "1.2L" (lakhs), "3.5M" (millions), etc.
        const metricStr = metric.toString();
        const numericMatch = metricStr.match(/[\d.]+/);
        const numericValue = numericMatch ? parseFloat(numericMatch[0]) : 0;
        const suffix = metricStr.replace(/[\d.]+/, ''); // Extracts L (lakhs), M (millions), etc.

        if (!isNaN(numericValue)) {
            return (
                <div
                    className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-center sm:text-left transition-colors duration-300 ${isHovered ? 'text-white' : 'text-primary'
                        } font-mono`}
                    style={{ minWidth: `5ch` }} // FIXED width for 5 characters
                >
                    <AnimatedCounter target={numericValue} suffix={suffix} isActive={isCounterActive} />
                </div>
            );
        }

        return <p className={`text-4xl ...`}>{metric}</p>;
    };


    return (
        <button
            id={id}
            onMouseEnter={() => onHover?.(id)}
            onMouseLeave={onLeave}
            className="group w-full cursor-pointer"
            onClick={() => {
                window.open('/register', '_blank', 'noopener,noreferrer');
                trackEvent("LP_Counter_button_clicked", window.location.href);
            }}
        >
            <div
                className={`z-10 rounded-2xl sm:rounded-3xl text-left bg-black px-4 sm:px-5 md:px-6 py-4 sm:py-5 flex flex-col justify-between transition-all duration-300
    ${isHovered ? 'shadow-lg scale-[1.02] bg-primary text-white' : 'shadow-md'}
    h-auto sm:h-52 md:h-56 lg:h-64 xl:h-[240px]`}
            >

                <h4
                    className={`text-xl sm:text-base md:text-lg font-bold whitespace-nowrap transition-colors duration-300 text-white text-center sm:text-left`}
                >
                    {title}
                </h4>

                <div
                    className={`flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-between mt-1 sm:mt-2`}
                >
                    {metricPosition === 'left' && renderMetric()}

                    <div className="flex flex-col items-center sm:items-start mt-1 sm:mt-0">
                        <p className="hidden sm:block text-xs sm:text-sm md:text-base lg:text-base font-light text-white/80 max-w-[100px] md:max-w-[200px] lg:max-w-[200px]">
                            {description}
                        </p>
                    </div>


                    {metricPosition === 'right' && renderMetric()}
                </div>

            </div>
        </button>
    );
};

const Counter: React.FC<{ ButtonText: string, metriccon1Description: string, metriccon1Value: number, metriccon2Description: string, metriccon2Value: number, metriccon3Description: string, metriccon3Value: number, metriccon4Description: string, metriccon4Value: number }> = ({ ButtonText, metriccon1Description, metriccon1Value, metriccon2Description, metriccon2Value, metriccon3Description, metriccon3Value, metriccon4Description, metriccon4Value }) => {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [counterRef, isCounterInView] = useInView({ threshold: 0.3 });

    return (
        <div className="relative py-8 sm:py-10 md:py-12 lg:py-14 w-full overflow-hidden" ref={counterRef}>
            <div className="max-w-7xl relative mx-auto flex w-full flex-col items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 px-4 sm:px-6">
                <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 w-full">
                    {/* First Row */}
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6 w-full">
                        <div className="flex-1">
                            <MetricCard
                                id="dashboard-lowered-costs-card"
                                title="Ads Reviewed"
                                description={metriccon1Description}
                                metric={metriccon1Value}
                                isHovered={hoveredCard === 'dashboard-lowered-costs-card'}
                                onHover={setHoveredCard}
                                onLeave={() => setHoveredCard(null)}
                                isCounterActive={isCounterInView}
                            />

                        </div>

                        <div className="flex-1 lg:flex-[1.2]">
                            <MetricCard
                                id="dashboard-evergreen-card"
                                title="AI Feedback Accuracy"
                                description={metriccon2Description}
                                metric={metriccon2Value}
                                isHovered={hoveredCard === 'dashboard-evergreen-card'}
                                onHover={setHoveredCard}
                                onLeave={() => setHoveredCard(null)}
                                isCounterActive={isCounterInView}
                            />

                        </div>
                    </div>

                    {/* Second Row */}
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6 w-full">
                        <div className="flex-1 lg:flex-[1.1]">
                            <MetricCard
                                id="dashboard-roi-card"
                                title="Avg CTR Boost"
                                description={metriccon3Description}
                                metric={metriccon3Value}
                                metricPosition="left"
                                isHovered={hoveredCard === 'dashboard-roi-card'}
                                onHover={setHoveredCard}
                                onLeave={() => setHoveredCard(null)}
                                isCounterActive={isCounterInView}
                            />

                        </div>
                        <div className="flex-1">
                            <MetricCard
                                id="dashboard-roas-card"
                                title="Platforms Supported"
                                description={metriccon4Description}
                                metric={metriccon4Value}
                                isHovered={hoveredCard === 'dashboard-roas-card'}
                                onHover={setHoveredCard}
                                onLeave={() => setHoveredCard(null)}
                                isCounterActive={isCounterInView}
                            />

                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <Button
                    onClick={() => {
                        window.open('/register', '_blank', 'noopener,noreferrer');
                        trackEvent("LP_Counter_button_clicked", window.location.href);
                    }}
                    className="shadow-lg rounded-xl sm:rounded-2xl font-bold h-12 sm:h-14 md:h-16 lg:h-[60px] min-w-[200px] sm:min-w-[220px] md:min-w-[248px] px-4 text-lg sm:text-xl md:text-2xl transition-colors duration-300 hover:opacity-90"
                >
                    {ButtonText}
                </Button>

                {/* Floating Metric Cards */}
                <div className="hidden md:block shadow-lg absolute z-20 h-16 sm:h-20 w-32 sm:w-40 rounded-xl sm:rounded-2xl bg-[#171717] p-3 sm:p-4 top-[160px] sm:top-[180px] md:top-[200px] left-[10%] lg:left-[246px] rotate-12 transition-transform hover:scale-105">
                    <div className="flex h-full flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <span className="text-white/80 text-lg sm:text-2xl font-bold">
                                <AnimatedCounter target={4.32} suffix="%" isActive={isCounterInView} className="text-lg sm:text-2xl font-bold" />
                            </span>
                            <span className="flex items-center text-green-500">
                                <TrendingUp className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                                <span className="text-xs font-normal">+23.15</span>
                            </span>
                        </div>
                        <span className="text-white/70 text-xs font-normal">CTR</span>
                    </div>
                </div>

                <div className="hidden md:block shadow-lg absolute z-20 h-16 sm:h-20 w-32 sm:w-40 rounded-xl sm:rounded-2xl bg-[#171717] p-3 sm:p-4 top-[176px] sm:top-[196px] md:top-[216px] right-[10%] lg:right-[240px] -rotate-12 transition-transform hover:scale-105">
                    <div className="flex h-full flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <span className="text-white/80 text-lg sm:text-2xl font-bold">
                                <span className="text-white/80 text-sm sm:text-base">$</span>
                                <AnimatedCounter target={2.95} isActive={isCounterInView} className="" />
                            </span>
                            <span className="flex items-center text-red-500">
                                <TrendingDown className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                                <span className="text-xs font-normal">-12.26</span>
                            </span>
                        </div>
                        <span className="text-white/70 text-xs font-normal">CPC</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Counter;
