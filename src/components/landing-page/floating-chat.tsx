"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Image from "next/image"
import ChatIcon from "@/assets/Chat-icon-suggesto.png"
import { Button } from "../ui/button"
import LoginChatCard from "./login-chat-card"

const FloatingChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev)
  }, [])

  // Close chat on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsChatOpen(false)
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
            src={ChatIcon || "/placeholder.svg"}
            alt="Chat Icon"
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
