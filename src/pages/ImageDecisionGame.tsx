import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChild } from '../contexts/ChildContext';
import type { ImageDecisionRound } from '../data/imageDecisions';
import { subscribeToImageDecisionRounds, getCompletedImageDecisionIds, markImageDecisionCompleted } from '../firebase/communityFirestore';
import { getCategoryById } from '../constants';
import type { CommunityCategoryId } from '../types';
import { XPRewardPopup } from '../components/community/XPRewardPopup';

export default function ImageDecisionGame() {
  const { user } = useAuth();
  const { activeChild } = useChild();
  const navigate = useNavigate();
  
  const [rounds, setRounds] = useState<ImageDecisionRound[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Game state for current round
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  
  // XP Popup state
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);

  // Randomize positions once per round
  const [isOptionALeft, setIsOptionALeft] = useState(true);

  useEffect(() => {
    const unsub = subscribeToImageDecisionRounds((data) => {
      setRounds(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user && activeChild) {
      getCompletedImageDecisionIds(user.uid).then(ids => setCompletedIds(new Set(ids)));
    }
  }, [user, activeChild]);

  // Randomize on new round
  useEffect(() => {
    setIsOptionALeft(Math.random() > 0.5);
    setHasAnswered(false);
    setIsCorrect(null);
    setSelectedSide(null);
    setAttemptCount(0);
  }, [currentIndex]);

  const currentRound = rounds[currentIndex];

  const handleSelect = async (side: 'left' | 'right', isOptionA: boolean) => {
    if (hasAnswered || !user || !currentRound) return;
    
    setHasAnswered(true);
    setSelectedSide(side);
    setAttemptCount(prev => prev + 1);
    
    const correct = isOptionA ? currentRound.optionA.isCorrect : currentRound.optionB.isCorrect;
    setIsCorrect(correct);

    if (correct) {
      if (!completedIds.has(currentRound.id)) {
        const isFirst = await markImageDecisionCompleted(currentRound.id, user.uid, attemptCount + 1);
        if (isFirst) {
          setCompletedIds(prev => new Set([...prev, currentRound.id]));
          setXpAmount(currentRound.xpReward);
          setShowXP(true);
        }
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < rounds.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finished all rounds - show completion (we can just advance index to rounds.length)
      setCurrentIndex(rounds.length);
    }
  };

  const handleTryAgain = () => {
    setHasAnswered(false);
    setIsCorrect(null);
    setSelectedSide(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Completion State
  if (currentIndex >= rounds.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-card max-w-md w-full"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-green-500 text-5xl">task_alt</span>
          </div>
          <h2 className="font-headline text-display-sm text-on-surface mb-4">Awesome Job!</h2>
          <p className="font-body text-body-lg text-on-surface-variant mb-8">
            You've completed all the image decision challenges and learned how to spot correct situations.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline text-title-md hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  if (!currentRound) return null;

  const category = getCategoryById(currentRound.category as CommunityCategoryId);
  const leftOption = isOptionALeft ? currentRound.optionA : currentRound.optionB;
  const rightOption = isOptionALeft ? currentRound.optionB : currentRound.optionA;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-surface hover:bg-surface-container flex items-center justify-center shadow-sm"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-sm font-headline" style={{ backgroundColor: category.bgAccent, color: category.color }}>
            {category.emoji} {category.label}
          </span>
          <span className="font-headline text-label-lg text-on-surface-variant bg-surface px-3 py-1 rounded-full shadow-sm">
            {currentIndex + 1} / {rounds.length}
          </span>
        </div>
      </div>

      {/* Context Text */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 text-center border-l-4" style={{ borderColor: category.color }}>
        <h2 className="font-headline text-title-lg text-on-surface mb-2">{currentRound.topic}</h2>
        <p className="font-body text-body-lg text-on-surface-variant mb-4">{currentRound.description}</p>
        <p className="font-headline text-title-md text-primary">{currentRound.question}</p>
      </div>

      {/* Images Side-by-Side (Stacked on Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* LEFT OPTION */}
        <motion.button
          whileHover={!hasAnswered ? { scale: 1.02 } : {}}
          whileTap={!hasAnswered ? { scale: 0.98 } : {}}
          onClick={() => handleSelect('left', isOptionALeft)}
          disabled={hasAnswered}
          className={`relative w-full rounded-2xl overflow-hidden shadow-card transition-all aspect-[4/3] flex items-center justify-center bg-surface-container ${
            !hasAnswered ? 'hover:shadow-card-hover cursor-pointer' : 'cursor-default'
          }`}
        >
          <img 
            src={leftOption.imageUrl} 
            alt={`Option 1 for ${currentRound.topic}`} 
            className="w-full h-full object-cover"
          />
          
          {/* Border Highlight overlay */}
          <AnimatePresence>
            {hasAnswered && selectedSide === 'left' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`absolute inset-0 border-8 rounded-2xl ${isCorrect ? 'border-green-500' : 'border-red-500'}`}
              />
            )}
            {hasAnswered && selectedSide !== 'left' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/40 rounded-2xl"
              />
            )}
          </AnimatePresence>
          
          {/* Result Icon */}
          <AnimatePresence>
            {hasAnswered && selectedSide === 'left' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                  isCorrect ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                <span className="material-symbols-outlined text-white text-3xl font-bold">
                  {isCorrect ? 'check' : 'close'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* RIGHT OPTION */}
        <motion.button
          whileHover={!hasAnswered ? { scale: 1.02 } : {}}
          whileTap={!hasAnswered ? { scale: 0.98 } : {}}
          onClick={() => handleSelect('right', !isOptionALeft)}
          disabled={hasAnswered}
          className={`relative w-full rounded-2xl overflow-hidden shadow-card transition-all aspect-[4/3] flex items-center justify-center bg-surface-container ${
            !hasAnswered ? 'hover:shadow-card-hover cursor-pointer' : 'cursor-default'
          }`}
        >
          <img 
            src={rightOption.imageUrl} 
            alt={`Option 2 for ${currentRound.topic}`} 
            className="w-full h-full object-cover"
          />
          
          <AnimatePresence>
            {hasAnswered && selectedSide === 'right' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`absolute inset-0 border-8 rounded-2xl ${isCorrect ? 'border-green-500' : 'border-red-500'}`}
              />
            )}
            {hasAnswered && selectedSide !== 'right' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/40 rounded-2xl"
              />
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {hasAnswered && selectedSide === 'right' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                  isCorrect ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                <span className="material-symbols-outlined text-white text-3xl font-bold">
                  {isCorrect ? 'check' : 'close'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Feedback Section */}
      <AnimatePresence mode="wait">
        {hasAnswered && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl shadow-card mb-6 ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <span className={`material-symbols-outlined text-3xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? 'emoji_events' : 'info'}
              </span>
              <div className="flex-1">
                <h3 className={`font-headline text-title-md mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? "That's Correct!" : "Not quite right..."}
                </h3>
                <p className="font-body text-body-lg text-on-surface mb-3">
                  {isCorrect ? currentRound.feedbackCorrect : currentRound.feedbackIncorrect}
                </p>
                
                {currentRound.legalFact && (
                  <div className="mt-4 p-4 bg-white/60 rounded-xl">
                    <p className="font-headline text-label-lg text-on-surface-variant mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">gavel</span> Legal Fact
                    </p>
                    <p className="font-body text-body-md text-on-surface">{currentRound.legalFact}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              {isCorrect ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-headline flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
                  Next Round <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={handleTryAgain}
                  className="px-6 py-3 bg-red-100 text-red-700 rounded-xl font-headline flex items-center gap-2 hover:bg-red-200 transition-colors"
                >
                  <span className="material-symbols-outlined">refresh</span> Try Again
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <XPRewardPopup xp={xpAmount} show={showXP} onComplete={() => setShowXP(false)} label="Great Choice!" />
    </div>
  );
}
