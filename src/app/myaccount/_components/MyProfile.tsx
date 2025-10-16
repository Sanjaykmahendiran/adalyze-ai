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
import ChangePasswordForm from "./changePassword"
import TransactionTable from "./paymentHistoryTable"
import { Camera } from "lucide-react"
import Image from "next/image"

// Base URL configuration
export const BASE_URL = "https://adalyzeai.xyz/App/api.php"

interface ProfileProps {
  name?: string
  mobileno?: string
  city?: string
  role?: string
  email?: string
  onProfileUpdate?: (updatedData: any) => void
  profileImage: string
}

export default function MyProfile({
  name = "",
  mobileno = "",
  city = "",
  role = "",
  email = "",
  onProfileUpdate,
  profileImage = "",
}: ProfileProps) {
  const userId = Cookies.get("userId")
  const [activeTab, setActiveTab] = useState("edit-profile")

  const [userName, setUserName] = useState(name || "")
  const [userMobileno, setUserMobileno] = useState(mobileno || "")
  const [userCity, setUserCity] = useState(city || "")
  const [userRole, setUserRole] = useState(role || "")
  const [imagePreview, setImagePreview] = useState<string>(profileImage || "")
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setUserName(name || "")
    setUserMobileno(mobileno || "")
    setUserCity(city || "")
    setUserRole(role || "")
  }, [name, mobileno, city, role])

  useEffect(() => {
    setImagePreview(profileImage || "")
  }, [profileImage])

  // Handle image upload to server
  const uploadImageToServer = async (base64Data: string) => {
    setIsUploadingImage(true)
    const payload = {
      gofor: "image_upload",
      imgname: base64Data,
      type: "profile",
    }

    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success === true) {
        toast.success("Profile image uploaded successfully")
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
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file")
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
    const payload = {
      gofor: "editprofile",
      user_id: userId || "",
      mobileno: userMobileno,
      name: userName,
      city: userCity,
      role: userRole,
      imgname: uploadedImageUrl || "", // Send the uploaded image URL
    }

    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.user_id) {
        // Save the entire user object to sessionStorage
        sessionStorage.setItem("userDetails", JSON.stringify(data))

        // Call parent callback if exists
        onProfileUpdate?.(data)

        toast.success("Profile updated successfully")
        // Optionally reload or update local state
        setUserName(data.name)
        setUserMobileno(data.mobileno)
        setUserCity(data.city)
        setUserRole(data.role)
      } else {
        toast.error(data.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast.error("Network error. Please try again.")
    }
  }


  useEffect(() => {
    if (sessionStorage.getItem("profileUpdated") === "true") {
      toast.success("Profile updated successfully")
      sessionStorage.removeItem("profileUpdated")
    }
  }, [])

  return (
    <div className="container mx-auto py-6 px-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-white">My Profile</h1>

      <Tabs defaultValue="edit-profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tabs List */}
        <TabsList className="grid grid-cols-2 w-full mb-6 rounded-full bg-black h-12">
          {["edit-profile", "change-password"].map((tab, idx) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="font-semibold rounded-[20px] h-10 px-2 sm:px-4 text-center sm:text-left text-gray-300 bg-transparent hover:bg-[#171717] 
                         data-[state=active]:bg-primary data-[state=active]:text-white transition-colors duration-300 truncate"
            >
              {tab === "edit-profile" ? "Edit Profile" : tab === "change-password" ? "Change Password" : ""}

            </TabsTrigger>
          ))}
        </TabsList>

        {/* Edit Profile Tab */}
        <TabsContent value="edit-profile">
          <Card className="rounded-2xl w-full p-4 sm:p-6 bg-black border-none shadow-gray-900/20">
            <div className="space-y-6">
              <h1 className="text-2xl font-semibold hidden sm:block text-white">Edit Profile</h1>
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
                          {userName ? userName.charAt(0).toUpperCase() : "U"}
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
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {isUploadingImage && (
                    <p className="text-sm text-blue-400">
                      Uploading image...
                    </p>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Name */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="name" className="text-gray-100 text-sm font-medium sm:w-[200px]">Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="mobileno" className="text-gray-100 text-sm font-medium sm:w-[200px]">Mobile Number</Label>
                    <Input
                      id="mobileno"
                      type="tel"
                      placeholder="Enter mobile number"
                      value={userMobileno}
                      onChange={(e) => setUserMobileno(e.target.value)}
                      className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                    />
                  </div>

                  {/* City */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="city" className="text-gray-100 text-sm font-medium sm:w-[200px]">City</Label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                      value={userCity}
                      onChange={(e) => setUserCity(e.target.value)}
                      className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                    />
                  </div>

                  {/* Role */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="role" className="text-gray-100 text-sm font-medium sm:w-[200px]">I'm a</Label>
                    <Select onValueChange={setUserRole} value={userRole}>
                      <SelectTrigger className="w-full border-none bg-[#171717] text-white">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#171717] border-none">
                        <SelectItem value="Freelancer">Freelancer</SelectItem>
                        <SelectItem value="Digital Marketer">Digital Marketer</SelectItem>
                        <SelectItem value="Business Owner - Entrepreneur">Business Owner / Entrepreneur</SelectItem>
                        <SelectItem value="Marketing Agency">Marketing Agency</SelectItem>
                        <SelectItem value="Content Creator">Content Creator (YouTuber, Blogger, etc.)</SelectItem>
                        <SelectItem value="Graphic Designer">Graphic Designer</SelectItem>
                        <SelectItem value="Social Media Manager">Social Media Manager</SelectItem>
                        <SelectItem value="Brand Manager">Brand Manager</SelectItem>
                        <SelectItem value="Startup - SME">Startup / SME</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Update Button */}
                <div className="flex justify-center sm:justify-end mt-4">
                  <Button
                    className="w-full sm:w-auto text-white"
                    onClick={handleSubmit}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Change Password Tab */}
        <TabsContent value="change-password">
          <div className="bg-black rounded-2xl transition-colors duration-200 ">
            <ChangePasswordForm email={email} />
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}
