"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, ReceiptText, Plus, X } from "lucide-react"
import Cookies from "js-cookie"
import toast from "react-hot-toast"
import ExpertConsultationPopup from "@/components/expert-form"

type SupportItem = {
  help_id: number
  email: string | null
  user_id: number
  category: string | null
  description: string | null
  comments?: string | null
  estatus?: string | null
  status?: number | string | null
  created_date?: string | null
  user_name?: string | null
}

type FeedbackItem = {
  fbid: number
  user_id: number
  ad_upload_id?: number
  rating?: number
  comments?: string | null
  status?: number | string | null
  created_date?: string | null
  user_name?: string | null
  ads_name?: string | null
}

type ExpertItem = {
  exptalk_id: number
  user_id: number
  prefdate?: string | null
  preftime?: string | null
  comments?: string | null
  estatus?: string | null
  status?: number | string | null
  created_date?: string | null
  modified_date?: string | null
  user_name?: string | null
}

function classForEstatus(v?: string | null) {
  const s = String(v ?? "").toLowerCase()
  if (s === "pending") return "bg-yellow-600 text-white"
  if (s === "completed" || s === "resolved") return "bg-green-600 text-white"
  if (s === "open") return "bg-sky-600 text-white"
  if (s === "scheduled") return "bg-blue-600 text-white"
  return "bg-gray-700 text-gray-100"
}

function classForStatus(v?: number | string | null) {
  const n = typeof v === "number" ? v : Number(v)
  if (Number.isFinite(n)) {
    if (n === 1) return "bg-green-600 text-white"
    if (n === 0) return "bg-zinc-700 text-gray-100"
  }
  return "bg-zinc-700 text-gray-100"
}

function useSearchFilter<T>(rows: T[], picker: (r: T) => string) {
  const [q, setQ] = useState("")
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return rows
    return rows.filter((r) => picker(r).includes(t))
  }, [rows, q, picker])
  return { q, setQ, filtered }
}

