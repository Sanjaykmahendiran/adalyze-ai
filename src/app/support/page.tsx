"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, ChevronDown, ChevronUp, MessageCircle, Mail, Send, Phone, Star, X, Calendar, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Cookies from 'js-cookie'
import toast from "react-hot-toast"
import Spinner from "@/components/overlay"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import SupportPageSkeleton from "@/components/Skeleton-loading/SupportPageSkeleton"

interface FAQ {
  faq_id: number
  question: string
  answer: string
  category: string
  status: number
  created_date: string
}

interface Ad {
  ads_type: string
  ad_id: number
  ads_name: string
  image_path: string
  industry: string
  score: number
  platforms: string
  uploaded_on: string 
}

export default function SupportPage() {
  const { userDetails } = useFetchUserDetails()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [showExpertDialog, setShowExpertDialog] = useState(false)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  // Check if user is pro
  const isProUser = userDetails?.payment_status === 1

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
    imgname: ""
  })

  const [expertCallData, setExpertCallData] = useState({
    prefdate: "",
    preftime: "",
    comments: ""
  })

  const [feedbackData, setFeedbackData] = useState({
    ad_upload_id: "",
    rating: "",
    comments: ""
  })

  const categories = ["General", "Pricing", "Technical", "Uploads", "Scoring", "Subscription"]

  // Fetch FAQs
  useEffect(() => {
    fetchFAQs()
  }, [selectedCategory])

  // Fetch ads when feedback dialog opens
  useEffect(() => {
    if (showFeedbackDialog) {
      fetchAds()
    }
  }, [showFeedbackDialog])

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const url = `https://adalyzeai.xyz/App/api.php?gofor=faqlist&category=${selectedCategory}`;

      const response = await fetch(url)
      const data = await response.json()
      setFaqs(data || [])
    } catch (error) {
      console.error("Error fetching FAQs:", error)
      setFaqs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAds = async () => {
    try {
      const userId = Cookies.get('userId')
      if (!userId) return

      const url = `https://adalyzeai.xyz/App/api.php?gofor=adslist&user_id=${userId}`;
      const response = await fetch(url)
      const data = await response.json()
      setAds(data || [])
    } catch (error) {
      console.error("Error fetching ads:", error)
      setAds([])
    }
  }

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const userId = Cookies.get('userId')

      const response = await fetch('https://adalyzeai.xyz/App/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gofor: "needhelp",
          user_id: userId,
          description: formData.message,
          category: formData.category,
          imgname: formData.imgname || ""
        })
      })

      if (response.ok) {
        toast.success('Support request submitted successfully!')
        setFormData({ name: "", email: "", category: "", message: "", imgname: "" })
      }
    } catch (error) {
      console.error("Error submitting support request:", error)
      toast.error('Failed to submit support request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleExpertCallSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const userId = Cookies.get('userId')

      const response = await fetch('https://adalyzeai.xyz/App/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gofor: "exptalkrequest",
          user_id: userId,
          prefdate: expertCallData.prefdate,
          preftime: expertCallData.preftime,
          comments: expertCallData.comments
        })
      })

      if (response.ok) {
        toast.success('Expert call request submitted successfully!')
        setExpertCallData({ prefdate: "", preftime: "", comments: "" })
        setShowExpertDialog(false)
      }
    } catch (error) {
      console.error("Error submitting expert call request:", error)
      toast.error('Failed to submit expert call request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const userId = Cookies.get('userId')

      const response = await fetch('https://adalyzeai.xyz/App/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gofor: "feedback",
          user_id: userId,
          ad_upload_id: feedbackData.ad_upload_id,
          rating: feedbackData.rating,
          comments: feedbackData.comments
        })
      })

      if (response.ok) {
        toast.success('Feedback submitted successfully!')
        setFeedbackData({ ad_upload_id: "", rating: "", comments: "" })
        setShowFeedbackDialog(false)
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <UserLayout userDetails={userDetails}>
      {loading ? <SupportPageSkeleton /> : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Support Center</h1>
                <p className="text-sm sm:text-base text-gray-300">Get help and find answers to common questions</p>
              </div>

              <div className="flex items-start sm:items-center gap-2">
                {/* AI Chatbot / Expert Call Button */}
                <Button
                  size="sm"
                  variant={isProUser ? "default" : "outline"}
                  className="flex-1 text-sm sm:text-base py-5"
                  disabled={!isProUser}
                  onClick={() => isProUser && setShowExpertDialog(true)}
                >
                  {isProUser ? (
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  ) : (
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">
                    {isProUser ? "Schedule Call" : "Start Chat (Upgrade to Pro)"}
                  </span>
                  <span className="sm:hidden">{isProUser ? "Schedule Expert Call" : "Upgrade  to Pro"}</span>
                </Button>

                {/* Feedback Button */}
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-[#2b2b2b] text-sm sm:text-base py-5"
                  onClick={() => setShowFeedbackDialog(true)}
                >
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Give Feedback
                </Button>
              </div>

            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-black rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                placeholder="Search for help articles, FAQs, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 bg-[#171717]  focus:border-primary outline-none text-white placeholder:text-gray-300 text-sm sm:text-base"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`text-xs sm:text-sm ${selectedCategory === category ? "bg-primary" : "border-[#2b2b2b]"}`}
                >
                  {category}
                </Button>
              ))}
            </div>

          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* FAQ Section */}
            <div className="xl:col-span-2 order-2 xl:order-1">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Frequently Asked Questions</h2>

              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-black rounded-lg p-4 sm:p-6 animate-pulse">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-16 sm:w-20 h-4 sm:h-5 bg-[#2b2b2b] rounded"></div>
                        <div className="flex-1 h-4 sm:h-5 bg-[#2b2b2b] rounded"></div>
                      </div>
                      <div className="h-3 sm:h-4 bg-[#2b2b2b] rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : filteredFaqs.length === 0 ? (
                <div className="bg-black rounded-lg p-6 sm:p-8 text-center">
                  <p className="text-sm sm:text-base text-gray-300">No FAQs found matching your search.</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {filteredFaqs.map((faq, index) => (
                    <div key={faq.faq_id} className="bg-black rounded-lg">
                      <button
                        className="w-full p-4 sm:p-6 text-left flex items-start sm:items-center justify-between transition-colors gap-3"
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <span className="font-medium text-sm sm:text-base break-words text-gray-300">{faq.question}</span>
                        </div>
                        <div className="shrink-0 mt-1 sm:mt-0">
                          {expandedFaq === index ? (
                            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                          ) : (
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                          )}
                        </div>
                      </button>

                      {expandedFaq === index && (
                        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                          <p className="text-sm sm:text-base text-white/80 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="order-1 xl:order-2 space-y-4 sm:space-y-6">
              {/* Contact Form */}
              <div className="bg-black rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold  text-white/80 mb-4">Contact Support</h3>

                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-[#171717] border-[#2b2b2b] text-sm sm:text-base"
                      placeholder="Your Name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-[#171717] border-[#2b2b2b] text-sm sm:text-base"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="w-full bg-[#171717] border-[#2b2b2b] text-sm sm:text-base">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical">Technical Issue</SelectItem>
                        <SelectItem value="Pricing">Pricing Question</SelectItem>
                        <SelectItem value="General">General Question</SelectItem>
                        <SelectItem value="Uploads">Upload Problem</SelectItem>
                        <SelectItem value="Scoring">Scoring Question</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-[#171717] border-[#2b2b2b] min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                      placeholder="Describe your issue or question..."
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full text-sm sm:text-base" disabled={loading}>
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>

            </div>
          </div>

          {/* Expert Call Dialog */}
          {showExpertDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-black border border-[#2b2b2b] rounded-lg p-4 sm:p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">Schedule Expert Call</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExpertDialog(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={handleExpertCallSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Date</label>
                    <Input
                      type="date"
                      value={expertCallData.prefdate}
                      onChange={(e) => setExpertCallData({ ...expertCallData, prefdate: e.target.value })}
                      className="bg-[#171717] border-[#2b2b2b] text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Time</label>
                    <Input
                      type="time"
                      value={expertCallData.preftime}
                      onChange={(e) => setExpertCallData({ ...expertCallData, preftime: e.target.value })}
                      className="bg-[#171717] border-[#2b2b2b] text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Comments</label>
                    <Textarea
                      value={expertCallData.comments}
                      onChange={(e) => setExpertCallData({ ...expertCallData, comments: e.target.value })}
                      className="bg-[#171717] border-[#2b2b2b] min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                      placeholder="What would you like to discuss?"
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 text-sm sm:text-base"
                      onClick={() => setShowExpertDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 text-sm sm:text-base" disabled={loading}>
                      {loading ? "Scheduling..." : "Schedule Call"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Feedback Dialog */}
          {showFeedbackDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-black border border-[#2b2b2b] rounded-lg p-4 sm:p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">Share Your Feedback</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFeedbackDialog(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Ad (Optional)</label>
                    <Select
                      value={feedbackData.ad_upload_id}
                      onValueChange={(value) => setFeedbackData({ ...feedbackData, ad_upload_id: value })}
                    >
                      <SelectTrigger className="w-full bg-[#171717] border-[#2b2b2b] text-sm sm:text-base">
                        <SelectValue placeholder="Select an ad (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No specific ad</SelectItem>
                        {ads.map((ad) => (
                          <SelectItem key={ad.ad_id} value={String(ad.ad_id)}>
                            {ad.ads_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Rating (1-10)</label>
                    <Select
                      value={feedbackData.rating}
                      onValueChange={(value) => setFeedbackData({ ...feedbackData, rating: value })}
                    >
                      <SelectTrigger className="w-full bg-[#171717] border-[#2b2b2b] text-sm sm:text-base">
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {i + 1} Star{i + 1 > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Comments</label>
                    <Textarea
                      value={feedbackData.comments}
                      onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
                      className="bg-[#171717] border-[#2b2b2b] min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                      placeholder="Share your thoughts and suggestions..."
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 text-sm sm:text-base"
                      onClick={() => setShowFeedbackDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 text-sm sm:text-base" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Feedback"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </UserLayout>
  )
}
