import { useState } from 'react';
// Added ArrowRight to this import list ↓
import { MapPin, Sprout, Loader2, ArrowLeft, Droplets, Wind, AlertTriangle, Search, Navigation, ArrowRight } from 'lucide-react';

export default function CropAdvisor({ setActiveTab }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // New State for Manual Search
  const [searchMode, setSearchMode] = useState('gps'); // 'gps' or 'manual'
  const [manualLocation, setManualLocation] = useState('');

  // 1. Function to call API (Reusable for both GPS and Manual)
  const fetchRecommendations = async (payload) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await fetch("http://127.0.0.1:8000/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.error) setError(data.error);
      else if (!data.crops) setError("Received incomplete data. Try again.");
      else setResult(data);

    } catch (err) {
        setError("Could not connect to the Brain. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle GPS Click
  const handleGpsSearch = () => {
    if ("geolocation" in navigator) {
      setLoading(true); 
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchRecommendations({ latitude, longitude });
        },
        () => {
          setError("GPS Permission Denied. Try Manual Search.");
          setLoading(false);
        }
      );
    } else {
      setError("GPS not supported.");
    }
  };

  // 3. Handle Manual Search Click
  const handleManualSearch = (e) => {
    e.preventDefault(); 
    if (!manualLocation.trim()) return;
    fetchRecommendations({ location_name: manualLocation });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
            onClick={() => setActiveTab('dashboard')} 
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition backdrop-blur-md"
        >
            <ArrowLeft className="text-white" />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-white">Smart Crop Advisor</h2>
            <p className="text-green-200/60 text-sm">AI-Powered Soil Analysis</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-panel p-4 rounded-xl border border-red-500/50 bg-red-500/10 mb-6 flex items-center gap-3">
            <AlertTriangle className="text-red-400 shrink-0" />
            <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {!result ? (
        // --- INPUT SCREEN ---
        <div className="glass-panel p-8 md:p-12 rounded-3xl min-h-[500px] border border-white/10 relative overflow-hidden flex flex-col items-center justify-center">
          
          {/* Animated Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
             <div className="w-64 h-64 border border-green-400 rounded-full animate-[ping_3s_linear_infinite]"></div>
          </div>

          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl relative z-10">
            {loading ? <Loader2 size={40} className="text-white animate-spin" /> : <Sprout size={40} className="text-white" />}
          </div>

          <h3 className="text-3xl font-bold mb-2 text-white text-center">
            {loading ? "Analyzing Soil Data..." : "Analyze Your Farm"}
          </h3>
          <p className="text-green-100/60 mb-8 text-center max-w-sm">
            Find the best crops for your specific soil type and season.
          </p>

          {/* Toggle Tabs */}
          <div className="flex p-1 bg-white/10 rounded-xl mb-6 w-full max-w-xs relative z-10">
            <button 
                onClick={() => setSearchMode('gps')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${searchMode === 'gps' ? 'bg-green-500 text-white shadow-lg' : 'text-green-200 hover:text-white'}`}
            >
                <Navigation size={14} /> GPS
            </button>
            <button 
                onClick={() => setSearchMode('manual')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${searchMode === 'manual' ? 'bg-green-500 text-white shadow-lg' : 'text-green-200 hover:text-white'}`}
            >
                <Search size={14} /> Manual
            </button>
          </div>

          {/* INPUT FORMS */}
          {searchMode === 'gps' ? (
             <button 
                onClick={handleGpsSearch}
                disabled={loading}
                className="w-full max-w-xs py-3.5 bg-white text-green-900 rounded-xl font-bold hover:scale-105 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
             >
                <MapPin size={18} /> Use My Current Location
             </button>
          ) : (
             <form onSubmit={handleManualSearch} className="w-full max-w-xs flex gap-2">
                <input 
                    type="text" 
                    placeholder="Enter Village or City..." 
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-green-400 transition"
                    autoFocus
                />
                <button 
                    type="submit"
                    disabled={loading || !manualLocation}
                    className="bg-green-500 hover:bg-green-400 text-white p-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowRight size={20} />
                </button>
             </form>
          )}

        </div>
      ) : (
        // --- RESULTS SCREEN ---
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            {/* Soil Health Card */}
            <div className="glass-panel p-6 rounded-3xl border border-green-400/30 bg-green-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><Sprout size={100} /></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full bg-green-400/20 text-green-300 text-xs font-bold border border-green-400/20">
                            CONFIDENCE: 92%
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold">
                            {result.location}
                        </span>
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-2">{result.soil_type}</h3>
                    <p className="text-green-100/80 max-w-2xl text-lg leading-relaxed">{result.soil_characteristics}</p>
                </div>
            </div>

            {/* Recommendations */}
            <h3 className="text-xl font-bold text-white mt-8 pl-2 flex items-center gap-2">
                <span className="text-green-400">✨</span> Top 3 Recommendations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {result.crops && result.crops.map((crop, i) => (
                    <div key={i} className="glass-panel p-6 rounded-3xl hover:bg-white/10 transition duration-300 group border border-white/5 hover:border-green-400/30">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl flex items-center justify-center border border-yellow-400/20 group-hover:scale-110 transition">
                                <span className="text-3xl">🌾</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-green-200/50 font-bold uppercase tracking-wider">Water</span>
                                <div className="flex items-center gap-1 text-blue-300 text-sm font-semibold">
                                    <Droplets size={14} /> {crop.water_need}
                                </div>
                            </div>
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-3">{crop.name}</h4>
                        <p className="text-green-100/60 text-sm leading-relaxed border-t border-white/10 pt-4">{crop.reason}</p>
                    </div>
                ))}
            </div>
            
            <div className="text-center pt-8">
                <button 
                    onClick={() => setResult(null)} 
                    className="text-green-400 hover:text-white transition text-sm font-semibold flex items-center justify-center gap-2 mx-auto"
                >
                    <Wind size={16} /> Scan a different field
                </button>
            </div>
        </div>
      )}
    </div>
  );
}