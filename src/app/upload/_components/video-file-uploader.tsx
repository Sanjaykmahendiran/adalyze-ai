"use client"

import type React from "react"
import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import { Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import toast from "react-hot-toast"

interface VideoUploaderProps {
  file: File | null
  onFileChange: (file: File | null) => void
  screenshots: string[]
  isUploaded: boolean
  isUploading?: boolean
  uploadProgress?: number
  onCancelUpload?: () => void
}

export function VideoUploader({
  file,
  onFileChange,
  screenshots,
  isUploaded,
  isUploading = false,
  uploadProgress = 0,
  onCancelUpload
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Memoize video URL to prevent recreation on every render
  const videoUrl = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file)
    }
    return null
  }, [file])

  // Cleanup object URL when file changes or component unmounts
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [videoUrl])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!isUploading) setIsDragging(true)
  }, [isUploading])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (!isUploading && e.dataTransfer.files?.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }, [isUploading])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!isUploading && files && files.length > 0) {
      validateAndSetFile(files[0])
    }
  }, [isUploading])

  const validateAndSetFile = useCallback((file: File) => {
    const validTypes = ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", "video/webm"]
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid video file (MP4, AVI, MOV, WMV, FLV, WEBM)")
      return
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size must be under 100MB")
      return
    }

    onFileChange(file)
  }, [onFileChange])

  const handleClick = useCallback(() => {
    if (!isUploading) fileInputRef.current?.click()
  }, [isUploading])

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isUploading) onFileChange(null)
  }, [isUploading, onFileChange])

  const handleCancelUpload = useCallback(() => {
    if (onCancelUpload) onCancelUpload()
    else onFileChange(null)
  }, [onCancelUpload, onFileChange])

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 rounded-2xl bg-[#171717] border border-primary p-4 sm:p-6 lg:p-8 text-white">
      {file && isUploaded && screenshots.length > 0 && !isUploading ? (
        <div className="flex flex-col items-center space-y-4">
          <video
            src={videoUrl || undefined}
            controls
            className="w-full max-w-sm h-48 sm:h-56 rounded-lg object-cover"
          />
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
            <Button
              onClick={handleClick}
              className="bg-[#db4900] hover:bg-[#c44000] text-white transition-all duration-200 w-full sm:w-auto"
            >
              Replace
            </Button>
            <Button
              variant="outline"
              onClick={handleRemove}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white w-full sm:w-auto"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : file && isUploading ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-full max-w-sm h-48 sm:h-56 rounded-lg overflow-hidden">
            <video
              src={videoUrl || undefined}
              className="w-full h-full object-cover rounded-lg"
              muted
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-white mx-auto" />
            </div>
          </div>
          <div className="w-full max-w-sm">
            <Progress value={uploadProgress} className="w-full h-2 mb-2" />
            <div className="flex justify-between items-center text-xs text-white">
              <span className="truncate mr-2 max-w-[60%]">{file.name}</span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleCancelUpload}
            className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white w-full sm:w-auto transition-all duration-200"
            type="button"
          >
            Cancel Upload
          </Button>
        </div>
      ) : (
        <div
          className={`flex min-h-[160px] sm:min-h-[200px] lg:min-h-[240px] w-full cursor-pointer flex-col items-center justify-center rounded-xl bg-[#2b2b2b] p-4 sm:p-6 text-center transition-all duration-300 ${isUploading
            ? "cursor-not-allowed opacity-50"
            : isDragging
              ? "border-4 border-dashed border-gray-400 bg-[#2b2b2b] scale-105"
              : "hover:bg-[#2a2a2a] text-white"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <Upload className="w-12 sm:w-16 h-12 sm:h-16 text-primary mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-200 font-medium text-sm sm:text-base">Click to upload or drag & drop</p>
          <p className="mt-2 text-xs sm:text-sm text-gray-300">MP4, AVI, MOV, WMV, FLV, WEBM (max. 100 MB)</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".mp4,.avi,.mov,.wmv,.flv,.webm"
        onChange={handleFileInput}
        disabled={isUploading}
      />
    </div>
  )
}
