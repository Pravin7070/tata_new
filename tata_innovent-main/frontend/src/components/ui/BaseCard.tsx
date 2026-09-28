import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export interface BaseCardProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  statusActive?: boolean;
}

export const BaseCard = ({ title, icon: Icon, children, className = '', statusActive = true }: BaseCardProps) => (
  <motion.div 
    whileHover={{ y: -1, boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)" }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className={`bg-automotive-card border border-automotive-border rounded-[12px] p-5 flex flex-col relative overflow-hidden h-full shadow-lg ${className}`}
  >
    <div className="flex items-center justify-between mb-5 relative z-10">
      <div className="flex items-center gap-3 text-automotive-white">
        {Icon && <Icon className="w-[18px] h-[18px] text-automotive-blue" />}
        <h3 className="font-[600] text-[17px] tracking-tight">{title}</h3>
      </div>
      {statusActive && (
        <motion.div 
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full bg-automotive-green shadow-[0_0_8px_#3DFF53]"
        />
      )}
    </div>
    <div className="flex-1 flex flex-col relative z-10 h-full">
      {children}
    </div>
  </motion.div>
);
