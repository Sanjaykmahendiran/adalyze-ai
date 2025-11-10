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
import { Check, ChevronsUpDown, Search, ChevronDown, X } from "lucide-react"

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

  // Additional profile fields for specific roles
  const [designation, setDesignation] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [gstNumber, setGstNumber] = useState("")
  const [address, setAddress] = useState("")
  const [pincode, setPincode] = useState("")
  const [teamMembers, setTeamMembers] = useState("")

  // Edit mode states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingAgency, setIsEditingAgency] = useState(false)

  // Check if agency data exists
  const hasAgencyData = userDetails?.agency && userDetails.agency.agency_name

  // Roles that require additional fields
  const rolesRequiringAdditionalFields = [
    "Startup - SME",
    "Brand Manager",
    "Marketing Agency",
    "Business Owner - Entrepreneur"
  ]
  const shouldShowAdditionalFields = rolesRequiringAdditionalFields.includes(userRole)

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

  // Mobile detection and modal states
  const [isMobile, setIsMobile] = useState(false)
  const [countryModalOpen, setCountryModalOpen] = useState(false)
  const [stateModalOpen, setStateModalOpen] = useState(false)
  const [cityModalOpen, setCityModalOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const [stateSearch, setStateSearch] = useState("")
  const [citySearch, setCitySearch] = useState("")

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

  // Detect mobile viewport
  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window !== "undefined") {
        const small = window.innerWidth <= 640
        setIsMobile(small)
      }
    }
    updateIsMobile()
    window.addEventListener('resize', updateIsMobile)
    return () => window.removeEventListener('resize', updateIsMobile)
  }, [])

  useEffect(() => {
    setUserName(name || "")
    setUserMobileno(mobileno || "")
    setUserCity(city || "")
    setUserRole(role || "")

    // Initialize additional fields from userDetails
    if (userDetails) {
      setDesignation(userDetails.designation || "")
      setWebsiteUrl(userDetails.website_url || "")
      setGstNumber(userDetails.gst_no || "")
      setAddress(userDetails.address || "")
      setPincode(userDetails.pincode || "")
      setTeamMembers(userDetails.team_members || "")
    }
  }, [name, mobileno, city, role, userDetails])

  useEffect(() => {
    setImagePreview(profileImage || "")
  }, [profileImage])

  // Preselect profile location based on existing user details
  useEffect(() => {
    if (!countries.length) return

    // For profile tab in edit mode - match user's country
    if (isEditingProfile) {
      const profileCountry = userDetails?.country || ""
      if (profileCountry && !selectedCountryId) {
        const match = countries.find((c) => c.name.toLowerCase() === profileCountry.toLowerCase())
        if (match) {
          setSelectedCountryId(match.id)
        }
      }
    }

    // For agency tab in edit mode - match agency country
    if (isEditingAgency) {
      const agencyCountry = agencyData.country || ""
      if (agencyCountry && !selectedCountryId) {
        const match = countries.find((c) => c.name.toLowerCase() === agencyCountry.toLowerCase())
        if (match) {
          setSelectedCountryId(match.id)
        }
      }
    }
  }, [countries, userDetails?.country, agencyData.country, isEditingProfile, isEditingAgency, selectedCountryId])

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

  // Auto-enable edit mode for agency if no data exists
  useEffect(() => {
    if (!hasAgencyData && userDetails?.type === "2") {
      setIsEditingAgency(true)
    }
  }, [hasAgencyData, userDetails?.type])

  // Fetch countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoadingCountries(true)
        const res = await fetch("https://techades.com/App/api.php?gofor=countrieslist")
        const data = await res.json()
        const mapped = (Array.isArray(data) ? data : []).map((c: any) => ({ id: String(c.id), name: String(c.name) }))
        setCountries(mapped)
      } catch (e) {
        console.error("Countries fetch error", e)
      } finally {
        setLoadingCountries(false)
      }
    }
    loadCountries()
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

        // Try to match existing state based on which form is being edited
        let preferredState = ""
        if (isEditingProfile) {
          preferredState = userDetails?.state || ""
        } else if (isEditingAgency) {
          preferredState = agencyData.state || ""
        }

        if (preferredState && !selectedStateId) {
          const match = mapped.find((s) => s.name.toLowerCase() === preferredState.toLowerCase())
          if (match) {
            setSelectedStateId(match.id)
          }
        }
      } catch (e) {
        console.error("States fetch error", e)
      } finally {
        setLoadingStates(false)
      }
    }
    loadStates()
  }, [selectedCountryId, userDetails?.state, agencyData.state, isEditingProfile, isEditingAgency, selectedStateId])

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

        // Try to match existing city based on which form is being edited
        let preferredCity = ""
        if (isEditingProfile) {
          preferredCity = userDetails?.city || ""
        } else if (isEditingAgency) {
          preferredCity = agencyData.city || ""
        }

        if (preferredCity && !selectedCityId) {
          const match = mapped.find((c) => c.name.toLowerCase() === preferredCity.toLowerCase())
          if (match) {
            setSelectedCityId(match.id)
            // Also set the city name for profile
            if (isEditingProfile) {
              setUserCity(match.name)
            }
          }
        }
      } catch (e) {
        console.error("Cities fetch error", e)
      } finally {
        setLoadingCities(false)
      }
    }
    loadCities()
  }, [selectedStateId, userDetails?.city, agencyData.city, isEditingProfile, isEditingAgency, selectedCityId])

  // Handle image upload to server
  const uploadImageToServer = async (base64Data: string, type: "profile" | "agency" = "profile") => {
    if (type === "profile") {
      setIsUploadingImage(true)
    } else {
      setIsUploadingAgencyLogo(true)
    }

    const payload = {
      imgname: base64Data,
      type: type,
    }

    try {
      const response = await fetch("/api/image_upload", {
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
    const selectedCountryName = countries.find((c) => c.id === selectedCountryId)?.name || userDetails?.country || ""
    const selectedStateName = states.find((s) => s.id === selectedStateId)?.name || userDetails?.state || ""
    const selectedCityName = cities.find((c) => c.id === selectedCityId)?.name || userCity || userDetails?.city || ""

    const payload: any = {
      user_id: userId || "",
      mobileno: userMobileno,
      name: userName,
      country: selectedCountryName,
      state: selectedStateName,
      city: selectedCityName,
      role: userRole,
      imgname: uploadedImageUrl || profileImage || "",
    }

    // Add additional fields if role requires them
    if (shouldShowAdditionalFields) {
      payload.designation = designation
      payload.website_url = websiteUrl
      payload.gst_no = gstNumber
      payload.address = address
      payload.pincode = pincode
      payload.team_members = teamMembers
    }

    try {
      const response = await fetch("/api/editprofile", {
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

        // Exit edit mode
        setIsEditingProfile(false)
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
       const endpoint = isEdit ? "/api/edituseragency" : "/api/adduseragency"
      const response = await fetch(endpoint, {
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

        // Exit edit mode
        setIsEditingAgency(false);

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
          <Card className="rounded-2xl w-full sm:p-6 bg-black border-none shadow-gray-900/20">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-white">
                  {isEditingProfile ? "Edit Profile" : "Profile Information"}
                </h1>
                {!isEditingProfile && (
                  <Button
                    onClick={() => setIsEditingProfile(true)}
                    className="text-white"
                  >
                    Edit
                  </Button>
                )}
              </div>

              {!isEditingProfile ? (
                // Display Profile Data as Card
                <div className="space-y-4">
                  {/* Profile Image Display */}
                  <div className="flex flex-col items-center space-y-4 mb-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-[#171717] border-2 border-[#3d3d3d] flex items-center justify-center">
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
                  </div>

                  {/* Profile Data Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Name", value: userName },
                      { label: "Email", value: email },
                      { label: "Mobile Number", value: userMobileno },
                      { label: "Role", value: userRole },
                      ...(shouldShowAdditionalFields
                        ? [
                          { label: "Designation", value: designation },
                          { label: "Website URL", value: websiteUrl },
                          { label: "GST Number", value: gstNumber },
                          { label: "Team Members", value: teamMembers },
                        ]
                        : []),
                      { label: "Address", value: address },
                      { label: "Country", value: userDetails?.country },
                      { label: "State", value: userDetails?.state },
                      { label: "City", value: userCity },
                      { label: "Pincode", value: pincode },
                    ].map((field, index) => (
                      <div
                        key={index}
                        className="flex flex-col bg-[#171717] border border-[#3d3d3d] p-3 rounded-lg hover:border-[#db4900] transition"
                      >
                        <Label className="text-primary text-sm uppercase tracking-wide">
                          {field.label}
                        </Label>
                        <p className="text-white text-base font-medium mt-1  break-words">
                          {field.value || "NA"}
                        </p>
                      </div>
                    ))}
                  </div>

                </div>
              ) : (
                // Edit Profile Form
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

                    {/* Role - Now 3rd field */}
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

                    {/* Additional Fields - Show conditionally based on role */}
                    {shouldShowAdditionalFields && (
                      <>
                        {/* Designation */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <Label htmlFor="designation" className="text-gray-100 text-sm font-medium sm:w-[200px]">Designation</Label>
                          <Input
                            id="designation"
                            placeholder="Enter designation"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
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
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                          />
                        </div>

                        {/* GST Number */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <Label htmlFor="gst_number" className="text-gray-100 text-sm font-medium sm:w-[200px]">GST Number</Label>
                          <Input
                            id="gst_number"
                            placeholder="Enter GST number"
                            value={gstNumber}
                            onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                            className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400 uppercase"
                          />
                        </div>

                        {/* Team Members */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <Label htmlFor="team_members" className="text-gray-100 text-sm font-medium sm:w-[200px]">Team Members</Label>
                          <Select
                            value={teamMembers}
                            onValueChange={(val) => setTeamMembers(val)}
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
                      </>
                    )}

                    {/* Address */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="address" className="text-gray-100 text-sm font-medium sm:w-[200px]">Address</Label>
                      <Input
                        id="address"
                        placeholder="Enter address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                      />
                    </div>

                    {/* Country (Profile) */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="profile_country" className="text-gray-100 text-sm font-medium sm:w-[200px]">Country</Label>
                      <div className="w-full">
                        {isMobile ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setCountryModalOpen(true)}
                              className="w-full bg-[#171717] border border-[#3d3d3d] text-white py-2 px-4 rounded-md text-left flex items-center justify-between"
                            >
                              <span className={selectedCountryId ? "text-white text-sm" : "text-white/60 text-sm"}>
                                {countries.find(c => c.id === selectedCountryId)?.name || "Select country"}
                              </span>
                              <ChevronDown className="w-4 h-4 text-white/60" />
                            </button>
                            {countryModalOpen && (
                              <div
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-[100000]"
                                onClick={() => setCountryModalOpen(false)}
                              >
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="bg-black rounded-xl w-full max-w-md h-[50vh] flex flex-col"
                                >
                                  <div className="p-4 border-b border-white/50">
                                    <div className="flex items-center justify-between mb-3">
                                      <h3 className="text-white font-semibold">Select Country</h3>
                                      <button
                                        type="button"
                                        onClick={() => setCountryModalOpen(false)}
                                        className="text-white/80 hover:text-white"
                                        aria-label="Close"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="relative">
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                      <input
                                        type="text"
                                        value={countrySearch}
                                        onChange={(e) => setCountrySearch(e.target.value)}
                                        placeholder="Search countries..."
                                        className="w-full pl-9 pr-3 py-3 text-sm bg-[#171717] text-white rounded-md placeholder-white/70 focus:outline-none focus:border-orange-500 transition-colors"
                                        autoComplete="off"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex-1 overflow-y-auto p-2">
                                    {countries.filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase())).map((c) => (
                                      <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCountryId(c.id)
                                          // Reset state/city and city text for profile on country change
                                          setSelectedStateId("")
                                          setStates([])
                                          setSelectedCityId("")
                                          setCities([])
                                          setUserCity("")
                                          setCountryModalOpen(false)
                                          setCountrySearch("")
                                        }}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedCountryId === c.id ? 'bg-orange-500/10 text-orange-500' : 'text-white hover:bg-[#2b2b2b]'}`}
                                      >
                                        {c.name}
                                      </button>
                                    ))}
                                    {countries.length === 0 && (
                                      <div className="px-4 py-4 text-sm text-gray-400 text-center">{loadingCountries ? "Loading..." : "No options available"}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
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
                        )}
                      </div>
                    </div>

                    {/* State (Profile) */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="profile_state" className="text-gray-100 text-sm font-medium sm:w-[200px]">State</Label>
                      <div className="w-full">
                        {isMobile ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setStateModalOpen(true)}
                              className="w-full bg-[#171717] border border-[#3d3d3d] text-white py-2 px-4 rounded-md text-left flex items-center justify-between"
                            >
                              <span className={selectedStateId ? "text-white text-sm" : "text-white/60 text-sm"}>
                                {states.find(s => s.id === selectedStateId)?.name || "Select state"}
                              </span>
                              <ChevronDown className="w-4 h-4 text-white/60" />
                            </button>
                            {stateModalOpen && (
                              <div
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-[100000]"
                                onClick={() => setStateModalOpen(false)}
                              >
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="bg-black rounded-xl w-full max-w-md h-[50vh] flex flex-col"
                                >
                                  <div className="p-4 border-b border-white/50">
                                    <div className="flex items-center justify-between mb-3">
                                      <h3 className="text-white font-semibold">Select State</h3>
                                      <button
                                        type="button"
                                        onClick={() => setStateModalOpen(false)}
                                        className="text-white/80 hover:text-white"
                                        aria-label="Close"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="relative">
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                      <input
                                        type="text"
                                        value={stateSearch}
                                        onChange={(e) => setStateSearch(e.target.value)}
                                        placeholder="Search states..."
                                        className="w-full pl-9 pr-3 py-3 text-sm bg-[#171717] text-white rounded-md placeholder-white/70 focus:outline-none focus:border-orange-500 transition-colors"
                                        autoComplete="off"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex-1 overflow-y-auto p-2">
                                    {states.filter((s) => s.name.toLowerCase().includes(stateSearch.toLowerCase())).map((s) => (
                                      <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedStateId(s.id)
                                          // Reset city and city text for profile on state change
                                          setSelectedCityId("")
                                          setCities([])
                                          setUserCity("")
                                          setStateModalOpen(false)
                                          setStateSearch("")
                                        }}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedStateId === s.id ? 'bg-orange-500/10 text-orange-500' : 'text-white hover:bg-[#2b2b2b]'}`}
                                      >
                                        {s.name}
                                      </button>
                                    ))}
                                    {states.length === 0 && (
                                      <div className="px-4 py-4 text-sm text-gray-400 text-center">{loadingStates ? "Loading..." : "No options available"}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
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
                        )}
                      </div>
                    </div>

                    {/* City (Profile) */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="profile_city" className="text-gray-100 text-sm font-medium sm:w-[200px]">City</Label>
                      <div className="w-full">
                        {isMobile ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setCityModalOpen(true)}
                              className="w-full bg-[#171717] border border-[#3d3d3d] text-white py-2 px-4 rounded-md text-left flex items-center justify-between"
                            >
                              <span className={selectedCityId ? "text-white text-sm" : "text-white/60 text-sm"}>
                                {cities.find(c => c.id === selectedCityId)?.name || "Select city"}
                              </span>
                              <ChevronDown className="w-4 h-4 text-white/60" />
                            </button>
                            {cityModalOpen && (
                              <div
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-[100000]"
                                onClick={() => setCityModalOpen(false)}
                              >
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="bg-black rounded-xl w-full max-w-md h-[50vh] flex flex-col"
                                >
                                  <div className="p-4 border-b border-white/50">
                                    <div className="flex items-center justify-between mb-3">
                                      <h3 className="text-white font-semibold">Select City</h3>
                                      <button
                                        type="button"
                                        onClick={() => setCityModalOpen(false)}
                                        className="text-white/80 hover:text-white"
                                        aria-label="Close"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="relative">
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                      <input
                                        type="text"
                                        value={citySearch}
                                        onChange={(e) => setCitySearch(e.target.value)}
                                        placeholder="Search cities..."
                                        className="w-full pl-9 pr-3 py-3 text-sm bg-[#171717] text-white rounded-md placeholder-white/70 focus:outline-none focus:border-orange-500 transition-colors"
                                        autoComplete="off"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex-1 overflow-y-auto p-2">
                                    {cities.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase())).map((c) => (
                                      <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCityId(c.id)
                                          const selected = cities.find((city) => city.id === c.id)
                                          setUserCity(selected ? selected.name : "")
                                          setCityModalOpen(false)
                                          setCitySearch("")
                                        }}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedCityId === c.id ? 'bg-orange-500/10 text-orange-500' : 'text-white hover:bg-[#2b2b2b]'}`}
                                      >
                                        {c.name}
                                      </button>
                                    ))}
                                    {cities.length === 0 && (
                                      <div className="px-4 py-4 text-sm text-gray-400 text-center">{loadingCities ? "Loading..." : "No options available"}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
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
                        )}
                      </div>
                    </div>

                    {/* Pincode */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="pincode" className="text-gray-100 text-sm font-medium sm:w-[200px]">Pincode</Label>
                      <Input
                        id="pincode"
                        placeholder="Enter pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="border-none bg-[#171717] text-white placeholder:text-gray-400 w-full focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {/* Update and Cancel Buttons */}
                  <div className="flex justify-center sm:justify-end gap-3 mt-4">
                    <Button
                      variant="outline"
                      className="sm:w-auto"
                      onClick={() => {
                        setIsEditingProfile(false)
                        // Reset to original values
                        setUserName(name || "")
                        setUserMobileno(mobileno || "")
                        setUserCity(city || "")
                        setUserRole(role || "")
                        setImagePreview(profileImage || "")
                        // Reset additional fields
                        if (userDetails) {
                          setDesignation(userDetails.designation || "")
                          setWebsiteUrl(userDetails.website_url || "")
                          setGstNumber(userDetails.gst_no || "")
                          setAddress(userDetails.address || "")
                          setPincode(userDetails.pincode || "")
                          setTeamMembers(userDetails.team_members || "")
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className=" sm:w-auto text-white"
                      onClick={handleSubmit}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Agency Tab - Only show if user type is "2" */}
        {userDetails?.type === "2" && (
          <TabsContent value="agency">
            <Card className="rounded-2xl w-full  sm:p-6 bg-black border-none shadow-gray-900/20">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold text-white">
                    {isEditingAgency ? (hasAgencyData ? "Edit Agency" : "Create Agency") : "Agency Information"}
                  </h1>
                  {!isEditingAgency && hasAgencyData && (
                    <Button
                      onClick={() => setIsEditingAgency(true)}
                      className="text-white"
                    >
                      Edit
                    </Button>
                  )}
                </div>

                {!isEditingAgency && hasAgencyData ? (
                  // Display Agency Data as Card
                  <div className="space-y-4">
                    {/* Agency Logo Display */}
                    <div className="flex flex-col items-center space-y-4 mb-6">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-[#171717] border-2 border-[#3d3d3d] flex items-center justify-center">
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
                    </div>

                    {/* Agency Data Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: "Agency Name", value: agencyData.agency_name },
                        { label: "Contact Person", value: agencyData.contact_person },
                        { label: "Designation", value: agencyData.designation },
                        { label: "Business Email", value: agencyData.business_email },
                        { label: "Business Phone", value: agencyData.business_phone },
                        { label: "Website URL", value: agencyData.website_url },
                        { label: "GST Number", value: agencyData.gst_no },
                        { label: "Address", value: agencyData.address },
                        { label: "Country", value: agencyData.country },
                        { label: "State", value: agencyData.state },
                        { label: "City", value: agencyData.city },
                        { label: "Pincode", value: agencyData.pincode },
                        { label: "Team Members", value: agencyData.team_members },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col p-3 rounded-lg bg-[#171717] border border-[#3d3d3d] hover:border-[#db4900] transition"
                        >
                          <Label className="text-primary text-sm tracking-wide uppercase">
                            {item.label}
                          </Label>
                          <p className="text-white text-base font-medium mt-1 break-words">
                            {item.value || "NA"}
                          </p>
                        </div>
                      ))}
                    </div>

                  </div>
                ) : (
                  // Edit/Create Agency Form
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
                          {isMobile ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setCountryModalOpen(true)}
                                className="w-full bg-[#171717] border border-[#3d3d3d] text-white py-2 px-4 rounded-md text-left flex items-center justify-between"
                              >
                                <span className={selectedCountryId ? "text-white text-sm" : "text-white/60 text-sm"}>
                                  {countries.find(c => c.id === selectedCountryId)?.name || "Select country"}
                                </span>
                                <ChevronDown className="w-4 h-4 text-white/60" />
                              </button>
                              {countryModalOpen && (
                                <div
                                  className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-[100000]"
                                  onClick={() => setCountryModalOpen(false)}
                                >
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-black rounded-xl w-full max-w-md h-[50vh] flex flex-col"
                                  >
                                    <div className="p-4 border-b border-white/50">
                                      <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-white font-semibold">Select Country</h3>
                                        <button
                                          type="button"
                                          onClick={() => setCountryModalOpen(false)}
                                          className="text-white/80 hover:text-white"
                                          aria-label="Close"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                      <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                        <input
                                          type="text"
                                          value={countrySearch}
                                          onChange={(e) => setCountrySearch(e.target.value)}
                                          placeholder="Search countries..."
                                          className="w-full pl-9 pr-3 py-3 text-sm bg-[#171717] text-white rounded-md placeholder-white/70 focus:outline-none focus:border-orange-500 transition-colors"
                                          autoComplete="off"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2">
                                      {countries.filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase())).map((c) => (
                                        <button
                                          key={c.id}
                                          type="button"
                                          onClick={() => {
                                            setSelectedCountryId(c.id)
                                            const selected = countries.find((country) => country.id === c.id)
                                            setAgencyData(prev => ({ ...prev, country: selected ? selected.name : "" }))
                                            setSelectedStateId("")
                                            setStates([])
                                            setAgencyData(prev => ({ ...prev, state: "", city: "" }))
                                            setSelectedCityId("")
                                            setCities([])
                                            setCountryModalOpen(false)
                                            setCountrySearch("")
                                          }}
                                          className={`w-full text-left p-3 rounded-lg transition-colors ${selectedCountryId === c.id ? 'bg-orange-500/10 text-orange-500' : 'text-white hover:bg-[#2b2b2b]'}`}
                                        >
                                          {c.name}
                                        </button>
                                      ))}
                                      {countries.length === 0 && (
                                        <div className="px-4 py-4 text-sm text-gray-400 text-center">{loadingCountries ? "Loading..." : "No options available"}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
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
                          )}
                        </div>
                      </div>

                      {/* State */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <Label htmlFor="agency_state" className="text-gray-100 text-sm font-medium sm:w-[200px]">State*</Label>
                        <div className="w-full">
                          {isMobile ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setStateModalOpen(true)}
                                className="w-full bg-[#171717] border border-[#3d3d3d] text-white py-2 px-4 rounded-md text-left flex items-center justify-between"
                              >
                                <span className={selectedStateId ? "text-white text-sm" : "text-white/60 text-sm"}>
                                  {states.find(s => s.id === selectedStateId)?.name || "Select state"}
                                </span>
                                <ChevronDown className="w-4 h-4 text-white/60" />
                              </button>
                              {stateModalOpen && (
                                <div
                                  className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-[100000]"
                                  onClick={() => setStateModalOpen(false)}
                                >
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-black rounded-xl w-full max-w-md h-[50vh] flex flex-col"
                                  >
                                    <div className="p-4 border-b border-white/50">
                                      <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-white font-semibold">Select State</h3>
                                        <button
                                          type="button"
                                          onClick={() => setStateModalOpen(false)}
                                          className="text-white/80 hover:text-white"
                                          aria-label="Close"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                      <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                        <input
                                          type="text"
                                          value={stateSearch}
                                          onChange={(e) => setStateSearch(e.target.value)}
                                          placeholder="Search states..."
                                          className="w-full pl-9 pr-3 py-3 text-sm bg-[#171717] text-white rounded-md placeholder-white/70 focus:outline-none focus:border-orange-500 transition-colors"
                                          autoComplete="off"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2">
                                      {states.filter((s) => s.name.toLowerCase().includes(stateSearch.toLowerCase())).map((s) => (
                                        <button
                                          key={s.id}
                                          type="button"
                                          onClick={() => {
                                            setSelectedStateId(s.id)
                                            const selected = states.find((state) => state.id === s.id)
                                            setAgencyData(prev => ({ ...prev, state: selected ? selected.name : "" }))
                                            setSelectedCityId("")
                                            setAgencyData(prev => ({ ...prev, city: "" }))
                                            setStateModalOpen(false)
                                            setStateSearch("")
                                          }}
                                          className={`w-full text-left p-3 rounded-lg transition-colors ${selectedStateId === s.id ? 'bg-orange-500/10 text-orange-500' : 'text-white hover:bg-[#2b2b2b]'}`}
                                        >
                                          {s.name}
                                        </button>
                                      ))}
                                      {states.length === 0 && (
                                        <div className="px-4 py-4 text-sm text-gray-400 text-center">{loadingStates ? "Loading..." : "No options available"}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
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
                          )}
                        </div>
                      </div>

                      {/* City */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <Label htmlFor="agency_city" className="text-gray-100 text-sm font-medium sm:w-[200px]">City*</Label>
                        <div className="w-full">
                          {isMobile ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setCityModalOpen(true)}
                                className="w-full bg-[#171717] border border-[#3d3d3d] text-white py-2 px-4 rounded-md text-left flex items-center justify-between"
                              >
                                <span className={selectedCityId ? "text-white text-sm" : "text-white/60 text-sm"}>
                                  {cities.find(c => c.id === selectedCityId)?.name || "Select city"}
                                </span>
                                <ChevronDown className="w-4 h-4 text-white/60" />
                              </button>
                              {cityModalOpen && (
                                <div
                                  className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-[100000]"
                                  onClick={() => setCityModalOpen(false)}
                                >
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-black rounded-xl w-full max-w-md h-[50vh] flex flex-col"
                                  >
                                    <div className="p-4 border-b border-white/50">
                                      <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-white font-semibold">Select City</h3>
                                        <button
                                          type="button"
                                          onClick={() => setCityModalOpen(false)}
                                          className="text-white/80 hover:text-white"
                                          aria-label="Close"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                      <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                        <input
                                          type="text"
                                          value={citySearch}
                                          onChange={(e) => setCitySearch(e.target.value)}
                                          placeholder="Search cities..."
                                          className="w-full pl-9 pr-3 py-3 text-sm bg-[#171717] text-white rounded-md placeholder-white/70 focus:outline-none focus:border-orange-500 transition-colors"
                                          autoComplete="off"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2">
                                      {cities.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase())).map((c) => (
                                        <button
                                          key={c.id}
                                          type="button"
                                          onClick={() => {
                                            setSelectedCityId(c.id)
                                            const selected = cities.find((city) => city.id === c.id)
                                            setAgencyData(prev => ({ ...prev, city: selected ? selected.name : "" }))
                                            setCityModalOpen(false)
                                            setCitySearch("")
                                          }}
                                          className={`w-full text-left p-3 rounded-lg transition-colors ${selectedCityId === c.id ? 'bg-orange-500/10 text-orange-500' : 'text-white hover:bg-[#2b2b2b]'}`}
                                        >
                                          {c.name}
                                        </button>
                                      ))}
                                      {cities.length === 0 && (
                                        <div className="px-4 py-4 text-sm text-gray-400 text-center">{loadingCities ? "Loading..." : "No options available"}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
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
                          )}
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

                    {/* Submit and Cancel Buttons */}
                    <div className="flex justify-center sm:justify-end gap-3 mt-4">
                      {hasAgencyData && (
                        <Button
                          variant="outline"
                          className=" sm:w-auto"
                          onClick={() => {
                            setIsEditingAgency(false)
                            // Reset to original agency data
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
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        className=" sm:w-auto text-white"
                        onClick={handleAgencySubmit}
                      >
                        {agencyData.agency_id ? "Update Agency" : "Create Agency"}
                      </Button>
                    </div>
                  </div>
                )}
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


