import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DetectivePuzzle, DetectiveAction } from '../../../types';
import toast from 'react-hot-toast';

interface ActionSortPuzzleProps {
  puzzle: DetectivePuzzle;
  onComplete: () => void;
}

export default function ActionSortPuzzle({ puzzle, onComplete }: ActionSortPuzzleProps) {
  const [unassigned, setUnassigned] = useState<DetectiveAction[]>(puzzle.actions || []);
  const [safeItems, setSafeItems] = useState<DetectiveAction[]>([]);
  const [unsafeItems, setUnsafeItems] = useState<DetectiveAction[]>([]);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  const handleAssign = (action: DetectiveAction, isSafeDrop: boolean) => {
    if (action.isSafe === isSafeDrop) {
      // Correct!
      setUnassigned(prev => prev.filter(a => a.id !== action.id));
      if (isSafeDrop) {
        setSafeItems(prev => [...prev, action]);
      } else {
        setUnsafeItems(prev => [...prev, action]);
      }
      
      toast.success('Correct!', { icon: '✅' });
      
      // Check if complete
      if (unassigned.length === 1) {
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    } else {
      // Incorrect
      setShowFeedback(action.consequenceFeedback);
      toast.error('Not quite right. Try again!', { icon: '❌' });
    }
  };

  return (
    <div className="flex flex-col relative pt-4 pb-8">
      
      <div className="flex-1 grid grid-cols-2 gap-4 mb-8 min-h-[200px]">
        {/* SAFE ZONE */}
        <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-4 flex flex-col items-center">
          <div className="bg-green-100 text-green-700 p-3 rounded-full mb-4">
            <span className="material-symbols-outlined text-3xl">gpp_good</span>
          </div>
          <h4 className="font-bold text-green-800 mb-4">SAFE ACTIONS</h4>
          
          <div className="w-full flex flex-col gap-2">
            <AnimatePresence>
              {safeItems.map(item => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-3 rounded-xl border border-green-300 text-sm text-center shadow-sm"
                >
                  {item.label}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* UNSAFE ZONE */}
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-4 flex flex-col items-center">
          <div className="bg-red-100 text-red-700 p-3 rounded-full mb-4">
            <span className="material-symbols-outlined text-3xl">warning</span>
          </div>
          <h4 className="font-bold text-red-800 mb-4">UNSAFE ACTIONS</h4>
          
          <div className="w-full flex flex-col gap-2">
            <AnimatePresence>
              {unsafeItems.map(item => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-3 rounded-xl border border-red-300 text-sm text-center shadow-sm"
                >
                  {item.label}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ITEMS TO SORT (Using buttons for reliable cross-device interaction instead of buggy drag/drop) */}
      <div className="bg-surface-container-lowest border-t-2 border-outline-variant -mx-6 -mb-6 p-6 pb-8">
        <h4 className="font-bold text-center mb-4 text-on-surface-variant">Tap an action to sort it:</h4>
        
        <div className="flex flex-wrap justify-center gap-3">
          <AnimatePresence mode="popLayout">
            {unassigned.map(item => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-sm w-full max-w-sm flex flex-col gap-3"
              >
                <p className="font-bold text-center">{item.label}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleAssign(item, true)}
                    className="py-2 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-200 transition-colors"
                  >
                    SAFE
                  </button>
                  <button 
                    onClick={() => handleAssign(item, false)}
                    className="py-2 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-colors"
                  >
                    UNSAFE
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {unassigned.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-8 w-full"
            >
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl">check</span>
              </div>
              <p className="font-bold text-xl text-green-700">All actions sorted perfectly!</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-3xl shadow-elevation-4 border-2 border-red-500 max-w-sm w-full z-50 text-center"
          >
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">error</span>
            </div>
            <h3 className="font-bold text-xl mb-2">Think again!</h3>
            <p className="text-on-surface-variant mb-6">{showFeedback}</p>
            <button 
              onClick={() => setShowFeedback(null)}
              className="w-full py-3 bg-red-100 text-red-700 font-bold rounded-xl"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {showFeedback && <div className="absolute inset-0 bg-black/20 z-40 rounded-3xl" onClick={() => setShowFeedback(null)} />}
    </div>
  );
}
