"use client"

import { useState, useEffect, ChangeEvent, useRef } from "react"
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
import Captcha, { CaptchaHandle } from "@/components/Captcha"
import avt1 from "@/assets/roi-p1.webp"
import avt2 from "@/assets/roi-p2.webp"
import ROIBanner from "@/assets/Landing-page/roi-banner.webp"
import { motion } from "framer-motion"
import Image from "next/image"
import { trackEvent } from "@/lib/eventTracker"
import Spinner from "@/components/overlay"

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

// removed Country interface as we now use a static list

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
    const captchaRef = useRef<CaptchaHandle>(null)

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormState(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async () => {
        if (isSubmitting) return

        // ✅ Verify captcha before API
        const isCaptchaOk = captchaRef.current?.verify()
        if (!isCaptchaOk) return // ❌ Stop silently — inline error will appear below captcha

        const { email, description } = formState

        try {
            setIsSubmitting(true)

            const response = await fetch("https://adalyzeai.xyz/App/tapi.php", {
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
                captchaRef.current?.reset()
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 sm:p-4">
            <Card className="w-full max-w-md shadow-lg bg-black max-h-[90vh] overflow-y-auto">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex justify-between items-start text-base sm:text-lg gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="text-white">Book Your ROI Call</div>
                            <div className="text-gray-300 text-xs sm:text-sm font-thin mt-1">
                                Submit your details and we'll get back to you within 24 hours!
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
                            <X className="h-4 w-4 text-white" />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
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
                            className="bg-[#171717]  text-white"
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
                            className="bg-[#171717]  text-white"
                        />
                    </div>

                    {/* Captcha inline validation */}
                    <Captcha ref={captchaRef} />
                </CardContent>
                <CardFooter className="p-4 sm:p-6 pt-0">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formState.email || !formState.description}
                        className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base py-2.5 sm:py-3"
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
                const response = await fetch('https://adalyzeai.xyz/App/tapi.php?gofor=testilist')
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
            <Spinner />
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
            <CardContent className="p-4 sm:p-6 md:p-8 relative">
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-1 sm:gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToPrevious}
                        className="text-white/60 hover:text-white h-7 w-7 sm:h-8 sm:w-8"
                    >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToNext}
                        className="text-white/60 hover:text-white h-7 w-7 sm:h-8 sm:w-8"
                    >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                </div>

                <div className="flex flex-col justify-center pr-8 sm:pr-10 md:pr-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                            <AvatarImage src={currentTestimonial.imgname} alt={currentTestimonial.name} />
                            <AvatarFallback className="bg-primary text-white text-xs sm:text-sm">
                                {currentTestimonial.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-white text-sm sm:text-base truncate">{currentTestimonial.name}</div>
                            <div className="text-xs sm:text-sm text-white/80 truncate">
                                {currentTestimonial.role} at {currentTestimonial.company}
                            </div>
                            <div className="flex gap-0.5 sm:gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-orange-500 text-orange-500" />
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="text-white/70 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">
                        {currentTestimonial.content}
                    </p>

                </div>

                {/* Progress indicators */}
                <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-primary' : 'bg-[#171717]'
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

    // Using static country list now; no search/dropdown states needed

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

    // Removed countries API, search, and custom dropdown handlers

    useEffect(() => {
        const fetchROI = async () => {
            if (country && teamMembers && creativesPerWeek) {
                setLoading(true)
                try {
                    const users = getUserCount(teamMembers)
                    const weeklyRange = getWeeklyRangeMidpoint(creativesPerWeek)

                    const response = await fetch(
                        `https://adalyzeai.xyz/App/tapi.php?gofor=calculateROI&country=${country}&users=${users}&weekly_range=${weeklyRange}`
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

            {/* Hero Section */}
            <section className="min-h-screen sm:h-screen pt-20 sm:pt-28 md:pt-32 lg:pt-36 pb-8 sm:pb-10 md:pb-12 lg:pb-14 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12">
                        <div className="order-2 md:order-1 md:max-w-2xl">
                            <motion.h1
                                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 text-balance leading-tight"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    ease: "easeOut",
                                    delay: 0.2
                                }}
                            >
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="block"
                                >
                                    See How Much
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                    className="block text-primary"
                                >
                                    Adalyze.app Can Save You
                                </motion.span>
                            </motion.h1>
                            <motion.p
                                className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4 sm:mb-6 md:mb-8 leading-relaxed"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.6,
                                    ease: "easeOut",
                                    delay: 0.8
                                }}
                            >
                                Answer three quick questions and instantly get a Return on Investment forecast - see the potential time and cost savings.

                            </motion.p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                                <Button size="lg"
                                    onClick={() => {
                                        window.open("/register", "_blank", "noopener,noreferrer");
                                        trackEvent("Agencies_Start_Free_Trial_button_clicked", window.location.href);
                                    }}
                                    className="flex items-center cursor-pointer gap-2 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors w-full sm:w-auto min-w-[180px] sm:min-w-[200px] md:min-w-[220px]"
                                >
                                    Start Your Free Trial
                                </Button>
                            </div>
                        </div>
                        <div className="order-1 md:order-2 flex items-center justify-center md:justify-end w-full h-auto md:h-full min-h-[250px] sm:min-h-[300px] md:min-h-[350px] lg:min-h-[400px] xl:min-h-[450px] md:max-w-md lg:max-w-lg xl:max-w-xl">
                            <Image
                                src={ROIBanner}
                                alt="Agency Dashboard Preview"
                                className="object-contain w-full h-auto max-w-full md:max-w-md lg:max-w-lg xl:max-w-xl scale-100 sm:scale-105 md:scale-100 bounce-slow"
                                width={1000}
                                height={750}
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>


            {/* ROI Calculator */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-12 sm:pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto items-start">
                    <div className="space-y-4">
                        <Card className="bg-black border-none">
                            <CardContent className="p-4 sm:p-6 md:p-8">
                                <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-white">Calculate your Return on Investment</h2>

                                <div className="space-y-4 sm:space-y-6">
                                    <div>
                                        <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-white/80">
                                            Country of operation
                                            <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                                        </label>
                                        <Select value={country} onValueChange={setCountry}>
                                            <SelectTrigger className="bg-[#171717] w-full text-white text-sm sm:text-base py-5.5">
                                                <SelectValue placeholder="Please select" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#171717] max-h-50">
                                                <SelectItem value="USA" className="text-sm sm:text-base">USA</SelectItem>
                                                <SelectItem value="UK" className="text-sm sm:text-base">UK</SelectItem>
                                                <SelectItem value="Canada" className="text-sm sm:text-base">Canada</SelectItem>
                                                <SelectItem value="Australia" className="text-sm sm:text-base">Australia</SelectItem>
                                                <SelectItem value="Germany" className="text-sm sm:text-base">Germany</SelectItem>
                                                <SelectItem value="France" className="text-sm sm:text-base">France</SelectItem>
                                                <SelectItem value="India" className="text-sm sm:text-base">India</SelectItem>
                                                <SelectItem value="Brazil" className="text-sm sm:text-base">Brazil</SelectItem>
                                                <SelectItem value="Mexico" className="text-sm sm:text-base">Mexico</SelectItem>
                                                <SelectItem value="Singapore" className="text-sm sm:text-base">Singapore</SelectItem>
                                                <SelectItem value="UAE" className="text-sm sm:text-base">UAE</SelectItem>
                                                <SelectItem value="South Africa" className="text-sm sm:text-base">South Africa</SelectItem>
                                                <SelectItem value="Other" className="text-sm sm:text-base">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-white/80">
                                            <span className="line-clamp-2">Number of team members who will use adalyze.app</span>
                                            <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                                        </label>
                                        <Select value={teamMembers} onValueChange={setTeamMembers}>
                                            <SelectTrigger className="bg-[#171717] w-full text-white text-sm sm:text-base min-h-[40px] sm:min-h-[44px]">
                                                <SelectValue placeholder="Please select" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#171717]">
                                                <SelectItem value="1-5" className="text-sm sm:text-base">1-5 members</SelectItem>
                                                <SelectItem value="6-10" className="text-sm sm:text-base">6-10 members</SelectItem>
                                                <SelectItem value="11-25" className="text-sm sm:text-base">11-25 members</SelectItem>
                                                <SelectItem value="26-50" className="text-sm sm:text-base">26-50 members</SelectItem>
                                                <SelectItem value="50+" className="text-sm sm:text-base">50+ members</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-white/80">
                                            <span className="line-clamp-2">How many creatives do you need per week on average?</span>
                                            <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                                        </label>
                                        <Select value={creativesPerWeek} onValueChange={setCreativesPerWeek}>
                                            <SelectTrigger className="bg-[#171717] w-full text-white text-sm sm:text-base min-h-[40px] sm:min-h-[44px]">
                                                <SelectValue placeholder="Please select" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#171717]">
                                                <SelectItem value="1-10" className="text-sm sm:text-base">1-10 creatives</SelectItem>
                                                <SelectItem value="11-25" className="text-sm sm:text-base">11-25 creatives</SelectItem>
                                                <SelectItem value="26-50" className="text-sm sm:text-base">26-50 creatives</SelectItem>
                                                <SelectItem value="51-100" className="text-sm sm:text-base">51-100 creatives</SelectItem>
                                                <SelectItem value="100+" className="text-sm sm:text-base">100+ creatives</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div>
                            <a href="#" className="text-primary text-xs sm:text-sm underline">
                                Disclaimer
                            </a>
                        </div>
                    </div>

                    <Card className="bg-black border-none">
                        <CardContent className="p-4 sm:p-6 md:p-8">
                            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center text-white">
                                Your Return on Investment with
                                <br />
                                Adalyze.app
                            </h2>

                            <div className="flex justify-center mb-6 sm:mb-8">
                                {roiData && roiData.Return_on_Investment ? (
                                    <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary break-words text-center">{roiData.Return_on_Investment}</div>
                                ) : (
                                    <div className="flex gap-2">
                                        <div className="w-6 h-1 sm:w-8 sm:h-1 bg-primary rounded"></div>
                                        <div className="w-6 h-1 sm:w-8 sm:h-1 bg-primary rounded"></div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                                <div className="text-center bg-[#171717] rounded-lg p-3 sm:p-4 md:p-6 flex flex-col items-center gap-2">
                                    <div className="text-xs sm:text-sm text-white/80 mb-1">Cost Savings</div>
                                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-white break-words">{costSavings}</div>
                                </div>
                                <div className="text-center bg-[#171717] rounded-lg p-3 sm:p-4 md:p-6 flex flex-col items-center gap-2">
                                    <div className="text-xs sm:text-sm text-white/80 mb-1">Time Saved</div>
                                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-white break-words">{timeSaved}</div>
                                </div>
                                <div className="text-center bg-[#171717] rounded-lg p-3 sm:p-4 md:p-6 flex flex-col items-center gap-2 sm:col-span-2 lg:col-span-1">
                                    <div className="text-xs sm:text-sm text-white/80 mb-1">ROI</div>
                                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-white break-words">{roi}</div>
                                </div>
                            </div>

                            <div className="text-center text-xs sm:text-sm text-white/80 mb-4 sm:mb-6 space-y-1">
                                <div>Currency in $USD</div>
                                <div>Annual Estimates</div>
                            </div>

                            <div className="bg-[#171717] rounded-lg p-4 sm:p-6 text-center">
                                <p className="text-xs sm:text-sm text-white/80">
                                    {roiData ? (
                                        <>Your ROI has been calculated based on your selections!</>
                                    ) : (
                                        <>
                                            Complete the details in left side to unlock your
                                            <br className="hidden sm:block" />
                                            <span className="sm:hidden"> </span>recommended plan.
                                        </>
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* How it works */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto items-start">
                    <div className="bg-black p-4 sm:p-6 md:p-8 rounded-lg">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white">How our Return of Investment calculator works</h2>
                        <p className="text-white/70 mb-4 sm:mb-6 text-sm sm:text-base">
                            ROI shows how many times the Adalyze.app subscription pays for itself. It's calculated as:
                        </p>
                        <div className="bg-[#171717] p-3 sm:p-4 rounded-lg mb-6 sm:mb-8">
                            <code className="text-primary text-xs sm:text-sm break-words">
                                (Savings on traditional design fees – Adalyze.app yearly fee) ÷ Adalyze.app yearly fee.
                            </code>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">What we compare</h3>
                        <div className="space-y-3 sm:space-y-4 text-white/70 mb-6 sm:mb-8 text-sm sm:text-base">
                            <p>
                                <span className="font-semibold text-white">Traditional design cost</span> – what you'd normally pay a
                                designer or agency to create the same number of creatives in one year.
                            </p>
                            <p>
                                <span className="font-semibold text-white">Adalyze.app plan cost</span> – the yearly price of the
                                smallest plan that fits both your team size and creative volume.
                            </p>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">How we estimate traditional cost</h3>
                        <ol className="space-y-2 text-white/70 list-decimal list-inside mb-6 sm:mb-8 text-sm sm:text-base">
                            <li>We take the mid-point of the weekly-creative range you picked and convert it to a yearly total.</li>
                            <li>We multiply that by a 1-hour-per-creative industry average.</li>
                            <li>We multiply the hours by the designer hourly rate for your country.</li>
                        </ol>

                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">Plan selection logic</h3>
                        <p className="text-white/70 text-sm sm:text-base">
                            Upper-bound of your weekly range decides the download tier; your seat bucket decides the user tier. We
                            choose the higher-priced of those two tiers so the plan always covers both needs.
                        </p>
                    </div>

                    {/* Calculate Your ROI with Our Sales Team */}
                    <div className="space-y-6 sm:space-y-8">
                        <Card className="bg-black border-none">
                            <CardContent className="p-4 sm:p-6 md:p-8">
                                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">Calculate Your ROI with Our Sales Team</h2>
                                <p className="text-white/70 mb-6 sm:mb-8 text-sm sm:text-base">
                                    Book a call with our team to review your ROI results, explore your specific use case and get clear next
                                    steps for implementing Adalyze.app in your business.
                                </p>

                                <Button
                                    className="w-full bg-primary text-white font-semibold py-4 sm:py-5 md:py-6 mb-6 sm:mb-8 hover:bg-primary/90 text-sm sm:text-base"
                                    onClick={() => setShowContactForm(true)}
                                >
                                    Book Your ROI Call
                                </Button>

                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-0">
                                    <div className="flex -space-x-2">
                                        <Avatar className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-[#171717]">
                                            <AvatarImage src={avt1.src} alt="User 1" />
                                            <AvatarFallback className="text-xs">U1</AvatarFallback>
                                        </Avatar>
                                        <Avatar className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-[#171717]">
                                            <AvatarImage src={avt2.src} alt="User 2" />
                                            <AvatarFallback className="text-xs">U2</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <span className="text-xs sm:text-sm text-white/70">
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
            <FAQSection ButtonText={"Start Free Trial"} category="general" />
            <LandingPageFooter />
            {showContactForm && (
                <ContactFormModal onClose={() => setShowContactForm(false)} />
            )}
        </div>
    )
}
