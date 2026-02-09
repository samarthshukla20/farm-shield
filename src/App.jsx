import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import CropAdvisor from './components/CropAdvisor';
import WeatherStation from './components/WeatherStation';
import { API_BASE_URL } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // --- STATE FOR LIVE DATA (Restored) ---
  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState('Welcome');
  const [location, setLocation] = useState('Detecting Location...');

  // --- NEW: Global Weather State (The Fix for Reloading) ---
  const [globalWeather, setGlobalWeather] = useState({
    code: 0,       // Default to Sun
    loading: true, // Start loading
    fetched: false // Track if we already have data
  });

  // --- 1. ENABLE BROWSER BACK BUTTON (Hash Routing) ---
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setActiveTab(hash);
      else setActiveTab('dashboard');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  // --- 2. HANDLE TIME & GREETING ---
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'short', day: 'numeric', month: 'short' };
      setCurrentDate(now.toLocaleDateString('en-GB', options));
      const hour = now.getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 18) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // --- 3. HANDLE LOCATION & FETCH WEATHER ONCE ---
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        // A. Get Address Name (Nominatim)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const addr = data.address;
          const locName = addr.village || addr.town || addr.city || addr.county || "Unknown Location";
          const stateCode = addr.state_district || addr.state || "";
          setLocation(`${locName}, ${stateCode}`);
        } catch (error) {
          setLocation("Location Unavailable");
        }

        // B. Fetch Weather Once (New Logic)
        if (!globalWeather.fetched) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/weather`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ latitude, longitude })
                });
                const data = await res.json();
                
                if (data.weather_code !== undefined) {
                setGlobalWeather({ 
                    code: data.weather_code, 
                    loading: false, 
                    fetched: true 
                });
                }
            } catch (err) {
                console.error("Global weather fetch failed:", err);
                setGlobalWeather(prev => ({ ...prev, loading: false }));
            }
        }

      }, () => {
          setLocation("Permission Denied");
          setGlobalWeather(prev => ({ ...prev, loading: false }));
      });
    } else {
      setLocation("GPS Not Supported");
      setGlobalWeather(prev => ({ ...prev, loading: false }));
    }
  }, [globalWeather.fetched]);

  return (
    <div className="flex min-h-screen text-white selection:bg-green-500/30">
      
      {/* Restored Original Sidebar Layout 
          (This fixes the UI overlap issue)
      */}
      <Sidebar activeTab={activeTab} setActiveTab={navigate} />

      <main className="flex-1 w-full md:ml-[290px] p-4 md:p-8 pb-24 md:pb-8 transition-all duration-300">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {greeting}, User 🌿
            </h1>
            <div className="flex items-center gap-2 text-green-200/80 text-sm font-medium">
              <span>{currentDate}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {location}
              </span>
            </div>
          </div>
          
          <button className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition self-end md:self-auto">
            <span>🌐</span>
            <span className="font-semibold text-sm">English</span>
          </button>
        </header>

        {/* --- VIEWS --- */}
        {activeTab === 'dashboard' && (
            <DashboardHome 
                setActiveTab={navigate} 
                location={location}
                // PASSING THE GLOBAL WEATHER STATE ↓
                weatherCode={globalWeather.code}
                weatherLoading={globalWeather.loading}
            />
        )}
        
        {activeTab === 'crops' && <CropAdvisor setActiveTab={navigate} />}

        {activeTab === 'weather' && <WeatherStation setActiveTab={navigate} />}
        
        {/* Placeholder for other tabs */}
        {activeTab !== 'dashboard' && activeTab !== 'crops' && activeTab !== 'weather' && (
          <div className="glass-panel p-10 rounded-3xl text-center min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-white/50">Feature Coming Soon</h2>
            <p className="text-green-200/40 mt-2 mb-6">We are building the {activeTab} module.</p>
            <button 
              onClick={() => navigate('dashboard')} 
              className="px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition text-sm font-medium"
            >
              Go Back Home
            </button>
          </div>
        )}

      </main>
    </div>
  );
}