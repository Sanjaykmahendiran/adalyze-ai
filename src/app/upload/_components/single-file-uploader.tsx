"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Upload, Loader2, X } from "lucide-react"
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
    if (!isUploading) {
      setIsDragging(true)
    }
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
    if (!isUploading) {
      fileInputRef.current?.click()
    }
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
      if (imageUrl) {
        toast.success("Image uploaded successfully!")
      } else {
        toast.error("Upload failed")
      }
    }
  }, [isUploading, imageUrl, file])

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl bg-[#121212] border border-primary p-4 sm:p-6 lg:p-8 text-white">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold">Upload one image </h2>
      </div>

      {file && imageUrl && !isUploading ? (
        <div className="flex min-h-[160px] sm:min-h-[200px] w-full flex-col items-center justify-center rounded-xl sm:rounded-2xl bg-[#2b2b2b] p-4 sm:p-6 text-center transition-all duration-300">
          <div className="relative w-24 sm:w-32 h-24 sm:h-32 mb-3 sm:mb-4 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt="Upload preview"
              fill
              className="object-cover"
            />
          </div>
          <p className="text-gray-300 font-medium mb-2 text-sm sm:text-base truncate max-w-full px-2">
            {file.name}
          </p>
          <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={handleClick}
              disabled={isUploading}
              className="bg-[#db4900] hover:bg-[#c44000] text-white w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              type="button"
            >
              Replace Image
            </Button>
            <Button
              variant="outline"
              onClick={handleRemove}
              disabled={isUploading}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              type="button"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : file && isUploading ? (
        <div className="flex min-h-[160px] sm:min-h-[200px] w-full flex-col items-center justify-center rounded-xl sm:rounded-2xl bg-[#121212] p-4 sm:p-6 text-center transition-all duration-300">
          <div className="relative w-24 sm:w-32 h-24 sm:h-32 mb-3 sm:mb-2 rounded-lg overflow-hidden">
            <Image
              src={URL.createObjectURL(file)}
              alt="Upload preview"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          </div>

          <div className="w-full max-w-xs mt-2">
            <Progress value={uploadProgress} className="w-full h-2" />
            <p className="text-sm text-gray-300 mt-1">{uploadProgress}%</p>
          </div>

          <p className="text-blue-400 text-sm mt-2">Uploading image...</p>
          <p className="text-gray-300 font-medium text-sm truncate max-w-full px-2">
            {file.name}
          </p>

          <Button
            variant="outline"
            onClick={handleCancelUpload}
            className="mt-3 border-red-500 text-red-400 hover:bg-red-500 hover:text-white bg-transparent text-sm px-4 py-1 transition-all duration-200"
            type="button"
          >
            Cancel Upload
          </Button>
        </div>
      ) : (
        <div
          className={`flex min-h-[160px] sm:min-h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-xl sm:rounded-2xl bg-[#2b2b2b] p-4 sm:p-6 text-center transition-all duration-300 ${isUploading
            ? "cursor-not-allowed opacity-50"
            : isDragging
              ? "border-4 border-dashed border-gray-400 bg-[#2b2b2b] scale-105"
              : "hover:bg-black text-white"
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
            {isUploading ? (
              "Uploading..."
            ) : (
              <>
                Click to upload <span className="text-gray-300">or drag and drop</span>
              </>
            )}
          </p>
          {!isUploading && (
            <p className="mt-2 text-xs sm:text-sm text-gray-300">PNG, JPG, JPEG (max. 10 MB)</p>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden "
        accept=".jpg,.jpeg,.png"
        onChange={handleFileInput}
        disabled={isUploading}
      />
    </div>
  )
}