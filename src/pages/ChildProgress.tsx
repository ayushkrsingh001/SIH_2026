import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useChild } from '../contexts/ChildContext';
import { getAllChildProgress, getModules, getBadges, getChild } from '../firebase/firestore';
import { calculateLevel, getXpForNextLevel } from '../services/xpSystem';
import { resolveAvatarUrl } from '../utils/avatar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { staggerContainer, staggerItem } from '../animations/variants';
import { PageSkeleton } from '../components/ui/SkeletonLoader';
import type { Progress, Module, Badge } from '../types';

const ChildProgress = () => {
  const { user } = useAuth();
  const { activeChild, setActiveChild } = useChild();
  const { childId } = useParams();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !childId) return;
      if (!activeChild) {
        const child = await getChild(user.uid, childId);
        if (child) setActiveChild(child);
      }
      const [prog, mods, allBadges] = await Promise.all([
        getAllChildProgress(user.uid, childId),
        getModules(),
        getBadges(),
      ]);
      setProgress(prog);
      setModules(mods);
      setBadges(allBadges);
      setLoading(false);
    };
    loadData();
  }, [user, childId, activeChild, setActiveChild]);

  if (loading) return <PageSkeleton />;

  const avatarUrl = resolveAvatarUrl(activeChild?.avatarId);
  const levelInfo = calculateLevel(activeChild?.xp || 0);
  const xpProgress = getXpForNextLevel(activeChild?.xp || 0);
  const completedModules = progress.filter(p => p.status === 'completed');
  const earnedBadges = badges.filter(b => activeChild?.badgeIds?.includes(b.id!));

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile Header */}
      <motion.div
        className="bg-surface-container-lowest rounded-[24px] shadow-card p-6 md:p-8 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-container shadow-lg bg-cream">
              <img src={avatarUrl} alt={activeChild?.displayName} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center shadow-sm">
              <span className="font-headline text-caption font-bold text-on-tertiary-fixed">{levelInfo.level}</span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-headline text-headline-md text-on-surface">{activeChild?.displayName}'s Progress</h1>
            <p className="font-body text-body-md text-primary font-semibold mt-1">Level {levelInfo.level} {levelInfo.title}</p>
            <div className="mt-3 max-w-xs">
              <ProgressBar value={xpProgress.progress} label={`${activeChild?.xp?.toLocaleString()} XP`} showLabel />
            </div>
          </div>

          <div className="flex gap-4 text-center">
            <div className="bg-surface-container-low rounded-[16px] p-4 min-w-[80px]">
              <p className="font-headline text-title-lg text-secondary">{completedModules.length}</p>
              <p className="font-body text-caption text-on-surface-variant">Quests</p>
            </div>
            <div className="bg-surface-container-low rounded-[16px] p-4 min-w-[80px]">
              <p className="font-headline text-title-lg text-tertiary">{earnedBadges.length}</p>
              <p className="font-body text-caption text-on-surface-variant">Badges</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badges Section */}
      <motion.div
        className="bg-surface-container-lowest rounded-[24px] shadow-card p-6 md:p-8 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-headline text-title-lg text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary filled">workspace_premium</span>
          Badges Earned
        </h2>

        {earnedBadges.length > 0 ? (
          <motion.div
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {earnedBadges.map(badge => (
              <motion.div
                key={badge.id}
                variants={staggerItem}
                className="flex flex-col items-center gap-2 p-3"
              >
                <div className="w-14 h-14 rounded-full bg-tertiary-fixed flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-on-tertiary-fixed text-2xl filled">{badge.icon || 'military_tech'}</span>
                </div>
                <span className="font-body text-caption text-on-surface font-semibold text-center">{badge.title}</span>
              </motion.div>
            ))}

            {/* Locked badge placeholders */}
            {badges.filter(b => !activeChild?.badgeIds?.includes(b.id!)).slice(0, 3).map(badge => (
              <div key={badge.id} className="flex flex-col items-center gap-2 p-3 opacity-40">
                <div className="w-14 h-14 rounded-full bg-surface-container-high border-2 border-dashed border-outline flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline text-2xl">lock</span>
                </div>
                <span className="font-body text-caption text-outline text-center">???</span>
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-surface-dim mb-2">military_tech</span>
            <p className="font-body text-body-md text-on-surface-variant">Complete quests to earn badges!</p>
          </div>
        )}
      </motion.div>

      {/* Completed Quests */}
      <motion.div
        className="bg-surface-container-lowest rounded-[24px] shadow-card p-6 md:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-headline text-title-lg text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary filled">menu_book</span>
          Quest History
        </h2>

        {completedModules.length > 0 ? (
          <div className="space-y-3">
            {completedModules.map(prog => {
              const mod = modules.find(m => m.id === prog.moduleId);
              if (!mod) return null;
              return (
                <div key={prog.id} className="flex items-center gap-4 p-4 bg-surface-container-low rounded-[16px]">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary filled">check_circle</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-headline text-body-md text-on-surface font-semibold truncate">{mod.title}</h4>
                    <p className="font-body text-caption text-on-surface-variant">Score: {prog.score}% · +{mod.xpReward} XP</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`material-symbols-outlined text-sm ${i < Math.ceil(prog.score / 20) ? 'text-tertiary-fixed-dim filled' : 'text-surface-dim'}`}
                        style={{ fontVariationSettings: i < Math.ceil(prog.score / 20) ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-surface-dim mb-2">explore</span>
            <p className="font-body text-body-md text-on-surface-variant">No quests completed yet. Start exploring!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ChildProgress;
