import React from 'react';
import { motion } from 'motion/react';

export const PageLoader: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 border-[3px] border-white/[0.06] border-t-primary rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 w-10 h-10 border-[3px] border-transparent border-r-primary/30 rounded-full"
          />
        </div>
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]"
        >
          Carregando
        </motion.p>
      </div>
    </div>
  );
};
