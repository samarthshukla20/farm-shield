import { LayoutGrid, Sprout, Bot, Siren } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'crops', label: 'My Crops', icon: Sprout },
    { id: 'bot', label: 'Sahayak Bot', icon: Bot },
  ];

  return (
    <>
      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <aside className="hidden md:flex fixed left-4 top-4 bottom-4 w-64 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl flex-col p-6 z-50">
        
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/20">
            <span className="text-2xl">🛡️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">FarmShield</h1>
            <p className="text-xs text-green-200 font-medium">AI Guard 2.0</p>
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
              </button>
            );
          })}
        </nav>

        {/* Desktop SOS */}
        <button className="mt-auto relative group overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-500 p-[1px]">
          <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition" />
          <div className="relative flex items-center justify-center gap-2 bg-red-600/90 backdrop-blur-sm py-3.5 rounded-xl border border-white/20 group-hover:bg-red-600 transition shadow-lg shadow-red-900/40">
              <Siren size={20} className="animate-pulse text-white" />
              <span className="font-bold text-white tracking-wide">SOS ALERT</span>
          </div>
        </button>
      </aside>


      {/* --- MOBILE BOTTOM BAR (Visible only on Mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#022c22]/90 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
        <div className="flex justify-around items-center p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
                  isActive ? 'text-green-400 bg-white/10' : 'text-green-100/60'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
          {/* Mobile SOS (Small) */}
          <button className="flex flex-col items-center gap-1 p-3 text-red-500 animate-pulse">
            <Siren size={24} />
            <span className="text-[10px] font-bold">SOS</span>
          </button>
        </div>
      </nav>
    </>
  );
}