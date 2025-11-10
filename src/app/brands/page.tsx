"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Plus,
  Edit,
  TrendingUp,
  UploadCloud,
  Phone,
  Activity,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Mail,
} from "lucide-react"
import toast from "react-hot-toast"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import BrandsLoadingSkeleton from "@/components/Skeleton-loading/brands-loading"
import AddBrandForm from "@/app/brands/_components/add-brand-form"
import { useRouter } from "next/navigation"
import UserLayout from "@/components/layouts/user-layout"

interface Brand {
  brand_id: number
  user_id: number
  brand_name: string
  website: string
  email: string
  mobile: string
  logo_url: string
  verified: number
  created_date: string
  upload_count: number
  average_score: number
  latest_score: number
  last_analysis_date: string
  go_count: number
  no_go_count: number
}

export default function BrandsPage() {
  const { userDetails,  } = useFetchUserDetails()
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)


  const formatTwoDigits = (value: number) => (value < 10 ? `0${value}` : `${value}`)

  const getBrandLimit = () => {
    return userDetails?.brands_count ?? 0
  }

  const brandLimit = getBrandLimit()
  const isAtBrandLimit = brands.length >= brandLimit

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/brandslist?user_id=${userDetails?.user_id}`
      )
      const data = await response.json()
      if (Array.isArray(data)) setBrands(data)
      else setBrands([])
    } catch (error) {
      toast.error("Failed to fetch brands")
    } finally {
      setLoading(false)
    }
  }

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand)
    setShowForm(true)
  }



  useEffect(() => {
    if (userDetails?.user_id) {
      fetchBrands()
    }
  }, [userDetails?.user_id])

  if (loading) return <BrandsLoadingSkeleton />

  return (
    <UserLayout userDetails={userDetails}>
    <div className="container max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Brands Management</h1>
          <p className="text-sm sm:text-base text-white/70 mt-2">
            Manage your brand profiles and detailed ad performance insights
          </p>
        </div>

        <Button
          className="flex items-center gap-2 w-full sm:w-auto"
          onClick={() => setShowForm(true)}
          disabled={isAtBrandLimit}
        >
          <Plus className="h-4 w-4" />
          {isAtBrandLimit
            ? `Brand Limit Reached (${brands.length}/${brandLimit})`
            : `Add Brand (${brands.length}/${brandLimit})`}
        </Button>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <AddBrandForm
              onCancel={() => setShowForm(false)}
              onAdded={async () => {
                await fetchBrands()
                setShowForm(false)
              }}
              editingBrand={(editingBrand ?? undefined) as any}
              userDetails={userDetails}
              currentBrandCount={brands.length}
            />
          </div>
        </div>
      )}

      {/* Brand Cards Grid */}
      {brands.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-white/70 mb-4">No brands found. Add your first brand.</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Your First Brand
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:pb-0 pb-24">
          {brands.map((brand) => (
            <Card
              key={brand.brand_id}
              onClick={() => {
                router.push(
                  `/brands/brand-detail?brand-token=${String(brand.brand_id)}&brand_name=${brand.brand_name}`
                )
              }}
              className="bg-black border-none rounded-2xl hover:shadow-lg cursor-pointer transition-all gap-2"
            >

              <CardHeader className="flex flex-row items-center gap-4 pb-2 pt-4  relative overflow-hidden">
                {/* Edit Button */}
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Edit brand"
                  onClick={(e) => { e.stopPropagation(); handleEditBrand(brand); }}
                  className="absolute top-0 right-2  h-7 w-7 rounded-full text-white hover:bg-white/10"
                >
                  <Edit className="h-4 w-4" />
                </Button>

                {/* Logo */}
                <img
                  src={brand.logo_url}
                  alt={brand.brand_name}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-contain bg-white flex-shrink-0"
                />

                {/* Text Info */}
                <div className="flex-1 min-w-0 ">
                  <CardTitle className="text-white text-lg truncate block">
                    {brand.brand_name.length > 30
                      ? `${brand.brand_name.slice(0, 30)}...`
                      : brand.brand_name}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-white/80 truncate" title={brand.website}>
                    {brand.website}
                  </p>
                </div>
              </CardHeader>


              <CardContent className="space-y-6 text-base text-white/80 px-4 ">

                {/* Row 1: Key Stats */}
                <div className="flex bg-black border border-primary rounded-xl p-3 divide-x divide-white/10">
                  {/* Uploads */}
                  <div className="flex-1 px-2 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <UploadCloud className="h-4 w-4 text-primary" />
                      <h4 className="text-xs font-medium text-white/80">Uploads</h4>
                    </div>
                    <div className="text-xl font-semibold text-white">
                      {formatTwoDigits(brand.upload_count)}
                    </div>
                  </div>
                  {/* Latest Score */}
                  <div className="flex-1 px-2 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-primary" />
                      <h4 className="text-xs font-medium text-white/80">Latest Score</h4>
                    </div>
                    <div className="text-xl font-semibold text-white">
                      {formatTwoDigits(Math.floor(brand.latest_score))}
                    </div>
                  </div>
                  {/* Avg Score */}
                  <div className="flex-1 px-2 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <h4 className="text-xs font-medium text-white/80">Avg Score</h4>
                    </div>
                    <div className="text-xl font-semibold text-white">
                      {brand.average_score.toFixed(1)}
                    </div>
                  </div>
                </div>

                {/* Row 2: Go vs No-Go Ads */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Go Ads */}
                  <div className="bg-[#0f1f0f] border border-green-700/40 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <ThumbsUp className="h-4 w-4 text-green-500" />
                      <h4 className="text-xs font-medium text-white/80">Go Ads</h4>
                    </div>
                    <div className="text-xl font-semibold text-green-400">
                      {formatTwoDigits(brand.go_count)}
                    </div>
                  </div>

                  {/* No-Go Ads */}
                  <div className="bg-[#1f0f0f] border border-red-700/40 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <ThumbsDown className="h-4 w-4 text-red-500" />
                      <h4 className="text-xs font-medium text-white/80">No-Go Ads</h4>
                    </div>
                    <div className="text-xl font-semibold text-red-400">
                      {formatTwoDigits(brand.no_go_count)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <div className="flex flex-col items-start text-left space-y-1">
                    <p className="text-xs text-white/80 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" /> {brand.email}
                    </p>
                    <p className="text-xs text-white/80 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" /> {brand.mobile}
                    </p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(
                        `/brands/brand-detail?brand-token=${String(brand.brand_id)}&brand_name=${brand.brand_name}`
                      )
                    }}
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <ArrowRight className="h-4 w-4 " />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}


    </div>
    </UserLayout>
  )
}
