"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Loader2, ChevronRight, Maximize2 } from "lucide-react"
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

// ─── Fullscreen lightbox ──────────────────────────────────────────────────────
function Lightbox({
  src,
  alt,
  label,
  onClose,
}: {
  src: string
  alt: string
  label?: string
  onClose: () => void
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Label */}
        {label && (
          <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-xs font-semibold uppercase tracking-widest">
            {label}
          </span>
        )}

        {/* Image */}
        <motion.img
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          src={src}
          alt={alt}
          onClick={(e) => e.stopPropagation()}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
        />
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Clickable image tile ─────────────────────────────────────────────────────
function ImageTile({
  src,
  alt,
  label,
  onExpand,
}: {
  src?: string
  alt: string
  label: string
  onExpand: () => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-white/30 text-[11px] font-semibold uppercase tracking-widest text-center">
        {label}
      </p>
      <div
        className="group relative aspect-square rounded-2xl overflow-hidden bg-[#1a1a1a] cursor-pointer ring-1 ring-white/5 hover:ring-primary/40 transition-all"
        onClick={src ? onExpand : undefined}
      >
        {src ? (
          <>
            <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            {/* Expand hint overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 bg-black/60 rounded-full px-3 py-1.5">
                <Maximize2 size={13} className="text-white" />
                <span className="text-white text-xs font-medium">View full</span>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
            No image
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────
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
  const [lightbox, setLightbox] = useState<{ src: string; alt: string; label?: string } | null>(null)

  useEffect(() => {
    if (!open || !adUploadId || !userId) return

    setLoading(true)
    setError(null)
    setSelectedIdx(0)
    setVersions([])

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
        if (err?.response?.status === 404) {
          setVersions([])
        } else {
          setError("Failed to load fix history.")
        }
      })
      .finally(() => setLoading(false))
  }, [open, adUploadId, userId])

  const selected = versions[selectedIdx] ?? null

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50"
              onClick={onClose}
            />

            {/* Modal — large */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="pointer-events-auto w-full max-w-5xl h-[88vh] flex flex-col rounded-2xl border border-white/10 bg-[#0e0e0e] shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={16} className="text-primary" />
                    <span className="text-white font-semibold">Fix History</span>
                    {versions.length > 0 && (
                      <span className="text-white/30 text-sm ml-0.5">
                        · {versions.length} version{versions.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="flex items-center justify-center w-8 h-8 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* ── Body ── */}
                <div className="flex flex-1 min-h-0">

                  {/* Loading */}
                  {loading && (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 size={26} className="animate-spin text-primary" />
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
                      {/* ── Sidebar ── */}
                      <div className="w-56 flex-shrink-0 border-r border-white/10 overflow-y-auto">
                        {versions.map((v, idx) => {
                          const isGo = v.newGoNoGo === "Go"
                          const isActive = idx === selectedIdx
                          return (
                            <button
                              key={v.fixedAdId}
                              onClick={() => setSelectedIdx(idx)}
                              className={`w-full text-left px-4 py-4 border-b border-white/5 flex items-center gap-3 transition-colors ${
                                isActive
                                  ? "bg-white/5 text-white"
                                  : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                              }`}
                            >
                              {/* Thumbnail */}
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                                <img
                                  src={v.generatedImageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  Version {versions.length - idx}
                                </p>
                                <p className="text-[11px] text-white/30 mt-0.5">
                                  {new Date(v.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>

                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                {v.newScore !== null && (
                                  <span className={`text-sm font-bold ${isGo ? "text-green-400" : "text-red-400"}`}>
                                    {v.newScore}
                                  </span>
                                )}
                                {isActive && (
                                  <ChevronRight size={13} className="text-primary" />
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      {/* ── Detail panel ── */}
                      {selected && (
                        <div className="flex-1 overflow-y-auto p-7 space-y-6">
                          {/* Meta row */}
                          <div className="flex items-center justify-between">
                            <p className="text-white/40 text-sm">
                              {formatDate(selected.createdAt)}
                            </p>
                            {selected.newGoNoGo && (
                              <span
                                className={`text-sm font-bold px-3 py-1 rounded-full border ${
                                  selected.newGoNoGo === "Go"
                                    ? "text-green-400 border-green-400/30 bg-green-400/10"
                                    : "text-red-400 border-red-400/30 bg-red-400/10"
                                }`}
                              >
                                {selected.newGoNoGo}
                              </span>
                            )}
                          </div>

                          {/* Before / After */}
                          <div className="grid grid-cols-2 gap-6">
                            {/* Before */}
                            <div className="space-y-3">
                              <ImageTile
                                src={originalImageUrl}
                                alt="Original ad"
                                label="Before"
                                onExpand={() =>
                                  originalImageUrl &&
                                  setLightbox({ src: originalImageUrl, alt: "Original ad", label: "Before — Original" })
                                }
                              />
                              {originalScore !== undefined && (
                                <p className="text-center">
                                  <span className="text-red-400 font-bold text-3xl">{originalScore}</span>
                                  <span className="text-white/30 text-sm ml-1">/ 100</span>
                                </p>
                              )}
                            </div>

                            {/* After */}
                            <div className="space-y-3">
                              <ImageTile
                                src={selected.generatedImageUrl}
                                alt="Fixed ad"
                                label="After"
                                onExpand={() =>
                                  setLightbox({
                                    src: selected.generatedImageUrl,
                                    alt: "Fixed ad",
                                    label: `After — Version ${versions.length - selectedIdx}`,
                                  })
                                }
                              />
                              {selected.newScore !== null && (
                                <p className="text-center">
                                  <span
                                    className={`font-bold text-3xl ${
                                      selected.newGoNoGo === "Go" ? "text-green-400" : "text-red-400"
                                    }`}
                                  >
                                    {selected.newScore}
                                  </span>
                                  <span className="text-white/30 text-sm ml-1">/ 100</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Score delta */}
                          {originalScore !== undefined && selected.newScore !== null && (
                            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4 flex items-center justify-between">
                              <span className="text-white/40 text-sm">Score improvement</span>
                              <span
                                className={`font-bold text-lg ${
                                  selected.newScore >= originalScore ? "text-green-400" : "text-red-400"
                                }`}
                              >
                                {selected.newScore >= originalScore ? "+" : ""}
                                {(selected.newScore - originalScore).toFixed(1)} pts
                              </span>
                            </div>
                          )}
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

      {/* Fullscreen lightbox — rendered outside the modal stack */}
      {lightbox && (
        <Lightbox
          src={lightbox.src}
          alt={lightbox.alt}
          label={lightbox.label}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}
