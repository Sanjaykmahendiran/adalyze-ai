"use client";

import { motion, useScroll, useTransform, useInView, useMotionTemplate } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

export default function MobileVideoSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);

    // 👇 Scroll progress - track section scroll
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start center", "end center"],
    });

    // 👇 Scroll-driven transforms (rotate + translate) - Enhanced effect
    const rotateX = useTransform(scrollYProgress, [0, 1], [30, -30]);
    const rotateXStr = useTransform(rotateX, (v) => `${v}deg`);
    const translateY = useTransform(scrollYProgress, [0, 1], [0, -80]);
    const translateYStr = useTransform(translateY, (v) => `${v}px`);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

    // Create transform string with stronger perspective
    const transform = useMotionTemplate`perspective(800px) rotateX(${rotateXStr}) translateY(${translateYStr}) scale(${scale})`;

    // 👇 Optional: fade reveal when entering viewport
    const isInView = useInView(sectionRef, { once: true, margin: "-20% 0px" });

    // Ensure video autoplays when component mounts
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.muted = true;
            setIsMuted(true);
            video.play().catch((error) => {
                console.log("Autoplay prevented:", error);
            });
        }
    }, []);

    const handleUnmute = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = false;
        setIsMuted(false);
    };

    const openFullscreen = () => {
        const video = videoRef.current;
        if (!video) return;
        if ((video as any).webkitEnterFullscreen) (video as any).webkitEnterFullscreen();
        else if (video.requestFullscreen) video.requestFullscreen();
    };

    return (
        <section
            ref={sectionRef}
            className="new-hero relative sm:hidden flex flex-col items-center justify-center w-full overflow-hidden py-24 px-4 md:px-12"
            style={{ position: 'relative' }}
        >

            {/* Perspective wrapper */}
            <div
                className="relative w-full flex justify-center"
                style={{
                    perspective: "800px",
                    perspectiveOrigin: "center center"
                }}
            >
                <motion.div
                    style={{
                        transform: transform,
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "hidden",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: isInView ? 1 : 0,
                        transition: { duration: 0.8, ease: "easeOut" },
                    }}
                    className="relative w-full max-w-[460px] md:max-w-[720px] aspect-[3/2] bg-black rounded-2xl border border-gray-800 shadow-2xl overflow-hidden will-change-transform"
                >
                    <video
                        ref={videoRef}
                        src="https://adalyze.app/uploads/video.mp4"
                        poster="https://adalyze.app/uploads/thumbnail.webp"
                        autoPlay
                        muted={isMuted}
                        loop
                        playsInline
                        className="w-full h-full object-contain opacity-100"
                    />

                    {/* Click to sound button - shows when muted */}
                    {isMuted && (
                        <div
                            className="absolute inset-0 flex flex-col justify-center items-center cursor-pointer z-10"
                            onClick={handleUnmute}
                        >
                            <div className="bg-white/90 hover:bg-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 shadow-lg">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="#000"
                                    viewBox="0 0 24 24"
                                    width="24"
                                    height="24"
                                >
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                </svg>
                            </div>
                            <p className="text-white text-sm mt-3 font-medium drop-shadow-lg">
                                Click to sound
                            </p>
                        </div>
                    )}

                    {/* Mobile fullscreen button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openFullscreen();
                        }}
                        className="absolute bottom-3 right-3 md:hidden bg-transparent border-none p-0 z-20"
                        aria-label="Enter fullscreen"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="26"
                            viewBox="0 -960 960 960"
                            width="26"
                            fill="#f3f3f3"
                        >
                            <path d="M120-120v-320h80v184l504-504H520v-80h320v320h-80v-184L256-200h184v80H120Z" />
                        </svg>
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
