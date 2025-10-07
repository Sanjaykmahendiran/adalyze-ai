import React from "react";
import NoDataFoundImage from "@/assets/no-data-found.webp";

interface ENoDataFoundProps {
  title?: string;
  description?: string;
  className?: string;
}

const NoDataFound: React.FC<ENoDataFoundProps> = ({
  title = "No items found",
  description = "Try adjusting your filters or search term",
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="w-42 h-42 mb-4">
        <img
          src={NoDataFoundImage.src}
          alt="Empty state"
          className="w-full h-full object-contain"
        />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-white text-center">{title}</h3>
      <p className="text-white/50 text-center">{description}</p>
    </div>
  );
};

export default NoDataFound;
