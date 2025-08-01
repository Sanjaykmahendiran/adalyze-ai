"use client";

import Link from "next/link";
import { Facebook, Linkedin, Twitter, Youtube, Instagram } from "lucide-react";
import Image from "next/image";
import playstore from "@/assets/playstore.png";
import appleicon from "@/assets/apple-icon.png";
import { useRouter } from "next/navigation";

const LandingPageFooter = () => {
    const router = useRouter();

    return (
        <footer className="bg-black text-white py-10 px-6 border-t border-[#2b2b2b] md:px-12">
            <div className=" mx-10 flex flex-col md:flex-row justify-between gap-12">
                {/* Left Section: Social + Links */}
                <div className="flex flex-col items-center md:items-start gap-6 w-full">
                    {/* Social Media Icons */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <Link href="https://www.facebook.com/suggestoai" aria-label="Facebook">
                            <Facebook className="w-6 h-6 hover:text-gray-400 transition" />
                        </Link>
                        <Link href="https://x.com/suggestoai" aria-label="Twitter">
                            <Twitter className="w-6 h-6 hover:text-gray-400 transition" />
                        </Link>
                        <Link href="https://www.youtube.com/@suggestoai" aria-label="YouTube">
                            <Youtube className="w-6 h-6 hover:text-gray-400 transition" />
                        </Link>
                        <Link href="https://www.instagram.com/suggestoai" aria-label="Instagram">
                            <Instagram className="w-6 h-6 hover:text-gray-400 transition" />
                        </Link>
                        <Link href="https://www.linkedin.com/company/suggestoai" aria-label="LinkedIn">
                            <Linkedin className="w-6 h-6 hover:text-gray-400 transition" />
                        </Link>
                    </div>

                    {/* Bottom Links */}
                    <div className="flex flex-wrap justify-center md:justify-start items-center text-xs gap-4 md:gap-8 text-center md:text-left">
                        <div>© {new Date().getFullYear()} Adalyze AI. All rights reserved.</div>
                        <Link href="/privacypolicy" className="hover:underline">
                            Privacy Policy
                        </Link>
                        <Link href="/returnpolicy" className="hover:underline">
                            Return Policy
                        </Link>
                        <Link href="/termsandconditions" className="hover:underline">
                            Terms of Use
                        </Link>
                    </div>

                </div>

                {/* Right Section: Contact & Buttons */}
                <div className="text-center md:text-right w-full">
                    <h3 className="text-xl font-bold text-primary mb-2">
                        Contact
                    </h3>
                    <a
                        href="mailto:support@suggesto.ai"
                        className="text-sm hover:text-primary block mb-6"
                    >
                        support@suggesto.ai
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default LandingPageFooter;
