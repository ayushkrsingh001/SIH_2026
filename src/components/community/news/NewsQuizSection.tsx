import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { XPRewardPopup } from '../XPRewardPopup';
import { updateChild } from '../../../firebase/firestore';
import { useChild } from '../../../contexts/ChildContext';
import type { NewsQuizEmbedded } from '../../../types';

interface NewsQuizSectionProps {
  quiz: NewsQuizEmbedded;
}

export const NewsQuizSection = ({ quiz }: NewsQuizSectionProps) => {
  const { user } = useAuth();
  const { activeChild, setActiveChild } = useChild();
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showXP, setShowXP] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);



  if (!quiz || quiz.questions.length === 0) return null;

  const currentQ = quiz.questions[currentQIdx];

  const handleSelect = async (idx: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(idx);
    const correct = idx === currentQ.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setXpEarned(prev => prev + currentQ.xpReward);
    }
  };

  const handleNext = async () => {
    if (currentQIdx < quiz.questions.length - 1) {
      setCurrentQIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      // Quiz complete
      setQuizCompleted(true);
      if (xpEarned > 0 && user && activeChild) {
        const newXp = activeChild.xp + xpEarned;
        await updateChild(user.uid, activeChild.id!, { xp: newXp });
        setActiveChild({ ...activeChild, xp: newXp });
        setShowXP(true);
      }
    }
  };

  if (quizCompleted) {
    return (
      <div className="bg-primary-container/20 rounded-2xl p-6 text-center border-2 border-primary/20">
        <span className="material-symbols-outlined text-[48px] text-primary mb-2">emoji_events</span>
        <h3 className="font-headline text-title-md text-on-surface mb-1">Quiz Completed!</h3>
        <p className="font-body text-body-md text-on-surface-variant">
          You earned {xpEarned} XP for testing your knowledge.
        </p>
        <XPRewardPopup xp={xpEarned} show={showXP} onComplete={() => setShowXP(false)} label="Quiz Passed!" />
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low rounded-2xl p-4 md:p-6 border border-outline-variant/30 relative overflow-hidden mt-4">
      <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-highest">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQIdx + (selectedOption !== null ? 1 : 0)) / quiz.questions.length) * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-2 mb-4 mt-2">
        <span className="material-symbols-outlined text-primary">quiz</span>
        <h4 className="font-headline text-title-md text-on-surface">Knowledge Check ({currentQIdx + 1}/{quiz.questions.length})</h4>
      </div>

      <p className="font-body text-body-lg text-on-surface mb-6">
        {currentQ.question}
      </p>

      <div className="space-y-3 mb-6">
        {currentQ.options.map((opt, idx) => {
          let btnClass = "bg-surface-container hover:bg-surface-container-high border-transparent text-on-surface";
          if (selectedOption !== null) {
            if (idx === currentQ.correctAnswer) {
              btnClass = "bg-green-100 border-green-500 text-green-900";
            } else if (idx === selectedOption) {
              btnClass = "bg-red-100 border-red-500 text-red-900";
            } else {
              btnClass = "bg-surface-container opacity-50";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selectedOption !== null}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all font-body text-body-md flex items-center justify-between ${btnClass}`}
            >
              <span>{opt}</span>
              {selectedOption !== null && idx === currentQ.correctAnswer && (
                <span className="material-symbols-outlined text-green-600">check_circle</span>
              )}
              {selectedOption === idx && idx !== currentQ.correctAnswer && (
                <span className="material-symbols-outlined text-red-600">cancel</span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedOption !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}
          >
            <p className="font-headline font-bold mb-1">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
            <p className="font-body text-body-sm">{currentQ.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedOption !== null && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleNext}
          className="w-full bg-primary text-on-primary py-3 rounded-full font-headline text-label-lg hover:shadow-md transition-shadow"
        >
          {currentQIdx < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </motion.button>
      )}
    </div>
  );
};
