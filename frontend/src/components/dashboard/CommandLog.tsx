
import { List, CheckCircle2, XCircle, MapPin, AlertCircle, Mountain } from 'lucide-react';
import { BaseCard } from '../ui/BaseCard';

export interface CommandItem {
  id: string | number;
  time: string;
  command: string;
  status: 'Success' | 'Failed' | 'Pending';
}

export interface CommandLogProps {
  commands: CommandItem[];
}

export const CommandLog = ({ commands }: CommandLogProps) => {
  const getIcon = (cmd: string) => {
    if (cmd.includes('MODE')) return <MapPin className="w-4 h-4 text-automotive-blue" />;
    if (cmd.includes('SUSPENSION')) return <Mountain className="w-4 h-4 text-[#ffaa00]" />;
    return <AlertCircle className="w-4 h-4 text-automotive-gray" />;
  };

  const formatCommand = (cmd: string) => {
    return cmd
      .replace('SET_MODE_', 'Drive Mode: ')
      .replace('SET_SUSPENSION_', 'Suspension: ')
      .replace(/_/g, ' ');
  };

  return (
    <BaseCard title="Navigation Event Timeline" icon={List}>
      <div className="flex flex-col overflow-y-auto custom-scrollbar pr-2 h-[200px]">
        {commands.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <List className="w-8 h-8 text-automotive-gray/40 mb-3" />
            <p className="text-[13px] text-automotive-gray/80 font-[500]">No Events Logged</p>
            <p className="text-[12px] text-automotive-gray/60 mt-1">Awaiting system instructions.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-2">
            {commands.map((cmd, i) => (
              <div key={cmd.id} className="flex flex-col">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-automotive-gray uppercase tracking-wider">{cmd.time}</span>
                    <div className="flex items-center gap-2">
                      {getIcon(cmd.command)}
                      <span className="text-[14px] font-[600] text-automotive-white">{formatCommand(cmd.command)}</span>
                    </div>
                  </div>
                  <div className="mt-1">
                    {cmd.status === 'Success' && <CheckCircle2 className="w-4 h-4 text-automotive-green" />}
                    {cmd.status === 'Failed' && <XCircle className="w-4 h-4 text-red-500" />}
                    {cmd.status === 'Pending' && <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse mt-1"></div>}
                  </div>
                </div>
                {i < commands.length - 1 && (
                  <div className="h-px w-full bg-white/5 mt-3"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseCard>
  );
};
