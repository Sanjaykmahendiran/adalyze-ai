"use client";

import HtmlRenderer from "@/components/html-renderer";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { axiosInstance } from "@/configs/axios";

const PoliciesSkeleton = () => (
  <div className="mt-6 space-y-4 animate-pulse">
    {/* Content lines skeleton */}
    <div className="space-y-3">
      <div className="h-6 w-3/4 bg-[#2b2b2b] rounded" />
      <div className="h-4 w-full bg-[#2b2b2b] rounded" />
      <div className="h-4 w-full bg-[#2b2b2b] rounded" />
      <div className="h-4 w-5/6 bg-[#2b2b2b] rounded" />
    </div>
    <div className="space-y-3 pt-4">
      <div className="h-5 w-2/3 bg-[#2b2b2b] rounded" />
      <div className="h-4 w-full bg-[#2b2b2b] rounded" />
      <div className="h-4 w-full bg-[#2b2b2b] rounded" />
      <div className="h-4 w-4/5 bg-[#2b2b2b] rounded" />
    </div>
    <div className="space-y-3 pt-4">
      <div className="h-5 w-1/2 bg-[#2b2b2b] rounded" />
      <div className="h-4 w-full bg-[#2b2b2b] rounded" />
      <div className="h-4 w-full bg-[#2b2b2b] rounded" />
      <div className="h-4 w-3/4 bg-[#2b2b2b] rounded" />
    </div>
  </div>
);

export default function PolicyComponent() {
  const [privacy, setPrivacy] = useState<string>("");
  const [returnPolicy, setReturnPolicy] = useState<string>("");
  const [termsConditions, setTermsConditions] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const [privacyRes, returnRes, termsRes] = await Promise.all([
          axiosInstance.get("?gofor=privacypolicy", { responseType: "text" }),
          axiosInstance.get("?gofor=returnpolicy", { responseType: "text" }),
          axiosInstance.get("?gofor=termsandconditions", { responseType: "text" }),
        ]);

        setPrivacy(privacyRes.data);
        setReturnPolicy(returnRes.data);
        setTermsConditions(termsRes.data);

      } catch (error) {
        console.error("Error fetching policies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);


  return (
    <div className="w-full  shadow  rounded-2xl lg:mt-6">
      <div className="w-full px-0 sm:px-12 py-8">
        <Tabs defaultValue="privacy" className="w-full rounded-[20px]">
          <TabsList className="flex bg-black h-12 text-black w-full sm:w-[40rem] justify-start rounded-full overflow-x-auto">
            <TabsTrigger value="privacy"
              className="font-semibold rounded-[20px] flex-grow h-10 px-2 py-1 text-center sm:text-left md:p-0 lg:text-sm md:text-xs font-medium bg-transparent data-[state=active]:bg-primary hover:bg-[#171717]">
              Privacy Policy
            </TabsTrigger>
            <TabsTrigger value="return"
              className="font-bold rounded-[20px] flex-grow h-10 px-2 py-1 text-center sm:text-left md:p-0 lg:text-sm md:text-xs font-medium bg-transparent data-[state=active]:bg-primary hover:bg-[#171717]">
              Return Policy
            </TabsTrigger>
            <TabsTrigger value="terms"
              className="font-bold rounded-[20px] flex-grow h-10 px-2 py-1 text-center sm:text-left md:p-0 lg:text-sm md:text-xs font-medium bg-transparent data-[state=active]:bg-primary hover:bg-[#171717]">
              Terms & Conditions
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <PoliciesSkeleton />
          ) : (
            <>
              <TabsContent value="privacy">
                <div className="mt-6 flex justify-center">
                  <div className="max-w-[800px] w-full">
                    <HtmlRenderer htmlContent={privacy} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="return">
                <div className="mt-6 flex justify-center">
                  <div className="max-w-[800px] w-full">
                    <HtmlRenderer htmlContent={returnPolicy} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="terms">
                <div className="mt-6 flex justify-center">
                  <div className="max-w-[800px] w-full">
                    <HtmlRenderer htmlContent={termsConditions} />
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
