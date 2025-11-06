"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import GooglePartner from "@/assets/Landing-page/google-partner.webp";
import MetaPartner from "@/assets/Landing-page/meta.webp";
import LinkedInPartner from "@/assets/Landing-page/linkedin.webp";
import PinterestPartner from "@/assets/Landing-page/pinterest-partner.webp";
import TiktokPartner from "@/assets/Landing-page/tik-tok.webp";

interface Partner {
  src: string;
  alt: string;
}

const PartnerLogos: React.FC = () => {
  const partners: Partner[] = [
    { src: GooglePartner.src, alt: "Google Partner" },
    { src: MetaPartner.src, alt: "Meta Business Partner" },
    { src: LinkedInPartner.src, alt: "LinkedIn Marketing Partner" },
    { src: PinterestPartner.src, alt: "Pinterest Partner" },
    { src: TiktokPartner.src, alt: "Tiktok Partner" },
  ];

  return (
    <>
      <section className="w-full max-w-7xl mx-auto flex justify-center py-8 px-4">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center bg-white rounded-3xl shadow-sm border border-[#171717] px-6 sm:px-8 md:px-10 py-6 gap-4 sm:gap-y-4 sm:gap-x-6 md:gap-x-8">
          {partners.map((partner, index) => (
            <React.Fragment key={partner.alt}>
              <div
                className={`flex items-center justify-center px-2 sm:px-4${partner.alt === "Tiktok Partner" ? " hidden sm:flex" : ""}`}
              >
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={140}
                  height={60}
                  className="object-contain max-w-[100px] sm:max-w-[140px] md:max-w-[150px]"
                  priority
                />
              </div>

              {/* Divider for medium+ screens */}
              {index < partners.length - 1 && (
                <div className="hidden md:block h-10 w-px bg-black/30" />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Bottom border */}
      <motion.div
        className="max-w-screen-xl mx-auto border-t border-[#db4900]/40 mt-6 sm:mt-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />
    </>
  );
};

export default PartnerLogos;
