import { Poppins } from "next/font/google";
import { Suspense } from "react";
import Spinner from "@/components/overlay";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });

export const metadata = {
  title: "Adalyze AI- Nextgen AI Tool for your Creativity",
  description: "Adalyze AI- Nextgen AI Tool for your Creativity",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Spinner />}>
      {children}</Suspense>
  );
}
