"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import toast from "react-hot-toast"

interface SingleFileUploaderProps {
  file: File | null
  onFileChange: (file: File | null) => void
  imageUrl: string | null
  isUploading?: boolean
  uploadProgress?: number
  onCancelUpload?: () => void
}

export function SingleFileUploader({
  file,
  onFileChange,
  imageUrl,
  isUploading = false,
  uploadProgress = 0,
  onCancelUpload
}: SingleFileUploaderProps) {
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
    if (!isUploading && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      validateAndSetFile(droppedFile)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUploading && e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPG, JPEG, PNG)")
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
    if (onCancelUpload) onCancelUpload()
    else onFileChange(null)
  }


  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl bg-[#171717] border border-primary p-4 sm:p-6 lg:p-8 text-white">
      {file && imageUrl && !isUploading ? (
        <div className="flex flex-col items-center space-y-4">
          {/* Preview */}
          <div className="relative w-40 h-40 rounded-lg overflow-hidden">
            <Image src={imageUrl} alt="Upload preview" fill className="object-cover" />
          </div>

          {/* Info */}
          <p className="text-gray-300 font-medium truncate">{file.name}</p>
          <p className="text-xs text-gray-300">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleClick} className="bg-[#db4900] hover:bg-[#ff5a1f] text-white w-full sm:w-auto">Replace</Button>
            <Button variant="outline" onClick={handleRemove} className="text-gray-300 hover:bg-[#3d3d3d] w-full sm:w-auto">Remove</Button>
          </div>
        </div>
      ) : file && isUploading ? (
        <div className="flex flex-col items-center space-y-4">
          {/* Preview + Loader */}
          <div className="relative w-40 h-40 rounded-lg overflow-hidden">
            <Image src={URL.createObjectURL(file)} alt="Upload preview" fill className="object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          </div>

          {/* Progress */}
          <div className="w-full max-w-xs">
            <Progress value={uploadProgress} className="w-full h-2" />
            <p className="text-sm text-gray-300 mt-1">{uploadProgress}%</p>
          </div>
          <p className="text-blue-400 text-sm">Uploading image...</p>
          <p className="text-gray-300 font-medium text-sm truncate">{file.name}</p>

          {/* Cancel button */}
          <Button variant="outline" onClick={handleCancelUpload} className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white">
            Cancel Upload
          </Button>
        </div>
      ) : (
        <div
          className={`flex min-h-[160px] sm:min-h-[200px] lg:min-h-[240px] w-full cursor-pointer bg-[#2b2b2b] flex-col items-center justify-center rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center transition-all duration-300 ${isUploading
              ? "cursor-not-allowed opacity-50"
              : isDragging
                ? "border-4 border-dashed border-gray-400 bg-[#2b2b2b] scale-105"
                : " hover:bg-[#2a2a2a] text-white"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="mb-3 sm:mb-4">
            {isUploading ? (
              <Loader2 className="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 mx-auto animate-spin" />
            ) : (
              <Upload className="w-12 sm:w-16 h-12 sm:h-16 text-primary mx-auto" />
            )}
          </div>
          <p className="text-gray-200 font-medium text-sm sm:text-base">
            {isUploading ? "Uploading..." : <>Click to upload <span className="text-gray-300">or drag and drop</span></>}
          </p>
          {!isUploading && (
            <p className="mt-2 text-xs sm:text-sm text-gray-300">PNG, JPG, JPEG (max. 10 MB)</p>
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
