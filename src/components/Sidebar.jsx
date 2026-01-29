import { LayoutGrid, Sprout, Bot, Siren } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'crops', label: 'My Crops', icon: Sprout },
    { id: 'bot', label: 'Sahayak Bot', icon: Bot },
  ];

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-64 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl flex flex-col p-6 z-50">
      
      {/* Logo Area */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/20">
          <span className="text-2xl">🛡️</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">FarmShield</h1>
          <p className="text-xs text-green-200 font-medium">AI Guard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-green-500/80 to-emerald-600/80 text-white shadow-lg shadow-green-900/20 border border-white/20' 
                  : 'text-green-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-green-200 group-hover:text-white'} />
              <span className="font-medium">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />}
            </button>
          );
        })}
      </nav>

      {/* SOS Button */}
      <button className="mt-auto relative group overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-500 p-[1px]">
        <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition" />
        <div className="relative flex items-center justify-center gap-2 bg-red-600/90 backdrop-blur-sm py-3.5 rounded-xl border border-white/20 group-hover:bg-red-600 transition shadow-lg shadow-red-900/40">
            <Siren size={20} className="animate-pulse text-white" />
            <span className="font-bold text-white tracking-wide">SOS ALERT</span>
        </div>
      </button>
    </aside>
  );
}