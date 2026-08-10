import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useChild } from '../../contexts/ChildContext';
import { getDailyChallengeStreak, getTodayDailyChallenge, cacheAILevel } from '../../firebase/firestore';
import { groqService } from '../../services/groqService';
import toast from 'react-hot-toast';
import type { DailyChallengeStreak, CachedAILevel } from '../../types';
import { Timestamp } from 'firebase/firestore';

export const DailyChallengeCard = () => {
  const { user } = useAuth();
  const { activeChild } = useChild();
  const navigate = useNavigate();

  const [streak, setStreak] = useState<DailyChallengeStreak | null>(null);
  const [todayChallenge, setTodayChallenge] = useState<CachedAILevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (user?.uid && activeChild?.id) {
      loadData();
    }
  }, [user?.uid, activeChild?.id]);

  useEffect(() => {
    // Countdown timer for next challenge
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      setTimeLeft(`${hours}h ${mins}m`);
    }, 60000);
    
    // Initial call
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    setTimeLeft(`${hours}h ${mins}m`);

    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    if (!user || !activeChild) return;
    try {
      const currentStreak = await getDailyChallengeStreak(activeChild.id!);
      const challenge = await getTodayDailyChallenge(activeChild.id!);
      setStreak(currentStreak);
      setTodayChallenge(challenge);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isCompletedToday = () => {
    if (!streak?.lastCompletedDate) return false;
    const lastDate = streak.lastCompletedDate.toDate();
    const now = new Date();
    return lastDate.toDateString() === now.toDateString();
  };

  const handlePlay = async () => {
    if (!user || !activeChild) return;

    if (todayChallenge) {
      if (todayChallenge.status === 'completed') {
        toast.success("You already completed today's challenge!");
        return;
      }
      navigate(`/play/${activeChild.id}/ai-level/${todayChallenge.id}`);
      return;
    }

    // Need to generate one
    setGenerating(true);
    try {
      const context = {
        playerAge: activeChild.ageGroup,
        currentWorld: 1,
        currentLevel: 1,
        difficulty: 'medium',
        completedTopics: [],
        weakTopics: [],
        strongTopics: [],
        language: 'en',
        currentXp: activeChild.xp,
        badgesEarned: [],
        avoidQuestions: [],
        recentDailyTopics: [] // We could fetch past 5 days of challenges here to avoid repetition
      };

      const levelData = await groqService.generateDailyChallenge(context);
      const newChallenge: Omit<CachedAILevel, 'id'> = {
        childId: activeChild.id!,
        parentId: user.uid,
        type: 'daily_challenge',
        generatedAt: Timestamp.now(),
        expiresAt: null,
        levelData,
        status: 'unplayed'
      };

      const id = await cacheAILevel(newChallenge);
      navigate(`/play/${activeChild.id}/ai-level/${id}`);
    } catch (e: any) {
      console.error('Error generating daily challenge:', e);
      toast.error(`Failed: ${e.message || 'Unknown error'}`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return null;

  const completed = isCompletedToday();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-[32px] p-6 md:p-8 text-white shadow-lg mb-8 ${
        completed ? 'bg-surface-container-high text-on-surface' : 'bg-gradient-to-br from-primary to-tertiary'
      }`}
    >
      {/* Background decoration */}
      {!completed && (
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`material-symbols-outlined filled text-3xl ${completed ? 'text-green-500' : 'text-secondary'}`}>
              {completed ? 'check_circle' : 'stars'}
            </span>
            <h2 className="font-headline text-headline-sm font-bold">
              {completed ? 'Challenge Completed!' : 'Daily AI Challenge'}
            </h2>
          </div>
          
          <p className={`font-body text-body-lg mb-4 ${completed ? 'text-on-surface-variant' : 'text-white/90'}`}>
            {completed 
              ? 'Awesome job! You earned your daily rewards. Come back tomorrow for a new mystery challenge.'
              : 'A brand new personalized challenge awaits. Earn extra XP, coins, and a Daily Badge!'}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${
              completed ? 'bg-surface-container-lowest text-on-surface' : 'bg-white/20 text-white'
            }`}>
              🔥 Streak: {streak?.currentStreak || 0} Days
            </div>
            {completed && (
              <div className="px-4 py-2 rounded-full bg-surface-container-lowest text-on-surface font-bold flex items-center gap-2">
                ⏳ Next challenge in: {timeLeft}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {!completed && (
            <button 
              onClick={handlePlay}
              disabled={generating}
              className="bg-secondary text-white px-8 py-4 rounded-full font-headline text-title-md font-bold shadow-sm hover:scale-105 transition-transform flex items-center gap-2 btn-tactile"
            >
              {generating ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  Generating...
                </>
              ) : (
                <>
                  Play Now
                  <span className="material-symbols-outlined">play_arrow</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
