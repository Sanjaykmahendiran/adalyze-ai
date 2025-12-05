"use client"

import React, { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DropdownOption {
  id: string
  name: string
  value?: string
}

interface CustomSearchDropdownProps {
  options: DropdownOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  loading?: boolean
  disabled?: boolean
  onSearch?: (searchTerm: string) => void
  className?: string
  triggerClassName?: string
  containerClassName?: string
  forceModal?: boolean
}

export function CustomSearchDropdown({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  loading = false,
  disabled = false,
  onSearch,
  className,
  triggerClassName,
  containerClassName,
  forceModal = false,
}: CustomSearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [positionAbove, setPositionAbove] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const touchHandledRef = useRef(false)
  const justOpenedRef = useRef(false)

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get display value
  const displayValue = options.find((opt) => opt.name === value || opt.value === value)?.name || value || placeholder

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return

    let cleanup: (() => void) | null = null

    // Delay to prevent immediate closing on mobile
    const timeoutId = setTimeout(() => {
      const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        const target = event.target as Node
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(target) &&
          triggerRef.current &&
          !triggerRef.current.contains(target)
        ) {
          setIsOpen(false)
          setSearchTerm("")
        }
      }

      // For desktop dropdown variant only; modal handles its own backdrop
      if (!(isMobile || forceModal)) {
        document.addEventListener("mousedown", handleClickOutside, true)
        document.addEventListener("touchend", handleClickOutside, true)
      }

      cleanup = () => {
        if (!(isMobile || forceModal)) {
          document.removeEventListener("mousedown", handleClickOutside, true)
          document.removeEventListener("touchend", handleClickOutside, true)
        }
      }
    }, 100) // Delay to allow dropdown to open first

    return () => {
      clearTimeout(timeoutId)
      if (cleanup) {
        cleanup()
      }
    }
  }, [isOpen, isMobile, forceModal])

  // Calculate dropdown position based on available space
  useEffect(() => {
    if (isOpen && triggerRef.current && !(isMobile || forceModal)) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top

      // Check if we need to position above (less than 300px below or more space above)
      const shouldPositionAbove = spaceBelow < 300 && spaceAbove > spaceBelow
      setPositionAbove(shouldPositionAbove)
    }
  }, [isOpen, isMobile, forceModal])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Small delay to ensure dropdown is rendered
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else {
      setSearchTerm("")
    }
  }, [isOpen])

  // Avoid immediate close from the same opening click/touch
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        justOpenedRef.current = false
      }, 200)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Detect mobile viewport (width <= 640 or touch device)
  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window !== "undefined") {
        const isSmall = window.innerWidth <= 640
        const isTouch = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
        setIsMobile(isSmall || isTouch)
      }
    }
    updateIsMobile()
    window.addEventListener("resize", updateIsMobile)
    return () => window.removeEventListener("resize", updateIsMobile)
  }, [])

  // Track mount to safely use portals
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle search with debounce
  useEffect(() => {
    // Only call onSearch if there's a search term and onSearch is provided
    if (onSearch && searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        onSearch(searchTerm)
      }, 300)
      return () => clearTimeout(timeoutId)
    } else if (onSearch && !searchTerm.trim()) {
      // Clear results when search is empty 
      onSearch("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]) // onSearch is stable (memoized in parent), no need to include in deps

  // Prevent background scroll on mobile when dropdown is open
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTouchAction = document.body.style.touchAction;
      // Only lock scroll for small screens
      if (window.innerWidth <= 640) {
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.touchAction = "none";
      }
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

  const handleSelect = (option: DropdownOption) => {
    onValueChange(option.name)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleTriggerClick = (e: React.MouseEvent) => {
    // If this was already handled by touch, ignore the click
    if (touchHandledRef.current) {
      touchHandledRef.current = false
      return
    }
    e.stopPropagation()
    if (!disabled) {
      // Ensure mobile state is up to date before opening
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth <= 640)
      }
      setIsOpen((prev) => {
        const next = !prev
        if (next) justOpenedRef.current = true
        return next
      })
    }
  }

  const handleTriggerTouch = (e: React.TouchEvent) => {
    e.stopPropagation()
    if (!disabled) {
      touchHandledRef.current = true
      // Ensure mobile state is up to date before opening
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth <= 640)
      }
      setIsOpen((prev) => {
        const next = !prev
        if (next) justOpenedRef.current = true
        return next
      })
      // Reset the flag after a short delay
      setTimeout(() => {
        touchHandledRef.current = false
      }, 300)
    }
  }

  return (
    <div className={cn("relative w-full", className)}> 
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleTriggerClick}
        onTouchEnd={handleTriggerTouch}
        className={cn(
          "w-full px-4 py-3 text-sm bg-card text-foreground rounded-md",
          "placeholder-muted-foreground focus:outline-none focus:border-orange-500",
          "transition-colors flex items-center justify-between",
          "border border-transparent hover:border-orange-500/50",
          "active:bg-card/80",
          disabled && "opacity-50 cursor-not-allowed",
          triggerClassName
        )}
        style={{
          WebkitTouchCallout: "none",
          userSelect: "none",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          cursor: "pointer",
        }}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {loading ? "Loading..." : displayValue}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {/* Mobile Modal Popup */}
      {isOpen && (isMobile || forceModal) && isMounted && createPortal(
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 100000 }}
          onClick={() => {
            if (forceModal) {
              return
            }
            if (justOpenedRef.current) {
              justOpenedRef.current = false
              return
            }
            setIsOpen(false)
            setSearchTerm("")
          }}
        >
          <div
            ref={dropdownRef}
            className={cn(
              "bg-card rounded-xl w-full max-w-md h-[50vh] flex flex-col",
              containerClassName
            )}
            onClick={(e) => e.stopPropagation()}
            style={{
              touchAction: "pan-y",
              WebkitOverflowScrolling: "touch",
              zIndex: 100001,
            }}
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-foreground font-semibold">{placeholder || "Select"}</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    setSearchTerm("")
                  }}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    if (!e.target.value.trim() && onSearch) {
                      onSearch("")
                    }
                  }}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-3 text-sm bg-secondary border border-border text-foreground rounded-md placeholder-muted-foreground focus:outline-none focus:border-orange-500 transition-colors"
                  autoComplete="off"
                />
              </div>
            </div>
            <div
              className="flex-1 overflow-y-auto p-2"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    onTouchEnd={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSelect(option)
                    }}
                    className={cn(
                      "w-full text-left p-3 hover:bg-muted rounded-lg text-foreground transition-colors",
                      value === option.name && "bg-orange-500/10 text-orange-500"
                    )}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                  >
                    {option.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-sm text-foreground/80 text-center">
                  {searchTerm.trim() ? `No results for \"${searchTerm}\"` : "No options available"}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Desktop/Non-mobile Dropdown Menu */}
      {isOpen && !(isMobile || forceModal) && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute z-[9999] w-full bg-card border border-orange-500/20 shadow-lg",
            "max-h-60 flex flex-col",
            positionAbove ? "bottom-full mb-1 rounded-b-md rounded-t-xl" : "top-full mt-1 rounded-t-md rounded-b-xl",
            containerClassName
          )}
          onClick={(e) => {
            e.stopPropagation()
          }}
          onTouchStart={(e) => {
            e.stopPropagation()
          }}
          onTouchEnd={(e) => {
            e.stopPropagation()
          }}
          style={{
            flexDirection: positionAbove ? "column-reverse" : "column",
            touchAction: "pan-y",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-orange-500/20">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  if (!e.target.value.trim() && onSearch) {
                    onSearch("")
                  }
                }}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-2 text-sm bg-secondary text-foreground rounded-md placeholder-muted-foreground focus:outline-none focus:border-orange-500 transition-colors"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Options List */}
          <div
            className="overflow-y-auto max-h-60 rounded-xl"
            style={{
              WebkitOverflowScrolling: "touch",
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option)}
                  onTouchEnd={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSelect(option)
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-sm text-left text-foreground hover:bg-orange-500/10",
                    "transition-colors border-b border-orange-500/10 last:border-b-0",
                    value === option.name && "bg-orange-500/10 text-orange-500"
                  )}
                  style={{
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {option.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                {searchTerm.trim() ? `No results for "${searchTerm}"` : "No options available"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

