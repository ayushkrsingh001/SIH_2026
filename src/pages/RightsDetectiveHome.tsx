import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { RIGHTS_DETECTIVE_CASES } from '../data/rightsDetectiveCases';
import { getAllDetectiveProgress } from '../firebase/firestore';
import type { DetectiveProgress } from '../types';

export default function RightsDetectiveHome() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const { user } = useAuth();
  
  const [progresses, setProgresses] = useState<Record<string, DetectiveProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user || !childId) return;
      try {
        const allProgress = await getAllDetectiveProgress(user.uid, childId);
        const progressMap = allProgress.reduce((acc, p) => {
          acc[p.caseId] = p;
          return acc;
        }, {} as Record<string, DetectiveProgress>);
        setProgresses(progressMap);
      } catch (e) {
        console.error("Error loading detective progress", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, childId]);

  if (loading) return <div className="p-8 text-center">Loading Detective HQ...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-headline font-bold text-primary mb-2">Rights Detective HQ</h1>
        <p className="text-on-surface-variant">Solve cases, find clues, and learn how to stay safe!</p>
      </div>

      <div className="relative">
        {/* Candy Crush style path (simplified for MVP) */}
        <div className="absolute top-0 bottom-0 left-1/2 w-2 bg-primary/20 -translate-x-1/2 rounded-full" />
        
        <div className="flex flex-col items-center gap-12 relative z-10">
          {RIGHTS_DETECTIVE_CASES.map((c, index) => {
            const progress = progresses[c.id];
            const isCompleted = progress?.status === 'completed';
            // First case is always unlocked. Others unlock if previous is completed.
            const prevCaseId = index > 0 ? RIGHTS_DETECTIVE_CASES[index - 1].id : null;
            const prevCompleted = prevCaseId ? progresses[prevCaseId]?.status === 'completed' : true;
            const isUnlocked = index === 0 || prevCompleted;

            return (
              <motion.div 
                key={c.id}
                whileHover={isUnlocked ? { scale: 1.05 } : {}}
                className={`relative p-6 rounded-2xl border-4 w-64 text-center cursor-pointer transition-all ${
                  isCompleted 
                    ? 'bg-primary-container border-primary text-on-primary-container' 
                    : isUnlocked
                      ? 'bg-surface border-primary/50 text-on-surface hover:border-primary shadow-lg'
                      : 'bg-surface-container-high border-outline-variant text-on-surface-variant opacity-75 cursor-not-allowed'
                } ${index % 2 === 0 ? 'mr-32' : 'ml-32'}`} // Zig zag pattern
                onClick={() => {
                  if (isUnlocked) navigate(`/play/${childId}/detective/${c.id}`);
                }}
              >
                <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md z-20 bg-tertiary">
                  {index + 1}
                </div>
                
                {isCompleted && (
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                )}
                {!isUnlocked && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                     <span className="material-symbols-outlined text-4xl text-outline">lock</span>
                  </div>
                )}
                
                <h3 className={`font-bold font-headline mb-2 ${!isUnlocked ? 'opacity-30' : ''}`}>{c.title}</h3>
                <p className={`text-xs ${!isUnlocked ? 'opacity-30' : ''}`}>{c.category}</p>
                <div className={`mt-3 inline-block px-2 py-1 rounded-full text-xs font-bold ${
                  c.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                  c.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                } ${!isUnlocked ? 'opacity-30' : ''}`}>
                  {c.difficulty}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
