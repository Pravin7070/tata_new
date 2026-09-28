import { 
  Play, Pause, RotateCcw, AlertTriangle, Car, Battery, MapPin,
  Gauge, Thermometer, Settings2, Activity, Mountain, Compass, ArrowUp, Cpu
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { BaseCard } from '../components/ui/BaseCard';

export const Simulation = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col gap-10 font-sans pb-10 h-full">
      
      {/* SECTION 1: Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[40px] font-[700] tracking-tight text-automotive-white leading-none mb-2">
            AI Digital Twin
          </h1>
          <div className="flex items-center gap-4 text-[15px] font-[400] text-automotive-muted">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-automotive-green animate-pulse shadow-[0_0_8px_#3DFF53]"></div>
              <span>System Connected</span>
            </div>
            <div className="w-px h-4 bg-automotive-border"></div>
            <span className="font-display text-automotive-white font-[600]">T+ {formatTime(time)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center justify-center gap-2 h-12 px-8 rounded-[12px] font-[600] text-[15px] transition-all shadow-lg ${
              isRunning ? 'bg-automotive-white text-automotive-background hover:bg-gray-200 shadow-automotive-white/20' 
                        : 'bg-automotive-blue text-automotive-background hover:bg-automotive-blue/90 shadow-automotive-blue/30'
            }`}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
            {isRunning ? 'Pause Simulation' : 'Start Simulation'}
          </button>
          <button 
            onClick={() => setTime(0)}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-[12px] bg-automotive-card border border-automotive-border text-automotive-white hover:bg-white/5 font-[600] text-[15px] transition-colors"
          >
            <RotateCcw size={18} /> Reset
          </button>
        </div>
      </div>

      {/* SECTION 2: Full Width Digital Twin (Hero) */}
      <section className="relative w-full h-[65vh] min-h-[500px] bg-automotive-background rounded-[12px] overflow-hidden shadow-2xl border border-automotive-border flex flex-col p-1">
        <iframe 
          src="http://localhost:5174/" 
          width="100%" 
          height="100%" 
          className="flex-1 rounded-[8px] border-none"
          title="Full Simulation Environment"
        />
        <div className="absolute bottom-6 right-6 pointer-events-none flex items-center gap-4 bg-automotive-card/80 backdrop-blur-md px-5 py-2.5 rounded-[12px] border border-automotive-border shadow-lg">
          <span className="text-[13px] font-[500] text-automotive-muted uppercase tracking-widest">Camera <span className="text-automotive-white font-[700] ml-1">Orbital</span></span>
          <div className="w-px h-4 bg-automotive-border"></div>
          <span className="text-[13px] font-[500] text-automotive-muted uppercase tracking-widest">FPS <span className="text-automotive-white font-display font-[700] ml-1">60</span></span>
        </div>
      </section>

      {/* SECTION 3: Telemetry Row */}
      <section className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-10 gap-6">
        {[
          { label: 'Speed', val: '24', unit: 'km/h', icon: Gauge, color: 'text-automotive-blue' },
          { label: 'Battery', val: '92', unit: '%', icon: Battery, color: 'text-automotive-green' },
          { label: 'Motor Temp', val: '41', unit: '°C', icon: Thermometer, color: 'text-automotive-danger' },
          { label: 'Steering', val: '12', unit: '° L', icon: Settings2, color: 'text-automotive-white' },
          { label: 'Wheel Slip', val: '3', unit: '%', icon: Activity, color: 'text-automotive-warning' },
          { label: 'GPS', val: 'Fix', unit: '3D', icon: MapPin, color: 'text-automotive-green' },
          { label: 'Terrain', val: 'Rock', unit: '', icon: Mountain, color: 'text-automotive-muted' },
          { label: 'Heading', val: '342', unit: '° N', icon: Compass, color: 'text-automotive-white' },
          { label: 'Altitude', val: '1.2', unit: 'km', icon: ArrowUp, color: 'text-automotive-white' },
          { label: 'Suspension', val: 'Adap', unit: 'tive', icon: Car, color: 'text-automotive-blue' },
        ].map((metric) => (
          <div key={metric.label} className="flex flex-col justify-center gap-3 p-4 bg-automotive-card border border-automotive-border rounded-[12px] shadow-sm items-center text-center">
            <metric.icon className={`w-5 h-5 ${metric.color}`} />
            <div className="flex flex-col">
               <p className="font-display text-[22px] font-[700] text-automotive-white leading-none tracking-tight">
                 {metric.val}<span className="text-[13px] font-sans font-[500] text-automotive-muted ml-0.5">{metric.unit}</span>
               </p>
               <span className="text-[11px] font-[600] text-automotive-muted uppercase tracking-widest mt-1">{metric.label}</span>
            </div>
          </div>
        ))}
      </section>

      {/* SECTION 4: Lower Dashboard (Controls, AI Log) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Mission Controls */}
        <BaseCard title="Mission & Override Controls" icon={Settings2}>
          <div className="flex flex-col gap-8 h-full justify-center">
             <div className="flex flex-col gap-4">
               <h3 className="text-[13px] font-[600] uppercase tracking-widest text-automotive-muted">Terrain Presets</h3>
               <div className="grid grid-cols-2 gap-4">
                 {['Rocky', 'Sand', 'Mud', 'Snow'].map((terrain) => (
                   <button key={terrain} className="py-3 px-4 rounded-[8px] bg-automotive-background border border-automotive-border hover:bg-white/5 text-[15px] font-[600] text-automotive-white transition-colors">
                     {terrain}
                   </button>
                 ))}
               </div>
             </div>

             <div className="flex flex-col gap-4">
               <h3 className="text-[13px] font-[600] uppercase tracking-widest text-automotive-muted">Emergency Intervention</h3>
               <button className="flex items-center justify-center gap-2 h-14 w-full bg-automotive-danger/10 hover:bg-automotive-danger/20 border border-automotive-danger/30 text-automotive-danger rounded-[12px] text-[16px] font-[700] transition-colors shadow-[0_0_15px_rgba(255,82,82,0.1)]">
                 <AlertTriangle className="w-5 h-5" /> TRIGGER E-STOP
               </button>
             </div>
          </div>
        </BaseCard>

        {/* AI Decision Log */}
        <BaseCard title="Operator AI Decision Log" icon={Cpu}>
          <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-4 h-[300px]">
            {[
              { time: '09:24:12', title: 'Terrain Classified', reason: 'Vision system detected 97% confidence Rock', outcome: 'Adaptive Suspension Prepared', type: 'info' },
              { time: '09:25:01', title: 'Speed Reduced', reason: 'High wheel slip probability ahead', outcome: 'Target speed 24km/h', type: 'warning' },
              { time: '09:26:45', title: 'Vehicle Action', reason: 'Navigating uneven surface', outcome: 'Active Dampening Enabled', type: 'action' },
            ].map((log, i) => (
              <div key={i} className="flex flex-col gap-2 p-4 bg-automotive-background border border-automotive-border rounded-[12px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {log.type === 'warning' && <AlertTriangle className="w-[18px] h-[18px] text-automotive-warning" />}
                    {log.type === 'info' && <Cpu className="w-[18px] h-[18px] text-automotive-blue" />}
                    {log.type === 'action' && <Car className="w-[18px] h-[18px] text-automotive-green" />}
                    <span className="text-[16px] font-[600] text-automotive-white tracking-tight">{log.title}</span>
                  </div>
                  <span className="text-[13px] font-display font-[600] text-automotive-muted">{log.time}</span>
                </div>
                <div className="flex flex-col gap-1 mt-1 border-t border-automotive-border pt-2">
                  <span className="text-[14px] font-[500] text-automotive-muted">Reason: <span className="text-automotive-white/80">{log.reason}</span></span>
                  <span className="text-[14px] font-[600] text-automotive-white">{log.outcome}</span>
                </div>
              </div>
            ))}
          </div>
        </BaseCard>

      </section>
    </div>
  );
};
