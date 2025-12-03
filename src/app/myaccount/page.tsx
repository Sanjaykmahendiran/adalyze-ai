"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { User, MessageSquare, HelpCircle, Users, Shield, X, ReceiptText, Building2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import ProfileTabs from "./_components/MyProfile"
import PolicyComponent from "./_components/policies"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import MyAccountLoadingSkeleton from "@/components/Skeleton-loading/myaccount-loading"
import TransactionTable from "./_components/paymentHistoryTable"
import YourBrand from "./_components/your-brand"
import Interact from "./_components/interact"

export default function MyAccount() {
  // Properly destructure all needed values from the hook
  const { userDetails, loading } = useFetchUserDetails()
  const searchParams = useSearchParams()
  const action = searchParams.get('action')

  // Move custom hook and states
  function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth < 768)
      check()
      window.addEventListener("resize", check)
      return () => window.removeEventListener("resize", check)
    }, [])
    return isMobile
  }

  const isMobile = useIsMobile();

  const [user, setUser] = useState({
    name: "",
    role: "",
    company: "",
    mobileno: "",
    city: "",
    email: "",
    profileImage: "",
  })

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

  // Handler for cards
  const handleCardClick = (index: number) => {
    setActiveCard(index)
    setIsOverlayOpen(true)
  }
  const closeOverlay = () => {
    setIsOverlayOpen(false)
  }

  // Handle profile update from child
  const handleProfileUpdate = (updatedData: any) => {
    setUser(prevUser => ({
      ...prevUser,
      name: updatedData.name,
      role: updatedData.role,
      mobileno: updatedData.mobileno,
      city: updatedData.city,
      profileImage: updatedData.profileImage || updatedData.profile_image || prevUser.profileImage,
    }))
  }

  // CARD ARRAYS (now in component, have access to all variables)
  const allCards = [
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
          userDetails={userDetails || undefined}
          action={action}
        />
      ),
    },
    {
      id: 1,
      title: "Your Brand",
      description: "View and manage your brand.",
      icon: (isActive: boolean) => (
        <Building2 className={`w-8 h-8 ${isActive ? "text-white" : "text-primary"}`} />
      ),
      component: <YourBrand userDetails={userDetails || undefined} />,
    },
    {
      id: 2,
      title: "Payment History",
      description: "View your past transactions.",
      icon: (isActive: boolean) => (
        <ReceiptText className={`w-8 h-8 ${isActive ? "text-white" : "text-primary"}`} />
      ),
      component: <TransactionTable userDetails={userDetails} />,
    },
    {
      id: 3,
      title: "Policies",
      description: "Read our policies and terms of use.",
      icon: (isActive: boolean) => <Shield className={`w-8 h-8 ${isActive ? "text-white" : "text-primary"}`} />,
      component: <PolicyComponent />,
    },
    {
      id: 4,
      title: "Interact",
      description: "share your thoughts.",
      icon: (isActive: boolean) => (
        <MessageSquare className={`w-8 h-8 ${isActive ? "text-white" : "text-primary"}`} />
      ),
      component: <Interact />,
    },
  ];

  const cards = allCards.filter(card => {
    if (card.title === "Your Brand") {
      return userDetails?.type === "1" && userDetails?.payment_status === 1;
    }
    return true;
  });
  // ---

  const [activeCard, setActiveCard] = useState(0);

  const prevAction = useRef(action);
  const prevIsMobile = useRef(isMobile);

  useEffect(() => {
    // Only auto-open My Profile (id: 0) overlay if transitioning (or loading) to mobile+add-agency
    if (
      isMobile &&
      action === 'add-agency' &&
      (!isOverlayOpen || prevAction.current !== action || !prevIsMobile.current)
    ) {
      setActiveCard(0);
      setIsOverlayOpen(true);
    }
    prevAction.current = action;
    prevIsMobile.current = isMobile;
    // Don't force close overlays here; let normal user click/modal logic handle it.
  }, [action, isMobile]);

  // Handle loading and validation states
  if (loading || !userDetails) {
    return <MyAccountLoadingSkeleton />
  }

  return (
    <UserLayout userDetails={userDetails}>
      {/* Desktop View */}
      <div className="hidden md:flex min-h-screen max-w-7xl mx-auto flex-col md:flex-row overflow-x-hidden">
        <aside className="fixed h-screen w-[320px] max-w-full p-4 space-y-2 overflow-x-hidden">
          <h1 className="text-xl sm:text-2xl font-semibold text-white mb-6">My Account</h1>
          {cards.map((card, index) => (
            <Card
              key={card.id}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-300 h-auto w-full border border-transparent ${activeCard === index ? "bg-primary text-white" : "bg-black text-white/80 "
                }`}
              onClick={() => setActiveCard(index)}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg">{card.icon(activeCard === index)}</div>
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
        <main className="w-full max-w-full md:ml-[330px] p-4 overflow-x-hidden">{cards[activeCard].component}</main>
      </div>

      {/* Mobile View */}
      <div className="md:hidden min-h-screen pb-16 text-white overflow-x-hidden w-full">
        <div className="px-4 py-3 w-full max-w-full">
          <h1 className="text-xl font-semibold mb-3">My Account</h1>

          {/* User Profile Overview */}
          <div className="mb-3 bg-primary rounded-lg p-3 text-center">
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm">{user.email}</p>
          </div>

          {/* Menu Cards */}
          <div className="space-y-2 w-full max-w-full">
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
          <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center overflow-x-hidden">
            <div className="bg-black w-full max-w-full h-full overflow-y-auto overflow-x-hidden">
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
              <div className="p-4 text-white w-full max-w-full">{cards[activeCard].component}</div>
            </div>
          </div>
        )}
      </div>

    </UserLayout>
  )
}
