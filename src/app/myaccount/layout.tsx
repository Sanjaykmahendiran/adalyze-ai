import { Poppins } from "next/font/google";
import { RootLayoutProps } from "@/app/types";
import { Suspense } from "react";
import Spinner from "@/components/overlay";

export const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });

export const metadata = {
  title: "Adalyze AI- Nextgen AI Tool for your Career Journey",
  description: "Adalyze AI- Nextgen AI Tool for your Career Journey",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <Suspense fallback={<Spinner />}>
      <div className=" md:pt-0">{children}</div>
    </Suspense>
  );
}
