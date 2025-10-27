import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { CheckIcon, ChevronDown, X } from "lucide-react"
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
    const isPopoverOpenRef = useRef(isPopoverOpen)
    const isSearchingRef = useRef(isSearching)

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
    }

    const handleClear = () => {
      onValueChange([])
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
                      className={cn("bg-[#171717] text-white border-foreground/1 hover:bg-[#3d3d3d] flex items-center gap-1")}
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
                    <Badge className={cn("bg-[#171717] text-white border-foreground/1 hover:bg-[#3d3d3d] ml-2")}>
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
          <Command shouldFilter={false}>
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
            <CommandList>
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
              <CommandGroup>
                <div className="flex items-center justify-between">
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem 
                        onSelect={() => {
                          handleClear()
                        }}
                        className="flex-1 justify-center cursor-pointer"
                      >
                        Clear
                      </CommandItem>
                    </>
                  )}
                  <CommandItem
                    onSelect={() => {
                      setIsPopoverOpen(false)
                    }}
                    className="flex-1 justify-center cursor-pointer max-w-full"
                  >
                    Close
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  },
)

CountrySelector.displayName = "CountrySelector"
