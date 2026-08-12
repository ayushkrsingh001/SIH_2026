import { useState, useEffect } from 'react';
import { Reorder } from 'framer-motion';
import type { DetectivePuzzle, DetectiveAction } from '../../../types';
import toast from 'react-hot-toast';

interface SequencePuzzleProps {
  puzzle: DetectivePuzzle;
  onComplete: () => void;
}

export default function SequencePuzzle({ puzzle, onComplete }: SequencePuzzleProps) {
  const [items, setItems] = useState<DetectiveAction[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Shuffle initial items reliably
    if (puzzle.actions && puzzle.correctSequenceIds) {
      let shuffled = [...puzzle.actions];
      
      // Proper Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Ensure it's not already in the correct order, to force the player to actually solve it
      const isAlreadyCorrect = shuffled.every((item, idx) => item.id === puzzle.correctSequenceIds![idx]);
      if (isAlreadyCorrect && shuffled.length > 1) {
        // Swap the first two items to break the correct order
        [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
      }
      
      setItems(shuffled);
    }
  }, [puzzle]);

  const checkOrder = () => {
    setIsChecking(true);
    
    if (!puzzle.correctSequenceIds) return;
    
    const isCorrect = items.every((item, index) => item.id === puzzle.correctSequenceIds![index]);
    
    if (isCorrect) {
      toast.success('Perfect sequence!', { icon: '🏆' });
      setTimeout(() => {
        onComplete();
      }, 1500);
    } else {
      toast.error('Not quite right. Try dragging them into a different order!', { icon: '🔄' });
      setTimeout(() => {
        setIsChecking(false);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col max-w-lg mx-auto w-full pt-4 pb-8">
      <div className="bg-primary-container text-on-primary-container p-4 rounded-2xl mb-8 flex gap-4 items-center w-full">
        <span className="material-symbols-outlined text-4xl">format_list_numbered</span>
        <div>
          <p className="font-bold text-lg">Order the steps</p>
          <p className="text-sm opacity-90">Drag the actions up and down to put them in the safest order.</p>
        </div>
      </div>

      <Reorder.Group 
        axis="y" 
        values={items} 
        onReorder={setItems} 
        className="w-full flex flex-col gap-3 mb-8"
      >
        {items.map((item, index) => (
          <Reorder.Item 
            key={item.id} 
            value={item}
            className="relative"
          >
            <div className="bg-white border-2 border-outline-variant p-4 rounded-xl shadow-sm flex items-center gap-4 cursor-grab active:cursor-grabbing hover:border-primary transition-colors select-none">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-on-surface-variant shrink-0">
                {index + 1}
              </div>
              <p className="font-bold flex-1">{item.label}</p>
              <span className="material-symbols-outlined text-outline">drag_indicator</span>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <button
        onClick={checkOrder}
        disabled={isChecking}
        className="bg-primary text-on-primary btn-tactile w-full py-4 rounded-2xl font-bold text-lg shadow-elevation-2 hover:bg-primary/90"
      >
        Check My Answer
      </button>
    </div>
  );
}
