"use client"

import { useState, useEffect, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Info, Star, X, Loader, ChevronLeft, ChevronRight } from "lucide-react"
import FAQSection from "@/components/landing-page/faq-section"
import LandingPageFooter from "@/components/landing-page/landing-page-footer"
import Header from "@/components/landing-page/header"
import avt1 from "@/assets/roi-p1.webp"
import avt2 from "@/assets/roi-p2.webp"

interface ROIData {
    Return_on_Investment?: string
    Cost_Savings?: string
    Time_Saved?: string
    ROI?: string
}

interface FormState {
    email: string
    description: string
}

interface Testimonial {
    testi_id: number
    content: string
    name: string
    imgname: string
    role: string
    company: string
    status: number
    created_date: string
}

function ContactFormModal({ onClose }: { onClose: () => void }) {
    const [formState, setFormState] = useState<FormState>({
        email: "",
        description: "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormState(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async () => {
        if (isSubmitting) return

        const { email, description } = formState

        try {
            setIsSubmitting(true)

            const response = await fetch("https://adalyzeai.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gofor: "sendquery",
                    email,
                    category: "roi-call",
                    description,
                }),
            })

            const result = await response.json()

            if (response.ok && result?.status !== "error") {
                setSubmitStatus('success')
                setTimeout(() => {
                    onClose()
                }, 2000)
            } else {
                setSubmitStatus('error')
            }
        } catch (error) {
            setSubmitStatus('error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md shadow-lg bg-[#1f1f21]">
                <CardHeader>
                    <CardTitle className="flex justify-between items-start text-lg">
                        <div>
                            <div className="text-white">Book Your ROI Call</div>
                            <div className="text-gray-300 text-sm font-thin">
                                Submit your details and we'll get back to you within 24 hours!
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4 text-white" />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {submitStatus === 'success' && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-500 text-sm">
                            ✓ Enquiry submitted successfully. We will get back in 24 hours.
                        </div>
                    )}
                    {submitStatus === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm">
                            Failed to submit enquiry. Please try again.
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1 text-white">
                            Email
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formState.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            className="bg-[#2b2b2b] border-[#2b2b2b] text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1 text-white">
                            Message
                        </label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formState.description}
                            onChange={handleChange}
                            placeholder="Tell us about your ROI goals and use case..."
                            rows={5}
                            required
                            className="bg-[#2b2b2b] border-[#2b2b2b] text-white"
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formState.email || !formState.description}
                        className="w-full bg-primary hover:bg-primary/90"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <Loader className="h-4 w-4 animate-spin" />
                                <span>Submitting...</span>
                            </div>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

