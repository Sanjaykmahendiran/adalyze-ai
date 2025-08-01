import { useEffect, useRef } from "react";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaRegFileAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const GalaxyBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const stars: {
        x: number;
        y: number;
        radius: number;
        alpha: number;
        delta: number;
    }[] = [];

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);
        let animationId: number;

        const initStars = () => {
            stars.length = 0;
            const count = Math.floor((width * height) / 8000);
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.2 + 0.3,
                    alpha: Math.random() * 0.6 + 0.2,
                    delta: Math.random() * 0.005 + 0.002,
                });
            }
        };

        const drawNebula = () => {
            const nebulaCount = 6;
            for (let i = 0; i < nebulaCount; i++) {
                const cx = Math.random() * width;
                const cy = Math.random() * height;
                const radius = Math.max(width, height) * (0.2 + Math.random() * 0.2);
                const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
                grad.addColorStop(0, "rgba(219,73,0,0.18)");
                grad.addColorStop(0.5, "rgba(219,73,0,0.04)");
                grad.addColorStop(1, "rgba(0,0,0,0)");
                ctx.save();
                ctx.globalCompositeOperation = "screen";
                ctx.fillStyle = grad;
                ctx.filter = "blur(120px)";
                ctx.fillRect(0, 0, width, height);
                ctx.restore();
            }
        };

        const render = () => {
            ctx.clearRect(0, 0, width, height);
            // base dark fill
            ctx.fillStyle = "#0f0f17";
            ctx.fillRect(0, 0, width, height);

            drawNebula();

            stars.forEach((s) => {
                s.alpha += s.delta * (Math.random() < 0.5 ? 1 : -1);
                if (s.alpha < 0.2) s.alpha = 0.2;
                if (s.alpha > 1) s.alpha = 1;
                ctx.save();
                ctx.globalAlpha = s.alpha;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.restore();
            });

            animationId = requestAnimationFrame(render);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initStars();
        };

        window.addEventListener("resize", handleResize);
        initStars();
        render();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden="true"
        />
    );
};

export default function CreateBetter() {
    const router = useRouter();
    return (
        <div className="relative min-h-screen overflow-hidden">
            <GalaxyBackground />
            <div className="bg-gradient-to-b from-black via-neutral-900 to-black px-6 py-12 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                            Nail your Ad on <span className="text-[#db4900]">every platform</span>
                        </h1>

                        {/* Social Media Icons */}
                        <div className="flex justify-center items-center gap-8 mb-16">
                            {[
                                {
                                    icon: <FaInstagram className="w-6 h-6" />,
                                    label: "Instagram",
                                },
                                {
                                    icon: <FaFacebookF className="w-6 h-6" />,
                                    label: "Facebook",
                                },
                                {
                                    icon: <FaLinkedinIn className="w-6 h-6" />,
                                    label: "LinkedIn",
                                },
                                {
                                    icon: <FaRegFileAlt className="w-6 h-6" />,
                                    label: "Docs",
                                },
                            ].map(({ icon, label }, idx) => (
                                <div
                                    key={idx}
                                    aria-label={label}
                                    role="button"
                                    className="w-16 h-16 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#db4900]/10 transition-transform transform hover:scale-105"
                                >
                                    <div className="text-[#db4900]">{icon}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
                        <div className="flex flex-col justify-end">
                            <h2 className="text-3xl md:text-4xl font-bold text-right text-white leading-tight">
                                Powered by <br />
                                <span className="text-[#db4900]">Adalyze AI</span>
                            </h2>
                        </div>

                        <div>
                            <p className="text-lg text-gray-300 leading-relaxed">
                                Adalyze is an AI-first ad analysis platform that evaluates your creatives across channels,
                                gives you a clear performance score, and delivers actionable feedback. Optimize your ads before
                                launch with insights on creative effectiveness, targeting, and engagement.
                            </p>
                        </div>
                    </div>

                    {/* Main CTA Section */}
                    <div className="text-center">
                        <h3 className="text-4xl md:text-6xl font-bold text-white mb-12 leading-tight">
                            Maximize Ad Impact with <span className="text-[#db4900]">AI-Powered</span>
                            <br />
                            Performance Insights
                        </h3>

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
                                        className="relative overflow-hidden flex items-center gap-2 px-8 py-6 text-white text-lg font-semibold rounded-lg transition-colors
                               before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#db4900]/40 before:to-transparent
                               before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                                    >
                                        Analyze Your Ad
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
