import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface XPRewardPopupProps {
  xp: number;
  show: boolean;
  onComplete?: () => void;
  label?: string;
}

export const XPRewardPopup = ({ xp, show, onComplete, label }: XPRewardPopupProps) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  useEffect(() => {
    if (show && xp >= 20) {
      const colors = ['#ff7f50', '#006a63', '#c5a018', '#a43c12', '#2EC4B6', '#E91E63', '#FF9800'];
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 200 - 100,
        y: -(Math.random() * 150 + 50),
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setParticles(newParticles);
    }
  }, [show, xp]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onComplete?.(), 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Confetti Particles */}
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: p.x,
                y: p.y,
                scale: [0, 1.5, 0.8],
                opacity: [1, 1, 0],
                rotate: Math.random() * 720,
              }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          ))}

          {/* XP Badge */}
          <motion.div
            className="relative flex flex-col items-center"
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: [0, 1.3, 1], y: [20, -30, -50] }}
            exit={{ scale: 0, opacity: 0, y: -80 }}
            transition={{ duration: 1.5, type: 'spring', stiffness: 200, damping: 15 }}
          >
            <motion.div
              className="bg-gradient-to-br from-primary-container to-primary rounded-full px-6 py-3 shadow-lg flex items-center gap-2"
              animate={{ boxShadow: ['0 0 0 0px rgba(255,127,80,0.3)', '0 0 0 15px rgba(255,127,80,0)', '0 0 0 0px rgba(255,127,80,0)'] }}
              transition={{ duration: 1.5, repeat: 1 }}
            >
              <span className="material-symbols-outlined text-white text-[24px] filled">star</span>
              <span className="font-headline text-title-lg text-white font-bold">+{xp} XP</span>
            </motion.div>
            {label && (
              <motion.p
                className="font-body text-label-md text-primary mt-2 font-semibold"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {label}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
