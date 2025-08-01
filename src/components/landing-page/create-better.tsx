import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import createBetter from "@/assets/full-image.png";
import { useRouter } from "next/navigation";

export default function CreateBetterSection() {
    const router = useRouter()
    return (
        <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-16 ">
            <div className="w-full max-w-6xl text-center">
                {/* Header */}
                <div className="mb-12 md:mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                        Discover Movies Smarter with Suggesto
                    </h1>
                    <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
                        Let AI guide your next watch—personalized, fast, and frustration-free.
                    </p>
                </div>

                {/* Full Width Image */}
                <div className="w-full mb-12 md:mb-16 px-2">
                    <div className="rounded-2xl overflow-hidden shadow-lg">
                        <Image
                            src={createBetter}
                            alt="AI-powered movie suggestion illustration"
                            width={1200}
                            height={600}
                            className="w-full h-auto object-cover"
                            priority
                        />
                    </div>
                </div>

                {/* CTA Button */}
                <div className="mb-6">
                    <Button
                        onClick={() => router.push("/download")}
                        size="lg"
                        className="text-white  px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold"
                    >
                        Try Suggesto Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>

                {/* Footer Text */}
                <p className="text-gray-500 text-xs sm:text-sm">
                    Free to Get Started
                </p>
            </div>
        </section>
    );
}
