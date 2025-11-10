"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { Upload, X, Plus, Loader2, Info } from "lucide-react"
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
  const [hasShownSuccessToast, setHasShownSuccessToast] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Use a Map to cache preview URLs by file object to avoid recreating on reorder
  const previewUrlsMapRef = useRef<Map<File, string>>(new Map())

  // Memoize preview URLs maintaining cache across reorders
  const previewUrls = useMemo(() => {
    const urlsMap = previewUrlsMapRef.current
    const currentFiles = new Set(files)
    
    // Remove URLs for files that are no longer in the list
    for (const [file, url] of urlsMap.entries()) {
      if (!currentFiles.has(file)) {
        URL.revokeObjectURL(url)
        urlsMap.delete(file)
      }
    }
    
    // Create URLs only for new files
    return files.map(file => {
      if (!urlsMap.has(file)) {
        urlsMap.set(file, URL.createObjectURL(file))
      }
      return urlsMap.get(file)!
    })
  }, [files])

  // Cleanup all object URLs on unmount
  useEffect(() => {
    return () => {
      const urlsMap = previewUrlsMapRef.current
      for (const url of urlsMap.values()) {
        URL.revokeObjectURL(url)
      }
      urlsMap.clear()
    }
  }, [])

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
      validateAndSetFiles(Array.from(e.dataTransfer.files))
    }
  }, [isUploading])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUploading && e.target.files && e.target.files.length > 0) {
      validateAndSetFiles(Array.from(e.target.files))
    }
  }, [isUploading])

  const validateAndSetFiles = useCallback((newFiles: File[]) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"]
    const invalidFiles = newFiles.filter(file =>
      !validTypes.includes(file.type) || file.size > 3 * 1024 * 1024
    )

    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} file(s) skipped. Please upload valid JPG/PNG under 3MB`)
    }

    const validFiles = newFiles.filter(file =>
      validTypes.includes(file.type) && file.size <= 3 * 1024 * 1024
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
  }, [files, onFilesChange])

  const handleClick = useCallback(() => {
    if (!isUploading && files.length < 7) {
      fileInputRef.current?.click()
    } else if (files.length >= 7) {
      toast.error("Maximum 7 images allowed")
    }
  }, [isUploading, files.length])

  const removeFile = useCallback((indexToRemove: number) => {
    if (!isUploading) {
      const updatedFiles = files.filter((_, index) => index !== indexToRemove)
      onFilesChange(updatedFiles)
      setHasShownSuccessToast(false)
    }
  }, [isUploading, files, onFilesChange])

  const handleClearAll = useCallback(() => {
    if (!isUploading) {
      onFilesChange([])
      setHasShownSuccessToast(false)
    }
  }, [isUploading, onFilesChange])

  const handleCancelUpload = useCallback(() => {
    if (onCancelUpload) onCancelUpload()
    else onFilesChange([])
    setHasShownSuccessToast(false)
  }, [onCancelUpload, onFilesChange])

  useEffect(() => {
    if (files.length === 0) {
      setHasShownSuccessToast(false)
    }
  }, [files.length])

  const canAddMore = files.length < 7 && !isUploading

  const shouldShowImageLoading = useCallback((index: number) => {
    return isUploading && index >= imageUrls.length
  }, [isUploading, imageUrls.length])

  const getImageSource = useCallback((index: number) => { 
    if (imageUrls[index]) {
      return imageUrls[index]
    }
    return previewUrls[index]
  }, [imageUrls, previewUrls])

  // Drag and drop reordering functions
  const handleDragStart = useCallback((index: number) => (e: React.DragEvent) => {
    if (isUploading) {
      e.preventDefault()
      return
    }
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", index.toString())
    setDraggedIndex(index)
  }, [isUploading])

  const handleDragOverItem = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedIndex === null || isUploading || draggedIndex === index) return
    
    e.dataTransfer.dropEffect = "move"
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }, [draggedIndex, isUploading, dragOverIndex])

  const handleDragLeaveItem = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleDropItem = useCallback((dropIndex: number) => (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (draggedIndex === null || draggedIndex === dropIndex || isUploading) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    // Reorder the files array efficiently
    const newFiles = [...files]
    const [draggedFile] = newFiles.splice(draggedIndex, 1)
    newFiles.splice(dropIndex, 0, draggedFile)
    
    // Reset states immediately for better responsiveness
    setDraggedIndex(null)
    setDragOverIndex(null)
    
    // Update files after state reset
    requestAnimationFrame(() => {
      onFilesChange(newFiles)
    })
  }, [draggedIndex, files, onFilesChange, isUploading])

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [])

  // Touch-based long-press drag and drop (mobile)
  const longPressTimeoutRef = useRef<number | null>(null)
  const isLongPressActiveRef = useRef(false)

  const clearLongPress = () => {
    if (longPressTimeoutRef.current !== null) {
      window.clearTimeout(longPressTimeoutRef.current)
      longPressTimeoutRef.current = null
    }
    isLongPressActiveRef.current = false
  }

  const handleTouchStart = useCallback((index: number) => (e: React.TouchEvent) => {
    if (isUploading) return
    // Schedule long-press to initiate drag
    clearLongPress()
    longPressTimeoutRef.current = window.setTimeout(() => {
      isLongPressActiveRef.current = true
      setDraggedIndex(index)
    }, 250)
  }, [isUploading])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isLongPressActiveRef.current) return
    const touch = e.touches[0]
    if (!touch) return
    // Prevent scrolling while dragging
    e.preventDefault()
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    if (!el) return
    const target = el.closest('[data-carousel-index]') as HTMLElement | null
    if (!target) return
    const indexAttr = target.getAttribute('data-carousel-index')
    if (indexAttr == null) return
    const overIndex = parseInt(indexAttr, 10)
    if (!Number.isNaN(overIndex)) {
      setDragOverIndex(prev => (prev !== overIndex ? overIndex : prev))
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    const dropIndex = dragOverIndex
    const dragIndex = draggedIndex
    clearLongPress()
    if (dragIndex === null) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }
    if (dropIndex == null || dropIndex === dragIndex || isUploading) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newFiles = [...files]
    const [draggedFile] = newFiles.splice(dragIndex, 1)
    newFiles.splice(dropIndex, 0, draggedFile)

    setDraggedIndex(null)
    setDragOverIndex(null)
    requestAnimationFrame(() => {
      onFilesChange(newFiles)
    })
  }, [dragOverIndex, draggedIndex, files, onFilesChange, isUploading])

  const handleTouchCancel = useCallback(() => {
    clearLongPress()
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [])

  return (
<div className="flex flex-col space-y-4 sm:space-y-6 rounded-2xl bg-[#171717] border border-primary p-4 sm:p-6 lg:p-8 text-white">
  {files.length > 0 ? (
    <div className="flex flex-col items-center space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 w-full">
        {files.map((file, index) => {
          const imageSource = getImageSource(index)
          const showLoading = shouldShowImageLoading(index)
          const isDraggingThis = draggedIndex === index
          const isDraggedOver = dragOverIndex === index && draggedIndex !== index

          return (
            <div 
              key={`${file.name}-${index}-${file.lastModified}`} 
              className={`relative group flex flex-col items-center transition-all duration-200 ${
                !isUploading ? 'cursor-move' : 'cursor-not-allowed'
              } ${
                isDraggingThis ? 'opacity-50 scale-95' : ''
              } ${
                isDraggedOver ? 'scale-105 ring-2 ring-primary' : ''
              }`}
              data-carousel-index={index}
              draggable={!isUploading}
              onDragStart={handleDragStart(index)}
              onDragOver={handleDragOverItem(index)}
              onDragLeave={handleDragLeaveItem}
              onDrop={handleDropItem(index)}
              onDragEnd={handleDragEnd}
              onTouchStart={handleTouchStart(index)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
            >
              <div className="relative w-full h-24 sm:h-28 xl:h-32 rounded-lg overflow-hidden">
                <Image src={imageSource} alt={`Upload preview ${index + 1}`} fill className="object-cover" />
                {showLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  </div>
                )}
              </div>

              {showLoading && (
                <div className="w-full mt-2">
                  <Progress value={uploadProgress} className="w-full h-2" />
                  <p className="text-xs text-gray-300 mt-1">{uploadProgress}%</p>
                </div>
              )}

              <div className="text-xs text-gray-300 mt-1 truncate w-full text-center px-1">{file.name}</div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
                disabled={isUploading}
                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-all duration-200 disabled:opacity-30 shadow-lg z-10"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )
        })}

        {canAddMore && (
          <div
            onClick={handleClick}
            className="flex flex-col items-center justify-center h-24 sm:h-28 xl:h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-[#2a2a2a] transition-all duration-200"
          >
            <Plus className="w-5 sm:w-6 h-5 sm:h-6 text-gray-300 mb-1" />
            <span className="text-xs text-gray-300">Add More</span>
          </div>
        )}
      </div>

      {/* Actions: Clear All / Cancel Upload */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Button
          variant="outline"
          onClick={handleClearAll}
          disabled={isUploading}
          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white w-full sm:w-auto transition-all duration-200 disabled:opacity-50"
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

      {/* Drag and drop hint */}
      {!isUploading && imageUrls.length > 0 && (
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-400 bg-[#2a2a2a] px-3 py-2 rounded-lg border border-gray-700">
          <Info className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-center">
              Drag and drop images to reorder them for your carousel
          </p>
        </div>
      )}
    </div>
  ) : (
    <div
      className={`flex min-h-[160px] sm:min-h-[200px] lg:min-h-[240px] w-full cursor-pointer flex-col items-center justify-center rounded-xl bg-[#2b2b2b] p-4 sm:p-6 text-center transition-all duration-300 ${
        isUploading
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
      <Upload className="w-12 sm:w-16 h-12 sm:h-16 text-primary mx-auto" />
      <p className="text-gray-200 font-medium text-sm sm:text-base">
        Click to upload <span className="text-gray-300">or drag and drop</span>
      </p>
      <p className="mt-1 text-xs sm:text-sm text-gray-300">PNG, JPG, JPEG (max. 3 MB each)</p>
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
