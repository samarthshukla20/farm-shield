import { useState } from 'react';
import { MapPin, Sprout, Loader2, ArrowLeft, Droplets, Wind, AlertTriangle } from 'lucide-react';

export default function CropAdvisor({ setActiveTab }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const getRecommendation = () => {
    setLoading(true);
    setError(null);
    setResult(null);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          console.log("Sending coordinates:", latitude, longitude);
          
          // Send coordinates to Python Backend
          const res = await fetch("http://127.0.0.1:8000/api/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude })
          });
          
          const data = await res.json();
          console.log("Backend Response:", data); // Check your browser console (F12) for this!

          // SAFETY CHECK: Did the backend return an error?
          if (data.error) {
            setError(data.error);
          } else if (!data.crops) {
            setError("Received incomplete data from AI. Please try again.");
          } else {
            setResult(data);
          }

        } catch (err) {
            console.error(err);
            setError("Could not connect to the Brain. Is the backend running?");
        } finally {
          setLoading(false);
        }
      });
    } else {
      setError("GPS is not available on this device.");
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header with Back Button */}
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

      {/* ERROR STATE: Shows detailed error message instead of crashing */}
      {error && (
        <div className="glass-panel p-6 rounded-2xl border border-red-500/50 bg-red-500/10 mb-6 flex items-start gap-4">
            <div className="p-3 bg-red-500/20 rounded-full text-red-400">
                <AlertTriangle size={24} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-red-200">Analysis Failed</h3>
                <p className="text-red-200/60 text-sm">{error}</p>
                <button 
                    onClick={() => setError(null)}
                    className="mt-3 text-xs bg-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition text-red-300"
                >
                    Dismiss
                </button>
            </div>
        </div>
      )}

      {!result ? (
        // STATE 1: IDLE / LOADING SCREEN
        <div className="glass-panel p-8 md:p-12 rounded-3xl text-center flex flex-col items-center justify-center min-h-[500px] border border-white/10 relative overflow-hidden">
          
          {/* Animated Background Rings */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
             <div className="w-64 h-64 border border-green-400 rounded-full animate-[ping_3s_linear_infinite]"></div>
             <div className="w-96 h-96 border border-green-400 rounded-full animate-[ping_3s_linear_infinite_1s]"></div>
          </div>

          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-500/30 relative z-10">
            {loading ? (
                <Loader2 size={48} className="text-white animate-spin" />
            ) : (
                <MapPin size={48} className="text-white drop-shadow-lg" />
            )}
          </div>

          <h3 className="text-3xl font-bold mb-3 text-white">
            {loading ? "Scanning Satellite Data..." : "Analyze My Farm"}
          </h3>
          
          <p className="text-green-100/70 max-w-md mb-10 text-lg">
            {loading 
                ? "Connecting to Gemini AI to analyze soil composition and weather patterns..." 
                : "We use your GPS location to detect soil type, moisture levels, and season to suggest the perfect crops."}
          </p>

          <button 
            onClick={getRecommendation}
            disabled={loading}
            className="px-10 py-4 bg-white text-green-900 rounded-2xl font-bold text-lg hover:scale-105 hover:shadow-xl hover:shadow-white/10 transition flex items-center gap-3 disabled:opacity-70 disabled:scale-100"
          >
            {loading ? "Processing..." : "Start Analysis"}
          </button>
        </div>
      ) : (
        // STATE 2: RESULTS DISPLAY (Only renders if we have valid results)
        <div className="space-y-6">
            
            {/* 1. Soil Health Card */}
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
                    <p className="text-green-100/80 max-w-2xl text-lg leading-relaxed">
                        {result.soil_characteristics}
                    </p>
                </div>
            </div>

            {/* 2. Recommendations Header */}
            <h3 className="text-xl font-bold text-white mt-8 pl-2 flex items-center gap-2">
                <span className="text-green-400">✨</span> Top 3 Recommendations
            </h3>

            {/* 3. Crop Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {result.crops && result.crops.map((crop, i) => (
                    <div key={i} className="glass-panel p-6 rounded-3xl hover:bg-white/10 transition duration-300 group border border-white/5 hover:border-green-400/30">
                        {/* Icon Header */}
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
                        <p className="text-green-100/60 text-sm leading-relaxed border-t border-white/10 pt-4">
                            {crop.reason}
                        </p>
                    </div>
                ))}
            </div>
            
            {/* Reset Button */}
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