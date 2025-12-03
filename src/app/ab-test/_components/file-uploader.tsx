"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import toast from "react-hot-toast"

interface ABFileUploadCardProps {
  title: string
  file: File | null
  onFileChange: (file: File | null) => void
  type: "A" | "B"
  imageUrl?: string | null
  isUploading?: boolean
  uploadProgress?: number
  onCancelUpload?: () => void
}

export default function ABFileUploadCard({
  title,
  file,
  onFileChange,
  type,
  imageUrl,
  isUploading = false,
  uploadProgress = 0,
  onCancelUpload
}: ABFileUploadCardProps) {
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
    const validTypes = ["image/jpeg", "image/png", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPG, JPEG, PNG)")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB")
      return
    }
    onFileChange(file)
  }

  const handleClick = () => {
    if (!isUploading) fileInputRef.current?.click()
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isUploading) onFileChange(null)
  }

  const handleCancelUpload = () => {
    if (onCancelUpload) {
      onCancelUpload()
    } else {
      onFileChange(null)
    }
  }


  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl bg-[#121212] border border-[#db4900] p-4 sm:p-6 lg:p-8 text-white">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      {/* Case 1: File uploaded & preview available */}
      {file && imageUrl && !isUploading ? (
        <div className="flex flex-col items-center justify-center text-center rounded-xl bg-[#2b2b2b] py-4 ">
          <div className="relative w-24 sm:w-32 h-24 sm:h-32 mb-3 rounded-lg overflow-hidden">
            <Image src={imageUrl} alt="Preview" fill className="object-cover" />
          </div>
          <p className="text-gray-300 font-medium mb-2 text-sm truncate max-w-full">
            {file.name}
          </p>
          <p className="text-xs text-gray-400 mb-3">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <Button
              onClick={handleClick}
              disabled={isUploading}
              className="bg-[#db4900] hover:bg-[#ff5a1f] text-white w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Replace
            </Button>
            <Button
              variant="outline"
              onClick={handleRemove}
              disabled={isUploading}
              className="text-gray-300 hover:bg-[#3d3d3d] hover:text-white w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : /* Case 2: Uploading */ file && isUploading ? (
        <div className="flex flex-col items-center justify-center text-center rounded-xl bg-[#1a1a1a] p-4 sm:p-6">
          <div className="relative w-24 sm:w-32 h-24 sm:h-32 mb-3 rounded-lg overflow-hidden">
            <Image
              src={URL.createObjectURL(file)}
              alt="Preview"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          </div>
          <Progress value={uploadProgress} className="w-full h-2 mt-2" />
          <p className="text-sm text-gray-300 mt-2">{uploadProgress}%</p>
          <Button
            variant="outline"
            onClick={handleCancelUpload}
            className="mt-3 border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            Cancel Upload
          </Button>
        </div>
      ) : (
        /* Case 3: Empty drop zone */
        <div
          className={`flex flex-col items-center justify-center text-center rounded-xl bg-[#2b2b2b] p-6 cursor-pointer transition-all duration-300 ${isUploading
            ? "cursor-not-allowed opacity-50"
            : isDragging
              ? "border-4 border-dashed border-gray-400 scale-105"
              : "hover:bg-[#1f1f1f]"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {isUploading ? (
            <Loader2 className="w-16 h-16 text-gray-300 animate-spin mb-3" />
          ) : (
            <Upload className="w-16 h-16 text-primary mb-3" />
          )}
          <p className="text-gray-200 font-medium">
            {isUploading ? (
              "Uploading..."
            ) : (
              <>
                Click to upload{" "}
                <span className="text-gray-400">or drag & drop</span>
              </>
            )}
          </p>
          {!isUploading && (
            <p className="mt-2 text-xs text-gray-400">
              PNG, JPG, JPEG (max. 10 MB)
            </p>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png"
        onChange={handleFileInput}
        disabled={isUploading}
      />
    </div>
  )
}
