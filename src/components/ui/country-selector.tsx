import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { CheckIcon, ChevronDown, X, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface CountryOption {
  value: string
  label: string
  id: string
  type?: string
}

interface CountrySelectorProps {
  options: CountryOption[]
  selectedValues: string[]
  onValueChange: (values: string[]) => void
  placeholder?: string
  className?: string
  onSearchChange?: (value: string) => void
  loading?: boolean
}

export const CountrySelector = React.forwardRef<HTMLButtonElement, CountrySelectorProps>(
  (
    {
      options,
      selectedValues,
      onValueChange,
      placeholder = "Select countries...",
      className,
      onSearchChange,
      loading = false,
      ...props
    },
    ref,
  ) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [searchInput, setSearchInput] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const isPopoverOpenRef = useRef(isPopoverOpen)
    const isSearchingRef = useRef(isSearching)
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Detect mobile viewport
    useEffect(() => {
      const updateIsMobile = () => {
        if (typeof window !== "undefined") {
          setIsMobile(window.innerWidth <= 640)
        }
      }
      updateIsMobile()
      window.addEventListener('resize', updateIsMobile)
      return () => window.removeEventListener('resize', updateIsMobile)
    }, [])

    // Update refs when state changes
    useEffect(() => {
      isPopoverOpenRef.current = isPopoverOpen
      isSearchingRef.current = isSearching
    }, [isPopoverOpen, isSearching])

    useEffect(() => {
      if (!isPopoverOpen) {
        setSearchInput("")
        setIsSearching(false)
      }
    }, [isPopoverOpen])

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault()
        setIsPopoverOpen(true)
      }
    }

    const toggleOption = (optionValue: string) => {
      const newSelectedValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((value) => value !== optionValue)
        : [...selectedValues, optionValue]
      onValueChange(newSelectedValues)
      // Reset search after selection
      setSearchInput("")
      setIsSearching(false)
      if (onSearchChange) {
        onSearchChange("")
      }
      // Refocus the search input after reset
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 0)
    }

    const handleCloseModal = () => {
      onValueChange([])
      setIsModalOpen(false)
    }
    const handleAdd = () => {
      setIsModalOpen(false)
      onValueChange(selectedValues)
      setSearchInput("")
      setIsSearching(false)
      if (onSearchChange) {
        onSearchChange("")
      }
      // Refocus the search input after reset
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 0)
    }

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev)
    }

    // Custom onOpenChange handler that prevents closing during search
    const handleOpenChange = (open: boolean) => {
      // If trying to close while searching, prevent it
      if (!open && isSearchingRef.current && searchInput.length > 0) {
        return
      }
      setIsPopoverOpen(open)
    }

    const getSelectedLabels = () => {
      return selectedValues.map(value => {
        const option = options.find(opt => opt.value === value)
        return option ? option.label : value
      })
    }

    return (
      <>
        {/* Mobile Modal */}
        {isMobile ? (
          <>
            <button
              ref={ref}
              {...props}
              type="button"
              onClick={() => setIsModalOpen(true)}
              className={cn(
                "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between",
                className,
              )}
            >
              {selectedValues.length > 0 ? (
                <div className="flex justify-between items-center w-full gap-1">
                  <div className="flex flex-wrap items-center gap-1">
                    {getSelectedLabels().slice(0, 6).map((label, index) => (
                      <Badge
                        key={selectedValues[index]}
                        className={cn("bg-secondary text-foreground border-foreground/1 hover:bg-accent flex items-center gap-1")}
                      >
                        {label}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500 x-circle-icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            const newSelectedValues = selectedValues.filter((_, i) => i !== index)
                            onValueChange(newSelectedValues)
                          }}
                        />
                      </Badge>
                    ))}
                    {selectedValues.length > 6 && (
                      <Badge className={cn("bg-secondary text-foreground border-foreground/1 hover:bg-accent ml-2")}>
                        {`+ ${selectedValues.length - 6} more`}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full mx-auto">
                  <span className="text-sm text-muted-foreground mx-3">{placeholder}</span>
                  <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
                </div>
              )}
            </button>

            {isModalOpen && (
              <div
                className="fixed inset-0 bg-black/20 dark:bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-[100000]"
                onClick={() => {
                  setIsModalOpen(false)
                  setSearchInput("")
                  setIsSearching(false)
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-card rounded-xl w-full max-w-md h-[60vh] flex flex-col"
                >
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-foreground font-semibold">Select Countries</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false)
                          setSearchInput("")
                          setIsSearching(false)
                        }}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchInput}
                        onChange={(e) => {
                          const value = e.target.value
                          setSearchInput(value)
                          setIsSearching(value.length > 0)
                          if (onSearchChange) {
                            onSearchChange(value)
                          }
                        }}
                        placeholder="Search countries..."
                        className="w-full pl-9 pr-3 py-3 text-sm bg-secondary text-foreground rounded-md placeholder-muted-foreground focus:outline-none focus:border-orange-500 transition-colors"
                        autoComplete="off"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                      <div className="px-4 py-4 text-sm text-muted-foreground text-center">Loading...</div>
                    ) : options.length === 0 ? (
                      <div className="px-4 py-4 text-sm text-muted-foreground text-center">No countries found.</div>
                    ) : (
                      <>
                        {/* Show selected items first */}
                        {selectedValues
                          .map(selectedValue => {
                            let option = options.find(opt => opt.value === selectedValue)
                            if (!option) {
                              option = {
                                value: selectedValue,
                                label: selectedValue,
                                id: `placeholder-${selectedValue}`,
                                type: 'selected'
                              }
                            }
                            return { ...option, isSelected: true }
                          })
                          .map((option) => (
                            <button
                              key={`selected-${option.id}-${option.type}`}
                              type="button"
                              onClick={() => toggleOption(option.value)}
                              className="w-full text-left text-foreground flex items-center gap-2 mb-1"
                            >
                              <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground">
                                <CheckIcon className="h-4 w-4" />
                              </div>
                              <span className="font-medium">{option.label}</span>
                            </button>
                          ))
                        }

                        {/* Show unselected options */}
                        {options
                          .filter(option => !selectedValues.includes(option.value))
                          .map((option) => (
                            <button
                              key={`${option.id}-${option.type}`}
                              type="button"
                              onClick={() => toggleOption(option.value)}
                              className="w-full text-left py-1 rounded-lg transition-colors text-foreground hover:bg-muted flex items-center gap-2 mb-1"
                            >
                              <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-primary opacity-50">
                                <CheckIcon className="h-4 w-4 invisible" />
                              </div>
                              <span>{option.label}</span>
                            </button>
                          ))
                        }
                      </>
                    )}
                  </div>
                  {/* Footer with actions */}
                  <div className="border-t border-border">
                    <div className="flex items-center justify-between">
                      {selectedValues.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsModalOpen(false)
                            handleCloseModal()
                          }}
                          className="flex-1 py-3 text-sm cursor-pointer hover:bg-muted text-foreground"
                        >
                          close
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          handleAdd()
                        }}
                        className="flex-1 py-3 text-sm cursor-pointer hover:bg-muted max-w-full text-foreground"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Desktop Popover */
          <Popover open={isPopoverOpen} onOpenChange={handleOpenChange} modal={false}>
            <PopoverTrigger asChild>
              <button
                ref={ref}
                {...props}
                onClick={(e) => {
                  if (!(e.target as HTMLElement).closest(".x-circle-icon")) {
                    handleTogglePopover()
                  }
                }}
                className={cn(
                  "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between",
                  className,
                )}
              >
                {selectedValues.length > 0 ? (
                  <div className="flex justify-between items-center w-full gap-1">
                    <div className="flex flex-wrap items-center gap-1">
                      {getSelectedLabels().slice(0, 6).map((label, index) => (
                        <Badge
                          key={selectedValues[index]}
                          className={cn("bg-secondary text-foreground border-foreground/1 hover:bg-accent flex items-center gap-1")}
                        >
                          {label}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500 x-circle-icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              const newSelectedValues = selectedValues.filter((_, i) => i !== index)
                              onValueChange(newSelectedValues)
                            }}
                          />
                        </Badge>
                      ))}
                      {selectedValues.length > 6 && (
                        <Badge className={cn("bg-secondary text-foreground border-foreground/1 hover:bg-accent ml-2")}>
                          {`+ ${selectedValues.length - 6} more`}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full mx-auto">
                    <span className="text-sm text-muted-foreground mx-3">{placeholder}</span>
                    <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
                  </div>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-full md:w-[380px] p-0"
              align="start"
              onEscapeKeyDown={() => setIsPopoverOpen(false)}
              onInteractOutside={(e) => {
                // Prevent closing when clicking on search input or interacting with dropdown content
                if (e.target instanceof Element && e.target.closest('[data-radix-popper-content-wrapper]')) {
                  e.preventDefault()
                }
              }}
            >
              <Command shouldFilter={false} className="flex flex-col">
                <CommandInput
                  placeholder="Search countries..."
                  onKeyDown={(e) => {
                    handleInputKeyDown(e)
                    // Prevent focus issues and dropdown closing
                    e.stopPropagation()
                    // Only prevent default for specific keys that might close dropdown
                    if (e.key === 'Escape') {
                      e.preventDefault()
                    }
                  }}
                  onKeyUp={(e) => {
                    // Prevent dropdown from closing on key up
                    e.stopPropagation()
                  }}
                  value={searchInput}
                  onValueChange={(value) => {
                    setSearchInput(value)
                    // Track when we're searching
                    setIsSearching(value.length > 0)
                    // Call external search callback if provided
                    if (onSearchChange) {
                      onSearchChange(value)
                    }
                  }}
                />
                <div className="flex flex-col max-h-[260px]">
                  <CommandList className="flex-1 overflow-auto">
                    <CommandEmpty>
                      {loading ? "Loading..." : "No countries found."}
                    </CommandEmpty>
                    <CommandGroup>
                      {options.length === 0 ? (
                        <CommandItem disabled className="cursor-not-allowed">
                          <span className="text-muted-foreground">No countries available</span>
                        </CommandItem>
                      ) : (
                        <>
                          {/* Show selected items first, even if they don't match search */}
                          {selectedValues
                            .map(selectedValue => {
                              // First try to find in current options
                              let option = options.find(opt => opt.value === selectedValue)

                              // If not found in current options, create a placeholder option
                              if (!option) {
                                option = {
                                  value: selectedValue,
                                  label: selectedValue,
                                  id: `placeholder-${selectedValue}`,
                                  type: 'selected'
                                }
                              }

                              return { ...option, isSelected: true }
                            })
                            .map((option) => (
                              <CommandItem
                                key={`selected-${option.id}-${option.type}`}
                                onSelect={() => {
                                  toggleOption(option.value)
                                }}
                                className="cursor-pointer bg-primary/10"
                              >
                                <div
                                  className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    "bg-primary text-primary-foreground"
                                  )}
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{option.label}</span>
                              </CommandItem>
                            ))
                          }

                          {/* Show unselected options that match the search */}
                          {options
                            .filter(option => !selectedValues.includes(option.value))
                            .map((option) => {
                              const isSelected = selectedValues.includes(option.value)
                              return (
                                <CommandItem
                                  key={`${option.id}-${option.type}`}
                                  onSelect={() => {
                                    toggleOption(option.value)
                                  }}
                                  className="cursor-pointer"
                                >
                                  <div
                                    className={cn(
                                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                      isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible",
                                    )}
                                  >
                                    <CheckIcon className="h-4 w-4" />
                                  </div>
                                  <span>{option.label}</span>
                                </CommandItem>
                              )
                            })
                          }
                        </>
                      )}
                    </CommandGroup>
                  </CommandList>
                  {/* Sticky footer with actions */}
                  <div className="sticky bottom-0 bg-background border-t">
                    <div className="flex items-center justify-between">
                      {selectedValues.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsPopoverOpen(false)
                            handleCloseModal()
                          }}
                          className="flex-1 py-2 text-sm cursor-pointer hover:bg-accent"
                        >
                          close
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIsPopoverOpen(false)
                          handleAdd()
                        }}
                        className="flex-1 py-2 text-sm cursor-pointer hover:bg-accent max-w-full"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </>
    )
  },
)

CountrySelector.displayName = "CountrySelector"
