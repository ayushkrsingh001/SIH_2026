import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import type { MythFact } from '../../types';
import { subscribeToMythFacts, markMythFactCompleted, getCompletedMythFactIds } from '../../firebase/communityFirestore';
import { getCategoryById } from '../../constants';
import { XPRewardPopup } from './XPRewardPopup';
import toast from 'react-hot-toast';

export const MythFactCards = () => {
  const { user } = useAuth();
  const [mythFacts, setMythFacts] = useState<MythFact[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);

  useEffect(() => {
    const unsub = subscribeToMythFacts((data) => {
      setMythFacts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user) {
      getCompletedMythFactIds(user.uid).then(ids => setCompletedIds(new Set(ids)));
    }
  }, [user]);

  const currentCard = mythFacts[currentIndex];
  const uncompletedCards = mythFacts.filter(mf => !completedIds.has(mf.id!));

  const handleFlip = () => setFlipped(!flipped);

  const handleComplete = async () => {
    if (!user || !currentCard || completedIds.has(currentCard.id!)) {
      goNext();
      return;
    }
    const isFirst = await markMythFactCompleted(currentCard.id!, user.uid);
    if (isFirst) {
      setCompletedIds(prev => new Set([...prev, currentCard.id!]));
      setXpAmount(currentCard.rewardXP);
      setShowXP(true);
    }
    goNext();
  };

  const goNext = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % mythFacts.length);
    }, 200);
  };

  const goPrev = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + mythFacts.length) % mythFacts.length);
    }, 200);
  };

  if (loading || mythFacts.length === 0) return null;
  if (!currentCard) return null;

  const category = getCategoryById(currentCard.categoryId);
  const isCompleted = completedIds.has(currentCard.id!);

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-title-lg text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary filled">lightbulb</span>
            Myth vs Fact
          </h2>
          <span className="font-body text-caption text-on-surface-variant">
            {currentIndex + 1}/{mythFacts.length}
          </span>
        </div>

        {/* Card Container */}
        <div className="relative w-full max-w-md mx-auto" style={{ perspective: '1200px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentCard.id}-${flipped}`}
              initial={{ opacity: 0, rotateY: flipped ? -90 : 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: flipped ? 90 : -90 }}
              transition={{ duration: 0.4 }}
              onClick={!flipped ? handleFlip : undefined}
              className={`relative min-h-[280px] rounded-[24px] p-6 shadow-card cursor-pointer select-none overflow-hidden ${
                !flipped ? 'hover:shadow-card-hover' : ''
              }`}
              style={{
                background: flipped
                  ? `linear-gradient(135deg, ${category.color}10, #f0fdf4)`
                  : `linear-gradient(135deg, ${category.color}08, #fef2f2)`,
              }}
            >
              {/* Decorative */}
              <div className="absolute top-4 right-4 opacity-10">
                <span className="material-symbols-outlined text-[80px]" style={{ color: category.color }}>
                  {flipped ? 'check_circle' : 'cancel'}
                </span>
              </div>

              {!flipped ? (
                /* MYTH Side */
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 font-headline text-label-md">
                      ❌ MYTH
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: category.bgAccent, color: category.color }}>
                      {category.emoji} {category.label}
                    </span>
                  </div>
                  <p className="font-headline text-title-lg text-on-surface mb-6 leading-relaxed">
                    "{currentCard.myth}"
                  </p>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">touch_app</span>
                    <span className="font-body text-caption">Tap to reveal the fact</span>
                  </div>
                </div>
              ) : (
                /* FACT Side */
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 font-headline text-label-md">
                      ✅ FACT
                    </span>
                  </div>
                  <p className="font-headline text-label-lg text-on-surface mb-3 leading-relaxed">
                    {currentCard.fact}
                  </p>
                  <div className="p-3 bg-surface-container-lowest/80 rounded-xl mb-3">
                    <p className="font-body text-caption text-on-surface-variant mb-1 font-semibold">💡 Explanation</p>
                    <p className="font-body text-caption text-on-surface">{currentCard.explanation}</p>
                  </div>
                  <div className="p-3 bg-surface-container-lowest/80 rounded-xl mb-4">
                    <p className="font-body text-caption text-on-surface-variant mb-1 font-semibold">⚖ Legal Info</p>
                    <p className="font-body text-caption text-on-surface">{currentCard.legalInfo}</p>
                  </div>

                  {!isCompleted && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => { e.stopPropagation(); handleComplete(); }}
                      className="w-full py-3 bg-green-500 text-white rounded-xl font-headline text-label-lg flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">star</span>
                      Got it! +{currentCard.rewardXP} XP
                    </motion.button>
                  )}
                  {isCompleted && (
                    <div className="flex items-center justify-center gap-2 py-3 text-green-600">
                      <span className="material-symbols-outlined text-[18px] filled">check_circle</span>
                      <span className="font-body text-label-md">Completed</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={goPrev}
              className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>

            {/* Progress dots */}
            <div className="flex gap-1">
              {mythFacts.slice(Math.max(0, currentIndex - 3), currentIndex + 4).map((mf, i) => {
                const actualIndex = Math.max(0, currentIndex - 3) + i;
                return (
                  <div
                    key={mf.id}
                    className={`rounded-full transition-all ${
                      actualIndex === currentIndex
                        ? 'w-4 h-1.5 bg-primary'
                        : completedIds.has(mf.id!)
                          ? 'w-1.5 h-1.5 bg-green-400'
                          : 'w-1.5 h-1.5 bg-outline-variant'
                    }`}
                  />
                );
              })}
            </div>

            <button
              onClick={goNext}
              className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <XPRewardPopup xp={xpAmount} show={showXP} onComplete={() => setShowXP(false)} label="Myth Busted!" />
    </>
  );
};
