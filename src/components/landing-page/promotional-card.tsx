"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import popupImage from "@/assets/Landing-page/Popup.jpg"
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
                            y:
                                typeof window !== "undefined" && window.innerWidth < 640
                                    ? 100
                                    : -20,
                            scale:
                                typeof window !== "undefined" && window.innerWidth >= 640
                                    ? 0.95
                                    : 1,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: { duration: 0.4, ease: "easeOut" },
                        }}
                        exit={{
                            opacity: 0,
                            y:
                                typeof window !== "undefined" && window.innerWidth < 640
                                    ? 100
                                    : -20,
                            scale:
                                typeof window !== "undefined" && window.innerWidth >= 640
                                    ? 0.95
                                    : 1,
                            transition: { duration: 0.3, ease: "easeIn" },
                        }}
                        className="bg-white w-full max-w-sm sm:max-w-md rounded-2xl overflow-hidden relative shadow-xl flex flex-col"
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-3 right-3 text-black hover:text-gray-600 z-10"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Image */}
                        <div className="relative w-full h-48 sm:h-56">
                            <Image
                                src={popupImage}
                                alt="Offer Image"
                                fill
                                className="object-cover object-center"
                                priority
                            />
                        </div>

                        {/* Content */}
                        <div className="px-4 sm:px-6 py-6 flex flex-col items-center text-center space-y-4">
                            <h2 className="text-2xl font-semibold text-black">
                                How to Avail Your 50% Discount
                            </h2>

                            <p className="text-gray-800 text-sm">
                                Get your free trial today and start within minutes. No credit card required. Completely risk-free.
                            </p>

                            <Button
                                className="w-full bg-[#ff4d4d] hover:bg-[#e63b3b] text-white font-semibold text-base py-3 rounded-lg"
                                onClick={() => {
                                    router.push("/register")
                                    setIsOpen(false)
                                }}
                            >
                                Claim My 50% OFF Now
                            </Button>

                            <p className="text-xs text-gray-600">
                                Only for the first 100 users. Completely risk-free trial.
                            </p>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
