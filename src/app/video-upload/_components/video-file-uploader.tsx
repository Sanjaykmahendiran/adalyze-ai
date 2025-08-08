"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, Video } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploaderProps {
  file: File | null
  onFileChange: (file: File | null) => void
}

export function FileUploader({ file, onFileChange }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      validateAndSetFile(droppedFile)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    const validTypes = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/webm"]
    const maxSize = 100 * 1024 * 1024 // 100MB for videos
    
    if (validTypes.includes(file.type) && file.size <= maxSize) {
      onFileChange(file)
    } else {
      alert("Please upload a valid video file (MP4, MPEG, MOV, AVI, WebM) under 100MB")
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col space-y-6 rounded-3xl bg-[#db4900] p-8 text-white">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Hello!</h1>
        <h2 className="text-3xl font-bold">Upload Video</h2>
      </div>

      {file ? (
        <div className="flex min-h-[200px] w-full flex-col items-center justify-center rounded-2xl bg-[#121212] p-6 text-center">
          <div className="relative w-48 h-32 mb-4 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
            <video
              src={URL.createObjectURL(file)}
              className="w-full h-full object-cover rounded-lg"
              controls
              preload="metadata"
            />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-5 h-5 text-gray-400" />
            <p className="text-gray-300 font-medium">{file.name}</p>
          </div>
          <p className="text-sm text-gray-400 mb-4">{formatFileSize(file.size)}</p>
          <div className="flex gap-3">
            <Button onClick={handleClick} className="bg-[#db4900] hover:bg-[#c44000] text-white">
              Replace Video
            </Button>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onFileChange(null)
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl bg-[#121212] p-6 text-center transition-all ${
            isDragging ? "border-4 border-dashed border-gray-400 bg-cyan-50" : "hover:bg-[#2b2b2b] text-white"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="mb-4">
            <Upload className="w-16 h-16 text-gray-300 mx-auto" />
          </div>
          <p className="text-gray-200 font-medium">
            Click to upload <span className="text-gray-400">or drag and drop</span>
          </p>
          <p className="mt-2 text-sm text-gray-400">MP4, MPEG, MOV, AVI, WebM (max. 100 MB)</p>
        </div>
      )}

      <input 
        ref={fileInputRef} 
        type="file" 
        className="hidden" 
        accept=".mp4,.mpeg,.mov,.avi,.webm,video/*" 
        onChange={handleFileInput} 
      />
    </div>
  )
}