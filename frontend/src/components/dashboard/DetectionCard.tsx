
import { Mountain } from 'lucide-react';
import { BaseCard } from '../ui/BaseCard';
import { motion } from 'framer-motion';

export interface DetectionCardProps {
  type: string;
  confidence: number;
}

export const DetectionCard = ({ type, confidence }: DetectionCardProps) => (
  <BaseCard title="Terrain Detection" icon={Mountain}>
    <div className="flex items-center justify-between mt-2">
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-[500] text-automotive-gray">Detected type</p>
        <p className="text-[22px] font-[700] text-automotive-white">{type}</p>
      </div>
      <div className="text-right flex flex-col gap-1">
        <p className="text-[13px] font-[500] text-automotive-gray">Confidence</p>
        <p className="text-[22px] font-[700] text-automotive-green">{confidence}%</p>
      </div>
    </div>
    <div className="mt-6 h-2 w-full bg-automotive-black rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${confidence}%` }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        className="h-full bg-automotive-green" 
      />
    </div>
  </BaseCard>
);
