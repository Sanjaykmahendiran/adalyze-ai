"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Loader2, ChevronRight } from "lucide-react"
import { axiosInstance } from "@/configs/axios"

interface FixedVersion {
  fixedAdId: number
  generatedImageUrl: string
  newScore: number | null
  newGoNoGo: string | null
  createdAt: string
}

interface FixedVersionsModalProps {
  open: boolean
  onClose: () => void
  adUploadId: number | undefined
  userId: number | undefined
  originalImageUrl?: string
  originalScore?: number
}

function formatDate(raw: string) {
  try {
    return new Date(raw).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return raw
  }
}

export default function FixedVersionsModal({
  open,
  onClose,
  adUploadId,
  userId,
  originalImageUrl,
  originalScore,
}: FixedVersionsModalProps) {
  const [versions, setVersions] = useState<FixedVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIdx, setSelectedIdx] = useState(0)

  useEffect(() => {
    if (!open || !adUploadId || !userId) return

    setLoading(true)
    setError(null)
    setSelectedIdx(0)

    axiosInstance
      .post("/api/fix/history", {
        user_id: userId,
        ad_upload_id: adUploadId,
      })
      .then((res) => {
        const raw = res.data.data.versions as Array<{
          fixed_ad_id: number
          generated_image_url: string
          new_score: number | null
          new_go_no_go: string | null
          created_at: string
        }>
        setVersions(
          raw.map((v) => ({
            fixedAdId: v.fixed_ad_id,
            generatedImageUrl: v.generated_image_url,
            newScore: v.new_score,
            newGoNoGo: v.new_go_no_go,
            createdAt: v.created_at,
          }))
        )
      })
      .catch((err) => {
        const status = err?.response?.status
        if (status === 404) {
          setVersions([])
        } else {
          setError("Failed to load fix history.")
        }
      })
      .finally(() => setLoading(false))
  }, [open, adUploadId, userId])

  const selected = versions[selectedIdx] ?? null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-[#111111] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-primary" />
                  <span className="text-white font-semibold text-sm">Fix History</span>
                  {versions.length > 0 && (
                    <span className="text-white/30 text-xs ml-1">
                      {versions.length} version{versions.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-1 min-h-0">
                {/* Loading */}
                {loading && (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 size={22} className="animate-spin text-primary" />
                  </div>
                )}

                {/* Error */}
                {!loading && error && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Empty */}
                {!loading && !error && versions.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-white/30 text-sm">No fixed versions yet.</p>
                  </div>
                )}

                {/* Content */}
                {!loading && !error && versions.length > 0 && (
                  <>
                    {/* Left sidebar — version list */}
                    <div className="w-48 flex-shrink-0 border-r border-white/10 overflow-y-auto">
                      {versions.map((v, idx) => {
                        const isGo = v.newGoNoGo === "Go"
                        const isActive = idx === selectedIdx
                        return (
                          <button
                            key={v.fixedAdId}
                            onClick={() => setSelectedIdx(idx)}
                            className={`w-full text-left px-3 py-3 border-b border-white/5 flex items-center gap-2 transition-colors ${
                              isActive
                                ? "bg-white/5 text-white"
                                : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">
                                Version {versions.length - idx}
                              </p>
                              <p className="text-[10px] text-white/30 mt-0.5">
                                {new Date(v.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            {v.newScore !== null && (
                              <span
                                className={`text-xs font-bold flex-shrink-0 ${
                                  isGo ? "text-green-400" : "text-red-400"
                                }`}
                              >
                                {v.newScore}
                              </span>
                            )}
                            {isActive && (
                              <ChevronRight size={12} className="text-primary flex-shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {/* Right panel — before / after detail */}
                    {selected && (
                      <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-white/40 text-xs">
                            {formatDate(selected.createdAt)}
                          </p>
                          {selected.newGoNoGo && (
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                                selected.newGoNoGo === "Go"
                                  ? "text-green-400 border-green-400/30 bg-green-400/10"
                                  : "text-red-400 border-red-400/30 bg-red-400/10"
                              }`}
                            >
                              {selected.newGoNoGo}
                            </span>
                          )}
                        </div>

                        {/* Before / After grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Before */}
                          <div className="space-y-2">
                            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest text-center">
                              Before
                            </p>
                            <div className="aspect-square rounded-xl overflow-hidden bg-[#1a1a1a]">
                              {originalImageUrl ? (
                                <img
                                  src={originalImageUrl}
                                  alt="Original ad"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                                  Original
                                </div>
                              )}
                            </div>
                            {originalScore !== undefined && (
                              <p className="text-center">
                                <span className="text-red-400 font-bold text-2xl">
                                  {originalScore}
                                </span>
                                <span className="text-white/30 text-xs ml-1">/ 100</span>
                              </p>
                            )}
                          </div>

                          {/* After */}
                          <div className="space-y-2">
                            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest text-center">
                              After
                            </p>
                            <div className="aspect-square rounded-xl overflow-hidden bg-[#1a1a1a]">
                              <img
                                src={selected.generatedImageUrl}
                                alt="Fixed ad"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {selected.newScore !== null && (
                              <p className="text-center">
                                <span
                                  className={`font-bold text-2xl ${
                                    selected.newGoNoGo === "Go"
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {selected.newScore}
                                </span>
                                <span className="text-white/30 text-xs ml-1">/ 100</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
