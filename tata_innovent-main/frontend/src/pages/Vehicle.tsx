import { useEffect, useState, useRef } from 'react';
import { BaseCard } from '../components/ui/BaseCard';
import { 
  HeartPulse, Battery, Zap, Car, ShieldCheck, Activity, Radio, Power, Info, Wrench, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { StatusRow } from '../components/vehicle/StatusRow';
import { TireCard } from '../components/vehicle/TireCard';
import { SensorCard } from '../components/vehicle/SensorCard';

export const Vehicle = () => {
  const [, setTelemetry] = useState<any>({
    battery: { charge: '94%', health: '99%', temp: '32°C', voltage: '412.5 V', current: '15.2 A', status: 'DISCHARGING' },
    motor: { status: 'NOMINAL', rpm: '1,250', temp: '45°C', load: '18%', efficiency: '92%', cooling: 'ACTIVE' }
  });
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:8000/live');
    wsRef.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'telemetry') {
          setTelemetry((prev: any) => ({
            ...prev,
          }));
        }
      } catch (err) {}
    };
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
  <div className="flex flex-col gap-10 font-sans pb-10">
    <div>
      <h1 className="text-[40px] font-[700] text-automotive-white tracking-tight leading-none mb-2">
        Hardware Diagnostics
      </h1>
      <p className="text-[15px] font-[400] text-automotive-muted">Platform Systems & Telemetry Monitoring</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* 1. Header Row (Core Status) */}
      <BaseCard title="Vehicle Readiness" icon={HeartPulse} className="lg:col-span-2">
        <div className="flex items-center justify-between h-full gap-6 mt-2">
          <div className="flex flex-col items-center gap-4 w-1/3">
            <div className="relative w-32 h-32 rounded-full border-[8px] border-automotive-background flex items-center justify-center shadow-[0_0_20px_rgba(61,255,83,0.15)]">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="42%" className="stroke-automotive-border" strokeWidth="8" fill="none" />
                <circle cx="50%" cy="50%" r="42%" className="stroke-automotive-green" strokeWidth="8" fill="none" strokeDasharray="264" strokeDashoffset="5.28" strokeLinecap="round" />
              </svg>
              <div className="text-center">
                <span className="text-[26px] font-display font-[700] text-automotive-white">98%</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 bg-automotive-green/10 border border-automotive-green/20 py-1.5 px-4 rounded-full">
               <div className="w-2.5 h-2.5 rounded-full bg-automotive-green shadow-[0_0_8px_#3DFF53] animate-pulse"></div>
               <span className="text-[13px] font-[600] text-automotive-green tracking-wider uppercase">Mission Ready</span>
            </div>
          </div>
          
          <div className="w-2/3 flex flex-col justify-center gap-4 border-l border-automotive-border pl-8">
             <div className="flex items-center justify-between">
                <span className="text-automotive-muted uppercase text-[13px] tracking-wider font-[600]">AI Systems</span>
                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-automotive-green" /><span className="text-[14px] font-[600] text-automotive-white">Healthy</span></div>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-automotive-muted uppercase text-[13px] tracking-wider font-[600]">Vehicle Systems</span>
                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-automotive-green" /><span className="text-[14px] font-[600] text-automotive-white">Healthy</span></div>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-automotive-muted uppercase text-[13px] tracking-wider font-[600]">Sensors & Cameras</span>
                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-automotive-green" /><span className="text-[14px] font-[600] text-automotive-white">Healthy</span></div>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-automotive-muted uppercase text-[13px] tracking-wider font-[600]">Communication</span>
                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-automotive-green" /><span className="text-[14px] font-[600] text-automotive-white">Healthy</span></div>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-automotive-muted uppercase text-[13px] tracking-wider font-[600]">Power Dynamics</span>
                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-automotive-green" /><span className="text-[14px] font-[600] text-automotive-white">Healthy</span></div>
             </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Vehicle Information" icon={Info} className="lg:col-span-1">
         <div className="flex flex-col gap-3 h-full justify-center">
            <StatusRow label="Model" value="TATA_4X4_PROTO" />
            <StatusRow label="VIN" value="TT294857392019A" />
            <StatusRow label="Firmware" value="v2.4.1-stable" valueClass="text-automotive-blue font-mono" />
            <StatusRow label="Software" value="v4.0.0-rc2" valueClass="text-automotive-blue font-mono" />
            <StatusRow label="Odometer" value="12,450 km" />
            <StatusRow label="Drive Mode" value="CRAWL" valueClass="text-automotive-white bg-automotive-blue/20 px-2 py-0.5 rounded text-[13px] font-[600]" isLast />
         </div>
      </BaseCard>

      <BaseCard title="Maintenance Status" icon={Wrench} className="lg:col-span-1">
         <div className="flex flex-col gap-3 h-full justify-center">
            <StatusRow label="Next Service" value="15,000 km" />
            <StatusRow label="Tire Rotation" value="2,000km left" valueClass="text-automotive-green font-mono" />
            <StatusRow label="Brake Inspect" value="OK" valueClass="text-automotive-green font-mono" />
            <StatusRow label="Battery Inspect" value="OK" valueClass="text-automotive-green font-mono" />
            <StatusRow label="Coolant Status" value="OPTIMAL" valueClass="text-automotive-green font-mono" isLast />
         </div>
      </BaseCard>

      {/* 2. Powertrain & Energy Row */}
      <BaseCard title="Battery Health" icon={Battery} className="lg:col-span-2">
         <div className="grid grid-cols-3 gap-6 h-full content-center text-center mt-2">
            <div className="bg-automotive-background p-4 rounded-[8px] border border-automotive-border flex flex-col gap-2 justify-center">
              <span className="text-[13px] text-automotive-muted font-[400]">State of Charge</span>
              <span className="text-[26px] font-display font-[700] text-automotive-green">94%</span>
            </div>
            <div className="bg-automotive-background p-4 rounded-[8px] border border-automotive-border flex flex-col gap-2 justify-center">
              <span className="text-[13px] text-automotive-muted font-[400]">State of Health</span>
              <span className="text-[26px] font-display font-[700] text-automotive-white">99%</span>
            </div>
            <div className="bg-automotive-background p-4 rounded-[8px] border border-automotive-border flex flex-col gap-2 justify-center">
              <span className="text-[13px] text-automotive-muted font-[400]">Temperature</span>
              <span className="text-[26px] font-display font-[700] text-automotive-white">32°C</span>
            </div>
            <div className="flex justify-between items-center border-t border-automotive-border pt-4 col-span-3">
               <div className="flex items-center gap-2 text-[15px]"><span className="text-automotive-muted font-[400]">Voltage:</span><span className="font-display font-[600] text-automotive-white">412.5 V</span></div>
               <div className="flex items-center gap-2 text-[15px]"><span className="text-automotive-muted font-[400]">Current:</span><span className="font-display font-[600] text-automotive-white">15.2 A</span></div>
               <div className="flex items-center gap-2 text-[15px]"><span className="text-automotive-muted font-[400]">Status:</span><span className="font-[600] text-automotive-blue">DISCHARGING</span></div>
            </div>
         </div>
      </BaseCard>

      <BaseCard title="Motor Health" icon={Zap} className="lg:col-span-1">
         <div className="flex flex-col gap-3 h-full justify-center mt-2">
            <StatusRow label="Status" value="NOMINAL" valueClass="text-automotive-green font-[600]" />
            <StatusRow label="RPM" value="1,250" />
            <StatusRow label="Temperature" value="45°C" />
            <StatusRow label="Load" value="18%" />
            <StatusRow label="Efficiency" value="92%" valueClass="text-automotive-blue font-[600]" />
            <StatusRow label="Cooling Status" value="ACTIVE" valueClass="text-automotive-green font-[600]" isLast />
         </div>
      </BaseCard>

      <BaseCard title="Electrical System" icon={Power} className="lg:col-span-1">
         <div className="flex flex-col gap-3 h-full justify-center mt-2">
            <StatusRow label="HV System" value="OK" valueClass="text-automotive-green font-[600]" />
            <StatusRow label="12V System" value="13.8V OK" valueClass="text-automotive-green font-[600]" />
            <StatusRow label="Fuse Status" value="ALL PASS" valueClass="text-automotive-green font-[600]" />
            <StatusRow label="CAN Comm" value="NOMINAL" valueClass="text-automotive-green font-[600]" />
            <StatusRow label="Power Dist" value="BALANCED" valueClass="text-automotive-green font-[600]" isLast />
         </div>
      </BaseCard>

      {/* 3. Chassis & Dynamics Row */}
      <BaseCard title="Tire Health" icon={Car} className="lg:col-span-2">
         <div className="grid grid-cols-2 gap-4 h-full content-center mt-2">
            {[
              { id: 'FL', press: '34 psi', temp: '28°C', cond: 'GOOD', wear: '15%' },
              { id: 'FR', press: '34 psi', temp: '28°C', cond: 'GOOD', wear: '14%' },
              { id: 'RL', press: '35 psi', temp: '29°C', cond: 'GOOD', wear: '18%' },
              { id: 'RR', press: '35 psi', temp: '29°C', cond: 'GOOD', wear: '18%' }
            ].map(tire => (
              <TireCard key={tire.id} {...tire} />
            ))}
         </div>
      </BaseCard>

      <BaseCard title="Suspension Health" icon={Activity} className="lg:col-span-1">
         <div className="flex flex-col gap-3 h-full justify-center mt-2">
            <StatusRow label="Status" value="NOMINAL" valueClass="text-automotive-green font-[600]" />
            <StatusRow label="Clearance" value="280 mm" />
            <div className="grid grid-cols-2 gap-4 mt-2">
               <div className="bg-automotive-background p-3 rounded-[8px] text-center border border-automotive-border">
                 <span className="block text-automotive-muted text-[13px] font-[400] mb-1">FL/FR Travel</span>
                 <span className="font-display font-[600] text-automotive-white text-[15px]">65% / 60%</span>
               </div>
               <div className="bg-automotive-background p-3 rounded-[8px] text-center border border-automotive-border">
                 <span className="block text-automotive-muted text-[13px] font-[400] mb-1">RL/RR Travel</span>
                 <span className="font-display font-[600] text-automotive-white text-[15px]">85% / 90%</span>
               </div>
            </div>
            <div className="w-full bg-automotive-blue/10 border border-automotive-blue/20 p-3 rounded-[8px] text-center mt-2">
               <span className="text-automotive-blue font-[600] text-[13px] tracking-widest uppercase">Active Damping OK</span>
            </div>
         </div>
      </BaseCard>

      <BaseCard title="Brake System" icon={ShieldCheck} className="lg:col-span-1">
         <div className="flex flex-col gap-3 h-full justify-center mt-2">
            <StatusRow label="Pad Wear" value="85% Remaining" />
            <StatusRow label="Brake Fluid" value="OPTIMAL" valueClass="text-automotive-green font-[600]" />
            <StatusRow label="ABS Status" value="READY" valueClass="text-automotive-green font-[600]" />
            <StatusRow label="Avg Temp" value="82°C" />
            <StatusRow label="Parking Brake" value="RELEASED" valueClass="text-automotive-muted font-[600]" isLast />
         </div>
      </BaseCard>

      {/* 4. Sensor & Diagnostics Row */}
      <BaseCard title="Sensor Health" icon={Radio} className="lg:col-span-2">
         <div className="grid grid-cols-4 gap-4 h-full items-center mt-2">
           {[
             { name: 'GPS Module', status: 'green' },
             { name: 'IMU Center', status: 'green' },
             { name: 'Wheel Enc.', status: 'green' },
             { name: 'Front LiDAR', status: 'green' },
             { name: 'Rear Radar', status: 'green' },
             { name: 'CAN Bus', status: 'green' },
             { name: 'Front Cam', status: 'green' },
             { name: 'Rear Cam', status: 'green' },
           ].map((s) => (
              <SensorCard key={s.name} {...s} />
           ))}
         </div>
      </BaseCard>

      <BaseCard title="Diagnostic Messages" icon={AlertTriangle} className="lg:col-span-2">
         <div className="grid grid-cols-2 gap-6 h-full items-start mt-2">
           <div className="flex h-full items-center justify-center bg-automotive-background rounded-[8px] border border-automotive-border p-6">
              <div className="text-center flex flex-col gap-2 items-center">
                 <div className="w-14 h-14 bg-automotive-green/10 rounded-full flex items-center justify-center mb-1">
                   <ShieldCheck size={28} className="text-automotive-green" />
                 </div>
                 <span className="text-automotive-green font-[700] tracking-widest uppercase text-[14px]">No Active Faults</span>
                 <span className="text-[13px] font-[400] text-automotive-muted">All systems operating normally.</span>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-2 space-y-2 h-[160px] custom-scrollbar">
             {[
                { time: '14:02:11', sys: 'HV_BATTERY', test: 'Cell Voltage Balance', res: 'PASS' },
                { time: '14:00:45', sys: 'POWERTRAIN', test: 'Motor Insulation Test', res: 'PASS' },
                { time: '13:58:20', sys: 'BRAKES', test: 'Hydraulic Pressure Check', res: 'PASS' },
                { time: '13:55:10', sys: 'SENSORS', test: 'LiDAR Calibration', res: 'FAIL' },
             ].map((log, i) => (
               <div key={i} className="flex gap-3 p-2 bg-automotive-background rounded-[8px] border border-automotive-border items-center">
                 <span className="text-automotive-muted w-16 shrink-0 font-display text-[12px]">{log.time}</span>
                 <span className="w-24 shrink-0 text-automotive-blue text-[12px] font-[600]">{log.sys}</span>
                 <span className="text-automotive-white truncate flex-1 text-[13px] font-[400]">{log.test}</span>
                 <span className={`font-[700] text-[12px] tracking-wider text-right ${
                   log.res === 'PASS' ? 'text-automotive-green' : 'text-automotive-danger'
                 }`}>{log.res}</span>
               </div>
             ))}
           </div>
         </div>
      </BaseCard>

    </div>
  </div>
  );
};
