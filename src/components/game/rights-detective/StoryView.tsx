import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DetectiveCase } from '../../../types';
import { MASCOT_URL } from '../../../constants';

interface StoryViewProps {
  caseData: DetectiveCase;
  onComplete: () => void;
}

export default function StoryView({ caseData, onComplete }: StoryViewProps) {
  const [currentScene, setCurrentScene] = useState(0);

  const nextScene = () => {
    if (currentScene < caseData.storyScenes.length - 1) {
      setCurrentScene(currentScene + 1);
    } else {
      onComplete();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-surface-container overflow-y-auto p-4 md:p-8 flex flex-col"
    >
      <div className="max-w-2xl w-full mx-auto my-auto bg-white rounded-3xl shadow-elevation-3 border border-outline-variant flex-shrink-0 flex flex-col">
        <div className="bg-primary p-6 text-center rounded-t-3xl">
          <img src={MASCOT_URL} alt="Detective" className="w-20 h-20 md:w-24 md:h-24 mx-auto drop-shadow-md" />
          <h2 className="text-on-primary font-headline font-bold text-xl md:text-2xl mt-4">Case Briefing</h2>
        </div>
        
        <div className="p-6 md:p-10 flex flex-col justify-center items-center text-center min-h-[250px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentScene}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-lg md:text-xl font-body text-on-surface leading-relaxed"
            >
              {caseData.storyScenes[currentScene].text}
            </motion.p>
          </AnimatePresence>
        </div>
        
        <div className="p-6 bg-surface-container-lowest border-t border-outline-variant flex justify-between items-center rounded-b-3xl">
          <div className="flex gap-2">
            {caseData.storyScenes.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all ${idx === currentScene ? 'w-8 bg-primary' : 'w-2 bg-outline-variant'}`} 
              />
            ))}
          </div>
          <button 
            onClick={nextScene}
            className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold text-lg shadow-sm hover:opacity-90 transition-all active:scale-95"
          >
            {currentScene === caseData.storyScenes.length - 1 ? 'Start Investigation' : 'Next'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
