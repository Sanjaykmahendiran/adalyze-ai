import { Crown, Check, Zap, Target, TrendingUp } from "lucide-react";

interface CompetitorTableProps {
    basicPrice: string;
}

export default function CompetitorTable({ basicPrice }: CompetitorTableProps) {
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

            <div className="bg-black rounded-lg border border-[#2a2a2a] overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#2a2a2a]">
                                <th className="text-left p-4 sm:p-6 font-semibold text-gray-300">Feature / Pricing</th>
                                <th className="text-center p-4 sm:p-6 font-semibold text-green-400 bg-green-900/10">
                                    <div className="flex items-center justify-center gap-2">
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
                                <td className="text-center p-4 sm:p-6 bg-green-900/10 font-bold text-green-400">{basicPrice}</td>
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
                                <td className="p-4 sm:p-6 font-medium">Go/No-Go Decision Engine</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-4 sm:p-6 font-medium">Ad Fatigue Score & Prediction</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-4 sm:p-6 font-medium">Best Day/Time to Post Analysis</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-4 sm:p-6 font-medium">Readability & Clarity Meter</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-yellow-400">Basic</td>
                                <td className="text-center p-4 sm:p-6 text-yellow-400">Basic</td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-4 sm:p-6 font-medium">Competitor Uniqueness Meter</td>
                                <td className="text-center p-4 sm:p-6 bg-green-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
                                <td className="text-center p-4 sm:p-6 text-red-400">No</td>
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
                                <td className="text-center p-4 sm:p-6 bg-green-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
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
                                <td className="text-center p-4 sm:p-6 bg-green-900/10"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
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

                {/* Mobile Table */}
                <div className="lg:hidden overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#2a2a2a]">
                                <th className="text-left p-2 font-semibold text-gray-300 text-xs">Feature / Pricing</th>
                                <th className="text-center p-2 font-semibold text-green-400 bg-green-900/10 text-xs">
                                    Adalyze AI (You)
                                </th>
                                <th className="text-center p-2 font-semibold text-gray-300 text-xs">Marpipe</th>
                                <th className="text-center p-2 font-semibold text-gray-300 text-xs">Pencil AI</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">Starting Price (per month)</td>
                                <td className="text-center p-2 bg-green-900/10 font-bold text-green-400 text-xs">{basicPrice}</td>
                                <td className="text-center p-2 text-gray-300 text-xs">$2,000+</td>
                                <td className="text-center p-2 text-gray-300 text-xs">$600+</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">Ad Scoring Dashboard</td>
                                <td className="text-center p-2 bg-green-900/10"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">Top-line Metrics</td>
                                <td className="text-center p-2 bg-green-900/10"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 text-red-400 text-xs">No</td>
                                <td className="text-center p-2 text-red-400 text-xs">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">Visual Readability & Emotion</td>
                                <td className="text-center p-2 bg-green-900/10"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 text-red-400 text-xs">No</td>
                                <td className="text-center p-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">Go/No-Go Decision Engine</td>
                                <td className="text-center p-2 bg-green-900/10"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 text-red-400 text-xs">No</td>
                                <td className="text-center p-2 text-red-400 text-xs">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">Ad Fatigue Score & Prediction</td>
                                <td className="text-center p-2 bg-green-900/10"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 text-red-400 text-xs">No</td>
                                <td className="text-center p-2 text-red-400 text-xs">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">Best Day/Time to Post</td>
                                <td className="text-center p-2 bg-green-900/10"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 text-red-400 text-xs">No</td>
                                <td className="text-center p-2 text-red-400 text-xs">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">Readability & Clarity Meter</td>
                                <td className="text-center p-2 bg-green-900/10"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 text-red-400 text-sm">No</td>
                                <td className="text-center p-2 text-yellow-400 text-sm">Basic</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">Competitor Uniqueness</td>
                                <td className="text-center p-2 bg-green-900/10"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 text-red-400 text-xs">No</td>
                                <td className="text-center p-2 text-red-400 text-xs">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">Platform Fit Scoring</td>
                                <td className="text-center p-2 bg-green-900/10"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 text-red-400 text-xs">No</td>
                                <td className="text-center p-2 text-red-400 text-xs">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">A/B Testing / Comparison</td>
                                <td className="text-center p-2 bg-green-900/10"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">Exportable Reports</td>
                                <td className="text-center p-2 bg-green-900/10"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 text-red-400 text-xs">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">Team / Multi-user Support</td>
                                <td className="text-center p-2 bg-green-900/10"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">Brand Consistency Check</td>
                                <td className="text-center p-2 bg-green-900/10"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 text-red-400 text-xs">No</td>
                                <td className="text-center p-2 text-red-400 text-sm">No</td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">AI-driven Suggestions</td>
                                <td className="text-center p-2 bg-green-900/10"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 text-red-400 text-xs">No</td>
                                <td className="text-center p-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">White-label / Enterprise</td>
                                <td className="text-center p-2 bg-green-900/10 text-green-400 text-xs">Custom</td>
                                <td className="text-center p-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                            </tr>
                            <tr className="hover:bg-[#1a1a1a] transition-colors">
                                <td className="p-2 font-medium text-xs">Ease of Use</td>
                                <td className="text-center p-2 bg-green-900/10 text-green-400 text-xs">No setup, instant</td>
                                <td className="text-center p-2 text-red-400 text-xs">Heavy setup</td>
                                <td className="text-center p-2 text-yellow-400 text-xs">Medium</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