function TableShell({
  title,
  placeholder,
  headers,
  rows,
  renderRow,
  renderMobileCard,
  searchPicker,
  onAdd,
}: {
  title: string
  placeholder: string
  headers: string[]
  rows: any[]
  renderRow: (row: any) => React.ReactNode
  renderMobileCard: (row: any) => React.ReactNode
  searchPicker: (row: any) => string
  onAdd?: () => void
}) {
  const { q, setQ, filtered } = useSearchFilter(rows, searchPicker)

  return (
    <Card className="rounded-2xl bg-black  w-full p-4 sm:p-6 relative overflow-hidden">
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-white">{title}</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Input
              type="text"
              placeholder={placeholder}
              className="pl-10 pr-4 py-2 rounded-md text-sm w-full bg-[#171717] text-gray-200 placeholder-gray-400"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          {onAdd && (
            <Button
              onClick={onAdd}
              size="sm"
              className="shrink-0 px-3 py-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg overflow-x-auto border-[#1e1e1e]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-white/80">
            <ReceiptText className="w-18 h-18 text-primary mb-2" />
            <span className="text-lg">No records found</span>
          </div>
        ) : (
          <Table className="w-full min-w-[800px]">
            <TableHeader>
              <TableRow className="bg-[#171717]">
                {headers.map((h) => (
                  <TableHead
                    key={h}
                    className={`px-4 py-3 font-semibold text-gray-300 ${h === "Date" ? "text-right" : h === "Status" ? "text-center" : "text-left"}`}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>{filtered.map(renderRow)}</TableBody>
          </Table>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden mt-4">
        {filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-400">
            <ReceiptText className="w-18 h-18 text-primary mb-2" />
            <span className="text-lg">No records found</span>
          </div>
        ) : (
          filtered.map((row) => renderMobileCard(row))
        )}
      </div>
    </Card>
  )
}

function formatDisplayDate(date?: string | null) {
  if (!date) return "NA"
  const d = new Date(date)
  if (isNaN(d.getTime())) return "NA"
  return d
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/\s/g, " ").replace(/\./g, "") // Remove period from short months
}

interface Ad {
  ad_id: number
  ads_name: string
}

export default function Interact() {
  const [activeTab, setActiveTab] = useState("support")
  const [support, setSupport] = useState<SupportItem[]>([])
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [experts, setExperts] = useState<ExpertItem[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(false)
  const userId = Cookies.get("userId") || "5"

  // Dialog states
  const [showSupportDialog, setShowSupportDialog] = useState(false)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [showExpertDialog, setShowExpertDialog] = useState(false)

  // Form data states
  const staticCategories = [
    "General",
    "Uploads",
    "Credits",
    "Technical",
    "Subscription",
    "Scoring",
    "Pricing"
  ]

  const [supportFormData, setSupportFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
    imgname: ""
  })

  const [feedbackFormData, setFeedbackFormData] = useState({
    ad_upload_id: "",
    rating: "",
    comments: ""
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [a, b, c] = await Promise.all([
          fetch(`/api/userhelplist?user_id=${userId}`).then((r) => r.json()),
          fetch(`/api/userfeedbacklist?user_id=${userId}`).then((r) => r.json()),
          fetch(`/api/userexptalkreqlist?user_id=${userId}`).then((r) => r.json()),
        ])
        setSupport(Array.isArray(a?.data) ? a.data : [])
        setFeedbacks(Array.isArray(b?.data) ? b.data : [])
        setExperts(Array.isArray(c?.data) ? c.data : [])
      } catch {
        setSupport([])
        setFeedbacks([])
        setExperts([])
      }
    }
    load()
  }, [userId])

  // Fetch ads when feedback dialog opens
  useEffect(() => {
    if (showFeedbackDialog) {
      fetchAds()
    }
  }, [showFeedbackDialog])

  const fetchAds = async () => {
    try {
      if (!userId) return

      const url = `/api/fulladsnamelist?user_id=${userId}`
      const response = await fetch(url)
      const result = await response.json()

      if (result.status && Array.isArray(result.data)) {
        setAds(result.data)
      } else {
        setAds([])
      }
    } catch (error) {
      console.error("Error fetching ads:", error)
      setAds([])
    }
  }

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)

      const response = await fetch("/api/needhelp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          description: supportFormData.message,
          email: supportFormData.email,
          category: supportFormData.category,
          imgname: supportFormData.imgname || ""
        })
      })

      if (response.ok) {
        toast.success("Support request submitted successfully!")
        setSupportFormData({ name: "", email: "", category: "", message: "", imgname: "" })
        setShowSupportDialog(false)
        // Reload support data
        const res = await fetch(`/api/userhelplist?user_id=${userId}`)
        const data = await res.json()
        setSupport(Array.isArray(data?.data) ? data.data : [])
      }
    } catch (error) {
      console.error("Error submitting support request:", error)
      toast.error("Failed to submit support request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate rating is required
    if (!feedbackFormData.rating || feedbackFormData.rating === "") {
      toast.error("Please select a rating")
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          ad_upload_id: feedbackFormData.ad_upload_id,
          rating: feedbackFormData.rating,
          comments: feedbackFormData.comments,
        }),
      })

      if (response.ok) {
        toast.success("Feedback submitted successfully!")
        setFeedbackFormData({ ad_upload_id: "", rating: "", comments: "" })
        setShowFeedbackDialog(false)
        // Reload feedback data
        const res = await fetch(`/api/userfeedbacklist?user_id=${userId}`)
        const data = await res.json()
        setFeedbacks(Array.isArray(data?.data) ? data.data : [])
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error("Failed to submit feedback. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleExpertCallSubmit = async (data: { prefdate: string; preftime: string; comments: string }) => {
    try {
      setLoading(true)

      const response = await fetch("/api/exptalkrequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          prefdate: data.prefdate,
          preftime: data.preftime,
          comments: data.comments
        })
      })

      if (response.ok) {
        toast.success("Expert call request submitted successfully!")
        setShowExpertDialog(false)
        // Reload expert data
        const res = await fetch(`/api/userexptalkreqlist?user_id=${userId}`)
        const result = await res.json()
        setExperts(Array.isArray(result?.data) ? result.data : [])
      } else {
        throw new Error('Failed to submit request')
      }
    } catch (error) {
      console.error("Error submitting expert call request:", error)
      toast.error("Failed to submit expert call request. Please try again.")
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 min-h-screen lg:mt-6">
      <Tabs defaultValue="support" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full mb-6 rounded-full bg-black h-12 grid-cols-3">
          {[
            { key: "support", label: "Support" },
            { key: "feedback", label: "Feedback" },
            { key: "expert-talk", label: "Expert Talk" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="font-semibold rounded-[20px] h-10 px-2 sm:px-4 text-center text-gray-300 bg-transparent hover:bg-[#171717] data-[state=active]:bg-primary data-[state=active]:text-white transition-colors duration-300 truncate"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* SUPPORT: id, email, category, description, estatus (badge), status (badge), created_date */}
        <TabsContent value="support">
          <TableShell
            title="Support"
            placeholder="Search tickets"
            headers={["#", "Email", "Category", "Description", "Status", "Date"]}
            rows={support}
            searchPicker={(r) =>
              [
                r?.help_id,
                r?.email,
                r?.category,
                r?.description,
                r?.estatus,
                r?.created_date,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
            }
            onAdd={() => setShowSupportDialog(true)}
            renderRow={(r: SupportItem) => (
              <TableRow key={`s-${r.help_id}`} className="bg-[#1e1e1e] hover:bg-[#2c2c2c]">
                <TableCell className="px-4 py-3 text-gray-200">{r.help_id}</TableCell>
                <TableCell className="px-4 py-3 text-gray-200">{r.email || "NA"}</TableCell>
                <TableCell className="px-4 py-3 text-gray-200">{r.category || "NA"}</TableCell>
                <TableCell className="px-4 py-3 text-gray-200">{r.description || "NA"}</TableCell>
                <TableCell className="px-4 py-3 text-center text-gray-200">
                  {r.estatus ? <Badge className={classForEstatus(r.estatus)}>{r.estatus}</Badge> : <span>-</span>}
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-gray-200">{formatDisplayDate(r.created_date)}</TableCell>
              </TableRow>
            )}
            renderMobileCard={(r: SupportItem) => (
              <div key={`s-${r.help_id}`} className="border rounded-lg p-4 shadow-md bg-[#171717]">
                <div className="text-lg font-semibold mb-2 text-white">Ticket # <span className="text-white/70 text-sm">{r.help_id}</span></div>
                <p className="text-sm text-white">Email: <span className="text-white/70 text-sm">{r.email || "NA"}</span></p>
                <p className="text-sm text-white">Category: <span className="text-white/70 text-sm">{r.category || "NA"}</span></p>
                <p className="text-sm text-white">Description: <span className="text-white/70 text-sm">{r.description || "NA"}</span></p>
                <p className="text-sm text-white">
                  Date: <span className="text-white/70 text-sm">{formatDisplayDate(r.created_date)}</span>
                </p>
                <div className="flex items-center justify-between mt-3">
                  {r.estatus ? <Badge className={classForEstatus(r.estatus)}>{r.estatus}</Badge> : <span className="text-gray-400 text-sm">-</span>}
                </div>
              </div>
            )}
          />
        </TabsContent>

        {/* FEEDBACK: id, ads_name, comments, status (badge), created_date */}
        <TabsContent value="feedback">
          <TableShell
            title="Feedback"
            placeholder="Search feedback"
            headers={["#", "Ad Name", "Comments", "Date"]}
            rows={feedbacks}
            searchPicker={(r) =>
              [r?.fbid, r?.ads_name, r?.comments, r?.created_date].filter(Boolean).join(" ").toLowerCase()
            }
            onAdd={() => setShowFeedbackDialog(true)}
            renderRow={(r: FeedbackItem) => (
              <TableRow key={`f-${r.fbid}`} className="bg-[#1e1e1e] hover:bg-[#2c2c2c]">
                <TableCell className="px-4 py-3 text-gray-200">{r.fbid}</TableCell>
                <TableCell className="px-4 py-3 text-gray-200">{r.ads_name || "NA"}</TableCell>
                <TableCell className="px-4 py-3 text-gray-200">{r.comments || "NA"}</TableCell>
                <TableCell className="px-4 py-3 text-right text-gray-200">{formatDisplayDate(r.created_date)}</TableCell>
              </TableRow>
            )}
            renderMobileCard={(r: FeedbackItem) => (
              <div key={`f-${r.fbid}`} className="border rounded-lg p-4 shadow-md bg-[#171717]">
                <div className="text-lg font-semibold mb-2 text-white">Feedback # <span className="text-white/70 text-sm">{r.fbid}</span></div>
                <p className="text-sm text-white">Ad Name: <span className="text-white/70 text-sm">{r.ads_name || "NA"}</span></p>
                {r.rating && <p className="text-sm text-white">Rating: <span className="text-white/70 text-sm">{r.rating}/10</span></p>}
                <p className="text-sm text-white">Comments: <span className="text-white/70 text-sm">{r.comments || "NA"}</span></p>
                <p className="text-sm text-white">
                  Date: <span className="text-white/70 text-sm">{formatDisplayDate(r.created_date)}</span>
                </p>
              </div>
            )}
          />
        </TabsContent>

        {/* EXPERT TALK: id, prefdate, preftime, comments, estatus (badge), status (badge), created_date */}
        <TabsContent value="expert-talk">
          <TableShell
            title="Expert Talk"
            placeholder="Search sessions"
            headers={["#", "Prefer Date", "Prefer Time", "Comments", "Status", "Date"]}
            rows={experts}
            searchPicker={(r) =>
              [r?.exptalk_id, r?.prefdate, r?.preftime, r?.comments, r?.estatus, r?.created_date]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
            }
            onAdd={() => setShowExpertDialog(true)}
            renderRow={(r: ExpertItem) => (
              <TableRow key={`e-${r.exptalk_id}`} className="bg-[#1e1e1e] hover:bg-[#2c2c2c]">
                <TableCell className="px-4 py-3 text-gray-200">{r.exptalk_id}</TableCell>
                <TableCell className="px-4 py-3 text-gray-200">{r.prefdate || "NA"}</TableCell>
                <TableCell className="px-4 py-3 text-gray-200">{r.preftime || "NA"}</TableCell>
                <TableCell className="px-4 py-3 text-gray-200">{r.comments || "NA"}</TableCell>
                <TableCell className="px-4 py-3 text-center text-gray-200">
                  {r.estatus ? <Badge className={classForEstatus(r.estatus)}>{r.estatus}</Badge> : <span>-</span>}
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-gray-200">{formatDisplayDate(r.created_date)}</TableCell>
              </TableRow>
            )}
            renderMobileCard={(r: ExpertItem) => (
              <div key={`e-${r.exptalk_id}`} className="border rounded-lg p-4 shadow-md bg-[#171717]">
                <div className="text-lg font-semibold mb-2 text-white">Session # <span className="text-white/70 text-sm">{r.exptalk_id}</span></div>
                <p className="text-sm text-white">Preferred Date: <span className="text-white/70 text-sm">{r.prefdate || "NA"}</span></p>
                <p className="text-sm text-white">Preferred Time: <span className="text-white/70 text-sm">{r.preftime || "NA"}</span></p>
                <p className="text-sm text-white">Comments: <span className="text-white/70 text-sm">{r.comments || "NA"}</span></p>
                <p className="text-sm text-white">
                  Date: <span className="text-white/70 text-sm">{formatDisplayDate(r.created_date)}</span>
                </p>
                <div className="flex items-center justify-between mt-3">
                  {r.estatus ? <Badge className={classForEstatus(r.estatus)}>{r.estatus}</Badge> : <span className="text-gray-400 text-sm">-</span>}
                </div>
              </div>
            )}
          />
        </TabsContent>
      </Tabs>

      {/* Support Dialog */}
      {showSupportDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-primary rounded-lg p-4 sm:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold">Contact Support</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSupportDialog(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={supportFormData.name}
                  onChange={(e) => setSupportFormData({ ...supportFormData, name: e.target.value })}
                  className="bg-[#171717] border-[#2b2b2b] text-sm sm:text-base"
                  placeholder="Your Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={supportFormData.email}
                  onChange={(e) => setSupportFormData({ ...supportFormData, email: e.target.value })}
                  className="bg-[#171717] border-[#2b2b2b] text-sm sm:text-base"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select
                  value={supportFormData.category}
                  onValueChange={(value) => setSupportFormData({ ...supportFormData, category: value })}
                >
                  <SelectTrigger className="w-full bg-[#171717] border-[#2b2b2b] text-sm sm:text-base">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {staticCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={supportFormData.message}
                  onChange={(e) => setSupportFormData({ ...supportFormData, message: e.target.value })}
                  className="bg-[#171717] border-[#2b2b2b] min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                  placeholder="Describe your issue or question..."
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-sm sm:text-base"
                  onClick={() => setShowSupportDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 text-sm sm:text-base" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Dialog */}
      {showFeedbackDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-primary rounded-lg p-4 sm:p-6 w-full max-w-md">
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
                  value={feedbackFormData.ad_upload_id}
                  onValueChange={(value) => setFeedbackFormData({ ...feedbackFormData, ad_upload_id: value })}
                >
                  <SelectTrigger className="w-full bg-[#171717] border-[#2b2b2b] text-sm sm:text-base">
                    <SelectValue placeholder="Select an ad (optional)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
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
                  value={feedbackFormData.rating}
                  onValueChange={(value) => setFeedbackFormData({ ...feedbackFormData, rating: value })}
                  required
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
                  value={feedbackFormData.comments}
                  onChange={(e) => setFeedbackFormData({ ...feedbackFormData, comments: e.target.value })}
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

      {/* Expert Call Dialog */}
      <ExpertConsultationPopup
        isOpen={showExpertDialog}
        onClose={() => setShowExpertDialog(false)}
        onSubmit={handleExpertCallSubmit}
      />
    </div>
  )
}
