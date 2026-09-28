import { useState, useEffect } from 'react';
import { Menu, Bell, User, MapPin, Wifi, Activity, Battery, Clock } from 'lucide-react';

export interface NavbarProps {
  toggleSidebar: () => void;
  brandName?: string;
  brandInitial?: string;
  systemStatus?: string;
  isSystemNominal?: boolean;
}

export const Navbar = ({ 
  toggleSidebar, 
  brandName = "Innovent", 
  brandInitial = "T", 
  systemStatus = "System Nominal", 
  isSystemNominal = true 
}: NavbarProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-[48px] bg-automotive-background/95 backdrop-blur-md border-b border-automotive-border z-20 flex items-center justify-between px-4 sm:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="text-automotive-muted hover:text-automotive-blue transition-colors md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-automotive-blue to-automotive-card flex items-center justify-center shadow-[0_0_10px_rgba(0,200,255,0.3)] border border-automotive-blue/30">
            <span className="font-extrabold text-[15px] text-automotive-white">{brandInitial}</span>
          </div>
          <span className="text-automotive-white font-[700] tracking-[0.2em] uppercase text-[15px] hidden sm:block">{brandName}</span>
        </div>
      </div>

      {/* Center HUD Indicators */}
      <div className="hidden lg:flex items-center gap-6 text-[13px] font-[500] text-automotive-muted h-full">
        <div className="flex items-center gap-2" title="GPS Status">
          <MapPin className="w-3.5 h-3.5 text-automotive-blue" />
          <span className="font-display">3D FIX</span>
        </div>
        <div className="w-px h-4 bg-automotive-border"></div>
        <div className="flex items-center gap-2" title="Network">
          <Wifi className="w-3.5 h-3.5 text-automotive-green" />
          <span className="font-display">5G</span>
        </div>
        <div className="w-px h-4 bg-automotive-border"></div>
        <div className="flex items-center gap-2" title="Latency">
          <Activity className="w-3.5 h-3.5 text-automotive-green" />
          <span className="font-display">12ms</span>
        </div>
        <div className="w-px h-4 bg-automotive-border"></div>
        <div className="flex items-center gap-2" title="Battery">
          <Battery className="w-3.5 h-3.5 text-automotive-green" />
          <span className="font-display">98%</span>
        </div>
        <div className="w-px h-4 bg-automotive-border"></div>
        <div className="flex items-center gap-2" title="System Time">
          <Clock className="w-3.5 h-3.5 text-automotive-blue" />
          <span className="font-display">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 border border-automotive-border px-3 py-1 rounded-[12px] bg-automotive-card">
           <span className={`w-2 h-2 rounded-full ${isSystemNominal ? 'bg-automotive-green animate-pulse shadow-[0_0_8px_#3DFF53]' : 'bg-automotive-danger animate-pulse shadow-[0_0_8px_#FF5252]'}`}></span>
           <span className={`text-[13px] font-[600] tracking-wider ${isSystemNominal ? 'text-automotive-green' : 'text-automotive-danger'}`}>{systemStatus}</span>
        </div>

        <button className="relative text-automotive-muted hover:text-automotive-white transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-automotive-blue border-2 border-automotive-background rounded-full"></span>
        </button>
        <button className="flex items-center gap-2 text-automotive-muted hover:text-automotive-white transition-colors">
          <div className="w-[32px] h-[32px] rounded-full bg-automotive-card border border-automotive-border flex items-center justify-center overflow-hidden">
            <User className="w-[18px] h-[18px]" />
          </div>
        </button>
      </div>
    </header>
  );
};
