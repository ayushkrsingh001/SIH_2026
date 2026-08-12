import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { DetectiveCase } from '../../../types';
import confetti from 'canvas-confetti';
import { MASCOT_URL } from '../../../constants';

interface CaseCompleteProps {
  caseData: DetectiveCase;
  xpEarned: number;
  onContinue: () => void;
}

export default function CaseComplete({ caseData, xpEarned, onContinue }: CaseCompleteProps) {
  
  useEffect(() => {
    // Fire confetti on mount
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD166', '#06D6A0', '#118AB2', '#EF476F']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD166', '#06D6A0', '#118AB2', '#EF476F']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-[#FDFBF7] z-50 overflow-y-auto flex flex-col items-center p-4 md:p-8"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        className="max-w-sm w-full flex flex-col items-center text-center py-10 m-auto"
      >
        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-b from-blue-50 to-white rounded-full flex items-center justify-center p-1.5 sm:p-2 border-4 border-white shadow-lg ring-4 ring-primary/10 mb-6 z-10">
           <img src={MASCOT_URL} alt="Mascot" className="w-full h-full object-cover rounded-full" />
        </div>

        <div className="mb-6 sm:mb-8 w-full">
          <h2 className="text-4xl sm:text-5xl font-headline font-black bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent mb-2">Case Closed!</h2>
          <p className="text-on-surface-variant text-base sm:text-lg font-medium px-2">You solved "{caseData.title}"</p>
        </div>

        <div className="w-full bg-gradient-to-br from-amber-50 to-orange-50 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 border border-amber-200/50 mb-8 sm:mb-10 shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 sm:w-40 sm:h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col items-center justify-center text-amber-600 mb-5 sm:mb-6 relative z-10">
            <span className="material-symbols-outlined text-5xl sm:text-6xl mb-1 filter drop-shadow-sm">social_leaderboard</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-headline font-black tracking-tight">+{xpEarned}</span>
              <span className="text-xl sm:text-2xl font-bold">XP</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm text-left relative z-10 border border-white">
            <h4 className="font-bold flex items-center gap-2 mb-2 text-primary text-sm sm:text-base">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-1 sm:p-1.5 rounded-lg text-[16px] sm:text-sm">psychology</span>
              Detective's Notebook
            </h4>
            <p className="text-xs sm:text-sm font-medium text-on-surface-variant leading-relaxed">{caseData.learningPoint}</p>
          </div>
        </div>

        <button 
          onClick={onContinue}
          className="bg-primary text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] shadow-primary/30 btn-tactile w-full py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
        >
          Return to HQ
          <span className="material-symbols-outlined text-[18px] sm:text-[20px]">exit_to_app</span>
        </button>
      </motion.div>
    </motion.div>
  );
}
