"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload } from "lucide-react"
import UserLayout from "@/components/layouts/user-layout"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import toast from "react-hot-toast"

export default function MyProfile() {
  const { userDetails } = useFetchUserDetails()

  // Profile form states
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userMobile, setUserMobile] = useState("")
  const [userCompany, setUserCompany] = useState("")
  const [userCity, setUserCity] = useState("")
  const [userRole, setUserRole] = useState("")
  const [profileImage, setProfileImage] = useState("")

  // Password form states
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Pre-fill form data when userDetails is available
  useEffect(() => {
    if (userDetails) {
      setUserName(userDetails.name || "")
      setUserEmail(userDetails.email || "")
      setUserMobile(userDetails.mobileno || "")
      setUserCompany(userDetails.company || "")
      setUserCity(userDetails.city || "")
      setUserRole(userDetails.role || "")
      setProfileImage(userDetails.imgname || "")
    }
  }, [userDetails])

  // Handle image upload
  const handleImageUpload = async (event:any) => {
    const file = event.target.files[0]
    if (!file) return

    setIsUploadingImage(true)

    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        if (!reader.result || typeof reader.result !== 'string') {
          toast.error('Failed to read the image file.')
          setIsUploadingImage(false)
          return
        }
        const base64String = reader.result.split(',')[1]

        const imageUploadPayload = {
          gofor: "image_upload",
          imgname: base64String,
          type: "profile"
        }

        const response = await fetch('https://adalyzeai.xyz/App/api.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(imageUploadPayload)
        })

        const result = await response.json()

        if (result.success || result.status === 'success') {
          // Assuming the API returns the uploaded image URL
          setProfileImage(result.url || URL.createObjectURL(file))
          toast.success('Profile image uploaded successfully!')
        } else {
          toast.error('Failed to upload image. Please try again.')
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!userDetails?.user_id) {
      toast.error('User ID not found. Please refresh the page.')
      return
    }

    setIsUpdatingProfile(true)

    try {
      const profileUpdatePayload = {
        gofor: "editprofile",
        user_id: userDetails.user_id,
        mobileno: userMobile,
        name: userName,
        imgname: profileImage,
        company: userCompany,
        city: userCity,
        role: userRole
      }

      const response = await fetch('https://adalyzeai.xyz/App/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileUpdatePayload)
      })

      const result = await response.json()

      if (result) {
        toast.success('Profile updated successfully!')
        // Optionally refresh user details
        window.location.reload()
      } else {
        toast.error('Failed to update profile. Please try again.')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // Handle password update
  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.')
      return
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.')
      return
    }

    setIsUpdatingPassword(true)

    try {
      // You may need to implement a separate password update API endpoint
      // For now, this is a placeholder structure
      const passwordUpdatePayload = {
        gofor: "updatepassword",
        user_id: userDetails?.user_id,
        current_password: currentPassword,
        new_password: newPassword
      }

      const response = await fetch('https://adalyzeai.xyz/App/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordUpdatePayload)
      })

      const result = await response.json()

      if (result.success || result.status === 'success') {
        toast.success('Password updated successfully!')
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error('Failed to update password. Please check your current password.')
      }
    } catch (error) {
      console.error('Password update error:', error)
      toast.error('Failed to update password. Please try again.')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <UserLayout userDetails={userDetails}>
      <div className="mx-auto py-6 px-4 max-w-4xl pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="grid gap-8">
          {/* Profile Information Section */}
          <Card className="rounded-2xl w-full p-8 bg-[#121212] border border-[#2b2b2b] shadow-sm">
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-semibold leading-tight">Profile Information</h2>
                <p className="text-sm text-muted-foreground mt-1">Update your personal details and contact information</p>
              </div>

              <Separator className="bg-[#2b2b2b]" />

              {/* Profile Image Section */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="w-24 h-24 ring-2 ring-[#2b2b2b] transition-all group-hover:scale-105 duration-200">
                    <AvatarImage src={profileImage} alt="Profile" />
                    <AvatarFallback className="text-2xl">
                      {userName.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-image"
                    className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition"
                  >
                    <Camera size={16} />
                  </label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{userName || "Your Name"}</h3>
                  <p className="text-sm text-muted-foreground">{userRole || "Role"} at {userCompany || "Company"}</p>
                  <p className="text-sm text-muted-foreground">{userCity || "City"}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-[#121212] border border-[#2b2b2b] h-11 focus-visible:ring-1 focus-visible:ring-[#2b2b2b]"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="bg-[#121212] border border-[#2b2b2b] h-11"
                    disabled
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-1.5">
                  <Label htmlFor="mobile" className="text-sm font-medium">Mobile Number</Label>
                  <Input
                    id="mobile"
                    placeholder="Enter your mobile number"
                    value={userMobile}
                    onChange={(e) => setUserMobile(e.target.value)}
                    className="bg-[#121212] border border-[#2b2b2b] h-11"
                  />
                </div>

                {/* Company */}
                <div className="space-y-1.5">
                  <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                  <Input
                    id="company"
                    placeholder="Enter your company name"
                    value={userCompany}
                    onChange={(e) => setUserCompany(e.target.value)}
                    className="bg-[#121212] border border-[#2b2b2b] h-11"
                  />
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-sm font-medium">City</Label>
                  <Input
                    id="city"
                    placeholder="Enter your city"
                    value={userCity}
                    onChange={(e) => setUserCity(e.target.value)}
                    className="bg-[#121212] border border-[#2b2b2b] h-11"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                  <Input
                    id="role"
                    placeholder="Enter your role"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="bg-[#121212] border border-[#2b2b2b] h-11"
                  />
                </div>
              </div>

              {/* Button */}
              <div className="flex justify-end pt-6">
                <Button
                  className="px-8 h-11"
                  onClick={handleProfileUpdate}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </Card>


          {/* Security Section */}
          <Card className="rounded-2xl w-full p-8 bg-[#121212] border-[#2b2b2b]">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Security Settings</h2>
                <p className="text-muted-foreground text-sm">Update your password to keep your account secure</p>
              </div>

              <Separator className="bg-[#2b2b2b]" />

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-sm font-medium">
                    Current Password
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-[#121212] border-[#2b2b2b] h-11"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium">
                      New Password
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-[#121212] border-[#2b2b2b] h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-[#121212] border-[#2b2b2b] h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  className="px-8"
                  onClick={handlePasswordUpdate}
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </UserLayout>
  )
}