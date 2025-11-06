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
import { Camera } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"

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
  userDetails?: any
  action?: string | null
}

interface AgencyData {
  agency_id?: number
  user_id?: string
  agency_name: string
  agency_logo: string
  contact_person: string
  designation: string
  business_email: string
  business_phone: string
  website_url: string
  gst_no: string
  address: string
  state: string
  city: string
  country: string
  pincode: string
  team_members: string
}

export default function MyProfile({
  name = "",
  mobileno = "",
  city = "",
  role = "",
  email = "",
  onProfileUpdate,
  profileImage = "",
  userDetails = null,
  action = null,
}: ProfileProps) {
  const userId = Cookies.get("userId")
  const [activeTab, setActiveTab] = useState(action === "add-agency" ? "agency" : "edit-profile")
  const router = useRouter()
  const [userName, setUserName] = useState(name || "")
  const [userMobileno, setUserMobileno] = useState(mobileno || "")
  const [userCity, setUserCity] = useState(city || "")
  const [userRole, setUserRole] = useState(role || "")
  const [imagePreview, setImagePreview] = useState<string>(profileImage || "")
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Agency form state
  const [agencyData, setAgencyData] = useState<AgencyData>({
    agency_name: "",
    agency_logo: "",
    contact_person: "",
    designation: "",
    business_email: "",
    business_phone: "",
    website_url: "",
    gst_no: "",
    address: "",
    state: "",
    city: "",
    country: "",
    pincode: "",
    team_members: ""
  })
  const [agencyLogoPreview, setAgencyLogoPreview] = useState<string>("")
  const [uploadedAgencyLogoUrl, setUploadedAgencyLogoUrl] = useState<string>("")
  const [isUploadingAgencyLogo, setIsUploadingAgencyLogo] = useState(false)
  const agencyLogoInputRef = useRef<HTMLInputElement>(null)

  // Country/State/City dropdown data and selections
  const [countries, setCountries] = useState<Array<{ id: string; name: string }>>([])
  const [states, setStates] = useState<Array<{ id: string; name: string }>>([])
  const [cities, setCities] = useState<Array<{ id: string; name: string }>>([])
  const [selectedCountryId, setSelectedCountryId] = useState<string>("")
  const [selectedStateId, setSelectedStateId] = useState<string>("")
  const [selectedCityId, setSelectedCityId] = useState<string>("")
  const [loadingCountries, setLoadingCountries] = useState(false)
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)

  // Local single-select popover component
  function SearchableSelect({
    options,
    value,
    onChange,
    placeholder,
    loading,
  }: {
    options: Array<{ id: string; name: string }>
    value: string
    onChange: (id: string) => void
    placeholder: string
    loading?: boolean
  }) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const selected = options.find(o => o.id === value)
    const filtered = search
      ? options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))
      : options

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex w-full items-center justify-between rounded-md border bg-[#171717] text-white h-10 px-3"
            type="button"
          >
            <span className="truncate text-left text-sm">
              {selected ? selected.name : placeholder}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>{loading ? "Loading..." : "No results found."}</CommandEmpty>
              <CommandGroup>
                {filtered.map((opt) => (
                  <CommandItem
                    key={opt.id}
                    value={opt.name}
                    onSelect={() => {
                      onChange(opt.id)
                      setOpen(false)
                    }}
                    className="cursor-pointer"
                  >
                    <Check className={`mr-2 h-4 w-4 ${opt.id === value ? "opacity-100" : "opacity-0"}`} />
                    <span>{opt.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  useEffect(() => {
    setUserName(name || "")
    setUserMobileno(mobileno || "")
    setUserCity(city || "")
    setUserRole(role || "")
  }, [name, mobileno, city, role])

  useEffect(() => {
    setImagePreview(profileImage || "")
  }, [profileImage])

  // Initialize agency data from userDetails
  useEffect(() => {
    if (userDetails?.agency) {
      const agency = userDetails.agency
      setAgencyData({
        agency_id: agency.agency_id,
        user_id: agency.user_id,
        agency_name: agency.agency_name || "",
        agency_logo: agency.agency_logo || "",
        contact_person: agency.contact_person || "",
        designation: agency.designation || "",
        business_email: agency.business_email || "",
        business_phone: agency.business_phone || "",
        website_url: agency.website_url || "",
        gst_no: agency.gst_no || "",
        address: agency.address || "",
        state: agency.state || "",
        city: agency.city || "",
        country: agency.country || "",
        pincode: agency.pincode || "",
        team_members: agency.team_members?.toString() || ""
      })
      setAgencyLogoPreview(agency.agency_logo || "")
    }
  }, [userDetails])

  // Fetch countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoadingCountries(true)
        const res = await fetch("https://techades.com/App/api.php?gofor=countrieslist")
        const data = await res.json()
        const mapped = (Array.isArray(data) ? data : []).map((c: any) => ({ id: String(c.id), name: String(c.name) }))
        setCountries(mapped)
        // Try to preselect by name from existing agency data
        if (agencyData.country) {
          const match = mapped.find((c) => c.name.toLowerCase() === agencyData.country.toLowerCase())
          if (match) setSelectedCountryId(match.id)
        }
      } catch (e) {
        console.error("Countries fetch error", e)
      } finally {
        setLoadingCountries(false)
      }
    }
    loadCountries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch states when country changes
  useEffect(() => {
    const loadStates = async () => {
      if (!selectedCountryId) {
        setStates([])
        setSelectedStateId("")
        return
      }
      try {
        setLoadingStates(true)
        const res = await fetch(`https://techades.com/App/api.php?gofor=stateslist&country_id=${encodeURIComponent(selectedCountryId)}`)
        const data = await res.json()
        const mapped = (Array.isArray(data) ? data : []).map((s: any) => ({ id: String(s.id), name: String(s.name) }))
        setStates(mapped)
        // Preselect by name from existing agency data
        if (agencyData.state) {
          const match = mapped.find((s) => s.name.toLowerCase() === agencyData.state.toLowerCase())
          if (match) setSelectedStateId(match.id)
        }
      } catch (e) {
        console.error("States fetch error", e)
      } finally {
        setLoadingStates(false)
      }
    }
    loadStates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryId])

  // Fetch cities when state changes
  useEffect(() => {
    const loadCities = async () => {
      if (!selectedStateId) {
        setCities([])
        setSelectedCityId("")
        return
      }
      try {
        setLoadingCities(true)
        const res = await fetch(`https://techades.com/App/api.php?gofor=citieslist&state_id=${encodeURIComponent(selectedStateId)}`)
        const data = await res.json()
        const mapped = (Array.isArray(data) ? data : []).map((c: any) => ({ id: String(c.id), name: String(c.name) }))
        setCities(mapped)
        // Preselect by name from existing agency data
        if (agencyData.city) {
          const match = mapped.find((c) => c.name.toLowerCase() === agencyData.city.toLowerCase())
          if (match) setSelectedCityId(match.id)
        }
      } catch (e) {
        console.error("Cities fetch error", e)
      } finally {
        setLoadingCities(false)
      }
    }
    loadCities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStateId])

  // Handle image upload to server
  const uploadImageToServer = async (base64Data: string, type: "profile" | "agency" = "profile") => {
    if (type === "profile") {
      setIsUploadingImage(true)
    } else {
      setIsUploadingAgencyLogo(true)
    }

    const payload = {
      gofor: "image_upload",
      imgname: base64Data,
      type: type,
    }

    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success === true) {
        toast.success(`${type === "profile" ? "Profile" : "Agency logo"} uploaded successfully`)
        if (type === "profile") {
          setUploadedImageUrl(data.url)
          setImagePreview(data.url)
        } else {
          setUploadedAgencyLogoUrl(data.url)
          setAgencyLogoPreview(data.url)
        }
        return data.url
      } else {
        toast.error(data.message || `Failed to upload ${type}`)
        return null
      }
    } catch (error) {
      console.error(`${type} upload error:`, error)
      toast.error(`Network error while uploading ${type}.`)
      return null
    } finally {
      if (type === "profile") {
        setIsUploadingImage(false)
      } else {
        setIsUploadingAgencyLogo(false)
      }
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
      await uploadImageToServer(base64Data, "profile")
    }
    reader.readAsDataURL(file)
  }

  // Trigger file input click
  const handleEditImageClick = () => {
    fileInputRef.current?.click()
  }

  // Handle agency logo selection and conversion to base64
  const handleAgencyLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setAgencyLogoPreview(base64String)

      // Upload to server immediately
      await uploadImageToServer(base64Data, "agency")
    }
    reader.readAsDataURL(file)
  }

  // Trigger agency logo file input click
  const handleEditAgencyLogoClick = () => {
    agencyLogoInputRef.current?.click()
  }

  const handleSubmit = async () => {
    const payload = {
      gofor: "editprofile",
      user_id: userId || "",
      mobileno: userMobileno,
      name: userName,
      city: userCity,
      role: userRole,
      imgname: uploadedImageUrl || "",
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

        // Check user type and route accordingly
        if (data.type === "2") {
          router.push("/clients")
        }

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

  // Handle agency form submission
  const handleAgencySubmit = async () => {
    const isEdit = agencyData.agency_id && agencyData.agency_id > 0;

    const payload = {
      gofor: isEdit ? "edituseragency" : "adduseragency",
      ...(isEdit && { agency_id: agencyData.agency_id }),
      user_id: userId || "",
      agency_name: agencyData.agency_name,
      agency_logo: uploadedAgencyLogoUrl || agencyData.agency_logo,
      contact_person: agencyData.contact_person,
      designation: agencyData.designation,
      business_email: agencyData.business_email,
      business_phone: agencyData.business_phone,
      website_url: agencyData.website_url,
      gst_no: agencyData.gst_no,
      address: agencyData.address,
      city: agencyData.city,
      state: agencyData.state,
      country: agencyData.country,
      pincode: agencyData.pincode,
      team_members: agencyData.team_members,
    };

    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast.success(data.message || `Agency ${isEdit ? "updated" : "created"} successfully`);

        // Update local state (optional)
        setAgencyData(prev => ({
          ...prev,
          ...agencyData,
        }));

        // Trigger parent callback if available
        onProfileUpdate?.(data);

        // ✅ Only redirect if it's a new agency (not edit)
        if (!isEdit) {
          router.push("/brands");
        }
      } else {
        toast.error(data.message || `Failed to ${isEdit ? "update" : "create"} agency`);
      }
    } catch (error) {
      console.error("Agency submission error:", error);
      toast.error("Network error. Please try again.");
    }
  };


  // Handle action prop changes
  useEffect(() => {
    if (action === "add-agency") {
      setActiveTab("agency")
    }
  }, [action])

  useEffect(() => {
    if (sessionStorage.getItem("profileUpdated") === "true") {
      toast.success("Profile updated successfully")
      sessionStorage.removeItem("profileUpdated")
    }
  }, [])

  return (
    <div className="container mx-auto py-6 min-h-screen lg:mt-6">

      <Tabs defaultValue="edit-profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tabs List */}
        <TabsList className={`grid w-full mb-6 rounded-full bg-black h-12 ${userDetails?.type === "2" ? "grid-cols-3" : "grid-cols-2"}`}>
          {[
            { key: "edit-profile", label: "Edit Profile" },
            ...(userDetails?.type === "2" ? [{ key: "agency", label: "Agency" }] : []),
            {
              key: "change-password",
              label: (
                <>
                  <span className="sm:hidden">Password</span>
                  <span className="hidden sm:inline">Change Password</span>
                </>
              )
            }
          ].map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="font-semibold rounded-[20px] h-10 px-2 sm:px-4 text-center sm:text-left text-gray-300 bg-transparent hover:bg-[#171717] 
                         data-[state=active]:bg-primary data-[state=active]:text-white transition-colors duration-300 truncate"
            >
              {tab.label}
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

                  {/* Country (Profile) */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="profile_country" className="text-gray-100 text-sm font-medium sm:w-[200px]">Country</Label>
                    <div className="w-full">
                      <SearchableSelect
                        options={countries}
                        value={selectedCountryId}
                        onChange={(newId) => {
                          setSelectedCountryId(newId)
                          // Reset state/city and city text for profile on country change
                          setSelectedStateId("")
                          setStates([])
                          setSelectedCityId("")
                          setCities([])
                          setUserCity("")
                        }}
                        placeholder="Select country"
                        loading={loadingCountries}
                      />
                    </div>
                  </div>

                  {/* State (Profile) */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="profile_state" className="text-gray-100 text-sm font-medium sm:w-[200px]">State</Label>
                    <div className="w-full">
                      <SearchableSelect
                        options={states}
                        value={selectedStateId}
                        onChange={(newId) => {
                          setSelectedStateId(newId)
                          // Reset city and city text for profile on state change
                          setSelectedCityId("")
                          setCities([])
                          setUserCity("")
                        }}
                        placeholder="Select state"
                        loading={loadingStates}
                      />
                    </div>
                  </div>

                  {/* City (Profile) */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="profile_city" className="text-gray-100 text-sm font-medium sm:w-[200px]">City</Label>
                    <div className="w-full">
                      <SearchableSelect
                        options={cities}
                        value={selectedCityId}
                        onChange={(newId) => {
                          setSelectedCityId(newId)
                          const selected = cities.find((c) => c.id === newId)
                          setUserCity(selected ? selected.name : "")
                        }}
                        placeholder="Select city"
                        loading={loadingCities}
                      />
                    </div>
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

        {/* Agency Tab - Only show if user type is "2" */}
        {userDetails?.type === "2" && (
          <TabsContent value="agency">
            <Card className="rounded-2xl w-full p-4 sm:p-6 bg-black border-none shadow-gray-900/20">
              <div className="space-y-6">
                <h1 className="text-2xl font-semibold hidden sm:block text-white">Agency Information</h1>
                <div className="space-y-8 sm:grid sm:grid-cols-1">
                  {/* Agency Logo Upload */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div
                        onClick={handleEditAgencyLogoClick}
                        className="w-32 h-32 rounded-full overflow-hidden bg-[#171717] border-2 border-[#3d3d3d] flex items-center justify-center">
                        {agencyLogoPreview ? (
                          <Image
                            src={agencyLogoPreview}
                            alt="Agency Logo"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400 text-4xl">
                            {agencyData.agency_name ? agencyData.agency_name.charAt(0).toUpperCase() : "A"}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleEditAgencyLogoClick}
                        className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white rounded-full p-2 shadow-lg transition-colors"
                        aria-label="Edit agency logo"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                    </div>
                    <input
                      ref={agencyLogoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAgencyLogoChange}
                      className="hidden"
                    />
                    {isUploadingAgencyLogo && (
                      <p className="text-sm text-blue-400">
                        Uploading logo...
                      </p>
                    )}
                  </div>

                  {/* Agency Form Fields */}
                  <div className="space-y-4">
                    {/* Agency Name */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="agency_name" className="text-gray-100 text-sm font-medium sm:w-[200px]">Agency Name*</Label>
                      <Input
                        id="agency_name"
                        placeholder="Enter agency name"
                        value={agencyData.agency_name}
                        onChange={(e) => setAgencyData(prev => ({ ...prev, agency_name: e.target.value }))}
                        className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                      />
                    </div>

                    {/* Contact Person */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="contact_person" className="text-gray-100 text-sm font-medium sm:w-[200px]">Contact Person*</Label>
                      <Input
                        id="contact_person"
                        placeholder="Enter contact person name"
                        value={agencyData.contact_person}
                        onChange={(e) => setAgencyData(prev => ({ ...prev, contact_person: e.target.value }))}
                        className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                      />
                    </div>

                    {/* Designation */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="designation" className="text-gray-100 text-sm font-medium sm:w-[200px]">Designation*</Label>
                      <Input
                        id="designation"
                        placeholder="Enter designation"
                        value={agencyData.designation}
                        onChange={(e) => setAgencyData(prev => ({ ...prev, designation: e.target.value }))}
                        className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                      />
                    </div>

                    {/* Business Email */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="business_email" className="text-gray-100 text-sm font-medium sm:w-[200px]">Business Email*</Label>
                      <Input
                        id="business_email"
                        type="email"
                        placeholder="Enter business email"
                        value={agencyData.business_email}
                        onChange={(e) => setAgencyData(prev => ({ ...prev, business_email: e.target.value }))}
                        className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                      />
                    </div>

                    {/* Business Phone */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="business_phone" className="text-gray-100 text-sm font-medium sm:w-[200px]">Business Phone*</Label>
                      <Input
                        id="business_phone"
                        type="tel"
                        placeholder="Enter business phone"
                        value={agencyData.business_phone}
                        onChange={(e) => setAgencyData(prev => ({ ...prev, business_phone: e.target.value }))}
                        className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                      />
                    </div>

                    {/* Website URL */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="website_url" className="text-gray-100 text-sm font-medium sm:w-[200px]">Website URL</Label>
                      <Input
                        id="website_url"
                        type="url"
                        placeholder="Enter website URL"
                        value={agencyData.website_url}
                        onChange={(e) => setAgencyData(prev => ({ ...prev, website_url: e.target.value }))}
                        className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                      />
                    </div>

                    {/* GST Number */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="gst_no" className="text-gray-100 text-sm font-medium sm:w-[200px]">GST Number</Label>
                      <Input
                        id="gst_no"
                        placeholder="Enter GST number"
                        value={agencyData.gst_no}
                        onChange={(e) => setAgencyData(prev => ({ ...prev, gst_no: e.target.value.toUpperCase() }))}
                        className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400 uppercase"
                      />
                    </div>

                    {/* Address */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="address" className="text-gray-100 text-sm font-medium sm:w-[200px]">Address*</Label>
                      <Input
                        id="address"
                        placeholder="Enter address"
                        value={agencyData.address}
                        onChange={(e) => setAgencyData(prev => ({ ...prev, address: e.target.value }))}
                        className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                      />
                    </div>

                    {/* Country */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="country" className="text-gray-100 text-sm font-medium sm:w-[200px]">Country*</Label>
                      <div className="w-full">
                        <SearchableSelect
                          options={countries}
                          value={selectedCountryId}
                          onChange={(newId) => {
                            setSelectedCountryId(newId)
                            const selected = countries.find((c) => c.id === newId)
                            setAgencyData(prev => ({ ...prev, country: selected ? selected.name : "" }))
                            setSelectedStateId("")
                            setStates([])
                            setAgencyData(prev => ({ ...prev, state: "", city: "" }))
                            setSelectedCityId("")
                            setCities([])
                          }}
                          placeholder="Select country"
                          loading={loadingCountries}
                        />
                      </div>
                    </div>

                    {/* State */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="agency_state" className="text-gray-100 text-sm font-medium sm:w-[200px]">State*</Label>
                      <div className="w-full">
                        <SearchableSelect
                          options={states}
                          value={selectedStateId}
                          onChange={(newId) => {
                            setSelectedStateId(newId)
                            const selected = states.find((s) => s.id === newId)
                            setAgencyData(prev => ({ ...prev, state: selected ? selected.name : "" }))
                            setSelectedCityId("")
                            setAgencyData(prev => ({ ...prev, city: "" }))
                          }}
                          placeholder="Select state"
                          loading={loadingStates}
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="agency_city" className="text-gray-100 text-sm font-medium sm:w-[200px]">City*</Label>
                      <div className="w-full">
                        <SearchableSelect
                          options={cities}
                          value={selectedCityId}
                          onChange={(newId) => {
                            setSelectedCityId(newId)
                            const selected = cities.find((c) => c.id === newId)
                            setAgencyData(prev => ({ ...prev, city: selected ? selected.name : "" }))
                          }}
                          placeholder="Select city"
                          loading={loadingCities}
                        />
                      </div>
                    </div>

                    {/* Pincode */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="pincode" className="text-gray-100 text-sm font-medium sm:w-[200px]">Pincode*</Label>
                      <Input
                        id="pincode"
                        placeholder="Enter pincode"
                        value={agencyData.pincode}
                        onChange={(e) => setAgencyData(prev => ({ ...prev, pincode: e.target.value }))}
                        className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                      />
                    </div>

                    {/* Team Members */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="team_members" className="text-gray-100 text-sm font-medium sm:w-[200px]">Team Members</Label>
                      <Select
                        value={agencyData.team_members}
                        onValueChange={(val) => setAgencyData(prev => ({ ...prev, team_members: val }))}
                      >
                        <SelectTrigger className="w-full border-none bg-[#171717] text-white">
                          <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#171717] border-none">
                          <SelectItem value="1-10">1-10</SelectItem>
                          <SelectItem value="10-20">10-20</SelectItem>
                          <SelectItem value="21-50">21-50</SelectItem>
                          <SelectItem value="51-100">51-100</SelectItem>
                          <SelectItem value="101-200">101-200</SelectItem>
                          <SelectItem value="200+">200+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center sm:justify-end mt-4">
                    <Button
                      className="w-full sm:w-auto text-white"
                      onClick={handleAgencySubmit}
                    >
                      {agencyData.agency_id ? "Update Agency" : "Create Agency"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        )}

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


