
import { Gauge, Settings2, Battery, Thermometer } from 'lucide-react';
import { BaseCard } from '../ui/BaseCard';

export interface StatusCardProps {
  speed: number | null;
  rpm: number | null;
  gear: string | number | null;
  battery: number | null;
  temp: number | null;
}

export const StatusCard = ({ speed, rpm, gear, battery, temp }: StatusCardProps) => (
  <BaseCard title="Vehicle Status" icon={Gauge}>
    <div className="flex flex-col gap-6 justify-center h-full mt-2">
      <div className="grid grid-cols-2 gap-y-6 gap-x-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-automotive-blue/10 flex items-center justify-center shrink-0">
            <Gauge className="w-5 h-5 text-automotive-blue" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[13px] font-[500] text-automotive-gray">Speed</p>
            <p className="font-mono text-[22px] font-[700] text-automotive-white leading-none tracking-tight">{speed ?? 'N/A'}{speed === null ? '' : <span className="text-[13px] font-[500] text-automotive-gray ml-0.5"> km/h</span>}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-automotive-gray/10 flex items-center justify-center shrink-0">
            <Settings2 className="w-5 h-5 text-automotive-gray" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[13px] font-[500] text-automotive-gray">Gear / RPM</p>
            <p className="font-mono text-[22px] font-[700] text-automotive-white leading-none tracking-tight">{gear ?? 'N/A'}{rpm === null ? '' : <span className="text-[13px] font-[500] text-automotive-gray ml-0.5">/ {rpm}</span>}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-automotive-green/10 flex items-center justify-center shrink-0">
            <Battery className="w-5 h-5 text-automotive-green" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[13px] font-[500] text-automotive-gray">Battery</p>
            <p className="font-mono text-[22px] font-[700] text-automotive-white leading-none tracking-tight">{battery ?? 'N/A'}{battery === null ? '' : <span className="text-[13px] font-[500] text-automotive-gray ml-0.5">%</span>}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-400/10 flex items-center justify-center shrink-0">
            <Thermometer className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[13px] font-[500] text-automotive-gray">Temp</p>
            <p className="font-mono text-[22px] font-[700] text-automotive-white leading-none tracking-tight">{temp ?? 'N/A'}{temp === null ? '' : <span className="text-[13px] font-[500] text-automotive-gray ml-0.5">°C</span>}</p>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
);
