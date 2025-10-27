
import Link from "next/link";
import Image from "next/image";
import notfoundimage from "@/assets/404.png";

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
            <Image
                src={notfoundimage}
                alt="404 Not Found"
                width={400}
                height={300}
                className="mb-6"
            />
            <p className="mb-6">Oops! The page you are looking for does not exist.</p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/" className="px-6 py-2 bg-primary text-white rounded-lg">Go to Home</Link>
            </div>
        </div>
    );
}
