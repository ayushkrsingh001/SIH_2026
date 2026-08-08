import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import type { WeeklyChallenge, WeeklyChallengeProgress } from '../../types';
import { subscribeToActiveChallenge, getChallengeProgress } from '../../firebase/communityFirestore';
import { SkeletonChallengeCard } from './SkeletonFeed';
import { XPRewardPopup } from './XPRewardPopup';

export const WeeklyChallengeCard = () => {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [progress, setProgress] = useState<WeeklyChallengeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [showXP, setShowXP] = useState(false);

  useEffect(() => {
    const unsub = subscribeToActiveChallenge((data) => {
      setChallenge(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (challenge?.id && user) {
      getChallengeProgress(challenge.id, user.uid).then(setProgress);
    }
  }, [challenge, user]);

  const getTaskProgress = (taskId: string) => progress?.taskProgress?.[taskId] || 0;

  const getTotalProgress = () => {
    if (!challenge) return 0;
    const total = challenge.tasks.reduce((sum, t) => sum + t.targetCount, 0);
    const completed = challenge.tasks.reduce((sum, t) => sum + Math.min(getTaskProgress(t.id), t.targetCount), 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getRemainingTime = () => {
    if (!challenge?.weekEndDate) return '';
    const end = challenge.weekEndDate.toDate?.() ? challenge.weekEndDate.toDate() : new Date();
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  if (loading) return <SkeletonChallengeCard />;
  if (!challenge) return null;

  const totalProgress = getTotalProgress();
  const isComplete = totalProgress >= 100;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[24px] shadow-card mb-8"
      >
        {/* Glass background */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-surface-container-lowest to-tertiary/5" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-[60px]" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-tertiary/10 rounded-full blur-[40px]" />

        <div className="relative z-10 p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container filled text-[24px]">emoji_events</span>
              </div>
              <div>
                <h3 className="font-headline text-title-lg text-on-surface">{challenge.title}</h3>
                <p className="font-body text-caption text-on-surface-variant">{challenge.description}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-body text-caption text-on-surface-variant">{getRemainingTime()}</span>
            </div>
          </div>

          {/* Progress Ring + Overall Bar */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-surface-container-high" />
                <circle
                  cx="28" cy="28" r="24" fill="none"
                  stroke={isComplete ? '#4CAF50' : '#006a63'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - totalProgress / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-headline text-label-md text-on-surface">
                {totalProgress}%
              </span>
            </div>
            <div className="flex-1">
              <div className="w-full bg-surface-container-high rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full"
                  style={{ backgroundColor: isComplete ? '#4CAF50' : '#006a63' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${totalProgress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-3 mb-5">
            {challenge.tasks.map((task) => {
              const taskProg = getTaskProgress(task.id);
              const taskComplete = taskProg >= task.targetCount;
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    taskComplete ? 'bg-green-50' : 'bg-surface-container-high'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    taskComplete ? 'bg-green-500 text-white' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {taskComplete ? (
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">{task.icon}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-body text-label-md ${taskComplete ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                      {task.title}
                    </p>
                    <p className="font-body text-caption text-on-surface-variant">{task.description}</p>
                  </div>
                  <span className="font-headline text-label-md text-on-surface-variant shrink-0">
                    {Math.min(taskProg, task.targetCount)}/{task.targetCount}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Rewards */}
          <div className="flex items-center gap-4 p-3 bg-surface-container-high/50 rounded-xl">
            <span className="font-body text-label-md text-on-surface-variant">Rewards:</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary filled">star</span>
              <span className="font-headline text-label-md text-primary">{challenge.rewardXP} XP</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-tertiary filled">monetization_on</span>
              <span className="font-headline text-label-md text-tertiary">{challenge.rewardCoins}</span>
            </div>
            {challenge.rewardBadge && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary filled">military_tech</span>
                <span className="font-headline text-label-md text-secondary">{challenge.rewardBadge}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <XPRewardPopup xp={challenge.rewardXP} show={showXP} onComplete={() => setShowXP(false)} label="Weekly Challenge Complete!" />
    </>
  );
};
