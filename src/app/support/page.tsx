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

export default function SupportPage() {
  const { userDetails } = useFetchUserDetails()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [isProUser, setIsProUser] = useState(false)
  const [showExpertDialog, setShowExpertDialog] = useState(false)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)

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

  const categories = ["all", "General", "Pricing", "Technical", "Uploads", "Scoring", "Subscription"]

  // Check if user is pro
  useEffect(() => {
    const paymentStatus = userDetails?.payment_status || ''
    setIsProUser(paymentStatus === 1)
  }, [])

  // Fetch FAQs
  useEffect(() => {
    fetchFAQs()
  }, [selectedCategory])

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const url = selectedCategory === "all"
        ? "https://adalyzeai.xyz/App/api.php?gofor=faqlist"
        : `https://adalyzeai.xyz/App/api.php?gofor=faqlist&category=${selectedCategory}`

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Support Center</h1>
            <p className="text-gray-400">Get help and find answers to common questions</p>
          </div>

          {/* Search Bar */}
          <div className="bg-black rounded-lg p-6 mb-8">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for help articles, FAQs, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#121212] border-[#2b2b2b] focus:border-primary outline-none text-white placeholder:text-gray-300"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-primary" : "border-[#2b2b2b]"}
                >
                  {category === "all" ? "All Topics" : category}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FAQ Section */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-black rounded-lg p-6 animate-pulse">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-20 h-5 bg-[#2b2b2b] rounded"></div>
                        <div className="flex-1 h-5 bg-[#2b2b2b] rounded"></div>
                      </div>
                      <div className="h-4 bg-[#2b2b2b] rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : filteredFaqs.length === 0 ? (
                <div className="bg-black rounded-lg p-8 text-center">
                  <p className="text-gray-300">No FAQs found matching your search.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFaqs.map((faq, index) => (
                    <div key={faq.faq_id} className="bg-black rounded-lg">
                      <button
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-[#121212] transition-colors"
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs bg-[#121212]">
                            {faq.category}
                          </Badge>
                          <span className="font-medium">{faq.question}</span>
                        </div>
                        {expandedFaq === index ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {expandedFaq === index && (
                        <div className="px-6 pb-6">
                          <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div>
              {/* Contact Form */}
              <div className="bg-black rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Contact Support</h3>

                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-[#121212] border-[#2b2b2b]"
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
                      className="bg-[#121212] border-[#2b2b2b]"
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
                      <SelectTrigger className="w-full bg-[#121212] border-[#2b2b2b]">
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
                      className="bg-[#121212] border-[#2b2b2b] min-h-[120px]"
                      placeholder="Describe your issue or question..."
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>

              {/* AI Chatbot / Expert Call */}
              <div className="bg-black rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Ask AdalyzeBot</h3>
                  {!isProUser && <Badge className="bg-gradient-to-b from-[#ff6a00] via-[#db4900] to-[#a63a00]">Pro Only</Badge>}
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  {isProUser ? "Schedule a call with our AI experts for personalized guidance." : "Get instant answers from our AI assistant trained on Adalyze knowledge."}
                </p>
                <Button
                  variant={isProUser ? "default" : "outline"}
                  className="w-full"
                  disabled={!isProUser}
                  onClick={() => isProUser && setShowExpertDialog(true)}
                >
                  {isProUser ? <Phone className="w-4 h-4 mr-2" /> : <MessageCircle className="w-4 h-4 mr-2" />}
                  {isProUser ? "Schedule Call" : "Start Chat (Upgrade to Pro)"}
                </Button>
              </div>

              {/* Feedback Section */}
              <div className="bg-black rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Share Your Feedback</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Help us improve by sharing your experience with Adalyze AI.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-[#2b2b2b]"
                  onClick={() => setShowFeedbackDialog(true)}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Give Feedback
                </Button>
              </div>

              {/* Response Time Notice */}
              <div className="bg-black rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-2">Response Time</h3>
                <p className="text-gray-400 text-sm">
                  We typically respond to support requests within 24 hours during business days.
                </p>
              </div>

              {/* Contact Links */}
              <div className="bg-black rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Other Ways to Reach Us</h3>
                <div className="space-y-3">
                  <a
                    href="mailto:support@adalyze.com"
                    className="flex items-center gap-3 p-3 bg-[#121212] rounded-lg hover:bg-[#2b2b2b] transition-colors"
                  >
                    <Mail className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-medium">Email Support</div>
                      <div className="text-sm text-gray-400">support@adalyze.com</div>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/1234567890"
                    className="flex items-center gap-3 p-3 bg-[#121212] rounded-lg hover:bg-[#2b2b2b] transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-medium">WhatsApp</div>
                      <div className="text-sm text-gray-400">Quick support chat</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Expert Call Dialog */}
          {showExpertDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-black border border-[#2b2b2b] rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Schedule Expert Call</h3>
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
                      className="bg-[#121212] border-[#2b2b2b]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Time</label>
                    <Input
                      type="time"
                      value={expertCallData.preftime}
                      onChange={(e) => setExpertCallData({ ...expertCallData, preftime: e.target.value })}
                      className="bg-[#121212] border-[#2b2b2b]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Comments</label>
                    <Textarea
                      value={expertCallData.comments}
                      onChange={(e) => setExpertCallData({ ...expertCallData, comments: e.target.value })}
                      className="bg-[#121212] border-[#2b2b2b] min-h-[100px]"
                      placeholder="What would you like to discuss?"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowExpertDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? "Scheduling..." : "Schedule Call"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Feedback Dialog */}
          {showFeedbackDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-black border border-[#2b2b2b] rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Share Your Feedback</h3>
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
                    <label className="block text-sm font-medium mb-2">Ad Upload ID (Optional)</label>
                    <Input
                      value={feedbackData.ad_upload_id}
                      onChange={(e) => setFeedbackData({ ...feedbackData, ad_upload_id: e.target.value })}
                      className="bg-[#121212] border-[#2b2b2b]"
                      placeholder="Enter ad upload ID if applicable"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Rating (1-10)</label>
                    <Select
                      value={feedbackData.rating}
                      onValueChange={(value) => setFeedbackData({ ...feedbackData, rating: value })}
                    >
                      <SelectTrigger className="w-full bg-[#121212] border-[#2b2b2b]">
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
                      className="bg-[#121212] border-[#2b2b2b] min-h-[100px]"
                      placeholder="Share your thoughts and suggestions..."
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowFeedbackDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
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