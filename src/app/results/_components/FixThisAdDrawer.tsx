"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, Loader2, Sparkles } from "lucide-react"
import { axiosInstance } from "@/configs/axios"

interface FixThisAdDrawerProps {
  open: boolean
  onClose: () => void
  adUploadId: number | undefined
  userId: number | undefined
  originalImageUrl: string | undefined
  originalScore: number | undefined
}

type Step = "consent" | "extracting" | "generating" | "analyzing" | "done" | "error"

export default function FixThisAdDrawer({
  open,
  onClose,
  adUploadId,
  userId,
  originalImageUrl,
  originalScore,
}: FixThisAdDrawerProps) {
  const [step, setStep] = useState<Step>("consent")
  const [consentChecked, setConsentChecked] = useState(false)
  const [brandName, setBrandName] = useState<string | null>(null)
  const [dnaSource, setDnaSource] = useState<"fresh" | "cached" | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [newScore, setNewScore] = useState<number | null>(null)
  const [newGoNoGo, setNewGoNoGo] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const reset = () => {
    setStep("consent")
    setConsentChecked(false)
    setBrandName(null)
    setDnaSource(null)
    setGeneratedImageUrl(null)
    setNewScore(null)
    setNewGoNoGo(null)
    setErrorMessage(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const runFixChain = async (isRetry = false) => {
    if (!adUploadId || !userId) return

    try {
      // Step 1 — extract brand DNA (backend auto-resets any stuck job)
      setStep("extracting")
      const startRes = await axiosInstance.post("/api/fix/start", {
        user_id: userId,
        ad_upload_id: adUploadId,
        accepted_ai_processing: true,
      })
      const { job_id, dna_source, brand_name } = startRes.data.data
      setBrandName(brand_name ?? null)
      setDnaSource(dna_source)

      // Step 2 — generate fixed image
      setStep("generating")
      const genRes = await axiosInstance.post("/api/fix/generate", {
        user_id: userId,
        job_id,
      })
      setGeneratedImageUrl(genRes.data.data.generated_image_url)

      // Step 3 — re-analyze
      setStep("analyzing")
      const analyzeRes = await axiosInstance.post("/api/fix/analyze", {
        user_id: userId,
        job_id,
      })
      setNewScore(analyzeRes.data.data.new_score)
      setNewGoNoGo(analyzeRes.data.data.new_go_no_go)
      setStep("done")
    } catch (err: any) {
      const status = err?.response?.status
      const msg = err?.response?.data?.message ?? "Something went wrong. Please try again."

      // 409 = stuck job from a previous run. Backend resets it on the next call,
      // so auto-retry once silently before showing an error to the user.
      if (status === 409 && !isRetry) {
        await runFixChain(true)
        return
      }

      setErrorMessage(msg)
      setStep("error")
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#111111] z-50 flex flex-col shadow-2xl border-l border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h2 className="text-white font-bold text-lg">Fix This Ad</h2>
                <p className="text-white/50 text-xs mt-0.5">AI-powered ad repair</p>
              </div>
              <button
                onClick={handleClose}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

              {/* Consent step */}
              {step === "consent" && (
                <div className="space-y-5">
                  <p className="text-white/70 text-sm leading-relaxed">
                    Our AI will analyze your ad, extract your brand DNA, generate an
                    improved version, and re-score it. This process takes about 30–60
                    seconds.
                  </p>

                  {/* Consent checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                        consentChecked
                          ? "bg-primary border-primary"
                          : "border-white/30 group-hover:border-white/60"
                      }`}
                      onClick={() => setConsentChecked((p) => !p)}
                    >
                      {consentChecked && (
                        <CheckCircle size={12} className="text-white" />
                      )}
                    </div>
                    <span className="text-white/60 text-xs leading-relaxed">
                      I consent to my ad image being processed by AI (OpenAI Vision +
                      Google Imagen) to generate a fixed version. This data is used
                      solely for ad improvement and handled per our Privacy Policy.
                    </span>
                  </label>

                  <button
                    disabled={!consentChecked}
                    onClick={runFixChain}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all
                      disabled:opacity-40 disabled:cursor-not-allowed
                      enabled:bg-primary enabled:text-white enabled:hover:opacity-90"
                  >
                    <Sparkles size={14} className="inline mr-2" />
                    Start Fix
                  </button>
                </div>
              )}

              {/* Processing steps */}
              {(step === "extracting" ||
                step === "generating" ||
                step === "analyzing") && (
                <div className="space-y-5 pt-2">
                  <p className="text-white/50 text-xs">
                    This takes about 30–60 seconds — hold tight.
                  </p>
                  <StepIndicator
                    label="Extracting brand DNA"
                    status={
                      step === "extracting"
                        ? "active"
                        : "done"
                    }
                  />
                  <StepIndicator
                    label="Generating fixed ad"
                    status={
                      step === "generating"
                        ? "active"
                        : step === "analyzing" || step === "done"
                        ? "done"
                        : "waiting"
                    }
                  />
                  <StepIndicator
                    label="Re-analyzing ad"
                    status={step === "analyzing" ? "active" : "waiting"}
                  />
                </div>
              )}

              {/* Done — before / after comparison */}
              {step === "done" && generatedImageUrl && (
                <div className="space-y-4">
                  {/* Brand DNA reuse badge */}
                  {dnaSource === "cached" && brandName && (
                    <div className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-2.5 text-xs text-primary flex items-center gap-2">
                      <CheckCircle size={13} />
                      Reusing brand DNA for{" "}
                      <span className="font-semibold">{brandName}</span>
                    </div>
                  )}

                  {/* Before / After */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Before */}
                    <div className="space-y-2">
                      <p className="text-white/40 text-xs font-medium uppercase tracking-wider text-center">
                        Before
                      </p>
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#1a1a1a]">
                        {originalImageUrl && (
                          <img
                            src={originalImageUrl}
                            alt="Original ad"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      {originalScore !== undefined && (
                        <p className="text-center">
                          <span className="text-red-400 font-bold text-xl">
                            {originalScore}
                          </span>
                          <span className="text-white/40 text-xs ml-1">/ 100</span>
                        </p>
                      )}
                      <p className="text-center text-red-400 text-xs font-semibold">
                        No Go
                      </p>
                    </div>

                    {/* After */}
                    <div className="space-y-2">
                      <p className="text-white/40 text-xs font-medium uppercase tracking-wider text-center">
                        After
                      </p>
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#1a1a1a]">
                        <img
                          src={generatedImageUrl}
                          alt="Fixed ad"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {newScore !== null && (
                        <p className="text-center">
                          <span
                            className={`font-bold text-xl ${
                              newGoNoGo === "Go"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {newScore}
                          </span>
                          <span className="text-white/40 text-xs ml-1">/ 100</span>
                        </p>
                      )}
                      {newGoNoGo && (
                        <p
                          className={`text-center text-xs font-semibold ${
                            newGoNoGo === "Go" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {newGoNoGo}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl font-semibold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Error */}
              {step === "error" && (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm leading-relaxed">
                    {errorMessage}
                  </div>
                  <button
                    onClick={reset}
                    className="w-full py-3 rounded-xl font-semibold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({
  label,
  status,
}: {
  label: string
  status: "active" | "done" | "waiting"
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
          status === "done"
            ? "bg-green-500"
            : status === "active"
            ? "bg-primary"
            : "bg-white/10"
        }`}
      >
        {status === "done" && <CheckCircle size={14} className="text-white" />}
        {status === "active" && (
          <Loader2 size={14} className="text-white animate-spin" />
        )}
      </div>
      <span
        className={`text-sm transition-colors ${
          status === "done"
            ? "text-green-400"
            : status === "active"
            ? "text-white"
            : "text-white/30"
        }`}
      >
        {label}
      </span>
    </div>
  )
}
