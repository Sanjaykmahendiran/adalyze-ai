export const MainStatCard = ({ title, value, subtitle, imageSrc }: {
    title: string;
    value: string | number;
    subtitle: string;
    imageSrc: string;
  }) => (
    <div className="bg-card rounded-2xl px-4 sm:px-6 py-4 sm:py-6 h-full flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#db4900]/20  group">
      <div className="flex items-center justify-between mb-2 flex-1">
        {/* Text Section */}
        <div className="flex flex-col justify-center min-w-0 flex-1 mr-2">
          <h3 className="text-muted-foreground text-base sm:text-lg font-medium mb-1 sm:mb-2 group-hover:text-foreground transition-colors duration-300 leading-tight">{title}</h3>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#db4900] group-hover:text-[#ff5722] transition-colors duration-300">{value}</div>
        </div>
        {/* Image Section */}
        <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
          <img
            src={imageSrc}
            alt={title}
            className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain"
          />
        </div>
      </div>
      {/* Subtitle */}
      <div className="mt-auto">
        <div className="bg-[#ffe7d9] dark:bg-[#ffe7d9]/20 text-gray-900 dark:text-foreground text-xs sm:text-sm px-2 sm:px-3 py-1 font-medium rounded-full inline-block group-hover:bg-[#ffccaa] dark:group-hover:bg-[#ffe7d9]/30 transition-colors duration-300">
          {subtitle}
        </div>
      </div>
    </div>
  );

export default MainStatCard;