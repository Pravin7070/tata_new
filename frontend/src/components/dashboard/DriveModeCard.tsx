
import { Settings2, CheckCircle2 } from 'lucide-react';
import { BaseCard } from '../ui/BaseCard';

export interface DriveModeCardProps {
  currentMode: string;
  activeAssist: string[];
}

export const DriveModeCard = ({ currentMode, activeAssist }: DriveModeCardProps) => (
  <BaseCard title="Drive Mode" icon={Settings2}>
    <div className="flex flex-col gap-6 mt-2 h-full justify-center">
      <div className="p-4 bg-automotive-blue/10 border border-automotive-blue/30 rounded-lg flex justify-between items-center">
        <span className="text-[22px] font-[700] text-automotive-blue uppercase tracking-tight">{currentMode}</span>
        <CheckCircle2 className="w-6 h-6 text-automotive-blue" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-[500] text-automotive-gray">Active Assists</span>
        <div className="flex gap-2 flex-wrap">
          {activeAssist.map((assist, i) => (
            <span key={i} className="px-3 py-1.5 bg-automotive-black border border-automotive-gray/30 text-[12px] font-[500] text-automotive-white uppercase tracking-wider rounded">
              {assist}
            </span>
          ))}
        </div>
      </div>
    </div>
  </BaseCard>
);
