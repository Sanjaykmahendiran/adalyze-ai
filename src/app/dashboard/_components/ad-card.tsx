import { useCallback } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { RecentAd } from "../types";

const AdCard = ({ ad, onViewReport }: { ad: RecentAd; onViewReport: (adId: string) => void }) => {
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = "/api/placeholder/300/200";
  }, []);

  // Determine progress color based on score
  const getProgressColor = (score: number) => {
    if (score < 50) return "#ef4444"; // red
    if (score < 75) return "#facc15"; // yellow
    return "#22c55e"; // green
  };

  const getTrailColor = (score: number) => {
    if (score < 50) return "#fca5a5"; // light red
    if (score < 75) return "#fef08a"; // light yellow
    return "#bbf7d0"; // light green
  };

  const score = ad.score ?? 75; // default score

return (
    <div
      onClick={() => onViewReport(ad.ad_id.toString())}
      className="bg-[#171717] rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-[#db4900]/10 group cursor-pointer"
    >
      {/* Left Image */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 aspect-square overflow-hidden flex-shrink-0">
        <img
          src={ad.image_path || "/api/placeholder/300/200"}
          alt={ad.ads_name || "Ad"}
          className="w-full h-full object-cover rounded-lg sm:rounded-xl"
          onError={handleImageError}
          loading="lazy"
        />
      </div>

      {/* Middle Content */}
      <div className="flex-1 flex flex-col justify-center gap-0.5 sm:gap-1 min-w-0">
        <p className="text-xs sm:text-sm lg:text-md text-[#db4900]">{ad.ads_type || "Unknown Type"}</p>
        <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-1">
          {ad.ads_name ? (ad.ads_name.length > 15 ? ad.ads_name.slice(0, 15) + "..." : ad.ads_name) : "Untitled Ad"}
        </h3>
        <div className="flex gap-1 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
          {(() => {
            if (!ad.platforms) return []
            
            try {
              // Try to parse as JSON first (for array format)
              const parsed = JSON.parse(ad.platforms)
              // If it's already an array, return it
              if (Array.isArray(parsed)) {
                return parsed
              }
              // If it's a string, return as single item array
              if (typeof parsed === 'string') {
                return [parsed]
              }
              return []
            } catch {
              // If JSON.parse fails, treat it as a plain string
              return [ad.platforms]
            }
          })().map((platform: string, index: number) => (
            <span
              key={index}
              className="bg-[#3d3d3d] text-gray-300 text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full"
            >
              {platform}
            </span>
          ))}
        </div>
      </div>

      {/* Right Score Section */}
      <div className="flex flex-col items-center justify-center w-20 sm:w-24 lg:w-28 py-2 sm:py-4 flex-shrink-0">
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
          <CircularProgressbar
            value={score}
            text={`${score}%`}
            strokeWidth={6}
            styles={buildStyles({
              pathColor: getProgressColor(score),
              textColor: getProgressColor(score),
              trailColor: getTrailColor(score),
              textSize: "24px",
            })}
          />
        </div>
        <span className="text-[10px] sm:text-xs lg:text-sm text-[#db4900] mt-0.5 sm:mt-1">CTR {ad.estimated_ctr}</span>
      </div>
    </div>
  );
};

export default AdCard;
