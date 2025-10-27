"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, AlertTriangle, X } from "lucide-react"
import toast from "react-hot-toast"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import BrandsLoadingSkeleton from "@/components/Skeleton-loading/brands-loading"
import AddBrandForm from "@/app/brands/_components/add-brand-form"

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

export default function BrandsPage() {
  const { userDetails } = useFetchUserDetails()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://adalyzeai.xyz/App/api.php?gofor=brandslist&user_id=${userDetails?.user_id || 1}`
      )
      const data = await response.json()
      if (Array.isArray(data)) {
        setBrands(data)
      } else {
        console.error("Invalid response format:", data)
        setBrands([])
      }
    } catch (error) {
      console.error("Error fetching brands:", error)
      toast.error("Failed to fetch brands")
      setBrands([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (brand: Brand) => {
    setBrandToDelete(brand)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(
        `https://adalyzeai.xyz/App/api.php?gofor=deletebrand&brand_id=${brandToDelete.brand_id}`,
        {
          method: "DELETE",
        }
      )
      const result = await response.json()

      if (result?.response === "Brand deleted successfully") {
        toast.success("Brand deleted successfully!")
        await fetchBrands() // Refresh the brands list
        setShowDeleteModal(false)
        setBrandToDelete(null)
      } else {
        toast.error("Failed to delete brand")
      }
    } catch (error) {
      console.error("Error deleting brand:", error)
      toast.error("Failed to delete brand. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setBrandToDelete(null)
  }

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand)
    setShowForm(true)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingBrand(null)
  }

  const handleFormSuccess = async () => {
    await fetchBrands()
    setShowForm(false)
    setEditingBrand(null)
  }

  useEffect(() => {
    if (userDetails?.user_id) {
      fetchBrands()
    }
  }, [userDetails?.user_id])

  if (loading) {
    return <BrandsLoadingSkeleton />
  }

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Brands Management</h1>
          <p className="text-white/70 mt-2">Manage your brand profiles and information</p>
        </div>

        <Button className="flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Brand
        </Button>
      </div>

      {/* Custom Popup Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          {/* Popup Content */}
          <div className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <AddBrandForm
              onCancel={handleFormCancel}
              onAdded={handleFormSuccess}
              editingBrand={editingBrand}
            />
          </div>
        </div>
      )}

      {/* Brands Table */}
      <Card className="border-none bg-black">
        <CardContent>
          {brands.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Plus className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first brand.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Brand
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#171717]">
                <TableRow>
                  <TableHead className="text-white text-left">#</TableHead>
                  <TableHead className="text-white text-left">Logo</TableHead>
                  <TableHead className="text-white text-left">Brand Name</TableHead>
                  <TableHead className="text-white text-left">Email</TableHead>
                  <TableHead className="text-white text-left">Mobile</TableHead>
                  <TableHead className="text-white text-left">Status</TableHead>
                  <TableHead className="text-white text-left">Created On</TableHead>
                  <TableHead className="text-white text-left">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand, index) => (
                  <TableRow key={brand.brand_id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <img
                        src={brand.logo_url}
                        alt={brand.brand_name}
                        className="h-16 w-16 object-contain bg-[#171717] rounded-full"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{brand.brand_name}</TableCell>
                    <TableCell>{brand.email}</TableCell>
                    <TableCell>{brand.mobile}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-500/10 text-green-500">
                        Verified
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(brand.created_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBrand(brand)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(brand)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleDeleteCancel}
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md mx-4">
            <div className="rounded-lg bg-[#171717] p-6 shadow-xl">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Delete Brand
                  </h3>
                  <p className="text-white/70 text-sm">
                    Are you sure you want to delete <span className="font-medium text-white">"{brandToDelete?.brand_name}"</span>?
                    This action cannot be undone and will permanently remove the brand and all its data.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete Brand"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
