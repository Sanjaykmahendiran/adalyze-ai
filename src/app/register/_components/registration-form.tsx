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
import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleSignInButton from "@/app/login/_components/GoogleSign-In";
import Cookies from "js-cookie";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const sourceOptions = [
  "Google",
  "Facebook",
  "Instagram",
  "LinkedIn",
  "Twitter",
  "Word of Mouth",
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
});

export default function RegistrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [emailValue, setEmailValue] = useState("");
  const [userId, setUserId] = useState("");
  const router = useRouter();

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
      source: "",
    },
  });

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

      const data = await response.json();

      if (response.ok && data.user_id) {
        setEmailValue(values.email);
        setUserId(data.user_id.toString());
        setStep(2);
        toast.success("Email verified successfully!");
      } else {
        toast.error("Email verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Email verification failed", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Google Sign-In
  async function handleGoogleSignIn(userData: any) {
    // Implementation for Google Sign-In
    console.log("Google Sign-In data:", userData);
    // Add your Google Sign-In logic here
  }

  // Step 2 submission - Full registration with real API
  async function onSubmitRegistration(values: z.infer<typeof registrationSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch("https://adalyzeai.xyz/App/api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gofor: "register",
          user_id: userId,
          name: values.name,
          mobileno: values.mobileno,
          password: values.password,
          role: values.role,
          city: values.city,
          source: values.source,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        // Save user_id in cookies
        Cookies.set("userId", userId, { expires: 30 }); // Expires in 30 days

        toast.success(data.message || "Registration successful!");
        registrationForm.reset();

        // Clear localStorage
        localStorage.removeItem("registrationStep");
        localStorage.removeItem("registrationEmail");
        localStorage.removeItem("registrationUserId");

        setTimeout(() => {
          router.push("/dashboard");
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
                        className="w-full px-4 py-3 text-sm bg-[#1a1a1a] text-white rounded-md placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
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

                <GoogleSignInButton />

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
                className="w-full px-4 py-3 text-sm bg-[#1a1a1a] text-white rounded-md placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
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
                      className="w-full px-4 py-3 text-sm bg-[#1a1a1a] text-white rounded-md placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
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
                      className="w-full px-4 py-3 text-sm bg-[#1a1a1a] text-white rounded-md placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
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
                        className="w-full px-4 py-3 text-sm bg-[#1a1a1a] text-white rounded-md placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
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
                  <FormLabel className="font-bold">Role</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full px-4 py-5 text-sm bg-[#1a1a1a] text-white rounded-md placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CEO">CEO</SelectItem>
                        <SelectItem value="CMO">CMO</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Developer">Developer</SelectItem>
                        <SelectItem value="Designer">Designer</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
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
                      className="w-full px-4 py-3 text-sm bg-[#1a1a1a] text-white rounded-md placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
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
                      <SelectTrigger className="w-full px-4 py-5 text-sm bg-[#1a1a1a] text-white rounded-md transition-colors">
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
              <Link href="/login" className="text-sm text-gray-400 flex justify-center mt-3">
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