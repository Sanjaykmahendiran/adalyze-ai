"use client";

import { X, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import useLogout from "@/hooks/useLogout";

interface UpgradePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
  onMaybeLater?: () => void;
}

export const UpgradePopup = ({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  onMaybeLater 
}: UpgradePopupProps) => {
  const router = useRouter();
  const logout = useLogout();

  const handleUpgrade = () => {
    onClose();
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push("/pro");
    }
  };

  const handleMaybeLater = () => {
    onClose();
    if (onMaybeLater) {
      onMaybeLater();
    } else {
      logout();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-black rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative border-2 border-[#db4900]/40 shadow-2xl shadow-[#db4900]/30 mx-4">
        {/* Confetti/Celebration Background Effect */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#db4900]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#ff5722]/20 rounded-full blur-3xl animate-pulse delay-150"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#db4900]/10 rounded-full blur-3xl"></div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative z-10">
          {/* Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#db4900]/20 rounded-full mb-4">
              <Zap className="w-8 h-8 text-[#db4900]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Upgrade to Pro
            </h2>
            <p className="text-white/70 text-sm sm:text-base">
              You've reached your free trial limit. Upgrade to continue analyzing ads and unlock premium features.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-white/90">
              <CheckCircle className="w-5 h-5 text-[#db4900] flex-shrink-0" />
              <span className="text-sm">Unlimited ad analysis</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <CheckCircle className="w-5 h-5 text-[#db4900] flex-shrink-0" />
              <span className="text-sm">Advanced AI insights</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <CheckCircle className="w-5 h-5 text-[#db4900] flex-shrink-0" />
              <span className="text-sm">Priority support</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-[#db4900] hover:bg-[#c44000] text-white rounded-lg py-3 text-base font-semibold transition-all duration-200"
            >
              Upgrade Now
            </Button>
            <Button
              onClick={handleMaybeLater}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-lg py-3 text-base font-semibold transition-all duration-200"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePopup;
