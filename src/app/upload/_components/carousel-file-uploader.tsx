"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Upload, X, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import toast from "react-hot-toast"

interface CarouselFileUploaderProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  imageUrls: string[]
  isUploading?: boolean
  uploadProgress?: number
  onCancelUpload?: () => void
}

export function CarouselFileUploader({
  files,
  onFilesChange,
  imageUrls,
  isUploading = false,
  uploadProgress = 0,
  onCancelUpload
}: CarouselFileUploaderProps) {
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
      validateAndSetFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUploading && e.target.files && e.target.files.length > 0) {
      validateAndSetFiles(Array.from(e.target.files))
    }
  }

  const validateAndSetFiles = (newFiles: File[]) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"]
    const invalidFiles = newFiles.filter(file =>
      !validTypes.includes(file.type) || file.size > 10 * 1024 * 1024
    )

    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} file(s) skipped. Please upload valid JPG/PNG under 10MB`)
    }

    const validFiles = newFiles.filter(file =>
      validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024
    )

    const totalFiles = files.length + validFiles.length
    if (totalFiles > 7) {
      toast.error("Maximum 7 images allowed for carousel")
      const allowedFiles = validFiles.slice(0, 7 - files.length)

      if (allowedFiles.length > 0) {
        onFilesChange([...files, ...allowedFiles])
      }
    } else if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles])
    }
  }

  const handleClick = () => {
    if (!isUploading && files.length < 7) {
      fileInputRef.current?.click()
    } else if (files.length >= 7) {
      toast.error("Maximum 7 images allowed")
    }
  }

  const removeFile = (indexToRemove: number) => {
    if (!isUploading) {
      const updatedFiles = files.filter((_, index) => index !== indexToRemove)
      onFilesChange(updatedFiles)
    }
  }

  const handleClearAll = () => {
    if (!isUploading) {
      onFilesChange([])
    }
  }

  const handleCancelUpload = () => {
    if (onCancelUpload) {
      onCancelUpload()
    } else {
      onFilesChange([])
    }
  }

  // Show success/error toasts when upload completes
  useEffect(() => {
    if (!isUploading && files.length > 0) {
      if (imageUrls.length > 0 && imageUrls.length === files.length) {
        toast.success(`${imageUrls.length} images uploaded successfully!`)
      } else if (imageUrls.length === 0) {
        toast.error("Upload failed")
      }
    }
  }, [isUploading, imageUrls.length, files.length])

  const canAddMore = files.length < 7 && !isUploading
  const hasUploadedImages = imageUrls.length > 0 && imageUrls.length === files.length && !isUploading

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 rounded-2xl bg-[#121212]  border border-primary p-4 sm:p-6 lg:p-8 text-white">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold">Upload Carousel Images </h2>
        <p className="text-white/80 text-sm sm:text-base">Upload 3-7 images for your carousel ad </p>
      </div>

      {files.length > 0 ? (
        <div className="space-y-4 transition-all duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 bg-[#2b2b2b] p-3 sm:p-4 rounded-xl">
            {files.map((file, index) => (
              <div key={index} className="relative group flex flex-col items-center transition-all duration-200">
                <div className="relative w-full h-20 sm:h-24 lg:h-28 rounded-lg overflow-hidden">
                  <Image
                    src={hasUploadedImages && imageUrls[index] ? imageUrls[index] : URL.createObjectURL(file)}
                    alt={`Upload preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div className="w-full mt-2">
                    <Progress value={uploadProgress} className="w-full h-2" />
                    <p className="text-xs text-gray-300 mt-1">{uploadProgress}%</p>
                  </div>
                )}

                <div className="text-xs text-gray-300 mt-1 truncate w-full text-center px-1">{file.name}</div>

                <button
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-30"
                  type="button"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {canAddMore && (
              <div
                onClick={handleClick}
                className="flex flex-col items-center justify-center h-20 sm:h-24 lg:h-28 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-800/30 transition-all duration-200"
              >
                <Plus className="w-5 sm:w-6 h-5 sm:h-6 text-gray-300 mb-1" />
                <span className="text-xs text-gray-300">Add More</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={isUploading}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white w-full sm:w-auto transition-all duration-200 disabled:opacity-50"
              type="button"
            >
              Clear All
            </Button>

            {isUploading && (
              <Button
                variant="outline"
                onClick={handleCancelUpload}
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white w-full sm:w-auto transition-all duration-200"
                type="button"
              >
                Cancel Upload
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`flex min-h-[160px] sm:min-h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-xl bg-[#2b2b2b] p-4 sm:p-6 text-center transition-all duration-300 ${isUploading
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
          <Upload className="w-12 sm:w-16 h-12 sm:h-16 text-primary mx-auto" />
          <p className="text-gray-200 font-medium text-sm sm:text-base">
            Click to upload <span className="text-gray-300">or drag and drop</span>
          </p>
          <p className="mt-2 text-xs sm:text-sm text-gray-300">PNG, JPG, JPEG (max. 10 MB each)</p>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">Upload 3-7 images</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png"
        multiple
        onChange={handleFileInput}
        disabled={isUploading}
      />
    </div>
  )
}