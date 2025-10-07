"use client";

import { useEffect, useState } from "react";
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
import { event } from "@/lib/gtm";

const sourceOptions = [
  "Google",
  "Facebook",
  "Instagram",
  "LinkedIn",
  "Twitter",
  "Word of Mouth",
  "Referral",
  "Other",
];

// Step 1 schema - only email
const emailSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

// Step 2 schema - updated fields as per API payload
const registrationSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  mobileno: z.string().min(10, { message: "Mobile number must be at least 10 digits." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
  role: z.string().min(1, { message: "Please select a role." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  source: z.string().min(1, { message: "Please select a source." }),
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

  // Get referral code from search params
  const referralCode = searchParams.get('referral_code') || '';

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
      mobileno: "",
      password: "",
      role: "",
      city: "",
      source: referralCode ? "Referral" : "",
      referral_code: referralCode,
    },
  });

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

  // Watch source field to handle referral selection
  const sourceValue = registrationForm.watch("source");
  const referralCodeValue = registrationForm.watch("referral_code");

  // Effect to check referral code when it changes
  useEffect(() => {
    if (sourceValue === "Referral" && referralCodeValue) {
      checkReferralCode(referralCodeValue);
    } else {
      setReferredBy("");
    }
  }, [sourceValue, referralCodeValue]);

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
        mobileno: string;
        password: string;
        role: string;
        city: string;
        source: string;
        referred_by?: number;
      } = {
        gofor: "register",
        user_id: userId,
        name: values.name,
        mobileno: values.mobileno,
        password: values.password,
        role: values.role,
        city: values.city,
        source: values.source,
      };

      // Add referred_by field if source is Referral and we have the user ID
      if (values.source === "Referral" && referralUserId) {
        // Send the user ID as integer in referred_by field
        payload.referred_by = parseInt(referralUserId);
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

        // ✅ GA4 / GTM custom event
        event("signup", {
          method: values.source === "Referral" ? "Referral" : values.source || "Email",
        });


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

                <GoogleSignInButton onSubmit={onSubmitRegistration} />

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
            onSubmit={registrationForm.handleSubmit(onSubmitRegistration)}
            className="space-y-3 text-xs text-left"
          >
            {/* Display the email (read-only) */}
            <div className="space-y-1">
              <h3 className="font-bold text-xs">Email</h3>
              <input
                type="email"
                value={emailValue}
                readOnly
                className="w-full px-4 py-3 text-sm bg-black text-white rounded-md placeholder-white/50 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

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
              name="mobileno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Mobile Number</FormLabel>
                  <FormControl>
                    <input
                      type="tel"
                      placeholder="Your Mobile Number"
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

            <FormField
              control={registrationForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">I'm a</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger
                        className="w-full px-4 py-5.5 text-sm bg-black text-white rounded-md placeholder-white/50 focus:outline-none focus:border-orange-500 transition-colors"
                        title={field.value}
                      >
                        <SelectValue
                          placeholder="Select Role"
                          children={
                            field.value && field.value.length > 40
                              ? field.value.slice(0, 40) + "…"
                              : field.value
                          }
                        />
                      </SelectTrigger>

                      <SelectContent className="min-w-full">
                        <SelectItem value="Freelancer">Freelancer</SelectItem>
                        <SelectItem value="Digital Marketer">Digital Marketer</SelectItem>
                        <SelectItem value="Business Owner - Entrepreneur">
                          Business Owner / Entrepreneur
                        </SelectItem>
                        <SelectItem value="Marketing Agency">Marketing Agency</SelectItem>
                        <SelectItem value="Content Creator">
                          Content Creator (YouTuber, Blogger, etc.)
                        </SelectItem>
                        <SelectItem value="Graphic Designer">Graphic Designer</SelectItem>
                        <SelectItem value="Social Media Manager">Social Media Manager</SelectItem>
                        <SelectItem value="Brand Manager">Brand Manager</SelectItem>
                        <SelectItem value="Startup - SME">Startup / SME</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>

                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={registrationForm.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">City</FormLabel>
                  <FormControl>
                    <input
                      placeholder="Your City"
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
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">How did you hear about us?</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <SelectTrigger className="w-full px-4 py-5 text-sm bg-black text-white rounded-md transition-colors">
                        <SelectValue placeholder="Select Source" />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceOptions.map((src) => (
                          <SelectItem key={src} value={src}>
                            {src}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Referral Code Field - Only show when source is "Referral" */}
            {sourceValue === "Referral" && (
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