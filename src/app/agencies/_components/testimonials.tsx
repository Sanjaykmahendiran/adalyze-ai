
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Quote, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import client1 from "@/assets/Landing-page/agency/cm-1.webp"
import client2 from "@/assets/Landing-page/agency/cw-2.webp"
import client3 from "@/assets/Landing-page/agency/cm-3.webp"
import client4 from "@/assets/Landing-page/agency/cm-4.webp"
import client5 from "@/assets/Landing-page/agency/cw-5.webp"

const testimonials = [
    {
        name: "Vikash Gupta",
        role: "Marketing Head",
        company: "Workfreaks Corporate Services",
        avatar: client1,
        rating: 5,
        text: "Our group companies have 5 brands and we incorporated Adalyze AI 2 months ago. It gave us clarity we never had before. The insights helped us cut wasted ad spend and focus on what truly converts. Our ROI growth speaks for itself.",
        results: ["68% ROI increase", "54% lead quality improvement", "90% reporting time reduction", "37% ad CTR increase"]
    },
    {
        name: "Priya Sharma",
        role: "Digital Marketing Manager",
        company: "Qualifit AI",
        avatar: client2,
        rating: 5,
        text: "Our Product is focused on B2B brands and Adalyze AI became our ad performance command center. Within weeks, we saw clear insights on what was draining our budget and what was scaling our reach. The ROI jump was a direct result of Adalyze's intelligence.",
        results: ["40% ROI increase", "58% ad engagement improvement", "85% reporting time reduction"]
    },
    {
        name: "Abhay Singh",
        role: "Head - Digital Marketing",
        company: "Collab Digital Hub",
        avatar: client3,
        rating: 5,
        text: "Managing multiple client accounts used to be chaotic before Adalyze AI. Now, I can view all campaigns, insights, and reports in one dashboard. The centralized control saves my team countless hours every week. Adalyze AI has become the smartest investment for our agency growth.",
        results: ["90% reporting time reduction", "50% campaign management efficiency", "75% ad optimization accuracy"]
    },
    {
        name: "Nishant Jaiswal",
        role: "Operations Manager",
        company: "Wert Digital Solutions",
        avatar: client4,
        rating: 5,
        text: "We are handling 10 brands and are able to generate white-label reports and insights within minutes. The platform highlights what’s working and what’s not automatically. We spend less time on reports and more time optimizing campaigns. It’s my go-to tool for smarter, faster ad management.",
        results: ["150% revenue growth", "Reduced overhead", "Scalable systems"]
    },
    {
        name: "Kavitha Reddy",
        role: "AGM - South India",
        company: "JSW Group",
        avatar: client5,
        rating: 5,
        text: "Adalyze AI streamlined the workflow with centralized dashboards and access control. Automated reporting and performance tracking reduced manual work by 80%. Our team efficiency and client response time have improved massively. It truly brings structure and intelligence to agency operations.",
        results: ["80% manual work reduction", "75% team efficiency improvement", "90% client response time reduction"]
    }
];

