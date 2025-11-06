
import { Suspense } from "react";
import Spinner from "@/components/overlay";

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
