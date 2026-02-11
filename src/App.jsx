import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import CropAdvisor from './components/CropAdvisor';
import WeatherStation from './components/WeatherStation';
import PestScanner from './components/PestScanner';
import SahayakBot from './components/SahayakBot';
import MandiRates from './components/MandiRates';
import { useTranslation } from 'react-i18next'; // 1. Import

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { t, i18n } = useTranslation(); // 2. Initialize Hook

  // --- STATE FOR LIVE DATA ---
  const [currentDate, setCurrentDate] = useState('');
  const [location, setLocation] = useState(t('header.detecting')); // Use translation for initial state

  // --- NEW: GLOBAL WEATHER STATE (Persists across tabs) ---
  const [weatherState, setWeatherState] = useState({
    data: null,
    loading: false,
    error: null
  });

  // --- LANGUAGE TOGGLE FUNCTION ---
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  // --- 1. ENABLE BROWSER BACK BUTTON ---
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

  // --- 2. HANDLE TIME ---
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format date based on language (optional refinement)
      const options = { weekday: 'short', day: 'numeric', month: 'short' };
      setCurrentDate(now.toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-GB', options));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, [i18n.language]); // Update date format when language changes

  // --- 3. HANDLE LOCATION ---
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
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
      }, () => setLocation("Permission Denied"));
    } else {
      setLocation("GPS Not Supported");
    }
  }, []);

  return (
    <div className="flex min-h-screen text-white selection:bg-green-500/30">
      
      <Sidebar activeTab={activeTab} setActiveTab={navigate} />

      <main className="flex-1 w-full md:ml-[290px] p-4 md:p-8 pb-24 md:pb-8 transition-all duration-300">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {t('greeting')}, User 🌿
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
          
          <button 
            onClick={toggleLanguage}
            className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition self-end md:self-auto cursor-pointer border border-white/10"
          >
            <span>🌐</span>
            <span className="font-semibold text-sm">
              {i18n.language === 'en' ? "English" : "हिंदी"}
            </span>
          </button>
        </header>

        {/* --- VIEWS --- */}
        {activeTab === 'dashboard' && <DashboardHome setActiveTab={navigate} location={location} />}
        
        {activeTab === 'crops' && <CropAdvisor setActiveTab={navigate} />}

        {activeTab === 'pest' && <PestScanner setActiveTab={navigate} />}

        {activeTab === 'bot' && <SahayakBot setActiveTab={navigate} />}

        {activeTab === 'mandi' && <MandiRates setActiveTab={navigate} />}

        {/* --- PASS GLOBAL STATE TO WEATHER STATION --- */}
        {activeTab === 'weather' && (
          <WeatherStation 
            setActiveTab={navigate} 
            weatherState={weatherState} 
            setWeatherState={setWeatherState} 
          />
        )}
        
        {/* Fallback for unknown tabs */}
        {activeTab !== 'dashboard' && activeTab !== 'crops' && activeTab!=='pest' && activeTab!=='bot' && activeTab!=='mandi' && activeTab !== 'weather' && (
          <div className="glass-panel p-10 rounded-3xl text-center min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-white/50">Feature Coming Soon</h2>
            <p className="text-green-200/40 mt-2 mb-6">We are building the {activeTab} module.</p>
            <button onClick={() => navigate('dashboard')} className="px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition text-sm font-medium">
              Go Back Home
            </button>
          </div>
        )}

      </main>
    </div>
  );
}