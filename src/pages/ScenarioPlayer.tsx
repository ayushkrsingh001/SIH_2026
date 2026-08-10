import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useChild } from '../contexts/ChildContext';
import { getProgress, setProgress, updateChild } from '../firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { MASCOT_SMALL_URL } from '../constants';
import { PageSkeleton } from '../components/ui/SkeletonLoader';
import type { Scene, Module, Progress, Choice, DangerZone } from '../types';
import { allLocalModules } from '../data';
import { groqService } from '../services/groqService';
import { transformAILevelToScenes } from '../services/aiLevelTransformer';
import toast from 'react-hot-toast';

const ScenarioPlayer = () => {
  const { user } = useAuth();
  const { activeChild } = useChild();
  const navigate = useNavigate();
  const { childId, moduleId } = useParams();

  const [module, setModule] = useState<Module | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [visitedSceneIds, setVisitedSceneIds] = useState<string[]>([]);
  const [totalChoices, setTotalChoices] = useState(0);
  const [correctChoices, setCorrectChoices] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [dragMatches, setDragMatches] = useState<Record<string, string>>({});
  const [sequenceSelection, setSequenceSelection] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!moduleId) return;
      
      const mod = allLocalModules.find(m => m.id === moduleId) || null;
      if (!mod) { navigate(-1); return; }
      
      setModule(mod);

      try {
        const childAge = activeChild?.age || 12;
        let ageGroup = '11-13';
        if (childAge <= 10) ageGroup = '8-10';
        else if (childAge >= 14) ageGroup = '14-16';

        const aiLevel = await groqService.generateCampaignLevel(
          mod.title,
          mod.category,
          mod.difficulty,
          ageGroup
        );

        const sceneList = transformAILevelToScenes(aiLevel, moduleId);
        
        if (sceneList.length === 0) { 
          toast.error("Failed to load questions. Please try again.");
          navigate(-1); 
          return; 
        }

        setScenes(sceneList);
        setCurrentScene(sceneList[0]);
        // Note: For dynamic levels, we ignore mid-level progress (visitedSceneIds) to ensure 
        // the new dynamic scenes don't clash with old session IDs.
        setVisitedSceneIds([]);
      } catch (error) {
        console.error("Error generating dynamic campaign level:", error);
        toast.error("Error loading dynamic level. Please try again.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [moduleId, user, childId, navigate, activeChild?.age]);

  // Setup timers
  useEffect(() => {
    if (currentScene?.type === 'time_challenge' && currentScene.timeLimit && !showFeedback) {
      setTimeLeft(currentScene.timeLimit);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentScene, showFeedback]);

  const handleTimeUp = () => {
    // Automatically select the wrong choice or show time up feedback
    if (currentScene?.choices) {
      const wrongChoice = currentScene.choices.find(c => !c.isCorrect) || currentScene.choices[0];
      handleChoiceSelect(wrongChoice);
    }
  };

  const saveProgress = useCallback(async (visited: string[], isComplete: boolean) => {
    if (!user || !childId || !moduleId) return;
    const finalScore = totalChoices > 0 ? Math.round((correctChoices / totalChoices) * 100) : 0;
    
    // In a real app we'd aggregate categoryScores here.
    
    const progressData: Progress = {
      parentId: user.uid,
      childId,
      moduleId,
      visitedSceneIds: visited,
      score: finalScore,
      status: isComplete ? 'completed' : 'in_progress',
      completedAt: isComplete ? Timestamp.now() : null,
    };
    await setProgress(progressData);

    if (isComplete && module && activeChild) {
      const newXp = (activeChild.xp || 0) + module.xpReward;
      const newCoins = (activeChild.coins || 0) + (module.coinReward || 10);
      await updateChild(user.uid, childId, {
        xp: newXp,
        coins: newCoins,
        lastActive: Timestamp.now(),
      });
    }
  }, [user, childId, moduleId, totalChoices, correctChoices, module, activeChild]);

  const handleContinue = async () => {
    if (!currentScene) return;

    if (currentScene.type === 'story') {
      await advanceToNext(currentScene.nextSceneId || null);
    }
  };

  const advanceToNext = async (nextId: string | null) => {
    if (!currentScene) return;
    
    if (!nextId) {
      await saveProgress([...visitedSceneIds, currentScene.id!], true);
      navigate(`/play/${childId}/module/${moduleId}/complete`, { replace: true });
      return;
    }
    const nextScene = scenes.find(s => s.id === nextId);
    if (nextScene) {
      const newVisited = [...visitedSceneIds, currentScene.id!];
      setVisitedSceneIds(newVisited);
      setCurrentScene(nextScene);
      setSelectedChoice(null);
      setTimeLeft(null);
      setDragMatches({});
      setSequenceSelection([]);
      setShowFeedback(false);
      await saveProgress(newVisited, false);
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

  const handleSpotDangerClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (showFeedback || !currentScene?.dangerZones) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    let clickedZone: DangerZone | null = null;
    
    for (const zone of currentScene.dangerZones) {
      // Check if click is within radius
      const dist = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
      if (dist <= zone.radius) {
        clickedZone = zone;
        break;
      }
    }

    if (clickedZone) {
      // Auto-select correct choice implicitly
      const correctChoice = currentScene.choices.find(c => c.isCorrect);
      if (correctChoice) handleChoiceSelect(correctChoice);
    } else {
      // Auto-select wrong choice implicitly
      const wrongChoice = currentScene.choices.find(c => !c.isCorrect);
      if (wrongChoice) handleChoiceSelect(wrongChoice);
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('itemId', itemId);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (showFeedback) return;
    const itemId = e.dataTransfer.getData('itemId');
    
    // Check if correct match
    const item = currentScene?.dragItems?.find(i => i.id === itemId);
    if (item && item.targetId === targetId) {
      setDragMatches(prev => {
        const newMatches = { ...prev, [itemId]: targetId };
        
        // If all matched, auto-select correct choice
        if (Object.keys(newMatches).length === currentScene?.dragItems?.length) {
          const correctChoice = currentScene.choices.find(c => c.isCorrect);
          if (correctChoice) handleChoiceSelect(correctChoice);
        }
        return newMatches;
      });
    } else {
      // Wrong match
      const wrongChoice = currentScene?.choices.find(c => !c.isCorrect);
      if (wrongChoice) handleChoiceSelect(wrongChoice);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSequenceSelect = (itemId: string) => {
    if (showFeedback || sequenceSelection.includes(itemId)) return;

    setSequenceSelection(prev => {
      const newSelection = [...prev, itemId];
      
      // If all items selected, evaluate
      if (currentScene?.sequenceItems && newSelection.length === currentScene.sequenceItems.length) {
        // Evaluate if correct order
        let isCorrect = true;
        for (let i = 0; i < newSelection.length; i++) {
          const item = currentScene.sequenceItems.find(item => item.id === newSelection[i]);
          if (item?.correctOrder !== i + 1) {
            isCorrect = false;
            break;
          }
        }
        
        const feedbackText = isCorrect 
          ? "Perfect sequence!" 
          : "Not quite the right order. Try again!";
          
        setSelectedChoice({
          text: 'Sequence',
          isCorrect,
          feedbackText,
          nextSceneId: currentScene.nextSceneId || null,
        });
        setShowFeedback(true);
      }
      
      return newSelection;
    });
  };

  const handleSequenceReset = () => {
    setSequenceSelection([]);
  };

  if (loading) return <PageSkeleton />;
  if (!currentScene || !module) return null;

  const progressPercent = scenes.length > 0 ? (visitedSceneIds.length / scenes.length) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/play/${childId}/map`)}
          className="text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Back to map"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex-1">
          <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-secondary rounded-full"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        <div className="font-body text-label-md text-on-surface-variant w-12 text-right">
          {Math.round(progressPercent)}%
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
          {currentScene.mediaUrl && (
            <div className={`w-full ${currentScene.type === 'spot_danger' ? 'h-96' : 'h-64'} bg-surface-dim relative overflow-hidden group`}>
              {currentScene.type === 'spot_danger' ? (
                <div className="relative w-full h-full cursor-crosshair">
                  <img src={currentScene.mediaUrl} alt="Scene context" className="w-full h-full object-cover" onClick={handleSpotDangerClick} />
                  {/* Debug/Show zones when feedback is shown */}
                  {showFeedback && currentScene.dangerZones?.map(z => (
                    <div key={z.id} className="absolute border-4 border-error rounded-full pointer-events-none" style={{ left: `${z.x - z.radius}%`, top: `${z.y - z.radius}%`, width: `${z.radius * 2}%`, height: `${z.radius * 2}%` }}>
                       <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-error text-on-error px-2 py-1 rounded text-xs whitespace-nowrap">{z.description}</span>
                    </div>
                  ))}
                  {!showFeedback && <div className="absolute inset-0 bg-black/10 pointer-events-none group-hover:bg-transparent transition-colors" />}
                  {!showFeedback && <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur px-4 py-2 rounded-full shadow-sm text-on-surface font-body text-label-md font-bold animate-pulse pointer-events-none">Tap the danger!</div>}
                </div>
              ) : (
                <img src={currentScene.mediaUrl} alt="Scene context" className="w-full h-full object-cover" />
              )}
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-primary-container">
                <img src={MASCOT_SMALL_URL} alt="Guide" className="w-full h-full object-cover" />
              </div>
              <div className="bg-surface-container-high rounded-[24px] rounded-tl-none p-5 flex-1 relative">
                {currentScene.type === 'time_challenge' && timeLeft !== null && (
                  <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${timeLeft <= 3 ? 'bg-error animate-pulse' : 'bg-primary'}`}>
                    {timeLeft}s
                  </div>
                )}
                <p className="font-body text-body-lg text-on-surface whitespace-pre-line leading-relaxed">
                  {currentScene.text}
                </p>
              </div>
            </div>

            {/* Render interaction based on type */}
            {(currentScene.type === 'choice' || currentScene.type === 'time_challenge') && !showFeedback && (
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

            {currentScene.type === 'drag_drop' && !showFeedback && currentScene.dragItems && currentScene.dragTargets && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3 p-4 bg-surface-container rounded-[20px]">
                  {currentScene.dragItems.filter(item => !dragMatches[item.id]).map(item => (
                    <motion.div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, item.id)}
                      className="px-4 py-2 bg-primary text-on-primary rounded-full font-body text-label-md cursor-grab active:cursor-grabbing shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.text}
                    </motion.div>
                  ))}
                  {currentScene.dragItems.filter(item => !dragMatches[item.id]).length === 0 && (
                    <span className="font-body text-caption text-on-surface-variant w-full text-center py-2">All items placed!</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {currentScene.dragTargets.map(target => (
                    <div
                      key={target.id}
                      onDrop={(e) => handleDrop(e as unknown as React.DragEvent, target.id)}
                      onDragOver={handleDragOver}
                      className="border-2 border-dashed border-outline-variant bg-surface-container-lowest p-4 rounded-[20px] min-h-[120px] flex flex-col items-center justify-center transition-colors hover:bg-surface-bright"
                    >
                      <span className="font-headline text-title-md text-on-surface-variant mb-2 text-center">{target.label}</span>
                      <div className="flex flex-col gap-2 w-full">
                        {currentScene.dragItems?.filter(item => dragMatches[item.id] === target.id).map(item => (
                           <div key={item.id} className="px-3 py-2 bg-primary-container text-on-primary-container rounded-lg font-body text-label-md text-center shadow-sm">
                             {item.text}
                           </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                    onClick={handleSequenceReset}
                    className="mt-4 text-primary font-body text-label-md hover:underline"
                  >
                    Reset Order
                  </button>
                )}
              </div>
            )}

            {currentScene.type === 'story' && !showFeedback && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleContinue}
                className="w-full py-4 bg-primary text-on-primary rounded-full font-body text-label-lg btn-tactile border-b-4 border-on-primary-fixed-variant shadow-sm"
              >
                Continue
              </motion.button>
            )}

            {/* Feedback Modal / Inline */}
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
                      ? 'bg-secondary text-on-secondary border-[#006b5a] hover:bg-[#006b5a]' // Hardcoded slightly darker teal for border
                      : 'bg-error text-on-error border-[#8c0009] hover:bg-[#8c0009]'
                  } transition-colors`}
                >
                  {selectedChoice.isCorrect ? 'Continue' : 'Try to remember this!'}
                </button>
              </motion.div>
            )}
            
            {showFeedback && !selectedChoice && (
               <motion.button
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 onClick={() => advanceToNext(currentScene.choices?.[0]?.nextSceneId || null)}
                 className="w-full py-4 bg-primary text-on-primary rounded-full font-body text-label-lg btn-tactile border-b-4 border-on-primary-fixed-variant shadow-sm mt-4"
               >
                 Continue
               </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ScenarioPlayer;
