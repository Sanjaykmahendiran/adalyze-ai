"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import toast from "react-hot-toast"
import Cookies from "js-cookie"
import Image from "next/image"

interface Brand {
    brand_id: number
    user_id: number
    brand_name: string
    email: string
    mobile: string
    website: string
    logo_url: string
    logo_hash: string
    verified: number
    locked: number
    status: number
    created_date: string
    modified_date: string
}

type Props = {
    onCancel: () => void
    onAdded: () => void
    editingBrand?: Brand | null
    currentBrandCount?: number
    userDetails?: any | null
}

export default function AddBrandForm({ onCancel, onAdded, editingBrand, currentBrandCount = 0, userDetails }: Props) {
    const [brandName, setBrandName] = useState("")
    const [brandEmail, setBrandEmail] = useState("")
    const [brandMobile, setBrandMobile] = useState("")
    const [website, setWebsite] = useState("")
    const [logoUrl, setLogoUrl] = useState("")
    const [logoPreview, setLogoPreview] = useState("")
    const [isUploadingLogo, setIsUploadingLogo] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const userId = Cookies.get("userId")

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    // Get brand limit from user details (brand_count)
    const getBrandLimit = () => {
        return userDetails?.brands_count ?? 0
    }

    const brandLimit = getBrandLimit()
    const usedBrandCount = (currentBrandCount ?? 0)
    // Allow adding brands if userDetails.type is "1" (bypass limit check)
    const isAtBrandLimit = !editingBrand && usedBrandCount >= brandLimit && userDetails?.type !== "1"

    // Populate form when editing
    useEffect(() => {
        if (editingBrand) {
            setBrandName(editingBrand.brand_name)
            setBrandEmail(editingBrand.email)
            setBrandMobile(editingBrand.mobile)
            setLogoUrl(editingBrand.logo_url)
            setWebsite(editingBrand.website)
            setLogoPreview(editingBrand.logo_url)
        } else {
            resetForm()
        }
    }, [editingBrand])

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    const readFileAsBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const result = typeof reader.result === "string" ? reader.result : ""
                const base64 = result.includes(",") ? result.split(",")[1] : result
                resolve(base64)
            }
            reader.onerror = (e) => reject(e)
            reader.readAsDataURL(file)
        })

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

        setIsUploadingLogo(true)
        try {
            const base64String = await readFileAsBase64(file)
            const imageUploadPayload = {
                gofor: "image_upload",
                imgname: base64String,
                type: "Brand",
            }

            const response = await fetch("https://adalyzeai.xyz/App/api.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(imageUploadPayload),
            })

            const result = await response.json()

            if (result?.success || result?.status === "success") {
                const uploadedUrl: string = result?.url || ""
                if (uploadedUrl) {
                    setLogoUrl(uploadedUrl)
                    setLogoPreview(uploadedUrl)
                } else {
                    // Fallback to local preview if API didn't return a URL
                    setLogoPreview(URL.createObjectURL(file))
                }
                toast.success("Logo uploaded successfully!")
            } else {
                toast.error(result?.message || "Failed to upload logo. Please try again.")
            }
        } catch (error) {
            console.error("Logo upload error:", error)
            toast.error("Failed to upload logo. Please try again.")
        } finally {
            setIsUploadingLogo(false)
            // Reset the input so the same file can be re-selected if needed
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const handleAddBrand = async () => {
        // Validate all required fields
        if (!brandName.trim()) {
            toast.error("Brand Name is required")
            return
        }
        if (!brandEmail.trim()) {
            toast.error("Brand Email is required")
            return
        }
        if (!brandMobile.trim()) {
            toast.error("Brand Mobile Number is required")
            return
        }
        if (!logoUrl.trim()) {
            toast.error("Logo is required. Please upload a logo.")
            return
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(brandEmail.trim())) {
            toast.error("Please enter a valid email address")
            return
        }

        // Check brand limit for new brands only
        if (!editingBrand && isAtBrandLimit) {
            toast.error(`You have reached the maximum limit of ${brandLimit} brands for your current package. Please upgrade your package to add more brands.`)
            return
        }

        setIsSubmitting(true)
        try {
            const isEditing = !!editingBrand
            const payload = isEditing
                ? {
                    gofor: "editbrands",
                    brand_id: editingBrand.brand_id.toString(),
                    user_id: userId,
                    brand_name: brandName.trim(),
                    email: brandEmail.trim(),
                    mobile: brandMobile.trim(),
                    website: website,
                    logo_url: logoUrl,
                }
                : {
                    gofor: "addbrand",
                    user_id: userId,
                    brand_name: brandName.trim(),
                    email: brandEmail.trim(),
                    mobile: brandMobile.trim(),
                    website: website,
                    logo_url: logoUrl,
                }

            const response = await fetch("https://adalyzeai.xyz/App/api.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const result = await response.json()

            if (result?.success || result?.status === "success") {
                toast.success(isEditing ? "Brand updated successfully!" : "Brand added successfully!")
                resetForm()
                onAdded()
            } else {
                toast.error(result?.error || `Failed to ${isEditing ? "update" : "add"} brand`)
            }
        } catch (error) {
            console.error(`Error ${editingBrand ? "updating" : "adding"} brand:`, error)
            toast.error(`Failed to ${editingBrand ? "update" : "add"} brand. Please try again.`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setBrandName("")
        setBrandEmail("")
        setBrandMobile("")
        setLogoUrl("")
        setLogoPreview("")
        setWebsite("")
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />
            {/* Popup Content */}
            <div className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="rounded-lg border border-primary bg-black px-4 py-3 max-h-[90vh] w-full overflow-y-auto">
                    <div className="mb-4 flex justify-between items-start border-b border-white/10 pb-4">
                        <div >
                            <h2 className="text-xl font-semibold text-white">
                                {editingBrand ? "Edit Brand" : userDetails?.type === "1" ? "Add Your Brand" : "Add New Brand"}
                            </h2>
                            <p className="text-white/60 text-sm">
                                {editingBrand
                                    ? "Update brand profile with logo and contact information."
                                    : isAtBrandLimit
                                        ? `You have reached the maximum limit of ${brandLimit} brands for your current package.`
                                        : userDetails?.type === "1"
                                            ? "Create a new Brand profile with logo and contact information."
                                            : `Create a new brand profile with logo and contact information. (${usedBrandCount}/${brandLimit} brands used)`
                                }
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {/* Logo Upload and Brand Tip */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Logo Upload Section */}
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="logo" className="text-white font-semibold text-base">Logo *</Label>
                                <div className="flex flex-col items-center gap-4">
                                    {logoPreview ? (
                                        <div className="relative ">
                                            <div className="h-24 w-24 rounded-full bg-white overflow-hidden">
                                                <Image
                                                    src={logoPreview}
                                                    alt="Logo preview"
                                                    width={96}
                                                    height={96}
                                                    className="object-contain rounded-full w-full h-full" />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 bg-[#171717] text-white"
                                                onClick={() => {
                                                    setLogoPreview("")
                                                    setLogoUrl("")
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div
                                                onClick={isAtBrandLimit ? undefined : triggerFileInput}
                                                className={`h-24 w-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-[#171717] ${isAtBrandLimit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                                    }`}
                                            >
                                                <Upload className="h-6 w-6 text-white" />
                                            </div>
                                            <span className="text-white text-xs">Click to upload(JPG or JPEG)</span>
                                        </>
                                    )}
                                </div>
                                {/* Hidden file input */}
                                <Input
                                    ref={fileInputRef}
                                    id="logo"
                                    type="file"
                                    accept=".jpg,.jpeg,image/jpeg"
                                    onChange={handleLogoUpload}
                                    disabled={isUploadingLogo || isAtBrandLimit}
                                    className="hidden"
                                />
                                {isUploadingLogo && <p className="text-sm text-white mt-1">Uploading...</p>}
                            </div>

                            {/* Brand Tip Section */}
                            <div className="flex-1">
                                <div className="p-2 bg-[#171717] rounded-lg border border-white/5 h-full">
                                    <h3 className="text-white font-semibold text-sm mb-2">Brand Tip:</h3>
                                    <p className="text-white/70 text-xs leading-relaxed">
                                        The details you add here help Adalyze understand, verify your brand identity and Analysis better.
                                        Use your official logo (clean, high-resolution, square & JPG or JPEG format if possible) and the same name, mobile number, and email that you use across your social media pages.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Brand Name */}
                            <div className="space-y-2">
                                <Label htmlFor="brandName" className="text-white font-semibold text-base">Brand Name*</Label>
                                <Input
                                    id="brandName"
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                    className="bg-[#171717] text-white text-base py-5.5"
                                    placeholder="Enter  name"
                                    required
                                    disabled={isAtBrandLimit}
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="brandEmail" className="text-white font-semibold text-base">Brand Email*</Label>
                                <Input
                                    id="brandEmail"
                                    type="email"
                                    value={brandEmail}
                                    className="bg-[#171717] text-white text-base py-5.5"
                                    onChange={(e) => setBrandEmail(e.target.value)}
                                    placeholder="Enter email"
                                    required
                                    disabled={isAtBrandLimit}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Mobile */}
                            <div className="space-y-2">
                                <Label htmlFor="brandMobile" className="text-white font-semibold text-base">Brand Mobile Number*</Label>
                                <Input
                                    id="brandMobile"
                                    value={brandMobile}
                                    onChange={(e) => setBrandMobile(e.target.value)}
                                    className="bg-[#171717] text-white text-base py-5.5"
                                    placeholder="Enter mobile number"
                                    required
                                    disabled={isAtBrandLimit}
                                />
                            </div>

                            {/* Website */}
                            <div className="space-y-2">
                                <Label htmlFor="website" className="text-white font-semibold text-base">Brand Website</Label>
                                <Input
                                    id="website"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className="bg-[#171717] text-white text-base py-5.5"
                                    placeholder="Enter website"
                                    required
                                    disabled={isAtBrandLimit}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                className="flex-1"
                                onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddBrand}
                                disabled={
                                    isSubmitting ||
                                    !brandName.trim() ||
                                    !brandEmail.trim() ||
                                    !brandMobile.trim() ||
                                    !website.trim() ||
                                    !logoUrl.trim() ||
                                    isAtBrandLimit
                                }
                                className="flex-1"
                            >
                                {isAtBrandLimit
                                    ? userDetails?.type === "1" ? "Brand Limit Reached" : "Brand Limit Reached"
                                    : isSubmitting
                                        ? (editingBrand ? "Updating..." : "Adding...")
                                        : (editingBrand ? "Update Brand" : userDetails?.type === "1" ? "Add Brand" : "Add Brand")
                                }
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
