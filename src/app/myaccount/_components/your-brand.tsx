"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from "react-hot-toast"
import Cookies from "js-cookie"
import { Camera } from "lucide-react"
import Image from "next/image"
import { axiosInstance } from "@/configs/axios"

// Base URL configuration

interface BrandData {
  brand_id: number
  user_id: number
  brand_name: string
  email: string
  mobile: string
  logo_url: string
  logo_hash: string
  verified: number
  locked: number
  status: number
  created_date: string
  modified_date: string
}

interface UserDetails {
  brand?: {
    brand_id: number
  } | false
  [key: string]: any
}

interface BrandProps {
  userDetails?: UserDetails
}

export default function YourBrand({
  userDetails,
}: BrandProps) {
  // Brand form state
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [brandName, setBrandName] = useState("")
  const [brandEmail, setBrandEmail] = useState("")
  const [brandMobile, setBrandMobile] = useState("")
  const [website, setWebsite] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)


  // Fetch brand data on component mount
  useEffect(() => {
    if (userDetails?.brand && typeof userDetails.brand === 'object' && userDetails.brand.brand_id) {
      fetchBrandData(userDetails.brand.brand_id)
    }
  }, [userDetails?.brand])

  // Fetch brand data from API
  const fetchBrandData = async (brandId: number) => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get(`?gofor=getbrand&brand_id=${brandId}`)
      const data = response.data
      
      if (data.brand_id) {
        setBrandData(data)
        setBrandName(data.brand_name || "")
        setBrandEmail(data.email || "")
        setBrandMobile(data.mobile || "")
        setWebsite(data.website || "")
        setImagePreview(data.logo_url || "")
        setUploadedImageUrl(data.logo_url || "")
      } else {
        toast.error("Failed to fetch brand data")
      }
    } catch (error) {
      console.error("Error fetching brand data:", error)
      toast.error("Network error while fetching brand data")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle image upload to server
  const uploadImageToServer = async (base64Data: string) => {
    setIsUploadingImage(true)
    const payload = {
      gofor: "image_upload",
      imgname: base64Data,
      type: "brand",
    }

    try {
      const response = await axiosInstance.post('', {
        gofor: "image_upload",
        imgname: base64Data,
        type: "brand",
      })

      const data = response.data

      if (data?.success === true) {
        toast.success("Brand image uploaded successfully")
        setUploadedImageUrl(data.url)
        setImagePreview(data.url)
        return data.url
      } else {
        toast.error(data.message || "Failed to upload image")
        return null
      }
    } catch (error) {
      console.error("Image upload error:", error)
      toast.error("Network error while uploading image.")
      return null
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Handle image selection and conversion to base64
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!["image/jpeg", "image/jpg"].includes(file.type)) {
      toast.error("Only JPG or JPEG images are allowed")
      return
    }


    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    // Convert to base64 and upload immediately
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      // Remove the data:image/xxx;base64, prefix
      const base64Data = base64String.split(",")[1]

      // Show local preview first
      setImagePreview(base64String)

      // Upload to server immediately
      await uploadImageToServer(base64Data)
    }
    reader.readAsDataURL(file)
  }

  // Trigger file input click
  const handleEditImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async () => {
    if (!brandData) {
      toast.error("No brand data available to update")
      return
    }

    const payload = {
      gofor: "editbrands",
      brand_id: brandData.brand_id.toString(),
      user_id: brandData.user_id.toString(),
      brand_name: brandName,
      email: brandEmail,
      mobile: brandMobile,
      logo_url: uploadedImageUrl || brandData.logo_url,
      website: website,
    }

    try {
      const response = await axiosInstance.post('', payload)

      const data = response.data

      if (response && data.success === true) {
        toast.success("Brand updated successfully")
        // Refresh brand data
        await fetchBrandData(brandData.brand_id)
      } else {
        toast.error(data.message || "Failed to update brand")
      }
    } catch (error) {
      console.error("Brand update error:", error)
      toast.error("Network error. Please try again.")
    }
  }



  return (
    <div className="container mx-auto py-6 px-4 min-h-screen lg:mt-6">
          <Card className="rounded-2xl w-full p-4 sm:p-6 bg-black border-none shadow-gray-900/20">
            <div className="space-y-6">
              <h1 className="text-2xl font-semibold hidden sm:block text-white">Your Brand</h1>
              <div className="space-y-8 sm:grid sm:grid-cols-1">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div
                      onClick={handleEditImageClick}
                      className="w-32 h-32 rounded-full overflow-hidden bg-[#171717] border-2 border-[#3d3d3d] flex items-center justify-center">
                      {imagePreview ? (
                        <Image
                          src={imagePreview}
                          alt="Profile"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-4xl">
                          {brandName ? brandName.charAt(0).toUpperCase() : "B"}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleEditImageClick}
                      className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white rounded-full p-2 shadow-lg transition-colors"
                      aria-label="Edit profile image"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                   accept=".jpg,.jpeg,image/jpeg"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-400">
                    (JPG or JPEG)
                  </p>
                  {isUploadingImage && (
                    <p className="text-sm text-blue-400">
                      Uploading image...
                    </p>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="text-gray-400">Loading brand data...</div>
                    </div>
                  ) : (
                    <>
                      {/* Brand Name */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <Label htmlFor="brandName" className="text-gray-100 text-sm font-medium sm:w-[200px]">Brand Name</Label>
                        <Input
                          id="brandName"
                          placeholder="Enter brand name"
                          value={brandName}
                          onChange={(e) => setBrandName(e.target.value)}
                          className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                        />
                      </div>

                      {/* Brand Email */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <Label htmlFor="brandEmail" className="text-gray-100 text-sm font-medium sm:w-[200px]">Email</Label>
                        <Input
                          id="brandEmail"
                          type="email"
                          placeholder="Enter brand email"
                          value={brandEmail}
                          onChange={(e) => setBrandEmail(e.target.value)}
                          className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                        />
                      </div>

                      {/* Brand Mobile */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <Label htmlFor="brandMobile" className="text-gray-100 text-sm font-medium sm:w-[200px]">Mobile Number</Label>
                        <Input
                          id="brandMobile"
                          type="tel"
                          placeholder="Enter mobile number"
                          value={brandMobile}
                          onChange={(e) => setBrandMobile(e.target.value)}
                          className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                        />
                      </div>

                      {/* Website */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <Label htmlFor="website" className="text-gray-100 text-sm font-medium sm:w-[200px]">Website</Label>
                        <Input
                          id="website"
                          placeholder="Enter website"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Update Button */}
                <div className="flex justify-center sm:justify-end mt-4">
                  <Button
                    className="w-full sm:w-auto text-white"
                    onClick={handleSubmit}
                    disabled={isLoading || !brandData}
                  >
                    {isLoading ? "Updating..." : "Update Brand"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
    </div>
  )
}
