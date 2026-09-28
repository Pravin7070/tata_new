import React from 'react';

interface SensorCardProps {
  name: string;
  status: string;
}

export const SensorCard: React.FC<SensorCardProps> = React.memo(({ name, status }) => {
  return (
    <div className="flex flex-col items-center justify-center p-2 bg-automotive-black/40 rounded border border-automotive-gray/10 h-full">
      <div className={`w-3 h-3 rounded-full mb-1.5 ${status === 'green' ? 'bg-automotive-green shadow-[0_0_5px_rgba(0,255,0,0.5)]' : status === 'yellow' ? 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]'}`}></div>
      <span className="text-center text-[9px] text-automotive-gray uppercase tracking-wider">{name}</span>
    </div>
  );
});

SensorCard.displayName = 'SensorCard';
