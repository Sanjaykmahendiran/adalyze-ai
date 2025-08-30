"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopNavbar } from "@/components/top-navbar";
import Spinner from "@/components/overlay";
import confetti from "canvas-confetti";
import useFetchUserDetails from "@/hooks/useFetchUserDetails";

export default function ThanksPage() {
  const { userDetails } = useFetchUserDetails();
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const order_id = searchParams?.get("order_id");

  useEffect(() => {
    if (order_id) {
    }
    setLoading(false);
  }, [order_id]);

  useEffect(() => {
    if (loading || !order_id) return;

    confetti({
      particleCount: 600,
      spread: 90,
      angle: 90,
      origin: { x: 0.5, y: 0.5 },
      colors: ["#ff6347", "#ffd700", "#32cd32"],
    });

    // Start countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, order_id, router]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="loginwrapper  flex justify-center items-center min-h-screen overflow-hidden">
      <div className="flex flex-col gap-4 justify-center bg-[#121212] my-6 p-6 lg:p-10 m-4 w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-[80%] 2xl:max-w-[70%] 2xl:px-16 2xl:py-12 rounded-3xl">
        <div className="relative rounded-xl ">
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <Check className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Payment Successful
            </h1>
            <p className="text-gray-300 mb-2">
              Thank you for your payment! Your transaction has been processed successfully.
            </p>
            <p className="text-sm mb-6 font-bold text-white">Order ID: {order_id}</p>
            <p className="text-gray-300 mb-4">
              Redirecting in <span className="font-bold">{countdown}</span> seconds...
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}