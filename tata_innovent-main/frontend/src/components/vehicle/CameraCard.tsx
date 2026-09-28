import React from 'react';

interface CameraCardProps {
  name: string;
  status: string;
  fps: number;
  res: string;
}

export const CameraCard: React.FC<CameraCardProps> = React.memo(({ name, status, fps, res }) => {
  return (
    <div className="flex flex-col items-center justify-between p-2 bg-automotive-black/40 rounded border border-automotive-gray/10 h-full">
      <div className="flex items-center gap-1.5 w-full justify-center mb-2">
        <div className={`w-2.5 h-2.5 rounded-full ${status === 'green' ? 'bg-automotive-green shadow-[0_0_5px_rgba(0,255,0,0.5)]' : 'bg-red-500'}`}></div>
        <span className="text-center text-[10px] text-automotive-gray uppercase tracking-wider">{name}</span>
      </div>
      <div className="w-full space-y-1 text-center border-t border-automotive-gray/10 pt-1">
        <p className="text-[9px] text-automotive-gray">FPS: <span className="text-automotive-white font-mono">{fps}</span></p>
        <p className="text-[9px] text-automotive-gray">Res: <span className="text-automotive-white font-mono">{res}</span></p>
      </div>
    </div>
  );
});

CameraCard.displayName = 'CameraCard';
