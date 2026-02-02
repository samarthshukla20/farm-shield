import { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Thermometer, MapPin, ArrowLeft, Search, Navigation, ArrowRight, Sun, CloudRain, CloudLightning, Snowflake } from 'lucide-react';

export default function WeatherStation({ setActiveTab }) {
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('gps');
  const [cityQuery, setCityQuery] = useState('');

  // Helper: Map WMO codes to Icons/Text
  const getWeatherDetails = (code) => {
    if (code === 0) return { label: "Clear Sky", icon: Sun, color: "text-yellow-400" };
    if (code >= 1 && code <= 3) return { label: "Partly Cloudy", icon: Cloud, color: "text-gray-300" };
    if (code >= 45 && code <= 48) return { label: "Foggy", icon: Cloud, color: "text-gray-400" };
    if (code >= 51 && code <= 67) return { label: "Rainy", icon: CloudRain, color: "text-blue-400" };
    if (code >= 71 && code <= 77) return { label: "Snow", icon: Snowflake, color: "text-cyan-200" };
    if (code >= 95) return { label: "Thunderstorm", icon: CloudLightning, color: "text-purple-400" };
    return { label: "Overcast", icon: Cloud, color: "text-gray-300" };
  };

  const fetchWeather = async (lat, lon, locationName) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lon })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setWeather({ ...data, locationName });
    } catch (err) {
      setError("Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  const handleGps = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, "Current Location"),
        () => { setError("GPS Denied"); setLoading(false); }
      );
    } else setError("GPS not supported");
  };

  const handleManual = async (e) => {
    e.preventDefault();
    if (!cityQuery) return;
    setLoading(true);
    try {
      // Geocode the city name first
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${cityQuery}`);
      const geoData = await geoRes.json();
      if (geoData.length > 0) {
        fetchWeather(geoData[0].lat, geoData[0].lon, geoData[0].display_name.split(',')[0]);
      } else {
        setError("City not found");
        setLoading(false);
      }
    } catch (err) {
      setError("Network Error");
      setLoading(false);
    }
  };

  // Auto-load GPS weather on first open
  useEffect(() => {
    handleGps();
  }, []);

  return (
    <div className="animate-in fade-in zoom-in duration-500 pb-20">
       
       {/* Header */}
       <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('dashboard')} className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition">
                <ArrowLeft className="text-white" />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-white">Weather Station</h2>
                <p className="text-green-200/60 text-sm">{weather ? weather.locationName : "Select Location"}</p>
            </div>
        </div>
        
        {/* Toggle Search Mode */}
        <div className="flex bg-white/10 rounded-lg p-1">
            <button onClick={() => setMode('gps')} className={`p-2 rounded-md transition ${mode === 'gps' ? 'bg-green-500 text-white' : 'text-white/50'}`}>
                <Navigation size={20} />
            </button>
            <button onClick={() => setMode('manual')} className={`p-2 rounded-md transition ${mode === 'manual' ? 'bg-green-500 text-white' : 'text-white/50'}`}>
                <Search size={20} />
            </button>
        </div>
      </div>

      {/* Manual Search Bar */}
      {mode === 'manual' && (
        <form onSubmit={handleManual} className="mb-6 flex gap-2">
            <input 
                type="text" 
                placeholder="Search city..." 
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400"
            />
            <button type="submit" className="bg-green-500 px-4 rounded-xl text-white font-bold">GO</button>
        </form>
      )}

      {error && <div className="p-4 bg-red-500/20 text-red-200 rounded-xl mb-6">{error}</div>}

      {loading && (
        <div className="h-64 flex flex-col items-center justify-center text-white/50">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading Satellite Data...
        </div>
      )}

      {!loading && weather && (
        <div className="space-y-6">
            
            {/* 1. Main Weather Card */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="relative z-10 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        {(() => {
                            const details = getWeatherDetails(weather.weather_code);
                            const Icon = details.icon;
                            return <Icon className={details.color} size={32} />;
                        })()}
                        <span className="text-xl text-white/80">{getWeatherDetails(weather.weather_code).label}</span>
                    </div>
                    <h1 className="text-7xl font-bold text-white mb-2">{Math.round(weather.temperature)}°</h1>
                    
                    {/* AI Insight Badge */}
                    <div className="inline-block px-4 py-2 bg-white/10 rounded-lg border border-white/10 backdrop-blur-md mt-2">
                        <p className="text-green-300 text-sm font-medium">🤖 AI Tip: {weather.ai_advice}</p>
                    </div>
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center min-w-[100px]">
                        <Droplets className="text-blue-400 mb-2" />
                        <span className="text-2xl font-bold text-white">{weather.humidity}%</span>
                        <span className="text-xs text-white/50 uppercase">Humidity</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center min-w-[100px]">
                        <Wind className="text-gray-400 mb-2" />
                        <span className="text-2xl font-bold text-white">{weather.wind_speed}</span>
                        <span className="text-xs text-white/50 uppercase">Wind (km/h)</span>
                    </div>
                </div>
            </div>

            {/* 2. 7-Day Forecast */}
            <h3 className="text-xl font-bold text-white pl-2">7-Day Forecast</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {weather.forecast.time.map((date, i) => {
                    if (i > 6) return null; // Limit to 7 days
                    const code = weather.forecast.weather_code[i];
                    const max = weather.forecast.temperature_2m_max[i];
                    const min = weather.forecast.temperature_2m_min[i];
                    const details = getWeatherDetails(code);
                    const Icon = details.icon;
                    
                    return (
                        <div key={i} className="glass-panel p-4 rounded-2xl flex flex-col items-center text-center border border-white/5 hover:bg-white/10 transition">
                            <span className="text-xs text-white/50 mb-2">
                                {new Date(date).toLocaleDateString('en-GB', { weekday: 'short' })}
                            </span>
                            <Icon className={`mb-3 ${details.color}`} size={24} />
                            <span className="text-lg font-bold text-white">{Math.round(max)}°</span>
                            <span className="text-xs text-white/40">{Math.round(min)}°</span>
                        </div>
                    );
                })}
            </div>
        </div>
      )}
    </div>
  );
}