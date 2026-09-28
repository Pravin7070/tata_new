
import { Car } from 'lucide-react';
import { BaseCard } from '../ui/BaseCard';

export interface VehicleCardProps {
  model: string;
  vin: string;
  firmware: string;
  uptime: string;
}

export const VehicleCard = ({ model, vin, firmware, uptime }: VehicleCardProps) => (
  <BaseCard title="Vehicle Overview" icon={Car}>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center h-full">
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-[500] text-automotive-gray">Model</p>
        <p className="font-[700] text-[22px] text-automotive-white truncate tracking-tight" title={model}>{model}</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-[500] text-automotive-gray">VIN</p>
        <p className="font-mono text-[16px] text-automotive-white truncate" title={vin}>{vin}</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-[500] text-automotive-gray">Firmware</p>
        <p className="font-mono text-[16px] text-automotive-blue">{firmware}</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-[500] text-automotive-gray">Uptime</p>
        <p className="font-mono text-[22px] font-[700] tracking-tight text-automotive-white">{uptime}</p>
      </div>
    </div>
  </BaseCard>
);
