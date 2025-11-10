import React from "react";

const SharePostCard: React.FC = () => {
  const color = "#db4900"; // Adalyze primary color

  return (
    <div
      id="share-card"
      className="w-[1080px] h-[1080px] bg-white flex flex-col items-center justify-between rounded-2xl overflow-hidden relative"
      style={{
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Background (optional faint network pattern) */}
      <div className="absolute inset-0 bg-white">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('/bg-pattern.png')", // optional decorative bg
            opacity: 0.08,
          }}
        />
      </div>

      {/* Top Section */}
      <div className="flex justify-between w-full px-10 pt-10 items-center z-10">
        <img src="/default-logo.png" alt="Logo" className="w-40 object-contain" />
        <p className="text-gray-600 font-medium text-lg">www.adalyze.app</p>
      </div>

      {/* Title */}
      <h1
        className="text-[56px] font-extrabold text-center mt-6 z-10"
        style={{ color }}
      >
        Campaign Progress Update
      </h1>

      {/* Robot with Rockets */}
      <div className="relative mt-2 z-10">
        <img
          src="/robot.png"
          alt="Robot"
          className="w-[300px] h-[300px] object-contain mx-auto"
        />
        <img
          src="/rocket.png"
          alt="Rocket Left"
          className="absolute -left-28 top-28 w-[180px] rotate-[-25deg]"
          style={{ filter: `drop-shadow(0 0 12px ${color})` }}
        />
        <img
          src="/rocket.png"
          alt="Rocket Right"
          className="absolute -right-28 top-28 w-[180px] rotate-[25deg]"
          style={{ filter: `drop-shadow(0 0 12px ${color})` }}
        />
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-3 gap-6 text-center mt-6 w-3/4 z-10">
        <div
          className="rounded-2xl py-6"
          style={{ backgroundColor: `${color}15` }}
        >
          <div className="flex flex-col items-center justify-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: color }}
            >
              <span className="text-white text-3xl">🎯</span>
            </div>
            <p className="text-gray-700 text-2xl font-bold">
              Reach <span style={{ color }}>+34%</span>
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl py-6"
          style={{ backgroundColor: `${color}15` }}
        >
          <div className="flex flex-col items-center justify-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: color }}
            >
              <span className="text-white text-3xl">📈</span>
            </div>
            <p className="text-gray-700 text-2xl font-bold">
              CTR <span style={{ color }}>+18%</span>
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl py-6"
          style={{ backgroundColor: `${color}15` }}
        >
          <div className="flex flex-col items-center justify-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: color }}
            >
              <span className="text-white text-3xl">👥</span>
            </div>
            <p className="text-gray-700 text-2xl font-bold">
              Cost Per Lead <span style={{ color }}>-22%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="w-full text-center mt-8 py-8 z-10"
        style={{ backgroundColor: color }}
      >
        <h2 className="text-white text-3xl font-bold">
          Result: Campaign is Improving
        </h2>
        <p className="text-white text-xl mt-2 opacity-90">
          Next Step: Increase best-performing audience by ₹200/day
        </p>
      </div>
    </div>
  );
};

export default SharePostCard;
