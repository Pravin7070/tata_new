import { useState } from 'react';
import { BaseCard } from '../components/ui/BaseCard';
import { 
  Brain, Car, Activity, MonitorPlay, ShieldAlert, Flag, Globe, Info, 
  CheckCircle2, XCircle, AlertTriangle 
} from 'lucide-react';
import { Toast } from '../components/ui/Toast';

const Toggle = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex justify-between items-center py-3 border-b border-automotive-border last:border-0">
    <span className="text-[14px] text-automotive-white font-[500]">{label}</span>
    <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors shadow-inner ${active ? 'bg-automotive-blue shadow-[0_0_10px_rgba(0,200,255,0.3)]' : 'bg-automotive-background border border-automotive-border'}`}>
      <div className={`absolute top-[2px] w-5 h-5 bg-white rounded-full transition-transform ${active ? 'right-[2px]' : 'left-[2px]'}`}></div>
    </div>
  </div>
);

const ValueRow = ({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) => (
  <div className="flex justify-between items-center py-3 border-b border-automotive-border last:border-0">
    <span className="text-[12px] text-automotive-muted uppercase font-[600] tracking-widest">{label}</span>
    <span className={`text-[14px] font-mono ${highlight ? 'text-automotive-blue font-[700]' : 'text-automotive-white font-[500]'}`}>{value}</span>
  </div>
);

const SensorRow = ({ label, status }: { label: string, status: 'Connected' | 'Disconnected' | 'Healthy' | 'Warning' }) => {
  let color = 'text-automotive-muted';
  let Icon = CheckCircle2;
  
  if (status === 'Connected' || status === 'Healthy') { 
    color = 'text-automotive-green'; 
    Icon = CheckCircle2; 
  }
  if (status === 'Disconnected') { 
    color = 'text-automotive-danger'; 
    Icon = XCircle; 
  }
  if (status === 'Warning') { 
    color = 'text-automotive-warning'; 
    Icon = AlertTriangle; 
  }

  return (
    <div className="flex justify-between items-center py-3 border-b border-automotive-border last:border-0">
      <span className="text-[14px] text-automotive-white font-[500]">{label}</span>
      <div className={`flex items-center gap-1.5 ${color} text-[12px] font-[700] uppercase tracking-wider`}>
        <Icon className="w-4 h-4" />
        {status}
      </div>
    </div>
  );
};

export const Settings = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  return (
    <div className="flex flex-col gap-10 font-sans pb-10 h-full max-w-screen-2xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-[40px] font-[700] tracking-tight text-automotive-white leading-none mb-2">
          Configuration Center
        </h1>
        <p className="text-[15px] font-[400] text-automotive-muted">
          User profiles and advanced system parameters for the TATA Innovent fleet.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* Section: User-Facing Preferences */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
             <h2 className="text-[18px] font-[600] text-automotive-white uppercase tracking-wider">Mission Preferences</h2>
             <div className="flex-1 h-px bg-automotive-border"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
            <BaseCard title="Vehicle Configuration" icon={Car}>
              <div className="flex flex-col h-full justify-between mt-2">
                <ValueRow label="Vehicle Name" value="Innovent Alpha" />
                <ValueRow label="Drive Mode" value="AWD Off-Road" highlight />
                <ValueRow label="Suspension Mode" value="Adaptive" />
                <ValueRow label="Ride Height" value="+45 mm" />
                <ValueRow label="Maximum Speed" value="40 km/h (Capped)" />
              </div>
            </BaseCard>

            <BaseCard title="Mission Settings" icon={Flag}>
              <div className="flex flex-col h-full justify-between mt-2">
                <ValueRow label="Nav Priority" value="Safest Route" highlight />
                <ValueRow label="Driving Style" value="Cautious" />
                <Toggle label="Energy Saving Mode" active={false} />
                <ValueRow label="Route Preference" value="Avoid Water" />
                <ValueRow label="Return-to-Base" value="20% Battery" />
              </div>
            </BaseCard>

            <BaseCard title="Simulation Tools" icon={MonitorPlay}>
              <div className="flex flex-col h-full justify-between mt-2">
                <ValueRow label="Simulation Speed" value="1.0x (Realtime)" />
                <ValueRow label="Terrain Preset" value="Dynamic Rocky" highlight />
                <ValueRow label="Camera View" value="Orbital Chase" />
                <Toggle label="Replay Mode" active={false} />
                <ValueRow label="Weather Preset" value="Clear Conditions" />
              </div>
            </BaseCard>

            <BaseCard title="Network & Telemetry" icon={Globe}>
              <div className="flex flex-col h-full justify-between mt-2">
                <SensorRow label="Network Status" status="Connected" />
                <ValueRow label="Signal Strength" value="-65 dBm" />
                <ValueRow label="Latency" value="12 ms" highlight />
                <Toggle label="Cloud Sync" active={true} />
                <Toggle label="Offline Mode" active={false} />
              </div>
            </BaseCard>
          </div>
        </div>

        {/* Section: Advanced System Parameters */}
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-center gap-4">
             <h2 className="text-[18px] font-[600] text-automotive-warning uppercase tracking-wider">Advanced System Parameters</h2>
             <div className="flex-1 h-px bg-automotive-border"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
            <BaseCard title="AI Engine" icon={Brain}>
              <div className="flex flex-col h-full justify-between mt-2">
                <ValueRow label="Detection Model" value="Innovent-Vision v3.2" highlight />
                <ValueRow label="Terrain Classify" value="Active (CNN)" />
                <ValueRow label="Obstacle Detect" value="LiDAR + Camera" />
                <ValueRow label="Confidence Thresh" value="85%" />
                <Toggle label="Auto Navigation" active={true} />
              </div>
            </BaseCard>

            <BaseCard title="Safety Interlocks" icon={ShieldAlert}>
              <div className="flex flex-col h-full justify-between mt-2">
                <Toggle label="Emergency Stop" active={true} />
                <Toggle label="Obstacle Avoidance" active={true} />
                <Toggle label="Wheel Slip Protect" active={true} />
                <Toggle label="Auto Recovery" active={false} />
                <ValueRow label="Safety Override" value="Locked" highlight />
              </div>
            </BaseCard>

            <BaseCard title="Hardware Sensors" icon={Activity}>
              <div className="flex flex-col h-full justify-between mt-2">
                <SensorRow label="Camera Array" status="Healthy" />
                <SensorRow label="GPS Receiver" status="Connected" />
                <SensorRow label="3D LiDAR" status="Warning" />
                <SensorRow label="IMU System" status="Healthy" />
                <SensorRow label="Wheel Encoders" status="Healthy" />
              </div>
            </BaseCard>

            <BaseCard title="System Internals" icon={Info}>
              <div className="flex flex-col h-full justify-between mt-2">
                <ValueRow label="Software Version" value="v2.4.1 (Stable)" />
                <ValueRow label="AI Weights" value="model-2026-07" />
                <ValueRow label="React UI Version" value="18.3.1" />
                <ValueRow label="FastAPI Backend" value="0.104.1" />
                <ValueRow label="System Uptime" value="14 Days, 6 Hrs" highlight />
              </div>
            </BaseCard>
          </div>
        </div>

      </div>
      
      <Toast 
        isVisible={!!toast} 
        message={toast?.message || ''} 
        type={toast?.type || 'info'} 
        onClose={() => setToast(null)} 
      />
    </div>
  );
};
