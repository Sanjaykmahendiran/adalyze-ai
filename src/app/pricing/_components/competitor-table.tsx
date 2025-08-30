
import { Crown, Check, Zap, Target, TrendingUp   } from "lucide-react";

export default function CompetitorTable() {

    return (

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">
                    How We Compare
                </h2>
                <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
                    See why Adalyze AI is the smart choice for ad analysis
                </p>
            </div>

            <div className="bg-[#121212] rounded-lg border border-[#2a2a2a] overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#2a2a2a]">
                                <th className="text-left p-4 sm:p-6 font-semibold text-gray-300">Feature / Pricing</th>
                                <th className="text-center p-4 sm:p-6 font-semibold text-green-400 bg-green-900/10">
                                    <div className="flex items-center justify-center gap-2">
                                        <Crown className="w-4 h-4" />
                                        Adalyze AI (You)
                                    </div>
                                </th>
                                <th className="text-center p-4 sm:p-6 font-semibold text-gray-300">Marpipe</th>
                                <th className="text-center p-4 sm:p-6 font-semibold text-gray-300">Pencil AI</th>
                                <th className="text-center p-4 sm:p-6 font-semibold text-gray-300">CreativeX</th>
                                <th className="text-center p-4 sm:p-6 font-semibold text-gray-300">Attention Insight</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-4 sm:p-6 font-medium">Starting Price (per month)</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10 font-bold text-green-400">$3 (₹199)</td>
                                <td className="text-center p-4 sm:p-6 text-gray-300">$2,000+</td>
                                <td className="text-center p-4 sm:p-6 text-gray-300">$600+</td>
                                <td className="text-center p-4 sm:p-6 text-gray-300">$3,000+</td>
                                <td className="text-center p-4 sm:p-6 text-gray-300">$19</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-4 sm:p-6 font-medium">Ad Scoring Dashboard</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-4 sm:p-6 font-medium">Top-line Metrics (Clarity, CTA, Safe-zone)</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-yellow-400">Partial (heatmap only)</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-4 sm:p-6 font-medium">Visual Readability & Emotion Check</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-4 sm:p-6 font-medium">Platform Fit Scoring (FB, Insta, LinkedIn, YouTube)</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-4 sm:p-6 font-medium">A/B Testing / Comparison</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10 text-green-400 text-sm">Yes (10–50 ads)</td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-4 sm:p-6 font-medium">Exportable Reports (PDF/Link)</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-4 sm:p-6 font-medium">Team / Multi-user Support</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10 text-green-400 text-sm">Yes (from $69)</td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-4 sm:p-6 font-medium">Brand Consistency Check</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-4 sm:p-6 font-medium">AI-driven Suggestions</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-4 sm:p-6 font-medium">White-label / Enterprise</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10 text-green-400 text-sm">Custom</td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                            </tr>
                            <tr className="hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-4 sm:p-6 font-medium">Ease of Use</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10 text-green-400 text-sm">No setup, instant results</td>
                                <td className="text-center p-4 sm:p-6 text-red-400 text-sm">Heavy setup</td>
                                <td className="text-center p-4 sm:p-6 text-yellow-400 text-sm">Medium</td>
                                <td className="text-center p-4 sm:p-6 text-red-400 text-sm">Enterprise setup</td>
                                <td className="text-center p-4 sm:p-6 text-yellow-400 text-sm">Yes (limited)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-6 p-4 sm:p-6">
                    {/* Adalyze AI Card */}
                    <div className="bg-green-900/10 border border-green-500/30 rounded-lg p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Crown className="w-5 h-5 text-green-400" />
                            <h3 className="font-bold text-green-400 text-lg">Adalyze AI (You)</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-300">Starting Price</span>
                                <span className="font-bold text-green-400">$3 (₹199)</span>
                            </div>
                            <div className="text-sm text-green-400 font-medium">
                                ✓ All premium features ✓ No setup required ✓ Instant results
                            </div>
                            <div className="text-xs text-gray-300 italic">
                                USP: Affordable, instant, made for freelancers, startups & agencies
                            </div>
                        </div>
                    </div>

                    {/* Competitors Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Marpipe</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">Price</span>
                                    <span className="text-red-400">$2,000+</span>
                                </div>
                                <div className="text-xs text-gray-500">Enterprise-only</div>
                            </div>
                        </div>

                        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Pencil AI</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">Price</span>
                                    <span className="text-red-400">$600+</span>
                                </div>
                                <div className="text-xs text-gray-500">Expensive AI generation focus</div>
                            </div>
                        </div>

                        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                            <h4 className="font-semibold mb-3">CreativeX</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">Price</span>
                                    <span className="text-red-400">$3,000+</span>
                                </div>
                                <div className="text-xs text-gray-500">Enterprise analytics</div>
                            </div>
                        </div>

                        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Attention Insight</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">Price</span>
                                    <span className="text-gray-300">$19</span>
                                </div>
                                <div className="text-xs text-gray-500">Just heatmaps</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-8 sm:mt-12">
                <div className="bg-gradient-to-r from-[#ff6a00]/10 to-[#a63a00]/10 rounded-lg p-6 sm:p-8 border border-[#ff6a00]/20">
                    <h3 className="text-lg sm:text-xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#ff6a00] to-[#ff8533]">
                        Why Choose Adalyze AI?
                    </h3>
                    <p className="text-sm sm:text-base text-gray-300 mb-4 max-w-2xl mx-auto">
                        Get enterprise-level ad analysis at a fraction of the cost. No complex setup,
                        no lengthy contracts - just instant, actionable insights for your ads.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm text-green-400">
                        <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Instant Analysis
                        </span>
                        <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Platform-Specific Scoring
                        </span>
                        <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            99% More Affordable
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}