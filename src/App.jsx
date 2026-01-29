import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // --- STATE FOR LIVE DATA ---
  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState('Welcome');
  const [location, setLocation] = useState('Detecting Location...');

  // --- 1. HANDLE TIME & GREETING ---
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Format Date: "Fri, 30 Jan"
      const options = { weekday: 'short', day: 'numeric', month: 'short' };
      setCurrentDate(now.toLocaleDateString('en-GB', options));

      // Set Greeting based on hour
      const hour = now.getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 18) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
    };

    updateTime(); // Run immediately
    const timer = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // --- 2. HANDLE LOCATION (Reverse Geocoding) ---
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use OpenStreetMap (Free API) to get address
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          
          // Extract useful parts (Village, District, State)
          const addr = data.address;
          const locName = addr.village || addr.town || addr.city || addr.county || "Unknown Location";
          const stateCode = addr.state_district || addr.state || "";
          
          setLocation(`${locName}, ${stateCode}`);
        } catch (error) {
          setLocation("Location Unavailable");
        }
      }, () => {
        setLocation("Permission Denied");
      });
    } else {
      setLocation("GPS Not Supported");
    }
  }, []);

  return (
    <div className="flex min-h-screen text-white selection:bg-green-500/30">
      
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 w-full md:ml-[290px] p-4 md:p-8 pb-24 md:pb-8 transition-all duration-300">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            {/* Dynamic Greeting & User Name */}
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {greeting}, User 🌿
            </h1>
            
            {/* Dynamic Date & Location */}
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
        
        {/* 1. Dashboard Tab */}
        {activeTab === 'dashboard' && (
  <DashboardHome setActiveTab={setActiveTab} location={location} />
)}
        
        {/* 2. Other Tabs (Placeholders for now) */}
        {activeTab !== 'dashboard' && (
          <div className="glass-panel p-10 rounded-3xl text-center min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-white/50">Feature Coming Soon</h2>
            <p className="text-green-200/40 mt-2 mb-6">We are building the {activeTab} module.</p>
            <button 
              onClick={() => setActiveTab('dashboard')} 
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