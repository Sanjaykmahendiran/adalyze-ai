"use client"

import { useState, useEffect } from "react"
import { User, MessageSquare, HelpCircle, Users, Shield, X, ReceiptText } from "lucide-react"
import { Card } from "@/components/ui/card"
import ProfileTabs from "./_components/MyProfile"
import FeedbackForm from "./_components/feedback-form"
import PolicyComponent from "./_components/policies"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import MyAccountLoadingSkeleton from "@/components/Skeleton-loading/myaccount-loading"
import TransactionTable from "./_components/paymentHistoryTable"

export default function MyAccount() {
  // Properly destructure all needed values from the hook
  const { userDetails, loading } = useFetchUserDetails()

  const [user, setUser] = useState({
    name: "",
    role: "",
    company: "",
    mobileno: "",
    city: "",
    email: "",
    profileImage: "",
  })

  const [activeCard, setActiveCard] = useState(0)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)

  // Update user state when userDetails change
  useEffect(() => {
    if (userDetails && Object.keys(userDetails).length > 0) {
      setUser({
        name: userDetails?.name || "",
        role: userDetails.role || "",
        company: userDetails.company || "",
        mobileno: userDetails.mobileno || "",
        city: userDetails.city || "",
        email: userDetails.email || "",
        profileImage: userDetails.imgname || "",
      })
    }
  }, [userDetails])

  const handleCardClick = (index: number) => {
    setActiveCard(index)
    setIsOverlayOpen(true)
  }

  const closeOverlay = () => {
    setIsOverlayOpen(false)
  }

  // Handle profile updates from child component - ONLY EDIT FORM FIELDS
  const handleProfileUpdate = (updatedData: any) => {
    // Update ONLY the fields that are in the MyProfile edit form
    setUser(prevUser => ({
      ...prevUser,
      name: updatedData.name,
      role: updatedData.role,
      mobileno: updatedData.mobileno,
      city: updatedData.city,
      profileImage: updatedData.profileImage || updatedData.profile_image || prevUser.profileImage,
    }))
  }

  const cards = [
    {
      id: 0,
      title: "My Profile",
      description: "Manage your profile details",
      icon: (isActive: boolean) => <User className={`w-8 h-8 ${isActive ? "text-white" : "text-primary"}`} />,
      component: (
        <ProfileTabs
          {...user}
          profileImage={userDetails?.imgname || ""}
          onProfileUpdate={handleProfileUpdate}
        />
      ),
    },
    {
      id: 1,
      title: "Payment History",
      description: "View your past transactions.",
      icon: (isActive: boolean) => (
        <ReceiptText className={`w-8 h-8 ${isActive ? "text-white" : "text-primary"}`} />
      ),
      component: <TransactionTable userDetails={userDetails} />,
    },
    {
      id: 2,
      title: "Feedback",
      description: "Share your experience with us.",
      icon: (isActive: boolean) => <MessageSquare className={`w-8 h-8 ${isActive ? "text-white" : "text-primary"}`} />,
      component: <FeedbackForm />,
    },
    {
      id: 3,
      title: "Policies",
      description: "Read our policies and terms of use.",
      icon: (isActive: boolean) => <Shield className={`w-8 h-8 ${isActive ? "text-white" : "text-primary"}`} />,
      component: <PolicyComponent />,
    },
  ]

  // Handle loading and validation states
  if (loading || !userDetails) {
    return <MyAccountLoadingSkeleton />
  }

  return (
    <UserLayout userDetails={userDetails}>
      {/* Desktop View */}
      <div className="hidden md:flex min-h-screen max-w-7xl mx-auto flex-col md:flex-row">
        <aside className="fixed h-screen w-[350px] p-4 space-y-2">
          <h1 className="text-xl font-semibold text-white">My Account</h1>
          {cards.map((card, index) => (
            <Card
              key={card.id}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-300 h-auto w-full border border-transparent ${activeCard === index ? "bg-primary text-white" : "bg-black text-white/80 "
                }`}
              onClick={() => setActiveCard(index)}
            >
              <div className="flex items-center gap-3">
                <div className=" rounded-lg">{card.icon(activeCard === index)}</div>
                <div>
                  <h2 className="font-bold">{card.title}</h2>
                  <p className={`text-xs ${activeCard === index ? "text-white" : "text-white/70"}`}>
                    {card.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </aside>
        <main className="w-full md:ml-[360px] p-4">{cards[activeCard].component}</main>
      </div>

      {/* Mobile View */}
      <div className="md:hidden min-h-screen pb-16 text-white">
        <div className="px-4 py-3">
          <h1 className="text-xl font-semibold mb-3">My Account</h1>

          {/* User Profile Overview */}
          <div className="mb-3 bg-primary rounded-lg p-3 text-center">
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm">{user.email}</p>
          </div>

          {/* Menu Cards */}
          <div className="space-y-2">
            {cards.map((card, index) => (
              <Card
                key={card.id}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-300 h-auto w-full border border-transparent ${activeCard === index && isOverlayOpen
                  ? "bg-primary text-white"
                  : "bg-black text-white/80"
                  }`}
                onClick={() => handleCardClick(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg">
                    {card.icon(activeCard === index && isOverlayOpen)}
                  </div>
                  <div>
                    <h2 className="font-bold">{card.title}</h2>
                    <p
                      className={`text-xs ${activeCard === index && isOverlayOpen
                        ? "text-white"
                        : "text-white/70"
                        }`}
                    >
                      {card.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Modal Overlay for Mobile */}
        {isOverlayOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
            <div className="bg-black w-full h-full overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">
                  {cards[activeCard].title}
                </h2>
                <button
                  onClick={closeOverlay}
                  className="text-white hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 text-white">{cards[activeCard].component}</div>
            </div>
          </div>
        )}
      </div>

    </UserLayout>
  )
}
