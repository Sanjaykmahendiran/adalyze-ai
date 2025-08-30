"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Upload, Loader2, X } from "lucide-react"
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!isUploading) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (!isUploading && e.dataTransfer.files?.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!isUploading && files && files.length > 0) {
      validateAndSetFile(files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
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
  }

  const handleClick = () => {
    if (!isUploading) fileInputRef.current?.click()
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isUploading) {
      onFileChange(null)
    }
  }

  const handleCancelUpload = () => {
    if (onCancelUpload) {
      onCancelUpload()
    } else {
      onFileChange(null)
    }
  }

  // Show success/error toasts when upload completes
  useEffect(() => {
    if (!isUploading && file) {
      if (isUploaded && screenshots.length > 0) {
        toast.success("Video uploaded successfully!")
      } else if (!isUploaded) {
        toast.error("Upload failed")
      }
    }
  }, [isUploading, isUploaded, screenshots.length, file])

  return (
    <div className="flex flex-col space-y-6 rounded-2xl bg-[#121212] border border-primary p-4 sm:p-6 md:p-8 text-white">
      <div className="space-y-1 sm:space-y-2 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Upload Video</h2>
        <p className="text-white/80 text-sm sm:text-base">Upload one video for your ad</p>
      </div>

      {file && isUploaded && screenshots.length > 0 && !isUploading ? (
        <div className="space-y-4 transition-all duration-300">
          <div className="flex flex-col items-center rounded-xl bg-[#121212] p-4 sm:p-6 min-h-[280px] sm:min-h-[320px] justify-center">
            <div className="w-full max-w-sm">
              <video
                src={URL.createObjectURL(file)}
                controls
                className="w-full h-48 sm:h-56 rounded-lg object-cover"
              />
              <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-center">
                <Button 
                  onClick={handleClick} 
                  className="bg-[#db4900] hover:bg-[#c44000] transition-all duration-200"
                >
                  Replace
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRemove} 
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent transition-all duration-200"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : file && isUploading ? (
        <div className="space-y-4 transition-all duration-300">
          <div className="flex flex-col items-center rounded-xl bg-[#2b2b2b] p-4 sm:p-6 min-h-[280px] sm:min-h-[320px] justify-center">
            <div className="relative w-full max-w-sm mb-4">
              <div className="relative w-full h-48 sm:h-56 rounded-lg overflow-hidden">
                <video
                  src={URL.createObjectURL(file)}
                  className="w-full h-full object-cover rounded-lg"
                  muted
                />
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">Processing video...</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 rounded-lg p-3">
                <Progress value={uploadProgress} className="w-full h-2 mb-2" />
                <div className="flex justify-between items-center text-xs text-white">
                  <span className="truncate mr-2 max-w-[60%]">{file.name}</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={handleCancelUpload}
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white bg-transparent transition-all duration-200"
              type="button"
            >
              Cancel Upload
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`flex min-h-[150px] sm:min-h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-xl bg-[#2b2b2b] p-4 sm:p-6 text-center transition-all duration-300 ${
            isUploading ? "cursor-not-allowed opacity-50" : isDragging ? "border-4 border-dashed border-gray-400 bg-[#2b2b2b] scale-105" : "hover:bg-black"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <Upload className="w-12 sm:w-16 h-12 sm:h-16 text-primary mx-auto" />
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