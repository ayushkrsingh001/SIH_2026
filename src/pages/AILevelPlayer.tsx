import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useChild } from '../contexts/ChildContext';
import { getCachedAILevelById, updateCachedAILevel, updateChild, updateDailyChallengeStreak } from '../firebase/firestore';
import { transformAILevelToScenes } from '../services/aiLevelTransformer';
import { Timestamp } from 'firebase/firestore';
import { MASCOT_SMALL_URL } from '../constants';
import { PageSkeleton } from '../components/ui/SkeletonLoader';
import type { Scene, Choice, CachedAILevel } from '../types';
import toast from 'react-hot-toast';

const AILevelPlayer = () => {
  const { user } = useAuth();
  const { activeChild } = useChild();
  const navigate = useNavigate();
  const { childId, aiLevelId } = useParams();

  const [cachedLevel, setCachedLevel] = useState<CachedAILevel | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [visitedSceneIds, setVisitedSceneIds] = useState<string[]>([]);
  const [totalChoices, setTotalChoices] = useState(0);
  const [correctChoices, setCorrectChoices] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sequenceSelection, setSequenceSelection] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!aiLevelId) { navigate(`/play/${childId}/ai-hub`); return; }

      const cached = await getCachedAILevelById(aiLevelId);
      if (!cached) {
        toast.error('AI level not found');
        navigate(`/play/${childId}/ai-hub`);
        return;
      }

      setCachedLevel(cached);
      const sceneList = transformAILevelToScenes(cached.levelData, `ai_${aiLevelId}`);
      setScenes(sceneList);
      setCurrentScene(sceneList[0]);

      // Mark as in_progress
      if (cached.status === 'unplayed') {
        await updateCachedAILevel(aiLevelId, { status: 'in_progress' });
      }

      setLoading(false);
    };
    loadData();
  }, [aiLevelId, navigate]);

  const saveCompletion = useCallback(async () => {
    if (!user || !childId || !aiLevelId || !cachedLevel) return;
    const finalScore = totalChoices > 0 ? Math.round((correctChoices / totalChoices) * 100) : 0;

    try {
      // Update cached level status
      await updateCachedAILevel(aiLevelId, {
        status: 'completed',
        score: finalScore,
      });

      // Award XP and coins
      if (activeChild) {
        const reward = cachedLevel.levelData.reward;
        const newXp = (activeChild.xp || 0) + reward.xp;
        const newCoins = (activeChild.coins || 0) + reward.coins;
        const newCompletedCount = (activeChild.completedLevelsCount || 0) + 1;
        
        await updateChild(user.uid, childId, {
          xp: newXp,
          coins: newCoins,
          completedLevelsCount: newCompletedCount,
          lastActive: Timestamp.now(),
        });

        // Update local state for triggers in the next screen
        activeChild.completedLevelsCount = newCompletedCount;

        if (cachedLevel.type === 'daily_challenge') {
          await updateDailyChallengeStreak(childId, user.uid);
        }
      }
    } catch (error) {
      console.error("Failed to save completion stats:", error);
      toast.error("Couldn't save some progress, but level is complete!");
    }
  }, [user, childId, aiLevelId, cachedLevel, totalChoices, correctChoices, activeChild]);

  const advanceToNext = async (nextId: string | null) => {
    if (!currentScene) return;

    if (!nextId) {
      // Level complete!
      await saveCompletion();
      navigate(`/play/${childId}/ai-complete/${aiLevelId}`, { replace: true });
      return;
    }

    const nextScene = scenes.find(s => s.id === nextId);
    if (nextScene) {
      const newVisited = [...visitedSceneIds, currentScene.id!];
      setVisitedSceneIds(newVisited);
      setCurrentScene(nextScene);
      setSelectedChoice(null);
      setSequenceSelection([]);
      setShowFeedback(false);
    }
  };

  const handleChoiceSelect = (choice: Choice) => {
    if (showFeedback) return;
    setSelectedChoice(choice);
    setShowFeedback(true);
    setTotalChoices(prev => prev + 1);
    if (choice.isCorrect) setCorrectChoices(prev => prev + 1);
  };

  const handleChoiceContinue = async () => {
    if (!selectedChoice) return;
    await advanceToNext(selectedChoice.nextSceneId || null);
  };

  const handleContinue = async () => {
    if (!currentScene) return;
    if (currentScene.type === 'story') {
      await advanceToNext(currentScene.nextSceneId || null);
    }
  };

  const handleSequenceSelect = (itemId: string) => {
    if (showFeedback || sequenceSelection.includes(itemId)) return;

    setSequenceSelection(prev => {
      const newSelection = [...prev, itemId];

      if (currentScene?.sequenceItems && newSelection.length === currentScene.sequenceItems.length) {
        let isCorrect = true;
        for (let i = 0; i < newSelection.length; i++) {
          const item = currentScene.sequenceItems.find(item => item.id === newSelection[i]);
          if (item?.correctOrder !== i + 1) {
            isCorrect = false;
            break;
          }
        }

        setSelectedChoice({
          text: 'Sequence',
          isCorrect,
          feedbackText: isCorrect
            ? '✅ Perfect sequence! You got the order right!'
            : '❌ Not quite the right order. Review the correct sequence!',
          nextSceneId: currentScene.nextSceneId || null,
        });
        setShowFeedback(true);
        setTotalChoices(prev => prev + 1);
        if (isCorrect) setCorrectChoices(prev => prev + 1);
      }

      return newSelection;
    });
  };

  if (loading) return <PageSkeleton />;
  if (!currentScene || !cachedLevel) return null;

  const progressPercent = scenes.length > 0 ? (visitedSceneIds.length / scenes.length) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/play/${childId}/ai-hub`)}
          className="text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Back to AI Hub"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex-1">
          <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        <div className="font-body text-label-md text-on-surface-variant w-12 text-right">
          {Math.round(progressPercent)}%
        </div>
        {/* AI Badge */}
        <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-full font-body text-xs font-bold flex items-center gap-1">
          <span className="material-symbols-outlined text-xs filled">auto_awesome</span>
          AI
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-surface-container-lowest rounded-[32px] shadow-card overflow-hidden border border-outline-variant/20"
        >
          <div className="p-6 md:p-8">
            {/* AI Level Title */}
            {currentScene.type === 'story' && (
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary filled text-lg">auto_awesome</span>
                <span className="font-headline text-label-md text-primary font-bold">
                  {cachedLevel.levelData.title}
                </span>
                <span className="text-on-surface-variant font-body text-caption">
                  · {cachedLevel.levelData.difficulty}
                </span>
              </div>
            )}

            {/* Scene Text */}
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-primary-container">
                <img src={MASCOT_SMALL_URL} alt="Guide" className="w-full h-full object-cover" />
              </div>
              <div className="bg-surface-container-high rounded-[24px] rounded-tl-none p-5 flex-1">
                <p className="font-body text-body-lg text-on-surface whitespace-pre-line leading-relaxed">
                  {currentScene.text}
                </p>
                {currentScene.relatedLegalInfo && currentScene.type !== 'story' && (
                  <div className="mt-3 p-3 bg-primary-fixed/30 rounded-xl">
                    <p className="font-body text-caption text-on-surface-variant flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-xs text-primary filled mt-0.5">gavel</span>
                      {currentScene.relatedLegalInfo}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Choice Questions */}
            {currentScene.type === 'choice' && !showFeedback && (
              <div className="space-y-3">
                {currentScene.choices.map((choice, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleChoiceSelect(choice)}
                    className="w-full p-4 bg-surface-bright border-2 border-outline-variant hover:border-primary rounded-[20px] text-left font-body text-body-lg text-on-surface transition-all hover:shadow-md tactile-input"
                  >
                    {choice.text}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Order Sequence */}
            {currentScene.type === 'order_sequence' && !showFeedback && currentScene.sequenceItems && (
              <div className="space-y-4">
                <p className="font-body text-label-md text-on-surface-variant">Tap the items in the correct order:</p>
                <div className="flex flex-col gap-2">
                  {currentScene.sequenceItems.map(item => {
                    const isSelected = sequenceSelection.includes(item.id);
                    const selectionIndex = sequenceSelection.indexOf(item.id);
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleSequenceSelect(item.id)}
                        disabled={isSelected}
                        className={`w-full p-4 border-2 rounded-[20px] text-left font-body text-body-lg flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-primary-container text-on-primary-container border-primary-container'
                            : 'bg-surface-bright border-outline-variant hover:border-primary text-on-surface'
                        }`}
                      >
                        <span>{item.text}</span>
                        {isSelected && (
                          <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                            {selectionIndex + 1}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                {sequenceSelection.length > 0 && (
                  <button
                    onClick={() => setSequenceSelection([])}
                    className="mt-4 text-primary font-body text-label-md hover:underline"
                  >
                    Reset Order
                  </button>
                )}
              </div>
            )}

            {/* Story Continue Button */}
            {currentScene.type === 'story' && !showFeedback && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleContinue}
                className="w-full py-4 bg-primary text-on-primary rounded-full font-body text-label-lg btn-tactile border-b-4 border-on-primary-fixed-variant shadow-sm"
              >
                Start Questions →
              </motion.button>
            )}

            {/* Feedback */}
            {showFeedback && selectedChoice && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-[24px] mb-6 ${
                  selectedChoice.isCorrect
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'bg-error-container text-on-error-container'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-3xl filled">
                    {selectedChoice.isCorrect ? 'check_circle' : 'cancel'}
                  </span>
                  <h3 className="font-headline text-title-lg">
                    {selectedChoice.isCorrect ? 'Great Job!' : 'Not Quite Right'}
                  </h3>
                </div>
                <p className="font-body text-body-lg mb-6 leading-relaxed opacity-90">
                  {selectedChoice.feedbackText}
                </p>
                <button
                  onClick={handleChoiceContinue}
                  className={`w-full py-4 rounded-full font-body text-label-lg shadow-sm border-b-4 ${
                    selectedChoice.isCorrect
                      ? 'bg-secondary text-on-secondary border-[#006b5a] hover:bg-[#006b5a]'
                      : 'bg-error text-on-error border-[#8c0009] hover:bg-[#8c0009]'
                  } transition-colors`}
                >
                  {selectedChoice.isCorrect ? 'Continue' : 'Got it, continue!'}
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AILevelPlayer;
