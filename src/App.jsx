import { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex min-h-screen text-white selection:bg-green-500/30">
      
      {/* Responsive Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      {/* Added: 'pb-24' for mobile bottom bar, 'md:ml-[290px]' for desktop sidebar */}
      <main className="flex-1 w-full md:ml-[290px] p-4 md:p-8 pb-24 md:pb-8 transition-all duration-300">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome, User 🌿</h1>
            <p className="text-green-200/80 text-sm">Sat, 26 Jan • Good Morning</p>
          </div>
          
          <button className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition self-end md:self-auto">
            <span>🌐</span>
            <span className="font-semibold text-sm">English</span>
          </button>
        </header>

        {/* Content Views */}
        {activeTab === 'dashboard' && <DashboardHome setActiveTab={setActiveTab} />}
        
        {/* Placeholder for other tabs */}
        {activeTab !== 'dashboard' && (
          <div className="glass-panel p-10 rounded-3xl text-center min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-white/50">Feature Coming Soon</h2>
            <p className="text-green-200/40 mt-2">We are building the {activeTab} module.</p>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="mt-6 px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition text-sm font-medium"
            >
              Go Back Home
            </button>
          </div>
        )}

      </main>
    </div>
  );
}