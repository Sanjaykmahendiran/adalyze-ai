"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import ChatIcon from "@/assets/Chat-icon-suggesto.png";
import { Button } from "../ui/button";
import LoginChatCard from "./login-chat-card";


const FloatingChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  // Close chat on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsChatOpen(false);
      }
    };

    if (isChatOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isChatOpen]);

  return (
    <>
      {!isChatOpen && (
        <Button
          id="movable-chat-button"
          variant="outline"
          size="icon"
          className="fixed w-14 h-14 rounded-full border-[#2b2b2b] shadow-lg z-50 transition-all duration-300 print:hidden hover:shadow-full"
          style={{
            bottom: `96px`,
            right: `20px`,
          }}
          onClick={toggleChat}
        >
          <Image
            src={ChatIcon}
            alt="Chat Icon"
            width={60}
            height={60}
            className="w-14 h-14"
          />
        </Button>
      )}

      {isChatOpen && (
        <div
          ref={chatRef}
          className="fixed right-4 bottom-11 z-50 w-full max-w-[350px] md:max-w-sm lg:max-w-md sm:right-4 animate-bubbleUp"
        >
          <LoginChatCard onClose={toggleChat} />
        </div>
      )}
    </>
  );
};

export default FloatingChat;
