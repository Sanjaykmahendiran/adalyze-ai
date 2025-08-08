import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Visual from "@/assets/visual-ad-analysis.png"
import Video from "@/assets/video-ad-insights.png"
import CreativeSuggestion from "@/assets/creative-suggestions.png"
import PerformanceOptimizer from "@/assets/performance-optimizer.png"

const features = [
    {
        title: "Visual Ad Analysis",
        description:
            "Upload your ad creatives and let Adalyze score them based on visual appeal, engagement potential, and platform suitability. Discover what elements work — from colors and layout to focal points and text placement.",
        buttonText: "Analyze Image",
        image: Visual,
    },
    {
        title: "Video Ad Insights",
        description:
            "Get instant feedback on your video ads. Adalyze breaks down key performance indicators like attention span, message clarity, and brand recall — helping you create high-impact video campaigns.",
        buttonText: "Analyze Video",
        image: Video,
    },
    {
        title: "Creative Suggestions",
        description:
            "Not sure why an ad isn't converting? Adalyze provides AI-powered improvement tips — from call-to-action wording to image framing — ensuring your creatives stay aligned with audience expectations and platform best practices.",
        buttonText: "Get Suggestions",
        image: CreativeSuggestion,
    },
    {
        title: "Performance Optimizer",
        description:
            "Improve ROAS with Adalyze's Performance Optimizer. Compare your ad metrics to industry benchmarks, identify weak spots, and apply recommended enhancements to maximize campaign efficiency.",
        buttonText: "Optimize Now",
        image: PerformanceOptimizer,
    },
]

export default function FeaturesSection() {
    return (
        <div className="min-h-screen bg-black text-white py-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-20">
                    <p className="text-primary text-sm font-medium mb-4">Our Features</p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        AI Tools for Ad Performance Analysis & Optimization
                    </h1>
                    <p className="text-gray-400 text-lg max-w-4xl mx-auto leading-relaxed">
                        Adalyze empowers marketers with AI-driven insights to optimize ad creatives, improve performance, and outsmart the competition. From analyzing visuals to providing actionable suggestions — here's how Adalyze elevates your campaigns.
                    </p>
                </div>

                {/* Features */}
                <div className="space-y-32">
                    {features.map((feature, index) => {
                        const isEven = index % 2 === 0;

                        return (
                            <div
                                key={index}
                                className="grid lg:grid-cols-2 gap-12 items-center"
                            >
                                {/* Text Side - appears first on even rows (0, 2, 4...) */}
                                <div className={`space-y-6 ${!isEven ? 'lg:order-2' : ''}`}>
                                    <h2 className="text-3xl font-bold text-primary">{feature.title}</h2>
                                    <p className="text-gray-300 text-lg leading-relaxed">
                                        {feature.description}
                                    </p>
                                    <Button variant="outline" className="text-white ">
                                        {feature.buttonText}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Image Side - appears second on even rows, first on odd rows */}
                                <div className={`flex justify-center ${!isEven ? 'lg:order-1' : ''}`}>
                                    <div className="w-full max-w-2xl h-80 flex items-center justify-center shadow-md mx-auto">
                                        <img
                                            src={feature.image.src}
                                            alt={feature.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}
