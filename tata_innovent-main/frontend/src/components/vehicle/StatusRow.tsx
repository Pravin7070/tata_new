import React from 'react';

interface StatusRowProps {
  label: string;
  value: string | React.ReactNode;
  valueClass?: string;
  isLast?: boolean;
}

export const StatusRow: React.FC<StatusRowProps> = React.memo(({ 
  label, 
  value, 
  valueClass = 'text-automotive-white font-mono',
  isLast = false 
}) => {
  return (
    <div className={`flex justify-between ${!isLast ? 'border-b border-automotive-gray/10 pb-1.5' : 'items-center'}`}>
      <span className="text-automotive-gray uppercase text-[10px] tracking-wider">{label}</span>
      <span className={valueClass}>
        {value}
      </span>
    </div>
  );
});

StatusRow.displayName = 'StatusRow';
