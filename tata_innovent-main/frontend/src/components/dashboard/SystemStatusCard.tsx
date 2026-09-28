
import { Wifi } from 'lucide-react';
import { BaseCard } from '../ui/BaseCard';

export interface SystemStatusCardProps {
  title: string;
  data: Record<string, string | number>;
}

export const SystemStatusCard = ({ title, data }: SystemStatusCardProps) => (
  <BaseCard title={title} icon={Wifi}>
    <div className="flex items-center justify-between gap-6 h-full">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1">
          <p className="text-[13px] font-[500] text-automotive-gray capitalize">{key}</p>
          <p className="font-mono font-[700] text-[22px] tracking-tight text-automotive-white">{String(value)}</p>
        </div>
      ))}
    </div>
  </BaseCard>
);
