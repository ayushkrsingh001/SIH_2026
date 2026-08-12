import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { DetectiveCase, DetectiveClue } from '../../../types';

interface InvestigationViewProps {
  caseData: DetectiveCase;
  cluesFound: string[];
  onClueFound: (clueId: string) => void;
  onResetClues: () => void;
  onComplete: () => void;
}

export default function InvestigationView({ caseData, cluesFound, onClueFound, onResetClues, onComplete }: InvestigationViewProps) {
  const [selectedClue, setSelectedClue] = useState<DetectiveClue | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  
  const allCluesFound = caseData.clues.filter(c => c.isRelevant).every(c => cluesFound.includes(c.id));

  const [showHint, setShowHint] = useState(false);

  // Deterministic positions based on thorough image analysis
  const getPosition = (id: string, index: number) => {
    if (caseData.id === 'case_01') {
      switch (id) {
        case 'c1': return { top: '50%', left: '52%' }; // MeanGator comment
        case 'c2': return { top: '36%', left: '42%' }; // Profile picture area
        case 'c3': return { top: '57%', left: '54%' }; // MeanGator Block button
        case 'c4': return { top: '72%', left: '45%' }; // BullyBot Report button
      }
    } else if (caseData.id === 'case_02') {
      switch (id) {
        case 'c1': return { top: '31%', left: '50%' }; // Full Name
        case 'c2': return { top: '46%', left: '50%' }; // Nickname
        case 'c3': return { top: '59%', left: '50%' }; // Address
        case 'c4': return { top: '72%', left: '50%' }; // Favorite Color
      }
    } else if (caseData.id === 'case_03') {
      switch (id) {
        case 'c1': return { top: '30%', left: '50%' }; // Flashing Text
        case 'c2': return { top: '60%', left: '25%' }; // Credit Card
        case 'c3': return { top: '55%', left: '75%' }; // Timer
        case 'c4': return { top: '18%', left: '85%' }; // Close Button
      }
    } else if (caseData.id === 'case_04') {
      switch (id) {
        case 'c1': return { top: '47%', left: '54%' }; // Alarm Clock
        case 'c2': return { top: '68%', left: '15%' }; // Energy Drink
        case 'c3': return { top: '85%', left: '25%' }; // Homework
        case 'c4': return { top: '40%', left: '30%' }; // Tablet
      }
    } else if (caseData.id === 'case_05') {
      switch (id) {
        case 'c1': return { top: '68%', left: '80%' }; // School message
        case 'c2': return { top: '82%', left: '80%' }; // Selfie message
        case 'c3': return { top: '50%', left: '85%' }; // Safe message
        case 'c4': return { top: '93%', left: '80%' }; // Input box
      }
    }
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const top = 15 + ((hash * 13) % 70);
    const left = 10 + (((hash + index) * 17) % 80);
    return { top: `${top}%`, left: `${left}%` };
  };

  const bgImage = caseData.id === 'case_01' ? '/assets/cyberbully_tablet.png' : 
                  caseData.id === 'case_02' ? '/assets/missing_privacy_form.png' : 
                  caseData.id === 'case_03' ? '/assets/case03.png' : 
                  caseData.id === 'case_04' ? '/assets/case04.png' : 
                  caseData.id === 'case_05' ? '/assets/case05.png' : 
                  'https://grainy-gradients.vercel.app/noise.svg';

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col"
    >
      <div className="bg-secondary p-3 md:p-4 text-center text-on-secondary shadow-md z-10 shrink-0">
        <p className="font-bold text-lg">{caseData.investigationText}</p>
        <p className="text-sm opacity-90">Find all the relevant clues to continue!</p>
      </div>

      {/* Main View - Clickable Thumbnail */}
      <div 
        className="flex-1 relative bg-surface-container overflow-hidden flex flex-col items-center justify-center p-4 cursor-pointer group"
        onClick={() => setIsInspecting(true)}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-110 blur-xl transition-transform group-hover:scale-100"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />

        <div className="relative aspect-square w-full max-w-[350px] md:max-w-[450px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-2xl md:rounded-3xl overflow-hidden border-4 border-white z-10 bg-white transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-2">
          <img 
            src={bgImage} 
            alt="Evidence Thumbnail" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white text-primary font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <span className="material-symbols-outlined text-2xl">search</span> 
              <span>Tap to Inspect</span>
            </div>
          </div>
        </div>
        
        <p className="z-10 mt-6 text-on-surface-variant font-bold flex items-center gap-2 animate-bounce">
          Tap the evidence to start investigating <span className="material-symbols-outlined">touch_app</span>
        </p>
      </div>

      {/* Fullscreen Inspection Modal using Portal to cover navbar */}
      {createPortal(
        <AnimatePresence>
          {isInspecting && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-2 md:p-8 backdrop-blur-sm"
              onClick={() => setIsInspecting(false)}
            >
              {/* Top Bar with Hint and Close */}
              <div className="absolute top-4 left-4 right-4 md:top-8 md:left-8 md:right-8 flex justify-between items-start z-[60] pointer-events-none">
                
                {/* Hint System */}
                <div className="pointer-events-auto relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowHint(!showHint); }}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-full transition-colors flex items-center gap-2 font-bold shadow-lg backdrop-blur-md border border-white/20"
                  >
                    <span className="material-symbols-outlined text-yellow-400">lightbulb</span> 
                    Hint
                  </button>
                  
                  <AnimatePresence>
                    {showHint && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="absolute top-full left-0 mt-3 w-64 bg-white rounded-2xl p-4 shadow-xl border border-outline-variant text-on-surface text-sm font-medium z-[70]"
                      >
                        <p>Look carefully at the text messages and the action buttons below them. Tap directly on anything that seems mean, or any buttons that could help!</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsInspecting(false);
                  }}
                  className="pointer-events-auto bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors shadow-lg backdrop-blur-md border border-white/20"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="text-white text-center mb-4 md:mb-6 mt-16 md:mt-0 z-[50]">
                <h3 className="text-xl md:text-3xl font-bold font-headline">Investigate the Evidence</h3>
                <p className="opacity-80 text-sm md:text-base mt-1">Tap directly on the image to find clues.</p>
              </div>

              <div 
                className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl md:rounded-3xl overflow-hidden border-2 border-white/20 bg-black z-[50] flex shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={bgImage} 
                  alt="Investigation Scene Full" 
                  className="w-auto h-auto max-w-[95vw] md:max-w-[800px] max-h-[70vh] md:max-h-[75vh] object-contain"
                />
                <div className="absolute inset-0 bg-black/5" />

                {/* Invisible Clue Hitboxes */}
                {caseData.clues.map((clue, idx) => {
                  const isFound = cluesFound.includes(clue.id);
                  const pos = getPosition(clue.id, idx);
                  
                  return (
                    <button
                      key={clue.id}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent clicks from bubbling
                        onClueFound(clue.id);
                        setSelectedClue(clue);
                      }}
                      style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
                      className={`absolute w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all z-[55] ${
                        isFound ? 'bg-primary/90 text-white backdrop-blur-sm border-2 border-white/80 shadow-lg' : 'opacity-0 hover:bg-white/10'
                      }`}
                    >
                      {isFound && (
                        <span className="material-symbols-outlined text-xl md:text-2xl font-bold">check</span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-6 flex flex-col md:flex-row items-center gap-4 z-[50]">
                <div className="text-white/90 text-sm font-bold bg-white/10 px-5 py-2 rounded-full backdrop-blur-md border border-white/10">
                  {caseData.clues.filter(c => cluesFound.includes(c.id) && c.isRelevant).length} of {caseData.clues.filter(c => c.isRelevant).length} relevant clues found
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onResetClues();
                  }}
                  className="text-white/60 hover:text-white text-sm bg-black/40 hover:bg-black/60 px-4 py-2 rounded-full flex items-center gap-2 transition-all border border-white/5"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span> Reset
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Clue Inspector Modal using Portal */}
      {createPortal(
        <AnimatePresence>
          {selectedClue && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9, x: '-50%' }}
              animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
              exit={{ opacity: 0, y: 30, scale: 0.9, x: '-50%' }}
              className="fixed bottom-10 left-1/2 w-[90%] max-w-sm backdrop-blur-xl bg-white/95 rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/50 z-[120]"
            >
              <div className="absolute -top-3 -right-3">
                <button 
                  onClick={() => setSelectedClue(null)}
                  className="bg-white hover:bg-error/10 text-on-surface hover:text-error w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors border border-outline-variant z-[130]"
                >
                  <span className="material-symbols-outlined text-lg font-bold">close</span>
                </button>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-container to-tertiary-container flex items-center justify-center mb-4 shadow-inner border border-white">
                  <span className="material-symbols-outlined text-4xl text-primary">{selectedClue.icon}</span>
                </div>
                
                <h3 className="font-headline font-bold text-2xl text-on-surface mb-2">{selectedClue.label}</h3>
                <p className="text-on-surface-variant mb-5">{selectedClue.description}</p>
                
                <div className={`px-5 py-2 rounded-full text-sm font-bold shadow-sm inline-flex items-center gap-2 ${
                  selectedClue.isRelevant ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-orange-100 text-orange-700 border border-orange-200'
                }`}>
                  {selectedClue.isRelevant ? (
                    <><span className="material-symbols-outlined text-[18px]">verified</span> Important Evidence</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">info</span> Not Relevant</>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Progress Bar & Continue (Z-index 20 so it's under the modal) */}
      <div className="bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 flex justify-between items-center relative">
        <div className="flex-1 max-w-xs flex flex-col gap-2">
          <div className="flex justify-between text-sm font-bold">
            <span>Clues Found</span>
            <span>{caseData.clues.filter(c => cluesFound.includes(c.id) && c.isRelevant).length} / {caseData.clues.filter(c => c.isRelevant).length}</span>
          </div>
          <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-tertiary"
              initial={{ width: 0 }}
              animate={{ width: `${(caseData.clues.filter(c => cluesFound.includes(c.id) && c.isRelevant).length / caseData.clues.filter(c => c.isRelevant).length) * 100}%` }}
            />
          </div>
          <button 
            onClick={onResetClues}
            className="text-xs text-on-surface-variant hover:text-error self-start underline underline-offset-2 flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span> Reset Clues
          </button>
        </div>

        <button
          onClick={onComplete}
          disabled={!allCluesFound}
          className={`bg-primary text-on-primary btn-tactile px-8 py-3 rounded-full font-bold transition-all hover:bg-primary/90 ${
            allCluesFound ? 'opacity-100 translate-y-0 shadow-lg' : 'opacity-50 pointer-events-none'
          }`}
        >
          Analyze Evidence <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
        </button>
      </div>
    </motion.div>
  );
}
