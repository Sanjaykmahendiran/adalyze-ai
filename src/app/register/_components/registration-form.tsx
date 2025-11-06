"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GoogleSignInButton from "@/app/login/_components/GoogleSign-In";
import Cookies from "js-cookie";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomSearchDropdown } from "@/components/ui/custom-search-dropdown";
import { event, trackSignup } from "@/lib/gtm";
import { login } from "@/services/authService";
import { trackEvent } from "@/lib/eventTracker";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface LoginFormData {
  token?: string;
  nouptoken?: string;
  email?: string;
  password?: string;
}

// Step 1 schema - only email
const emailSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

// Step 2 schema - updated fields as per requirements
const registrationSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
  type: z.string().min(1, { message: "Please select an option." }),
  city: z.string().min(1, { message: "Please select a city." }),
  referral_code: z.string().optional(),
});

export default function RegistrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [emailValue, setEmailValue] = useState("");
  const [userId, setUserId] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [isCheckingReferral, setIsCheckingReferral] = useState(false);
  const [referralUserId, setReferralUserId] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // City data states
  const [cities, setCities] = useState<Array<{ id: string, name: string }>>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const citySearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchTermRef = useRef<string>("");

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      let loginData;

      if (data.token) {
        loginData = await login({ google_token: data.token });
      } else if (data.nouptoken) {
        loginData = await login({ nouptoken: data.nouptoken });
      } else {
        loginData = await login(data);
      }

      if (loginData.status === "success" && loginData.user) {
        const user = loginData.user;
        Cookies.set("userId", user.user_id.toString(), { expires: 7 });
        trackEvent("Google_Register_completed", window.location.href, user.email);
        toast.success("Login successful!");

        // if (user.payment_status === 0) {
        //   if (user.fretra_status === 1) {
        //     setEmailValue(user.email);
        //     setUserId(user.user_id.toString());
        //     setStep(2); // Allowed even if unpaid
        //   } else {
        //     router.push("/pricing"); // Unpaid and fretra_status not 1
        //   }
        // } else {
        //   router.push("/dashboard"); // Paid users
        // }

        // Set user data and transition to step 2
        setEmailValue(user.email);
        setUserId(user.user_id.toString());
        setStep(2);

      } else {
        toast.error(loginData.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (searchParams) {
      const getToken = searchParams.get("token");
      if (getToken) {
        onSubmit({ nouptoken: getToken });
      }
    }
  }, [searchParams]);


  // Get referral code from search params
  const referralCode = searchParams.get('referral_code') || '';

  // Get UTM parameters from search params
  const utmSource = searchParams.get('utm_source') || '';
  const utmMedium = searchParams.get('utm_medium') || '';
  const utmCampaign = searchParams.get('utm_campaign') || '';
  const utmContent = searchParams.get('utm_content') || '';
  const utmTerm = searchParams.get('utm_term') || '';

  // Get source from search params
  const sourceFromParams = searchParams.get('source') || '';

  // Effect to persist the step and user data in localStorage
  useEffect(() => {
    // Try to load saved state on component mount
    const savedStep = localStorage.getItem("registrationStep");
    const savedEmail = localStorage.getItem("registrationEmail");
    const savedUserId = localStorage.getItem("registrationUserId");

    if (savedStep === "2" && savedEmail && savedUserId) {
      setStep(2);
      setEmailValue(savedEmail);
      setUserId(savedUserId);
    }
  }, []);

  // Update localStorage whenever step or user data changes
  useEffect(() => {
    if (step === 2) {
      localStorage.setItem("registrationStep", "2");
      localStorage.setItem("registrationEmail", emailValue);
      localStorage.setItem("registrationUserId", userId);
    } else {
      // Clear stored data when returning to step 1
      localStorage.removeItem("registrationStep");
      localStorage.removeItem("registrationEmail");
      localStorage.removeItem("registrationUserId");
    }
  }, [step, emailValue, userId]);

  // Form for step 1 - Email only
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // Form for step 2 - Full registration
  const registrationForm = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      password: "",
      type: "",
      city: "",
      referral_code: referralCode,
    },
  });

  // Function to fetch cities based on search
  const fetchCities = useCallback(async (searchTerm: string) => {
    // Prevent duplicate API calls for the same search term
    if (lastSearchTermRef.current === searchTerm.trim()) {
      return;
    }

    if (!searchTerm.trim()) {
      setCities([]);
      lastSearchTermRef.current = "";
      return;
    }

    // Update the last search term before making the call
    lastSearchTermRef.current = searchTerm.trim();

    setLoadingCities(true);
    try {
      const response = await fetch(`https://techades.com/App/api.php?gofor=locationlist&search=${encodeURIComponent(searchTerm.trim())}`);
      const data: Array<{ id: string, name: string }> = await response.json();
      // Remove duplicates based on city id to prevent React key warnings
      const uniqueCities = Array.from(
        new Map(data.map((city) => [city.id, city])).values()
      );
      setCities(uniqueCities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      // Don't show error toast for every search, just log it
      console.log("City search failed for:", searchTerm);
      // Reset last search term on error so it can be retried
      lastSearchTermRef.current = "";
    } finally {
      setLoadingCities(false);
    }
  }, []);

  // Handle city search with additional debounce protection
  const handleCitySearch = useCallback((searchTerm: string) => {
    // Clear any existing timeout
    if (citySearchTimeoutRef.current) {
      clearTimeout(citySearchTimeoutRef.current);
    }

    // Only search if term is not empty
    if (!searchTerm.trim()) {
      setCities([]);
      lastSearchTermRef.current = "";
      return;
    }

    // Debounce the API call
    citySearchTimeoutRef.current = setTimeout(() => {
      fetchCities(searchTerm);
    }, 300);
  }, [fetchCities]);

  // Function to check referral code and get referred by name and user ID
  const checkReferralCode = async (code: string) => {
    if (!code.trim()) {
      setReferredBy("");
      setReferralUserId("");
      return;
    }

    setIsCheckingReferral(true);
    try {
      const response = await fetch(
        `https://adalyzeai.xyz/App/api.php?gofor=usergetbyref&referral_code=${code}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.user_id && data.name) {
          // Store the user_id separately
          setReferralUserId(data.user_id.toString());
          // Display the user name
          setReferredBy(data.name);
        } else {
          setReferredBy("");
          setReferralUserId("");
          toast.error("Invalid referral code");
        }
      } else {
        setReferredBy("");
        setReferralUserId("");
        toast.error("Invalid referral code");
      }
    } catch (error) {
      console.error("Error checking referral code:", error);
      setReferredBy("");
      setReferralUserId("");
      toast.error("Error validating referral code");
    } finally {
      setIsCheckingReferral(false);
    }
  };

  // Watch referral code field
  const referralCodeValue = registrationForm.watch("referral_code");

  // Effect to check referral code when it changes
  useEffect(() => {
    if (sourceFromParams === "Referral" && referralCodeValue) {
      checkReferralCode(referralCodeValue);
    } else {
      setReferredBy("");
    }
  }, [sourceFromParams, referralCodeValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (citySearchTimeoutRef.current) {
        clearTimeout(citySearchTimeoutRef.current);
      }
    };
  }, []);



  // Step 1 submission - Email verification with real API
  async function onSubmitEmail(values: z.infer<typeof emailSchema>) {
    setIsLoading(true);

    try {
      const response = await fetch("https://adalyzeai.xyz/App/api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gofor: "eregister",
          email: values.email,
        }),
      });

      const data: {
        user_id?: number;
        status?: string;
        message?: string;
      } = await response.json();

      if (data.user_id) {
        setEmailValue(values.email);
        setUserId(data.user_id.toString());

        trackEvent("1St_level_email_register", window.location.href, values.email);

        // Call addidentifier API after step 1 completion
        try {
          const cookieId = Cookies.get('cookie_id') || '';
          const addIdentifierResponse = await fetch("https://adalyzeai.xyz/App/api.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              gofor: "addidentifier",
              cookie_id: cookieId,
              user_id: data.user_id,
              email: values.email,
              phone: "" // Phone will be added in step 2 if needed
            }),
          });

          const addIdentifierData = await addIdentifierResponse.json();
          console.log("Add identifier response:", addIdentifierData);
        } catch (error) {
          console.error("Add identifier API error:", error);
          // Don't block the flow if this API fails
        }

        setStep(2);
      } else if (data.status === "error" && data.message) {
        toast.error(data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Email verification failed", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }



  // Step 2 submission - Full registration with real API
  async function onSubmitRegistration(values: z.infer<typeof registrationSchema>) {
    setIsLoading(true);
    try {
      const payload: {
        gofor: string;
        user_id: string;
        name: string;
        password: string;
        type: string;
        city: string;
        source?: string;
        referred_by?: number;
        utm_source?: string;
        utm_medium?: string;
        utm_campaign?: string;
        utm_content?: string;
        utm_term?: string;
      } = {
        gofor: "register",
        user_id: userId,
        name: values.name,
        password: values.password,
        type: values.type, // This will be "1" for Single Brand or "2" for Multiple Brand
        city: values.city,
      };

      // Only add source if it comes from search params
      if (sourceFromParams) {
        payload.source = sourceFromParams;
      }

      // Add referred_by field if source is Referral and we have the user ID
      if (sourceFromParams === "Referral" && referralUserId) {
        // Send the user ID as integer in referred_by field
        payload.referred_by = parseInt(referralUserId);
      }

      // Add UTM parameters if they exist
      if (utmSource) {
        payload.utm_source = utmSource;
      }
      if (utmMedium) {
        payload.utm_medium = utmMedium;
      }
      if (utmCampaign) {
        payload.utm_campaign = utmCampaign;
      }
      if (utmContent) {
        payload.utm_content = utmContent;
      }
      if (utmTerm) {
        payload.utm_term = utmTerm;
      }

      const response = await fetch("https://adalyzeai.xyz/App/api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === "success") {
        // Save user_id in cookies
        Cookies.set("userId", userId, { expires: 30 });
        // Save email in cookies
        Cookies.set("email", emailValue, { expires: 30 });
        trackEvent("Register_completed", window.location.href, emailValue);
        // ✅ GA4 / GTM custom event

        trackSignup(sourceFromParams === "Referral" ? "Referral" : sourceFromParams || "Email", userId);

        toast.success(data.message || "Registration successful!");
        registrationForm.reset();
        // Clear localStorage
        localStorage.removeItem("registrationStep");
        localStorage.removeItem("registrationEmail");
        localStorage.removeItem("registrationUserId");

        setTimeout(() => {
          router.push("/emailconfrimation");
        }, 2000);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration failed", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {step === 1 ? (
        <>
          {/* Step 1: Email only */}
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(onSubmitEmail)}
              className="space-y-3 text-xs text-left"
            >
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Email</FormLabel>
                    <FormControl>
                      <input
                        type="email"
                        placeholder="Your Email"
                        {...field}
                        className="w-full px-4 py-3 text-sm bg-black text-white rounded-md placeholder-white/50 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-12"
                >
                  {isLoading ? "Verifying..." : "Continue"}
                </Button>

                <GoogleSignInButton onSubmit={onSubmit} />

                <Link href="/login" className="text-sm mt-4 flex justify-center">
                  Already have an account?{" "}
                  <span className="hover:underline pl-1 text-primary">Login</span>
                </Link>
              </div>
            </form>
          </Form>
        </>
      ) : (
        // Step 2: Full registration with password
        <Form {...registrationForm}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              registrationForm.handleSubmit(onSubmitRegistration)(e);
            }}
            className="space-y-5 text-xs text-left"
          >

            <FormField
              control={registrationForm.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-white">Analyze For</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-black text-white focus:ring-none text-sm  w-full py-7">
                        <SelectValue placeholder="Select Analyze For" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-black border border-orange-500/20 text-white gap-y-2">
                      {/* Single Brand */}
                      <SelectItem
                        value="1"
                        className={`p-4 rounded-lg bg-[#171717] cursor-pointer transition-all data-[state=checked]:bg-orange-500/10 data-[state=checked]:border-orange-500`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Checkbox */}
                          <div className="flex items-center justify-center">
                            <Checkbox checked={field.value === "1"} onCheckedChange={() => field.onChange("1")} />
                          </div>

                          {/* Text content */}
                          <div className="flex flex-col text-left">
                            <p className="font-semibold text-white">Single Brand</p>
                            <p className="text-xs text-white/80">
                              Upload and analyze ads for one brand
                            </p>
                          </div>
                        </div>
                      </SelectItem>

                      {/* Multi Brand */}
                      <SelectItem
                        value="2"
                        className={`p-4 rounded-lg bg-[#171717] cursor-pointer transition-all data-[state=checked]:bg-orange-500/10 data-[state=checked]:border-orange-500`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Checkbox */}
                          <div className="flex items-center justify-center">
                            <Checkbox checked={field.value === "2"} onCheckedChange={() => field.onChange("2")} />
                          </div>

                          {/* Text content */}
                          <div className="flex flex-col text-left">
                            <p className="font-semibold text-white">Multi Brand</p>
                            <p className="text-xs text-white/80">
                              Upload and analyze ads for multiple brands
                            </p>
                          </div>
                        </div>

                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={registrationForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Name</FormLabel>
                  <FormControl>
                    <input
                      placeholder="Your Name"
                      {...field}
                      className="w-full px-4 py-3 text-sm bg-black text-white rounded-md placeholder-white/50 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={registrationForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        {...field}
                        className="w-full px-4 py-3 text-sm bg-black text-white rounded-md placeholder-white/50 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:text-primary text-primary"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City Field - Custom Mobile-Friendly Dropdown */}
            <FormField
              control={registrationForm.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">City</FormLabel>
                  <FormControl>
                    <CustomSearchDropdown
                      options={cities.map((city) => ({
                        id: city.id,
                        name: city.name,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select City"
                      searchPlaceholder="Type to search cities..."
                      loading={loadingCities}
                      onSearch={handleCitySearch}
                      className="w-full"
                      triggerClassName="w-full px-4  text-sm bg-black text-white rounded-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Referral Code Field - Only show when source is "Referral" from search params */}
            {sourceFromParams === "Referral" && (
              <FormField
                control={registrationForm.control}
                name="referral_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Referral Code</FormLabel>
                    <FormControl>
                      <input
                        placeholder="Enter Referral Code"
                        {...field}
                        className="w-full px-4 py-3 text-sm bg-black text-white rounded-md placeholder-white/50 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </FormControl>
                    <FormMessage />

                    {/* Show referred by name */}
                    {isCheckingReferral && (
                      <p className="text-xs text-gray-300 mt-1">Checking referral code...</p>
                    )}
                    {referredBy && !isCheckingReferral && (
                      <p className="text-xs text-green-400 mt-1">
                        Referred by: <span className="font-semibold">{referredBy}</span>
                      </p>
                    )}
                    {!referredBy && !isCheckingReferral && field.value && (
                      <p className="text-xs text-red-400 mt-1">Invalid referral code</p>
                    )}
                  </FormItem>
                )}
              />
            )}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full px-12"
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => setStep(1)}
                className="w-full px-12 mt-2"
              >
                Back
              </Button>
              <Link href="/login" className="text-sm text-gray-300 flex justify-center mt-3">
                Already have an account?{" "}
                <span className="hover:underline pl-1 text-primary">Login</span>
              </Link>
            </div>
          </form>
        </Form>
      )}
    </>
  );
}