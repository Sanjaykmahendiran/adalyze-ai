import { Poppins } from "next/font/google";
import { Suspense } from "react";
import MyAccountLoadingSkeleton from "@/components/Skeleton-loading/myaccount-loading";

export const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });

export const metadata = {
  title: "Adalyze AI- Nextgen AI Tool for your Career Journey",
  description: "Adalyze AI- Nextgen AI Tool for your Career Journey",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<MyAccountLoadingSkeleton />}>
      <div className=" md:pt-0">{children}</div>
    </Suspense>
  );
}
