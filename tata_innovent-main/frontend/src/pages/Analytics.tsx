import { BaseCard } from '../components/ui/BaseCard';
import { BarChart2, TrendingUp, Clock, Activity, Target, Map as MapIcon } from 'lucide-react';

export const Analytics = () => (
  <div className="flex flex-col gap-10 font-sans pb-10 h-full">
    <div>
      <h1 className="text-[40px] font-[700] text-automotive-white tracking-tight leading-none mb-2">
        Fleet Analytics
      </h1>
      <p className="text-[15px] font-[400] text-automotive-muted">Historical Data & Performance Metrics</p>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      
      {/* Top Overview Stats */}
      <BaseCard title="Trip & Mission Analytics" icon={Clock} className="lg:col-span-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-2 divide-x divide-automotive-border">
          <div className="flex flex-col gap-2 pl-4">
            <span className="text-[13px] text-automotive-muted font-[400]">Total Distance</span>
            <span className="text-[26px] font-display font-[700] text-automotive-white">12,450 km</span>
          </div>
          <div className="flex flex-col gap-2 pl-6">
            <span className="text-[13px] text-automotive-muted font-[400]">Autonomous Time</span>
            <span className="text-[26px] font-display font-[700] text-automotive-white">342 h</span>
          </div>
          <div className="flex flex-col gap-2 pl-6">
            <span className="text-[13px] text-automotive-muted font-[400]">Avg Efficiency</span>
            <span className="text-[26px] font-display font-[700] text-automotive-blue">14.2 kWh</span>
          </div>
          <div className="flex flex-col gap-2 pl-6">
            <span className="text-[13px] text-automotive-muted font-[400]">Mission Success</span>
            <span className="text-[26px] font-display font-[700] text-automotive-green">98.5%</span>
          </div>
          <div className="flex flex-col gap-2 pl-6">
            <span className="text-[13px] text-automotive-muted font-[400]">Obstacles Avoided</span>
            <span className="text-[26px] font-display font-[700] text-automotive-white">1,402</span>
          </div>
        </div>
      </BaseCard>
      
      {/* Main Charts */}
      <BaseCard title="Efficiency & Speed Trend" icon={TrendingUp} className="lg:col-span-8 min-h-[380px] flex flex-col">
        <div className="flex-1 flex items-end gap-3 pt-8 pb-4">
          {[60, 45, 80, 50, 70, 90, 65, 55, 85, 75, 40, 60, 95, 80].map((h, i) => (
            <div key={i} className="flex-1 bg-automotive-blue/10 hover:bg-automotive-blue transition-colors rounded-t relative group flex flex-col justify-end">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-automotive-card px-3 py-1.5 text-[13px] font-[600] rounded-[8px] border border-automotive-border shadow-xl transition-opacity whitespace-nowrap z-10">
                {h} km/h avg
              </div>
              <div className="w-full bg-automotive-blue rounded-t transition-all duration-1000 shadow-[0_0_15px_rgba(0,200,255,0.2)]" style={{ height: `${h}%` }}></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[13px] text-automotive-muted border-t border-automotive-border pt-4">
          <span>Day 1</span><span>Day 3</span><span>Day 5</span><span>Day 7</span><span>Day 9</span><span>Day 11</span><span>Day 14</span>
        </div>
      </BaseCard>
      
      <BaseCard title="Energy Distribution" icon={BarChart2} className="lg:col-span-4 min-h-[380px]">
        <div className="flex flex-col gap-6 h-full justify-center mt-2">
          {[
            { label: 'Traction Motors', val: 75, color: 'bg-automotive-blue' },
            { label: 'AI Compute', val: 12, color: 'bg-automotive-green' },
            { label: 'Thermal Mgmt', val: 8, color: 'bg-automotive-warning' },
            { label: 'Sensors / LiDAR', val: 5, color: 'bg-automotive-muted' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <span className="text-automotive-white text-[15px] font-[500]">{item.label}</span>
                <span className="font-display text-[15px] text-automotive-muted font-[600]">{item.val}%</span>
              </div>
              <div className="h-2.5 w-full bg-automotive-background rounded-full overflow-hidden border border-automotive-border">
                <div className={`h-full ${item.color} shadow-[0_0_10px_currentColor]`} style={{ width: `${item.val}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </BaseCard>

      {/* Secondary Metrics */}
      <BaseCard title="Terrain Distribution" icon={MapIcon} className="lg:col-span-4 min-h-[320px]">
         <div className="flex flex-col gap-5 h-full justify-center mt-2">
           {[
             { label: 'Asphalt / Highway', pct: 40 },
             { label: 'Gravel / Dirt', pct: 35 },
             { label: 'Mud / Deep Rut', pct: 15 },
             { label: 'Rock / Boulder', pct: 10 }
           ].map((t, i) => (
             <div key={i} className="flex items-center gap-4 bg-automotive-background p-3 rounded-[8px] border border-automotive-border">
                <div className="w-10 h-10 rounded-full bg-automotive-card border border-automotive-border flex items-center justify-center shrink-0">
                   <span className="font-display font-[700] text-automotive-blue text-[13px]">{t.pct}%</span>
                </div>
                <span className="font-[500] text-[15px] text-automotive-white">{t.label}</span>
             </div>
           ))}
         </div>
      </BaseCard>

      <BaseCard title="Prediction Accuracy" icon={Target} className="lg:col-span-4 min-h-[320px]">
         <div className="flex flex-col gap-6 h-full justify-center items-center mt-2">
            <div className="relative w-40 h-40 rounded-full border-[10px] border-automotive-background flex items-center justify-center shadow-[0_0_30px_rgba(61,255,83,0.1)]">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="42%" className="stroke-automotive-border" strokeWidth="12" fill="none" />
                <circle cx="50%" cy="50%" r="42%" className="stroke-automotive-green" strokeWidth="12" fill="none" strokeDasharray="264" strokeDashoffset="13.2" strokeLinecap="round" />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-[32px] font-display font-[700] text-automotive-white leading-none">95%</span>
                <span className="text-[11px] text-automotive-muted uppercase tracking-widest mt-1">Confidence</span>
              </div>
            </div>
            <p className="text-center text-[14px] text-automotive-muted px-4">
              AI terrain detection model successfully matching physical ground truth.
            </p>
         </div>
      </BaseCard>

      <BaseCard title="System Load Analysis" icon={Activity} className="lg:col-span-4 min-h-[320px]">
         <div className="flex flex-col gap-6 h-full justify-center mt-2">
            <div className="flex flex-col gap-2 bg-automotive-background p-4 rounded-[8px] border border-automotive-border">
               <div className="flex justify-between items-center">
                  <span className="text-[13px] font-[400] text-automotive-muted">Suspension Usage (Active Damping)</span>
                  <span className="font-display font-[600] text-automotive-warning">High</span>
               </div>
               <div className="w-full h-1.5 bg-automotive-card rounded-full mt-1">
                  <div className="h-full bg-automotive-warning w-[85%] rounded-full shadow-[0_0_10px_#FFC107]"></div>
               </div>
            </div>
            <div className="flex flex-col gap-2 bg-automotive-background p-4 rounded-[8px] border border-automotive-border">
               <div className="flex justify-between items-center">
                  <span className="text-[13px] font-[400] text-automotive-muted">Motor Temperature Avg</span>
                  <span className="font-display font-[600] text-automotive-green">Nominal</span>
               </div>
               <div className="w-full h-1.5 bg-automotive-card rounded-full mt-1">
                  <div className="h-full bg-automotive-green w-[45%] rounded-full shadow-[0_0_10px_#3DFF53]"></div>
               </div>
            </div>
            <div className="flex flex-col gap-2 bg-automotive-background p-4 rounded-[8px] border border-automotive-border">
               <div className="flex justify-between items-center">
                  <span className="text-[13px] font-[400] text-automotive-muted">Obstacle Evasion Frequency</span>
                  <span className="font-display font-[600] text-automotive-blue">14/hr</span>
               </div>
               <div className="w-full h-1.5 bg-automotive-card rounded-full mt-1">
                  <div className="h-full bg-automotive-blue w-[30%] rounded-full shadow-[0_0_10px_#00C8FF]"></div>
               </div>
            </div>
         </div>
      </BaseCard>

    </div>
  </div>
);
