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
import { Search, ReceiptText } from "lucide-react"
import Cookies from "js-cookie"

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
  searchPicker,
}: {
  title: string
  placeholder: string
  headers: string[]
  rows: any[]
  renderRow: (row: any) => React.ReactNode
  searchPicker: (row: any) => string
}) {
  const { q, setQ, filtered } = useSearchFilter(rows, searchPicker)

  return (
    <Card className="rounded-2xl bg-black  w-full p-4 sm:p-6 relative overflow-hidden">
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-white">{title}</h1>
        <div className="relative w-full sm:w-64">
          <Input
            type="text"
            placeholder={placeholder}
            className="pl-10 pr-4 py-2 rounded-md text-sm w-full bg-[#171717] text-gray-200 placeholder-gray-400"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                    className={`px-4 py-3 font-semibold text-gray-300 ${h === "created_date" ? "text-right" : h === "status" || h === "estatus" ? "text-center" : "text-left"}`}
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
          filtered.map((row, i) => renderRow(row))
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

export default function Interact() {
  const [activeTab, setActiveTab] = useState("support")
  const [support, setSupport] = useState<SupportItem[]>([])
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [experts, setExperts] = useState<ExpertItem[]>([])
  const userId = Cookies.get("userId") || "5"

  useEffect(() => {
    const load = async () => {
      try {
        const [a, b, c] = await Promise.all([
          fetch(`https://adalyzeai.xyz/App/api.php?gofor=userhelplist&user_id=${userId}`).then((r) => r.json()),
          fetch(`https://adalyzeai.xyz/App/api.php?gofor=userfeedbacklist&user_id=${userId}`).then((r) => r.json()),
          fetch(`https://adalyzeai.xyz/App/api.php?gofor=userexptalkreqlist&user_id=${userId}`).then((r) => r.json()),
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
            renderRow={(r: SupportItem) => (
              <TableRow key={`s-${r.help_id}`} className="bg-[#1e1e1e] hover:bg-[#2c2c2c] md:table-row grid grid-cols-1 md:grid-cols-7 md:gap-0 gap-2 p-4 md:p-0">
                <TableCell className="px-4 py-3 text-gray-200">{r.help_id}</TableCell>
                <TableCell className="px-4 py-3 text-gray-200">{r.email || "NA"}</TableCell>
                <TableCell className="px-4 py-3 text-gray-200">{r.category || "NA"}</TableCell>
                <TableCell className="px-4 py-3 text-gray-200">{r.description || "NA"}</TableCell>
                <TableCell className="px-4 py-3 text-gray-200">
                  {r.estatus ? <Badge className={classForEstatus(r.estatus)}>{r.estatus}</Badge> : <span>-</span>}
                </TableCell>
                <TableCell className="px-4 py-3  text-gray-200">{formatDisplayDate(r.created_date)}</TableCell>
              </TableRow>
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
            renderRow={(r: FeedbackItem) => (
              <TableRow key={`f-${r.fbid}`} className="bg-[#1e1e1e] hover:bg-[#2c2c2c] md:table-row grid grid-cols-1 md:grid-cols-5 md:gap-0 gap-2 p-4 md:p-0">
                <TableCell className="px-4 py-3 text-gray-200">{r.fbid}</TableCell>
                <TableCell className="px-4 py-3 text-gray-200">{r.ads_name || "NA"}</TableCell>
                <TableCell className="px-4 py-3 text-gray-200">{r.comments || "NA"}</TableCell>
                <TableCell className="px-4 py-3 text-gray-200">{formatDisplayDate(r.created_date)}</TableCell>
              </TableRow>
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
            renderRow={(r: ExpertItem) => (
              <TableRow key={`e-${r.exptalk_id}`} className="bg-[#1e1e1e] hover:bg-[#2c2c2c] md:table-row grid grid-cols-1 md:grid-cols-7 md:gap-0 gap-2 p-4 md:p-0">
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
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