export default function AgenciesTestimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 6000);

        return () => clearInterval(timer);
    }, []);

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.8,
            rotateY: direction > 0 ? 45 : -45
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.8,
            rotateY: direction < 0 ? 45 : -45
        })
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.23, 0.86, 0.39, 0.96]
            }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const nextTestimonial = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <section id="testimonials" className="relative text-white overflow-hidden">

            <motion.div
                ref={containerRef}
                className="relative z-10 max-w-7xl "
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {/* Header */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="text-center py-4 sm:py-6 md:py-8"
                >
                    <motion.h2
                        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl max-w-6xl mx-auto font-bold text-primary mb-2 sm:mb-3 md:mb-4 leading-tight px-2"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.2
                        }}
                        viewport={{ once: true }}
                    >
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            viewport={{ once: true }}
                            className="block"
                        >
                            What Agencies Are Saying
                        </motion.span>

                    </motion.h2>
                    <motion.p
                        className="text-white font-semibold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-2 sm:mb-3 md:mb-4 leading-tight px-2"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.6,
                            ease: "easeOut",
                            delay: 0.8
                        }}
                        viewport={{ once: true }}
                    >
                        AI that delivers value clients can see.
                    </motion.p>
                    <motion.p
                        className="text-xs sm:text-sm md:text-base text-white/80 max-w-2xl mx-auto leading-relaxed px-2"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.6,
                            ease: "easeOut",
                            delay: 1.0
                        }}
                        viewport={{ once: true }}
                    >
                        Join forward-thinking agencies using Adalyze AI to impress clients, win pitches, and drive better creative outcomes with every ad analyzed.                        </motion.p>
                </motion.div>

                {/* Main Testimonial Display */}
                <div className="relative max-w-6xl mx-auto">
                    <div className="relative min-h-[600px] sm:min-h-[550px] md:min-h-[450px] lg:min-h-[400px] perspective-1000">
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.4 },
                                    scale: { duration: 0.4 },
                                    rotateY: { duration: 0.6 }
                                }}
                                className="absolute inset-0"
                            >
                                <div className="relative h-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/[0.15] p-4 sm:p-6 md:p-8 lg:p-12 overflow-hidden group">
                                    {/* Animated background gradient */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-black-500/[0.08] via-black-500/[0.05] to-black-500/[0.08] rounded-3xl"
                                        animate={{
                                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                                        }}
                                        transition={{
                                            duration: 15,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                        style={{
                                            backgroundSize: '300% 300%'
                                        }}
                                    />

                                    {/* Quote icon */}
                                    <motion.div
                                        className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 opacity-20"
                                        animate={{ rotate: [0, 10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                    >
                                        <Quote className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white" />
                                    </motion.div>

                                    <div className="relative z-10 h-full flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-8 justify-center md:justify-start">
                                        {/* User Info */}
                                        <div className="flex-shrink-0 text-center md:text-left w-full md:w-auto">
                                            <motion.div
                                                className="relative mb-4 sm:mb-5 md:mb-6"
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto md:mx-0 rounded-full overflow-hidden border-2 sm:border-[3px] md:border-4 border-white/20 relative">
                                                    <img
                                                        src={testimonials[currentIndex].avatar.src}
                                                        alt={testimonials[currentIndex].name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Floating ring animation */}
                                                <motion.div
                                                    className="absolute inset-0 border-2  rounded-full"
                                                    animate={{
                                                        scale: [1, 1.4, 1],
                                                        opacity: [0.5, 0, 0.5]
                                                    }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                />
                                            </motion.div>

                                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">
                                                {testimonials[currentIndex].name}
                                            </h3>
                                            <p className="text-primary mb-0.5 sm:mb-1 font-medium text-sm sm:text-base md:text-lg">
                                                {testimonials[currentIndex].role}
                                            </p>
                                            <p className="text-white/60 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base">
                                                {testimonials[currentIndex].company}
                                            </p>

                                            {/* Star Rating */}
                                            <div className="flex justify-center md:justify-start gap-0.5 sm:gap-1 mb-4 sm:mb-5 md:mb-6">
                                                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.1, duration: 0.3 }}
                                                    >
                                                        <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 w-full">
                                            <motion.blockquote
                                                className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/90 leading-relaxed mb-4 sm:mb-6 md:mb-8 font-light italic"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3, duration: 0.8 }}
                                            >
                                                "{testimonials[currentIndex].text}"
                                            </motion.blockquote>

                                            {/* Results */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                                                {testimonials[currentIndex].results.map((result, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="bg-white/[0.05] rounded-lg p-2 sm:p-2.5 md:p-3 border border-white/[0.1] backdrop-blur-sm"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                                                        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                                                    >
                                                        <span className="text-xs sm:text-sm md:text-base text-white/70 font-medium leading-tight">
                                                            {result}
                                                        </span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex justify-center items-center gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-7 md:mt-8">
                        <motion.button
                            onClick={prevTestimonial}
                            className="p-2 sm:p-2.5 md:p-3 rounded-full bg-black border border-white/[0.15] backdrop-blur-sm text-white hover:bg-white/[0.15] transition-all"
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Previous testimonial"
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.button>

                        {/* Dots Indicator */}
                        <div className="flex gap-2 sm:gap-2.5 md:gap-3">
                            {testimonials.map((_, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => {
                                        setDirection(index > currentIndex ? 1 : -1);
                                        setCurrentIndex(index);
                                    }}
                                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${index === currentIndex
                                        ? 'bg-primary scale-125'
                                        : 'bg-white/30 hover:bg-white/50'
                                        }`}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>

                        <motion.button
                            onClick={nextTestimonial}
                            className="p-2 sm:p-2.5 md:p-3 rounded-full bg-black border border-white/[0.15] backdrop-blur-sm text-white hover:bg-white/[0.15] transition-all"
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Next testimonial"
                        >
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.button>
                    </div>
                </div>

            </motion.div>
        </section>
    );
}
