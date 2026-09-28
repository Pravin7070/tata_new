
import { Car } from 'lucide-react';
import { BaseCard } from '../ui/BaseCard';

export interface SuspensionCardProps {
  frontLeft: number | null;
  frontRight: number | null;
  rearLeft: number | null;
  rearRight: number | null;
  mode: string;
  status: string;
}

export const SuspensionCard = ({ frontLeft, frontRight, rearLeft, rearRight, mode, status }: SuspensionCardProps) => (
  <BaseCard title="Suspension Status" icon={Car}>
    <div className="flex flex-col h-full justify-between gap-6 mt-2">
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-4 flex flex-col gap-1 border border-automotive-gray/20 rounded-lg bg-automotive-black/50 items-center justify-center">
          <p className="text-[13px] font-[500] text-automotive-gray">FL</p>
          <p className="font-mono text-[22px] font-[700] text-automotive-white">{frontLeft ?? 'N/A'}{frontLeft === null ? '' : <span className="text-[13px] font-[500] text-automotive-gray ml-1">mm</span>}</p>
        </div>
        <div className="p-4 flex flex-col gap-1 border border-automotive-gray/20 rounded-lg bg-automotive-black/50 items-center justify-center">
          <p className="text-[13px] font-[500] text-automotive-gray">FR</p>
          <p className="font-mono text-[22px] font-[700] text-automotive-white">{frontRight ?? 'N/A'}{frontRight === null ? '' : <span className="text-[13px] font-[500] text-automotive-gray ml-1">mm</span>}</p>
        </div>
        <div className="p-4 flex flex-col gap-1 border border-automotive-gray/20 rounded-lg bg-automotive-black/50 items-center justify-center">
          <p className="text-[13px] font-[500] text-automotive-gray">RL</p>
          <p className="font-mono text-[22px] font-[700] text-automotive-white">{rearLeft ?? 'N/A'}{rearLeft === null ? '' : <span className="text-[13px] font-[500] text-automotive-gray ml-1">mm</span>}</p>
        </div>
        <div className="p-4 flex flex-col gap-1 border border-automotive-gray/20 rounded-lg bg-automotive-black/50 items-center justify-center">
          <p className="text-[13px] font-[500] text-automotive-gray">RR</p>
          <p className="font-mono text-[22px] font-[700] text-automotive-white">{rearRight ?? 'N/A'}{rearRight === null ? '' : <span className="text-[13px] font-[500] text-automotive-gray ml-1">mm</span>}</p>
        </div>
      </div>
      <div className="flex justify-between items-center text-[13px] font-[500]">
        <span className="text-automotive-gray">Mode: <span className="text-automotive-white">{mode}</span></span>
        <span className="text-automotive-green">{status}</span>
      </div>
    </div>
  </BaseCard>
);
