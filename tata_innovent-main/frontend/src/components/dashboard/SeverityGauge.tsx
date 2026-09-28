
import { Activity } from 'lucide-react';
import { BaseCard } from '../ui/BaseCard';
import { motion } from 'framer-motion';

export interface SeverityGaugeProps {
  level: string;
  score: number;
  maxScore: number;
}

export const SeverityGauge = ({ level, score, maxScore }: SeverityGaugeProps) => (
  <BaseCard title="Terrain Severity" icon={Activity}>
    <div className="flex flex-col gap-6 mt-2 h-full justify-center">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-[500] text-automotive-gray">Severity level: {level}</p>
        <div className="flex items-baseline gap-1 text-right">
          <p className="text-[22px] font-[700] text-automotive-white">{score}</p>
          <p className="text-[13px] font-[500] text-automotive-gray">/ {maxScore}</p>
        </div>
      </div>
      <div className="flex h-3 gap-1.5">
        {[...Array(maxScore)].map((_, i) => (
          <div key={i} className="flex-1 rounded-sm bg-automotive-black overflow-hidden relative">
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: i < score ? 1 : 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
              className={`absolute inset-0 origin-left ${i > 7 ? 'bg-red-500' : i > 4 ? 'bg-yellow-500' : 'bg-automotive-green'}`}
            />
          </div>
        ))}
      </div>
    </div>
  </BaseCard>
);
