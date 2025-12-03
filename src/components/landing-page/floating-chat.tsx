"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Image from "next/image"
import ChatIcon from "@/assets/Chat-icon-suggesto.png"
import MobileChatIcon from "@/assets/Chat-icon-suggesto-mobile.webp"
import { Button } from "../ui/button"
import LoginChatCard from "./login-chat-card"

const FloatingChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    handleResize() // initial value
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev)
  }, [])

  // Close chat on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Check if the click is outside the chat component
      if (chatRef.current && !chatRef.current.contains(target)) {
        // Check if the click is on any Radix UI Select dropdown elements
        const isSelectDropdown = target?.closest('[data-radix-select-content]') ||
                                target?.closest('[data-radix-popper-content-wrapper]') ||
                                target?.closest('[data-radix-portal]') ||
                                target?.closest('[data-slot="select-content"]') ||
                                target?.closest('[role="listbox"]') ||
                                target?.closest('[role="option"]') ||
                                target?.closest('[data-state="open"]');
        
        // Don't close if clicking on Select dropdown elements
        if (!isSelectDropdown) {
          setIsChatOpen(false)
        }
      }
    }

    if (isChatOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isChatOpen])

  return (
    <>
      {!isChatOpen && (
        <Button
          id="movable-chat-button"
          variant="outline"
          size="icon"
          className="fixed w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[#2b2b2b] shadow-lg z-50 transition-all duration-300 print:hidden hover:shadow-full bottom-12 sm:bottom-14 right-4 sm:right-5   md:bottom-8 md:right-6 touch-manipulation bg-transparent"
          onClick={toggleChat}
        >
          <Image
            src={isMobile ? MobileChatIcon : ChatIcon}
            alt="Adalyze AI Chat Icon"
            width={60}
            height={60}
            className="w-10 h-10 sm:w-12 sm:h-12"
          />
        </Button>
      )}

      {isChatOpen && (
        <div
          ref={chatRef}
          className="fixed right-2 sm:right-2 bottom-4 sm:bottom-10 z-50 w-[calc(100vw-1rem)] max-w-[320px]   sm:w-full sm:max-w-[350px] md:max-w-sm lg:max-w-md animate-bubbleUp"
        >
          <LoginChatCard onClose={toggleChat} />
        </div>
      )}
    </>
  )
}

export default FloatingChat
