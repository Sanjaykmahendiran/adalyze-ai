"use client";

import HtmlRenderer from "@/components/html-renderer";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Spinner from "@/components/overlay";

export default function PolicyComponent() {
  const [privacy, setPrivacy] = useState<string>("");
  const [returnPolicy, setReturnPolicy] = useState<string>("");
  const [termsConditions, setTermsConditions] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const [privacyRes, returnRes, termsRes] = await Promise.all([
          fetch('https://adalyzeai.xyz/App/api.php?gofor=privacypolicy'),
          fetch('https://adalyzeai.xyz/App/api.php?gofor=returnpolicy'),
          fetch('https://adalyzeai.xyz/App/api.php?gofor=termsandconditions')
        ]);

        const privacyData = await privacyRes.text();
        const returnData = await returnRes.text();
        const termsData = await termsRes.text();

        setPrivacy(privacyData);
        setReturnPolicy(returnData);
        setTermsConditions(termsData);
      } catch (error) {
        console.error("Error fetching policies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  return (
    <div className="w-full  shadow  rounded-2xl">
      <div className="max-w-full sm:max-w-4xl px-4 sm:px-12 py-8">
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
            <div className="flex justify-center items-center py-6">
              <Spinner />
            </div>
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
