import { Sprout, CloudLightning, ScanLine, Bot, MapPin, ArrowRight, Sun, Cloud, CloudRain, Snowflake, Loader2 } from 'lucide-react';

// Now accepts weatherCode and weatherLoading as props
export default function DashboardHome({ setActiveTab, location, weatherCode, weatherLoading }) {
  
  // 1. Helper Function: Maps Code -> Icon & Color
  const getWeatherDetails = (code) => {
    if (code === undefined || code === null) return { icon: Sun, color: "text-yellow-400" };
    if (code === 0) return { icon: Sun, color: "text-yellow-400" };
    if (code >= 1 && code <= 3) return { icon: Cloud, color: "text-gray-300" };
    if (code >= 45 && code <= 48) return { icon: Cloud, color: "text-gray-400" };
    if (code >= 51 && code <= 67) return { icon: CloudRain, color: "text-blue-400" };
    if (code >= 71 && code <= 77) return { icon: Snowflake, color: "text-cyan-200" };
    if (code >= 95) return { icon: CloudLightning, color: "text-purple-400" };
    return { icon: Cloud, color: "text-gray-300" };
  };

  // 2. Get the correct icon Component
  const { icon: WeatherIcon, color: iconColor } = getWeatherDetails(weatherCode);

  const features = [
    {
      id: 'crops',
      title: "Smart Crop Advisor",
      desc: "Get GPS-based crop suggestions tailored to your soil.",
      icon: Sprout,
      color: "text-green-400",
      bg: "bg-green-400/10"
    },
    {
      id: 'weather',
      title: "Weather Station",
      desc: "Live forecasts and storm alerts for your village.",
      icon: CloudLightning,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10"
    },
    {
      id: 'pest',
      title: "Dr. Crop (Pest Scan)",
      desc: "Instant disease diagnosis using AI vision.",
      icon: ScanLine,
      color: "text-red-400",
      bg: "bg-red-400/10"
    },
    {
      id: 'bot',
      title: "Sahayak Chatbot",
      desc: "Your personal 24/7 agriculture expert.",
      icon: Bot,
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hero Section */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden group flex justify-between items-center">
        
        {/* Light Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500/20 rounded-full blur-3xl -mt-16 group-hover:bg-green-500/30 transition duration-700"></div>
        
        <div className="relative z-10 flex-1 pr-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">Farm Overview</h2>
          <p className="text-green-100/70 max-w-xl text-sm md:text-base leading-relaxed">
            Everything looks good at <span className="text-white font-semibold">{location}</span>. 
            System is monitoring conditions. <span className="text-white font-semibold">Get more details at Weather Station.</span>. 
          </p>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10">
              <MapPin size={14} className="text-red-400" />
              <span className="text-xs md:text-sm">{location}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs md:text-sm">System Online</span>
            </div>
          </div>
        </div>

        {/* Dynamic Weather Icon with Loading State */}
        <div className="relative z-10 ml-auto shrink-0">
          {weatherLoading ? (
            <Loader2 
              className="w-24 h-24 md:w-40 md:h-40 text-white/30 animate-spin" 
              strokeWidth={1.5}
            />
          ) : (
            <WeatherIcon 
              className={`w-24 h-24 md:w-40 md:h-40 ${iconColor} drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]`} 
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="glass-panel p-5 md:p-6 rounded-3xl text-left transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] active:scale-95 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={28} className="md:w-8 md:h-8" />
                </div>
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/20 transition">
                  <ArrowRight size={18} className="text-white/50 group-hover:text-white" />
                </div>
              </div>
              
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-green-100/60 text-sm leading-relaxed">{item.desc}</p>
            </button>
          );
        })}
      </div>

    </div>
  );
}