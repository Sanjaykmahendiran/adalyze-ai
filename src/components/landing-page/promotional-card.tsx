"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import popupImage from "@/assets/Popup.jpg"
import { motion, AnimatePresence } from "framer-motion"

export default function PromotionalPopup() {
    const [isOpen, setIsOpen] = useState(true)
    const router = useRouter()
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6">
                    <motion.div
                        ref={modalRef}
                        initial={{
                            opacity: 0,
                            y: typeof window !== "undefined" && window.innerWidth < 640 ? 100 : -20,
                            scale: typeof window !== "undefined" && window.innerWidth >= 640 ? 0.95 : 1,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: { duration: 0.4, ease: "easeOut" },
                        }}
                        exit={{
                            opacity: 0,
                            y: typeof window !== "undefined" && window.innerWidth < 640 ? 100 : -20,
                            scale: typeof window !== "undefined" && window.innerWidth >= 640 ? 0.95 : 1,
                            transition: { duration: 0.3, ease: "easeIn" },
                        }}
                        className="bg-white w-full max-w-lg sm:max-w-xl 
               rounded-2xl overflow-hidden relative shadow-xl "
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-3 right-3 text-black hover:text-white z-10"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Image (smaller height now) */}
                        <div className="relative w-full h-50 sm:h-58">
                            <Image
                                src={popupImage}
                                alt="Offer Image"
                                fill
                                className="object-cover object-center w-full h-full"
                                priority
                            />
                        </div>

                        {/* Content */}
                        <div className="px-2 sm:px-4 py-2 sm:py-4 text-center">
                            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-black">
                                How to Avail Your 50% Discount
                            </h2>

                            <div className="mb-4 flex items-center justify-center">
                                <ul className="text-gray-800 text-sm grid grid-cols-2 gap-x-1 gap-y-3 text-left">
                                    <li>✅ Get your free trial today</li>
                                    <li>✅ Get started within minutes</li>
                                    <li>✅ No credit card required</li>
                                    <li>✅ Cancel anytime</li>
                                </ul>
                            </div>

                            <Button
                                className="w-full bg-[#ff4d4d] hover:bg-[#e63b3b] text-white font-semibold text-base py-2.5"
                                onClick={() => {
                                    router.push("/register")
                                    setIsOpen(false)
                                }}
                            >
                                🔥 Claim My 50% OFF Now
                            </Button>

                            <p className="text-xs text-gray-600 mt-3 flex items-center justify-center gap-3">
                                <span>⚡ Only for the first 100 users.</span>
                                <span>🔒 No risk – cancel anytime</span>
                            </p>

                        </div>
                    </motion.div>

                </div>
            )}
        </AnimatePresence>
    )
}
