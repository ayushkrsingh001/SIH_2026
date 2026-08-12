import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useChild } from '../contexts/ChildContext';
import { RIGHTS_DETECTIVE_CASES } from '../data/rightsDetectiveCases';
import { getDetectiveProgress, saveDetectiveProgress, updateChild } from '../firebase/firestore';
import type { DetectiveCase, DetectiveProgress } from '../types';

import StoryView from '../components/game/rights-detective/StoryView';
import InvestigationView from '../components/game/rights-detective/InvestigationView';
import ActionSortPuzzle from '../components/game/rights-detective/ActionSortPuzzle';
import SequencePuzzle from '../components/game/rights-detective/SequencePuzzle';
import CaseComplete from '../components/game/rights-detective/CaseComplete';
import toast from 'react-hot-toast';

type GameState = 'STORY' | 'INVESTIGATION' | 'PUZZLE' | 'COMPLETED';

export default function RightsDetectiveCase() {
  const { childId, caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeChild, setActiveChild } = useChild();

  const [caseData, setCaseData] = useState<DetectiveCase | null>(null);
  const [progress, setProgress] = useState<DetectiveProgress | null>(null);
  
  const [gameState, setGameState] = useState<GameState>('STORY');
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [cluesFound, setCluesFound] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCase() {
      if (!user || !childId || !caseId) return;
      
      const foundCase = RIGHTS_DETECTIVE_CASES.find(c => c.id === caseId);
      if (!foundCase) {
        navigate(`/play/${childId}/detective`);
        return;
      }
      setCaseData(foundCase);

      try {
        const existingProgress = await getDetectiveProgress(user.uid, childId, caseId);
        if (existingProgress) {
          setProgress(existingProgress);
          
          if (existingProgress.status === 'completed') {
            // Replaying a completed case: Start fresh locally
            setCluesFound([]);
          } else {
            // Resuming an incomplete case: Load previous clues
            setCluesFound(existingProgress.cluesFound || []);
          }
        } else {
          // Initialize progress
          const newProgress: Omit<DetectiveProgress, 'id'> = {
            childId,
            caseId,
            status: 'in_progress',
            startedAt: null, // Will use serverTimestamp but we can mock it here
            completedAt: null,
            cluesFound: [],
            puzzlesCompleted: [],
            attempts: 0,
            hintsUsed: 0,
            score: 0,
            bestScore: 0
          };
          await saveDetectiveProgress(user.uid, newProgress);
          // Wait to fetch actual doc or just use the local representation
          setProgress(newProgress as DetectiveProgress);
        }
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [user, childId, caseId, navigate]);

  if (loading || !caseData || !progress) return <div className="p-8 text-center">Loading Case Files...</div>;

  const handleStoryComplete = () => {
    setGameState('INVESTIGATION');
  };

  const handleClueFound = async (clueId: string) => {
    if (!cluesFound.includes(clueId)) {
      const newClues = [...cluesFound, clueId];
      setCluesFound(newClues);
      
      // Save progress
      if (user && childId) {
        await saveDetectiveProgress(user.uid, {
          ...progress,
          cluesFound: newClues
        });
      }
      toast.success("Clue Found!");
    }
  };

  const handleResetClues = async () => {
    setCluesFound([]);
    if (user && childId && progress) {
      await saveDetectiveProgress(user.uid, {
        ...progress,
        cluesFound: []
      });
    }
    toast.success("Clues reset. Find them again!");
  };

  const handleInvestigationComplete = () => {
    setGameState('PUZZLE');
    setCurrentPuzzleIndex(0);
  };

  const handlePuzzleComplete = async (score: number) => {
    if (currentPuzzleIndex < caseData.puzzles.length - 1) {
      setCurrentPuzzleIndex(prev => prev + 1);
    } else {
      // All puzzles done! Complete case.
      setGameState('COMPLETED');
      
      if (user && childId && activeChild) {
        const newScore = progress.score + score;
        const bestScore = Math.max(progress.bestScore, newScore);
        
        await saveDetectiveProgress(user.uid, {
          ...progress,
          status: 'completed',
          score: newScore,
          bestScore,
          completedAt: null // Ideally use timestamp
        });

        // Award XP
        if (progress.status !== 'completed') { // only award first time
          const newXp = activeChild.xp + caseData.xpReward;
          await updateChild(user.uid, childId, { xp: newXp });
          setActiveChild({ ...activeChild, xp: newXp });
          toast.success(`You earned ${caseData.xpReward} XP!`, { icon: '🌟' });
        }
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-160px)] mt-4 flex flex-col relative bg-surface rounded-3xl overflow-hidden shadow-xl border border-outline-variant">
      {/* Header */}
      <header className="bg-surface-container py-3 px-6 flex justify-between items-center border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/play/${childId}/detective`)} className="p-2 bg-white rounded-full shadow-sm text-on-surface-variant hover:text-primary transition-colors">
             <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="font-headline font-bold text-lg leading-tight">{caseData.title}</h2>
            <p className="text-xs text-on-surface-variant">{caseData.category}</p>
          </div>
        </div>
        <div className="bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">search</span>
          {gameState === 'STORY' && 'Briefing'}
          {gameState === 'INVESTIGATION' && 'Investigation'}
          {gameState === 'PUZZLE' && `Analysis (${currentPuzzleIndex + 1}/${caseData.puzzles.length})`}
          {gameState === 'COMPLETED' && 'Case Closed'}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden bg-[#FDFBF7]">
        <AnimatePresence mode="wait">
          {gameState === 'STORY' && (
            <StoryView 
              key="story"
              caseData={caseData} 
              onComplete={handleStoryComplete} 
            />
          )}
          
          {gameState === 'INVESTIGATION' && (
            <InvestigationView 
              key="investigation"
              caseData={caseData} 
              cluesFound={cluesFound}
              onClueFound={handleClueFound}
              onResetClues={handleResetClues}
              onComplete={handleInvestigationComplete} 
            />
          )}

          {gameState === 'PUZZLE' && (
            <motion.div 
              key={`puzzle-${currentPuzzleIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="absolute inset-0 p-6 flex flex-col"
            >
              <div className="mb-6">
                 <h3 className="text-2xl font-headline font-bold text-primary mb-2">
                   {caseData.puzzles[currentPuzzleIndex].question}
                 </h3>
                 <p className="text-on-surface-variant bg-tertiary/10 p-3 rounded-xl border border-tertiary/20 flex items-center gap-2 inline-flex">
                   <span className="material-symbols-outlined text-tertiary">lightbulb</span>
                   {caseData.puzzles[currentPuzzleIndex].hint}
                 </p>
              </div>

              <div className="flex-1 overflow-y-auto pb-12 px-2">
                {caseData.puzzles[currentPuzzleIndex].type === 'sort' ? (
                  <ActionSortPuzzle 
                    puzzle={caseData.puzzles[currentPuzzleIndex]} 
                    onComplete={() => handlePuzzleComplete(100)} 
                  />
                ) : (
                  <SequencePuzzle 
                    puzzle={caseData.puzzles[currentPuzzleIndex]} 
                    onComplete={() => handlePuzzleComplete(100)} 
                  />
                )}
              </div>
            </motion.div>
          )}

          {gameState === 'COMPLETED' && (
            <CaseComplete 
              key="completed"
              caseData={caseData} 
              xpEarned={caseData.xpReward} 
              onContinue={() => navigate(`/play/${childId}/detective`)} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
