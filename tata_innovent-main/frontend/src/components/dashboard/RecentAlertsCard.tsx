
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { BaseCard } from '../ui/BaseCard';

export interface AlertItem {
  id: string | number;
  time: string;
  type: 'Warning' | 'Info' | 'Critical';
  message: string;
}

export interface RecentAlertsCardProps {
  alerts: AlertItem[];
}

export const RecentAlertsCard = ({ alerts }: RecentAlertsCardProps) => (
  <BaseCard title="Recent Alerts" icon={ShieldAlert}>
    <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 h-[200px]">
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <ShieldAlert className="w-8 h-8 text-automotive-green/40 mb-3" />
          <p className="text-[13px] text-automotive-green/80 font-[500]">No Recent Alerts</p>
          <p className="text-[12px] text-automotive-gray/60 mt-1">System operating within normal parameters.</p>
        </div>
      ) : (
        alerts.map((alert, index) => {
          let style = 'bg-automotive-blue/10 border-automotive-blue/30 text-automotive-blue';
          if (alert.type === 'Warning') style = 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';
          if (alert.type === 'Critical') style = 'bg-red-500/10 border-red-500/30 text-red-500';
          if (alert.message === 'Clear path') style = 'bg-automotive-green/10 border-automotive-green/30 text-automotive-green';

          return (
            <div key={`${alert.id}-${index}`} className={`flex gap-3 p-4 rounded-lg border ${style}`}>
              <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1 w-full">
                <div className="flex justify-between items-start">
                  <p className="text-[13px] font-[500] text-automotive-white leading-snug">{alert.message}</p>
                  <p className="text-[12px] text-automotive-gray font-mono">{alert.time}</p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  </BaseCard>
);
