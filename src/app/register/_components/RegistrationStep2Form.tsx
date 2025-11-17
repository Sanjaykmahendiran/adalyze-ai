import { useState, useRef, useCallback, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomSearchDropdown } from "@/components/ui/custom-search-dropdown";
import Cookies from "js-cookie";
import { Checkbox } from "@/components/ui/checkbox";
import { trackEvent } from "@/lib/eventTracker";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/configs/axios";

const registrationSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  type: z.string().min(1, { message: "Please select an option." }),
  city: z.string().min(1, { message: "Please select a city." }),
  referral_code: z.string().optional(),
});

export default function RegistrationStep2Form({
  email,
  userId,
  sourceFromParams = "",
  referralCode = "",
  utmSource = "",
  utmMedium = "",
  utmCampaign = "",
  utmContent = "",
  utmTerm = "",
  onComplete,
}: {
  email: string;
  userId: string;
  sourceFromParams?: string;
  referralCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  onComplete?: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const citySearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchTermRef = useRef<string>("");

  const [referredBy, setReferredBy] = useState("");
  const [isCheckingReferral, setIsCheckingReferral] = useState(false);
  const [referralUserId, setReferralUserId] = useState("");
  const router = useRouter();

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

  // City fetch logic
  const fetchCities = useCallback(async (searchTerm: string) => {
    if (lastSearchTermRef.current === searchTerm.trim()) return;
    if (!searchTerm.trim()) {
      setCities([]);
      lastSearchTermRef.current = "";
      return;
    }
    lastSearchTermRef.current = searchTerm.trim();
    setLoadingCities(true);
    try {
      const response = await fetch(
        `https://techades.com/App/api.php?gofor=locationlist&search=${encodeURIComponent(searchTerm.trim())}`
      );
      const data: Array<{ id: string; name: string }> = await response.json();
      const uniqueCities = Array.from(new Map(data.map((city) => [city.id, city])).values());
      setCities(uniqueCities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      lastSearchTermRef.current = "";
    } finally {
      setLoadingCities(false);
    }
  }, []);

  // Debounced city search
  const handleCitySearch = useCallback(
    (searchTerm: string) => {
      if (citySearchTimeoutRef.current) clearTimeout(citySearchTimeoutRef.current);
      if (!searchTerm.trim()) {
        setCities([]);
        lastSearchTermRef.current = "";
        return;
      }
      citySearchTimeoutRef.current = setTimeout(() => {
        fetchCities(searchTerm);
      }, 300);
    },
    [fetchCities]
  );

  // Referral code check
  const checkReferralCode = async (code: string) => {
    if (!code.trim()) {
      setReferredBy("");
      setReferralUserId("");
      return;
    }
    setIsCheckingReferral(true);
    try {
      const response = await axiosInstance.get(`?gofor=usergetbyref&referral_code=${code}`);
      const data = response.data;
      if (data.user_id && data.name) {
        setReferralUserId(data.user_id.toString());
        setReferredBy(data.name);
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

  // Watch referral code
  const referralCodeValue = registrationForm.watch("referral_code");
  useEffect(() => {
    if (sourceFromParams === "Referral" && referralCodeValue) {
      checkReferralCode(referralCodeValue);
    } else {
      setReferredBy("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFromParams, referralCodeValue]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (citySearchTimeoutRef.current) clearTimeout(citySearchTimeoutRef.current);
    };
  }, []);

  // Registration submit
  async function onSubmitRegistration(values: z.infer<typeof registrationSchema>) {
    setIsLoading(true);
    try {
      const payload: any = {
        gofor: "register",
        user_id: userId,
        name: values.name,
        password: values.password,
        type: values.type,
        city: values.city,
      };
      if (sourceFromParams) payload.source = sourceFromParams;
      if (sourceFromParams === "Referral" && referralUserId) {
        payload.referred_by = parseInt(referralUserId);
      }
      if (utmSource) payload.utm_source = utmSource;
      if (utmMedium) payload.utm_medium = utmMedium;
      if (utmCampaign) payload.utm_campaign = utmCampaign;
      if (utmContent) payload.utm_content = utmContent;
      if (utmTerm) payload.utm_term = utmTerm;
        const response = await axiosInstance.post("", payload);
      const data = response.data;
      if (data.status === "success") {
        Cookies.set("userId", userId, { expires: 30 });
        Cookies.set("email", email, { expires: 30 });
        trackEvent("Register_completed", window.location.href, email);
        toast.success(data.message || "Registration successful!");
        registrationForm.reset();
        if (typeof onComplete === "function") {
          onComplete();
        } else {
          // Default: Route to email confirmation
          setTimeout(() => {
            router.push("/emailconfrimation");
          }, 2000);
        }
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
    <Form {...registrationForm}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          registrationForm.handleSubmit(onSubmitRegistration)(e);
        }}
        className="space-y-5 text-xs text-left"
      >
        {/* Analyze For (type) */}
        <FormField
          control={registrationForm.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-white">Analyze For</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-black text-white focus:ring-none text-sm  w-full py-7">
                    <SelectValue placeholder="Select Analyze For" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-black border border-orange-500/20 text-white gap-y-2">
                  <SelectItem value="1" className={`p-4 rounded-lg bg-[#171717] cursor-pointer transition-all data-[state=checked]:bg-orange-500/10 data-[state=checked]:border-orange-500`}>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center">
                        <Checkbox checked={field.value === "1"} onCheckedChange={() => field.onChange("1")} />
                      </div>
                      <div className="flex flex-col text-left">
                        <p className="font-semibold text-white">Single Brand</p>
                        <p className="text-xs text-white/80">Upload and analyze ads for one brand</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="2" className={`p-4 rounded-lg bg-[#171717] cursor-pointer transition-all data-[state=checked]:bg-orange-500/10 data-[state=checked]:border-orange-500`}>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center">
                        <Checkbox checked={field.value === "2"} onCheckedChange={() => field.onChange("2")} />
                      </div>
                      <div className="flex flex-col text-left">
                        <p className="font-semibold text-white">Multi Brand</p>
                        <p className="text-xs text-white/80">Upload and analyze ads for multiple brands</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name */}
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

        {/* Password */}
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* City */}
        <FormField
          control={registrationForm.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">City</FormLabel>
              <FormControl>
                <CustomSearchDropdown
                  options={cities.map((city) => ({ id: city.id, name: city.name }))}
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

        {/* Referral Code */}
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
                {isCheckingReferral && <p className="text-xs text-gray-300 mt-1">Checking referral code...</p>}
                {referredBy && !isCheckingReferral && (
                  <p className="text-xs text-green-400 mt-1">Referred by: <span className="font-semibold">{referredBy}</span></p>
                )}
                {!referredBy && !isCheckingReferral && field.value && (
                  <p className="text-xs text-red-400 mt-1">Invalid referral code</p>
                )}
              </FormItem>
            )}
          />
        )}

        <div className="pt-2">
          <Button type="submit" disabled={isLoading} className="w-full px-12">
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