function TestimonialSlider() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const response = await fetch('https://adalyzeai.xyz/App/api.php?gofor=testilist')
                const data = await response.json()
                if (Array.isArray(data)) {
                    setTestimonials(data.filter(item => item.status === 1))
                }
            } catch (error) {
                console.error('Error fetching testimonials:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTestimonials()
    }, [])

    useEffect(() => {
        if (testimonials.length === 0 || isPaused) return

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % testimonials.length)
        }, 4000)

        return () => clearInterval(interval)
    }, [testimonials.length, isPaused])

    const goToSlide = (index: number) => {
        setCurrentIndex(index)
    }

    const goToPrevious = () => {
        setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length)
    }

    const goToNext = () => {
        setCurrentIndex(prev => (prev + 1) % testimonials.length)
    }

    if (isLoading) {
        return (
            <Card className="bg-black border-none">
                <CardContent className="p-8 flex items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }

    if (testimonials.length === 0) {
        return null
    }

    const currentTestimonial = testimonials[currentIndex]

    return (
        <Card
            className="bg-black border-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <CardContent className="p-8 relative">
                <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToPrevious}
                        className="text-white/60 hover:text-white"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToNext}
                        className="text-white/60 hover:text-white"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className=" flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={currentTestimonial.imgname} alt={currentTestimonial.name} />
                            <AvatarFallback className="bg-primary text-white">
                                {currentTestimonial.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold text-white">{currentTestimonial.name}</div>
                            <div className="text-sm text-gray-400">
                                {currentTestimonial.role} at {currentTestimonial.company}
                            </div>
                            <div className="flex gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                        {currentTestimonial.content}
                    </p>

                </div>

                {/* Progress indicators */}
                <div className="flex justify-center gap-2 mt-6">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-primary' : 'bg-[#171717]'
                                }`}
                            aria-label={`Go to testimonial ${index + 1}`}
                        />
                    ))}
                </div>

            </CardContent>

            <style jsx>{`
                @keyframes progress {
                    0% { width: 0% }
                    100% { width: 100% }
                }
            `}</style>
        </Card>
    )
}

export default function ROICalculator() {
    const [country, setCountry] = useState("")
    const [teamMembers, setTeamMembers] = useState("")
    const [creativesPerWeek, setCreativesPerWeek] = useState("")
    const [roiData, setRoiData] = useState<ROIData | null>(null)
    const [loading, setLoading] = useState(false)
    const [showContactForm, setShowContactForm] = useState(false)

    const getWeeklyRangeMidpoint = (range: string): string => {
        const rangeMap: Record<string, string> = {
            "1-10": "5-6",
            "11-25": "18-19",
            "26-50": "38-39",
            "51-100": "75-76",
            "100+": "150-151"
        }
        return rangeMap[range] || ""
    }

    const getUserCount = (range: string): string => {
        const userMap: Record<string, string> = {
            "1-5": "3",
            "6-10": "8",
            "11-25": "18",
            "26-50": "38",
            "50+": "75"
        }
        return userMap[range] || ""
    }

    useEffect(() => {
        const fetchROI = async () => {
            if (country && teamMembers && creativesPerWeek) {
                setLoading(true)
                try {
                    const users = getUserCount(teamMembers)
                    const weeklyRange = getWeeklyRangeMidpoint(creativesPerWeek)

                    const response = await fetch(
                        `https://adalyzeai.xyz/App/api.php?gofor=calculateROI&country=${country}&users=${users}&weekly_range=${weeklyRange}`
                    )
                    const data = await response.json()
                    setRoiData(data)
                } catch (error) {
                    console.error("Error fetching ROI data:", error)
                    setRoiData(null)
                } finally {
                    setLoading(false)
                }
            } else {
                setRoiData(null)
            }
        }

        fetchROI()
    }, [country, teamMembers, creativesPerWeek])

    const costSavings = loading ? "Loading..." : (roiData?.Cost_Savings || "$--")
    const timeSaved = loading ? "Loading..." : (roiData?.Time_Saved || "-- hours")
    const roi = loading ? "Loading..." : (roiData?.ROI || "--")

    return (
        <div className="min-h-screen ">
            <Header />
            <div className="container mx-auto px-4 pt-16 pb-20 mt-24 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                    <span className="text-primary">See How Much Time & Money</span>
                    <br />
                    <span className="text-primary">Adalyze.app Can Save Your Company</span>
                </h1>
                <p className="text-white/70 text-lg mb-12">
                    Answer three quick questions and instantly get a{" "}
                    <span className="font-semibold text-white">Return on Investment</span> forecast.
                </p>
            </div>

            <div className="container mx-auto px-4 pb-16">
                <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
                    <div className="space-y-4">
                        <Card className="bg-black border-none">
                            <CardContent className="p-8">
                                <h2 className="text-2xl font-bold mb-8 text-white">Calculate your Return on Investment</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium mb-3 text-white/80">
                                            Country of operation
                                            <Info className="w-4 h-4 text-gray-500" />
                                        </label>
                                        <Select value={country} onValueChange={setCountry}>
                                            <SelectTrigger className="bg-[#171717] w-full text-white">
                                                <SelectValue placeholder="Please select" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#171717]">
                                                <SelectItem value="USA">USA</SelectItem>
                                                <SelectItem value="UK">UK</SelectItem>
                                                <SelectItem value="Canada">Canada</SelectItem>
                                                <SelectItem value="Australia">Australia</SelectItem>
                                                <SelectItem value="Germany">Germany</SelectItem>
                                                <SelectItem value="France">France</SelectItem>
                                                <SelectItem value="India">India</SelectItem>
                                                <SelectItem value="Brazil">Brazil</SelectItem>
                                                <SelectItem value="Mexico">Mexico</SelectItem>
                                                <SelectItem value="Singapore">Singapore</SelectItem>
                                                <SelectItem value="UAE">UAE</SelectItem>
                                                <SelectItem value="South Africa">South Africa</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium mb-3 text-white/80">
                                            Number of team members who will use adalyze.app
                                            <Info className="w-4 h-4 text-gray-500" />
                                        </label>
                                        <Select value={teamMembers} onValueChange={setTeamMembers}>
                                            <SelectTrigger className="bg-[#171717] w-full text-white">
                                                <SelectValue placeholder="Please select" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#171717]">
                                                <SelectItem value="1-5">1-5 members</SelectItem>
                                                <SelectItem value="6-10">6-10 members</SelectItem>
                                                <SelectItem value="11-25">11-25 members</SelectItem>
                                                <SelectItem value="26-50">26-50 members</SelectItem>
                                                <SelectItem value="50+">50+ members</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium mb-3 text-white/80">
                                            How many creatives do you need per week on average?
                                            <Info className="w-4 h-4 text-gray-500" />
                                        </label>
                                        <Select value={creativesPerWeek} onValueChange={setCreativesPerWeek}>
                                            <SelectTrigger className="bg-[#171717] w-full text-white">
                                                <SelectValue placeholder="Please select" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#171717]">
                                                <SelectItem value="1-10">1-10 creatives</SelectItem>
                                                <SelectItem value="11-25">11-25 creatives</SelectItem>
                                                <SelectItem value="26-50">26-50 creatives</SelectItem>
                                                <SelectItem value="51-100">51-100 creatives</SelectItem>
                                                <SelectItem value="100+">100+ creatives</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div>
                            <a href="#" className="text-primary text-sm underline">
                                Disclaimer
                            </a>
                        </div>
                    </div>

                    <Card className="bg-black border-none">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold mb-8 text-center text-white">
                                Your Return on Investment with
                                <br />
                                Adalyze.app
                            </h2>

                            <div className="flex justify-center mb-8">
                                {roiData && roiData.Return_on_Investment ? (
                                    <div className="text-4xl font-bold text-primary">{roiData.Return_on_Investment}</div>
                                ) : (
                                    <div className="flex gap-2">
                                        <div className="w-8 h-1 bg-primary rounded"></div>
                                        <div className="w-8 h-1 bg-primary rounded"></div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                                <div className="text-center bg-[#171717] rounded-lg p-4 sm:p-6 flex flex-col items-center gap-2">
                                    <div className="text-sm text-white/80 mb-1">Cost Savings</div>
                                    <div className="text-xl sm:text-2xl font-bold text-white">{costSavings}</div>
                                </div>
                                <div className="text-center bg-[#171717] rounded-lg p-4 sm:p-6 flex flex-col items-center gap-2">
                                    <div className="text-sm text-white/80 mb-1">Time Saved</div>
                                    <div className="text-xl sm:text-2xl font-bold text-white">{timeSaved}</div>
                                </div>
                                <div className="text-center bg-[#171717] rounded-lg p-4 sm:p-6 flex flex-col items-center gap-2 sm:col-span-2 lg:col-span-1">
                                    <div className="text-sm text-white/80 mb-1">ROI</div>
                                    <div className="text-xl sm:text-2xl font-bold text-white">{roi}</div>
                                </div>
                            </div>

                            <div className="text-center text-sm text-white/80 mb-6">
                                <div>Currency in $USD</div>
                                <div>Annual Estimates</div>
                            </div>

                            <div className="bg-[#171717] rounded-lg p-6 text-center">
                                <p className="text-sm text-white/80">
                                    {roiData ? (
                                        <>Your ROI has been calculated based on your selections!</>
                                    ) : (
                                        <>
                                            Complete the details in left side to unlock your
                                            <br />
                                            recommended plan.
                                        </>
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
                    <div className="bg-black p-8 rounded-lg">
                        <h2 className="text-3xl font-bold mb-6 text-white">How our Return of Investment calculator works</h2>
                        <p className="text-gray-400 mb-6">
                            ROI shows how many times the Adalyze.app subscription pays for itself. It's calculated as:
                        </p>
                        <div className="bg-[#171717] p-4 rounded-lg mb-8">
                            <code className="text-primary text-sm">
                                (Savings on traditional design fees – Adalyze.app yearly fee) ÷ Adalyze.app yearly fee.
                            </code>
                        </div>

                        <h3 className="text-xl font-bold mb-4 text-white">What we compare</h3>
                        <div className="space-y-4 text-gray-400 mb-8">
                            <p>
                                <span className="font-semibold text-white">Traditional design cost</span> – what you'd normally pay a
                                designer or agency to create the same number of creatives in one year.
                            </p>
                            <p>
                                <span className="font-semibold text-white">Adalyze.app plan cost</span> – the yearly price of the
                                smallest plan that fits both your team size and creative volume.
                            </p>
                        </div>

                        <h3 className="text-xl font-bold mb-4 text-white">How we estimate traditional cost</h3>
                        <ol className="space-y-2 text-gray-400 list-decimal list-inside mb-8">
                            <li>We take the mid-point of the weekly-creative range you picked and convert it to a yearly total.</li>
                            <li>We multiply that by a 1-hour-per-creative industry average.</li>
                            <li>We multiply the hours by the designer hourly rate for your country.</li>
                        </ol>

                        <h3 className="text-xl font-bold mb-4 text-white">Plan selection logic</h3>
                        <p className="text-gray-400">
                            Upper-bound of your weekly range decides the download tier; your seat bucket decides the user tier. We
                            choose the higher-priced of those two tiers so the plan always covers both needs.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <Card className="bg-black border-none">
                            <CardContent className="p-8">
                                <h2 className="text-2xl font-bold mb-6 text-white">Calculate Your ROI with Our Sales Team</h2>
                                <p className="text-gray-400 mb-8">
                                    Book a call with our team to review your ROI results, explore your specific use case and get clear next
                                    steps for implementing Adalyze.app in your business.
                                </p>

                                <Button
                                    className="w-full bg-primary text-white font-semibold py-6 mb-8 hover:bg-primary/90"
                                    onClick={() => setShowContactForm(true)}
                                >
                                    Book Your ROI Call
                                </Button>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex -space-x-2">
                                        <Avatar className="w-8 h-8 border-2 border-[#171717]">
                                            <AvatarImage src={avt1.src} alt="User 1" />
                                            <AvatarFallback>U1</AvatarFallback>
                                        </Avatar>
                                        <Avatar className="w-8 h-8 border-2 border-[#171717]">
                                            <AvatarImage src={avt2.src} alt="User 2" />
                                            <AvatarFallback>U2</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <span className="text-sm text-gray-400">
                                        Supporting over <span className="font-semibold text-white">+12,000 users</span> worldwide
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dynamic Testimonial Slider */}
                        <TestimonialSlider />
                    </div>
                </div>
            </div>
            <FAQSection ButtonText={"Start Free Trial"} />
            <LandingPageFooter />
            {showContactForm && (
                <ContactFormModal onClose={() => setShowContactForm(false)} />
            )}
        </div>
    )
}
