"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X } from "lucide-react"
import toast from "react-hot-toast"
import Cookies from "js-cookie"

interface Brand {
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

type Props = {
    onCancel: () => void
    onAdded: () => void
    editingBrand?: Brand | null
}

export default function AddBrandForm({ onCancel, onAdded, editingBrand }: Props) {
    const [brandName, setBrandName] = useState("")
    const [brandEmail, setBrandEmail] = useState("")
    const [brandMobile, setBrandMobile] = useState("")
    const [logoUrl, setLogoUrl] = useState("")
    const [logoPreview, setLogoPreview] = useState("")
    const [isUploadingLogo, setIsUploadingLogo] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const userId = Cookies.get("userId")

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    // Populate form when editing
    useEffect(() => {
        if (editingBrand) {
            setBrandName(editingBrand.brand_name)
            setBrandEmail(editingBrand.email)
            setBrandMobile(editingBrand.mobile)
            setLogoUrl(editingBrand.logo_url)
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

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file")
            return
        }

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
        if (!brandName.trim() || !brandEmail.trim() || !brandMobile.trim()) {
            toast.error("Please fill in all required fields")
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
                      logo_url: logoUrl,
                  }
                : {
                      gofor: "addbrand",
                      user_id: userId,
                      brand_name: brandName.trim(),
                      email: brandEmail.trim(),
                      mobile: brandMobile.trim(),
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
                toast.error(result?.message || `Failed to ${isEditing ? "update" : "add"} brand`)
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
    }

    return (
        <div className="rounded-lg border border-white/10 bg-[#171717] p-6">
            <div className="mb-4 flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        {editingBrand ? "Edit Brand" : "Add New Brand"}
                    </h2>
                    <p className="text-white/60 text-sm">
                        {editingBrand 
                            ? "Update brand profile with logo and contact information." 
                            : "Create a new brand profile with logo and contact information."
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

            <div className="grid gap-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                    <Label htmlFor="logo">Brand Logo</Label>
                    <div className="flex flex-col items-center gap-4">
                        {logoPreview ? (
                            <div className="relative">
                                <Avatar className="h-24 w-24 object-contain rounded-full">
                                    <AvatarImage src={logoPreview} alt="Logo preview" />
                                    <AvatarFallback>Logo</AvatarFallback>
                                </Avatar>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-black text-white"
                                    onClick={() => {
                                        setLogoPreview("")
                                        setLogoUrl("")
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : (
                            <div
                                onClick={triggerFileInput}
                                className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-black cursor-pointer"
                            >
                                <Upload className="h-6 w-6 text-white" />
                            </div>
                        )}

                        <div className="flex flex-col items-center gap-2 w-full">
                            <Input
                                ref={fileInputRef}
                                id="logo"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                disabled={isUploadingLogo}
                                className="bg-black text-white text-base w-full border-none"
                            />
                            {isUploadingLogo && <p className="text-sm text-white mt-1">Uploading...</p>}
                        </div>
                    </div>
                </div>

                {/* Brand Name */}
                <div className="space-y-2">
                    <Label htmlFor="brandName">Brand Name *</Label>
                    <Input
                        id="brandName"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="bg-black text-white text-base"
                        placeholder="Enter brand name"
                        required
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="brandEmail">Email *</Label>
                    <Input
                        id="brandEmail"
                        type="email"
                        value={brandEmail}
                        className="bg-black text-white text-base"
                        onChange={(e) => setBrandEmail(e.target.value)}
                        placeholder="Enter brand email"
                        required
                    />
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                    <Label htmlFor="brandMobile">Mobile *</Label>
                    <Input
                        id="brandMobile"
                        value={brandMobile}
                        onChange={(e) => setBrandMobile(e.target.value)}
                        className="bg-black text-white text-base"
                        placeholder="Enter mobile number"
                        required
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddBrand}
                        disabled={
                            isSubmitting ||
                            !brandName.trim() ||
                            !brandEmail.trim() ||
                            !brandMobile.trim()
                        }
                    >
                        {isSubmitting 
                            ? (editingBrand ? "Updating..." : "Adding...") 
                            : (editingBrand ? "Update Brand" : "Add Brand")
                        }
                    </Button>
                </div>
            </div>
        </div>
    )
}
