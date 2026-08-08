import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getChildren, getAllChildProgress } from '../firebase/firestore';
import { calculateLevel, getXpForNextLevel } from '../services/xpSystem';
import { AVATAR_OPTIONS, MAX_CHILDREN } from '../constants';
import { staggerContainer, staggerItem } from '../animations/variants';
import { CardSkeleton } from '../components/ui/SkeletonLoader';
import type { Child } from '../types';
import { allLocalModules } from '../data';

interface ChildAnalytics {
  child: Child;
  safetyScore: number;
  strongTopic: string;
  weakTopic: string;
  completionRate: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<ChildAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const childrenData = await getChildren(user.uid);
        const totalModules = allLocalModules.length;

        const analyticsData = await Promise.all(childrenData.map(async (child) => {
          const progressList = await getAllChildProgress(user.uid, child.id!);
          
          let safetyScoreTotal = 0;
          let safetyModulesCount = 0;
          const categoryScores: Record<string, { total: number; count: number }> = {};
          
          progressList.forEach(p => {
            const mod = allLocalModules.find(m => m.id === p.moduleId);
            if (mod) {
              const cat = mod.category || 'General';
              if (!categoryScores[cat]) categoryScores[cat] = { total: 0, count: 0 };
              categoryScores[cat].total += p.score;
              categoryScores[cat].count += 1;
              
              if (cat.toLowerCase().includes('safety') || cat.toLowerCase().includes('defence')) {
                safetyScoreTotal += p.score;
                safetyModulesCount += 1;
              }
            }
          });

          const safetyScore = safetyModulesCount > 0 ? Math.round(safetyScoreTotal / safetyModulesCount) : 0;
          const completionRate = totalModules > 0 ? Math.round((progressList.length / totalModules) * 100) : 0;
          
          let strongTopic = 'None yet';
          let weakTopic = 'None yet';
          let maxScore = -1;
          let minScore = 101;
          
          Object.keys(categoryScores).forEach(cat => {
            const avg = categoryScores[cat].total / categoryScores[cat].count;
            if (avg > maxScore) { maxScore = avg; strongTopic = cat; }
            if (avg < minScore) { minScore = avg; weakTopic = cat; }
          });

          return { child, safetyScore, strongTopic, weakTopic, completionRate };
        }));

        setAnalytics(analyticsData);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getAvatar = (avatarId: string) => AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0];

  return (
    <div className="pb-20">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline text-display-lg-mobile md:text-display-lg text-on-surface">Parent Dashboard</h2>
          <p className="font-body text-body-lg text-on-surface-variant mt-2">Manage your explorers and track their journey.</p>
        </div>
        <div className="flex gap-4">
          {analytics.length < MAX_CHILDREN && (
            <button
              onClick={() => navigate('/dashboard/add-child')}
              className="bg-primary text-on-primary px-6 py-3 rounded-full font-body text-label-md btn-tactile border-b-4 border-on-primary-fixed-variant flex items-center gap-2"
            >
              <span className="material-symbols-outlined">person_add</span>
              Add Explorer
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <CardSkeleton /><CardSkeleton />
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {analytics.map(({ child, safetyScore, strongTopic, weakTopic, completionRate }) => {
            const avatar = getAvatar(child.avatarId);
            const levelInfo = calculateLevel(child.xp);
            const xpProgress = getXpForNextLevel(child.xp);

            return (
              <motion.div
                key={child.id}
                variants={staggerItem}
                className="bg-surface-container-lowest rounded-[32px] p-6 md:p-8 shadow-card relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center shrink-0 border-4 border-cream shadow-sm overflow-hidden relative">
                      <img alt={child.displayName} className="w-full h-full object-cover" src={avatar.imageUrl} />
                      {child.streak > 2 && (
                         <div className="absolute -bottom-1 -right-1 bg-tertiary text-on-tertiary text-xs px-2 py-0.5 rounded-full font-bold border-2 border-white flex items-center gap-1">
                           🔥 {child.streak}
                         </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-headline text-headline-sm text-on-surface">{child.displayName}</h3>
                      <p className="font-body text-title-md text-primary font-bold">Lvl {levelInfo.level} {levelInfo.title}</p>
                      {child.currentTitle && (
                         <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded-sm font-body text-caption uppercase mt-1 inline-block">{child.currentTitle}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => navigate(`/play/${child.id}/map`)} className="bg-primary-container text-on-primary-container px-4 py-2 rounded-full font-body text-label-md btn-tactile-primary flex items-center gap-1">
                    Play
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface-bright p-4 rounded-[20px] border border-outline-variant">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-secondary text-sm filled">shield</span>
                      <span className="font-body text-caption text-on-surface-variant">Safety Score</span>
                    </div>
                    <div className="font-headline text-display-md text-secondary">{safetyScore}%</div>
                  </div>
                  <div className="bg-surface-bright p-4 rounded-[20px] border border-outline-variant">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-primary text-sm filled">task_alt</span>
                      <span className="font-body text-caption text-on-surface-variant">Completion</span>
                    </div>
                    <div className="font-headline text-display-md text-primary">{completionRate}%</div>
                  </div>
                </div>

                <div className="space-y-4 mb-6 bg-surface-container-high p-4 rounded-[20px]">
                  <div className="flex justify-between items-center">
                     <span className="font-body text-label-md text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-sm text-secondary">trending_up</span> Strongest</span>
                     <span className="font-headline text-title-md text-on-surface">{strongTopic}</span>
                  </div>
                  <div className="h-px bg-surface-dim" />
                  <div className="flex justify-between items-center">
                     <span className="font-body text-label-md text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-sm text-error">trending_down</span> Needs Focus</span>
                     <span className="font-headline text-title-md text-on-surface">{weakTopic}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-body text-caption mb-1 text-on-surface-variant">
                    <span>XP Progress to Lvl {levelInfo.level + 1}</span>
                    <span className="font-bold text-primary">{xpProgress.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress.progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
