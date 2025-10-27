"use client"

import UserLayout from "@/components/layouts/user-layout"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"

export default function BrandsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userDetails } = useFetchUserDetails()
  
  return <UserLayout userDetails={userDetails}>{children}</UserLayout>
}