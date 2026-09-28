import React from 'react';

interface TireCardProps {
  id: string;
  press: string;
  temp: string;
  cond: string;
  wear: string;
}

export const TireCard: React.FC<TireCardProps> = React.memo(({ id, press, temp, cond, wear }) => {
  return (
    <div className="bg-automotive-black/30 p-2 rounded border border-automotive-gray/10 flex flex-col gap-1 text-xs">
      <div className="flex justify-between items-center mb-1 border-b border-automotive-gray/20 pb-1">
        <span className="text-automotive-gray uppercase text-[10px] tracking-widest">{id}</span>
        <span className="text-automotive-green font-bold text-[9px] uppercase">{cond}</span>
      </div>
      <div className="flex justify-between"><span className="text-automotive-gray">Pressure:</span><span className="font-mono text-automotive-white">{press}</span></div>
      <div className="flex justify-between"><span className="text-automotive-gray">Temp:</span><span className="font-mono text-automotive-white">{temp}</span></div>
      <div className="flex justify-between"><span className="text-automotive-gray">Wear:</span><span className="font-mono text-automotive-white">{wear}</span></div>
    </div>
  );
});

TireCard.displayName = 'TireCard';
