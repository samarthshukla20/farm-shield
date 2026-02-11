import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, MapPin, Search, Filter, IndianRupee } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function MandiRates({ setActiveTab }) {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState("Madhya Pradesh");
  const [searchQuery, setSearchQuery] = useState("");

  const states = ["Madhya Pradesh", "Maharashtra", "Punjab", "Uttar Pradesh"];

  useEffect(() => {
    fetchRates();
  }, [selectedState]);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mandi?state=${selectedState}`);
      const data = await res.json();
      setRates(data);
    } catch (err) {
      console.error("Failed to fetch rates");
    } finally {
      setLoading(false);
    }
  };

  // Filter based on search
  const filteredRates = rates.filter(item => 
    item.commodity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in fade-in zoom-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
            onClick={() => setActiveTab('dashboard')} 
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition backdrop-blur-md"
        >
            <ArrowLeft className="text-white" />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
               Mandi Bhav <IndianRupee size={20} className="text-yellow-400" />
            </h2>
            <p className="text-green-200/60 text-sm">Live Market Rates</p>
        </div>
      </div>

      {/* Controls: State Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* State Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:w-2/3">
            {states.map((state) => (
                <button
                    key={state}
                    onClick={() => setSelectedState(state)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition ${
                        selectedState === state 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                >
                    {state}
                </button>
            ))}
        </div>

        {/* Search Bar */}
        <div className="relative md:w-1/3">
            <Search className="absolute left-3 top-3 text-white/30" size={18} />
            <input 
                type="text" 
                placeholder="Search crop..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-green-400 transition"
            />
        </div>
      </div>

      {/* Rates Grid */}
      {loading ? (
        <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/50">Fetching Live Prices...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
            {filteredRates.length > 0 ? filteredRates.map((item, i) => (
                <div key={i} className="glass-panel p-5 rounded-2xl border border-white/5 hover:bg-white/5 transition group relative overflow-hidden">
                    
                    {/* Trend Banner */}
                    <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1 ${
                        item.trend === 'up' ? 'bg-green-500/20 text-green-400' : 
                        item.trend === 'down' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                        {item.trend === 'up' && <TrendingUp size={14} />}
                        {item.trend === 'down' && <TrendingDown size={14} />}
                        {item.trend === 'stable' && <Minus size={14} />}
                        {item.trend === 'up' ? 'RISING' : item.trend === 'down' ? 'FALLING' : 'STABLE'}
                    </div>

                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-white">{item.commodity}</h3>
                        <div className="flex items-center gap-1 text-white/50 text-xs mt-1">
                            <MapPin size={12} /> {item.market}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                        <div className="text-center">
                            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Min Price</p>
                            <p className="text-white font-medium">₹{item.min_price}</p>
                        </div>
                        <div className="text-center border-l border-white/10 bg-white/5 rounded-lg mx-1 py-1">
                            <p className="text-green-400/80 text-[10px] uppercase tracking-wider mb-0 font-bold">Avg Price</p>
                            <p className="text-green-400 font-bold text-xl">₹{item.price}</p>
                        </div>
                        <div className="text-center border-l border-white/10">
                            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Max Price</p>
                            <p className="text-white font-medium">₹{item.max_price}</p>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="col-span-full text-center py-10 text-white/30">
                    No crops found matching "{searchQuery}"
                </div>
            )}
        </div>
      )}
    </div>
  );
}