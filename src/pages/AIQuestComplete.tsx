import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useChild } from '../contexts/ChildContext';
import { 
  getCachedAILevelById, addLearningEvent, getLearningHistory, 
  getSafetyTwinProfile, saveSafetyTwinProfile 
} from '../firebase/firestore';
import { groqService } from '../services/groqService';
import toast from 'react-hot-toast';
import { calculateLevel } from '../services/xpSystem';
import { AVATAR_OPTIONS } from '../constants';
import { celebrationVariants, staggerContainer, staggerItem } from '../animations/variants';
import type { CachedAILevel } from '../types';

const AIQuestComplete = () => {
  const { user } = useAuth();
  const { activeChild } = useChild();
  const navigate = useNavigate();
  const { childId, aiLevelId } = useParams();

  const [level, setLevel] = useState<CachedAILevel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !childId || !aiLevelId) return;
      const cached = await getCachedAILevelById(aiLevelId);
      if (!cached) { navigate(-1); return; }
      setLevel(cached);

      // AI Safety Twin Sync (Run async so it doesn't block UI)
      setTimeout(async () => {
        try {
          await addLearningEvent({
            childId,
            parentId: user.uid,
            activityType: 'ai_level',
            topic: cached.levelData.learningObjective || 'General',
            score: cached.score || 0,
            mistakes: [], // AI levels don't track detailed mistakes yet
            timeSpent: cached.timeSpent || 120,
          });

          // Check if we need to sync Twin (e.g. every completion)
          const history = await getLearningHistory(user.uid, childId);
          const profile = await getSafetyTwinProfile(user.uid, childId);
          
          const updatedProfileData = await groqService.analyzeLearningHistory(history.slice(0, 5), profile);
          
          const newProfile: any = {
            ...(profile || { childId, parentId: user.uid }),
            ...updatedProfileData,
          };
          
          await saveSafetyTwinProfile(newProfile);
          toast.success("AI Safety Twin updated!");
        } catch (e: any) {
          console.error("AI Twin Sync Error:", e);
          toast.error(`AI Safety Twin update failed: ${e.message || e}`);
        }
      }, 0);

      setLoading(false);
    };
    loadData();
  }, [user, childId, aiLevelId, navigate]);

  const avatar = AVATAR_OPTIONS.find(a => a.id === activeChild?.avatarId) || AVATAR_OPTIONS[0];
  const levelInfo = activeChild ? calculateLevel(activeChild.xp || 0) : { level: 1, title: 'Beginner' };

  if (loading || !level) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const reward = level.levelData.reward;
  const score = level.score || 0;

  return (
    <div className="max-w-lg mx-auto text-center py-8">
      {/* Confetti decorations */}
      <div className="relative mb-8">
        <motion.div className="absolute -top-4 left-1/4 text-tertiary-fixed-dim" animate={{ rotate: 360, y: [0, -20, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <span className="material-symbols-outlined text-3xl filled">auto_awesome</span>
        </motion.div>
        <motion.div className="absolute -top-2 right-1/4 text-primary-container" animate={{ rotate: -360, y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}>
          <span className="material-symbols-outlined text-2xl filled">celebration</span>
        </motion.div>
      </div>

      {/* Trophy or Chest */}
      <motion.div
        variants={celebrationVariants}
        initial="initial"
        animate="animate"
        className="mb-6"
      >
        <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-card-hover">
          <span className="material-symbols-outlined text-6xl text-white filled">
            {level.type === 'daily_challenge' ? 'redeem' : 'auto_awesome'}
          </span>
        </div>
      </motion.div>

      <motion.h1
        className="font-headline text-display-lg-mobile text-on-surface mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {level.type === 'daily_challenge' ? 'Daily Challenge Complete!' : 'AI Quest Complete!'}
      </motion.h1>

      <motion.p
        className="font-body text-body-lg text-on-surface-variant mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Amazing work on "{level.levelData.title}"!
      </motion.p>

      <motion.p
        className="font-body text-caption text-primary mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        🤖 Generated by AI · {level.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </motion.p>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem} className="bg-surface-container-lowest rounded-[24px] p-4 shadow-card">
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-primary text-xl filled">bolt</span>
          </div>
          <p className="font-headline text-title-lg text-primary">+{reward.xp}</p>
          <p className="font-body text-caption text-on-surface-variant">XP Earned</p>
        </motion.div>

        <motion.div variants={staggerItem} className="bg-surface-container-lowest rounded-[24px] p-4 shadow-card">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-secondary text-xl filled">target</span>
          </div>
          <p className="font-headline text-title-lg text-secondary">{score}%</p>
          <p className="font-body text-caption text-on-surface-variant">Score</p>
        </motion.div>

        <motion.div variants={staggerItem} className="bg-surface-container-lowest rounded-[24px] p-4 shadow-card relative overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-[#FFD166]/30 flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-[#FFB703] text-xl filled">monetization_on</span>
          </div>
          <p className="font-headline text-title-lg text-[#FFB703]">+{reward.coins}</p>
          <p className="font-body text-caption text-on-surface-variant">Coins</p>
        </motion.div>

        <motion.div variants={staggerItem} className="bg-surface-container-lowest rounded-[24px] p-4 shadow-card">
          <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-tertiary text-xl filled">trending_up</span>
          </div>
          <p className="font-headline text-title-lg text-tertiary">Lvl {levelInfo.level}</p>
          <p className="font-body text-caption text-on-surface-variant">{levelInfo.title}</p>
        </motion.div>
      </motion.div>

      {/* Badge */}
      {reward.badge && (
        <motion.div
          className="bg-tertiary-fixed/10 rounded-[24px] p-6 mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="font-headline text-title-lg text-on-surface mb-3 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-tertiary filled">workspace_premium</span>
            Badge Earned!
          </h3>
          <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center mx-auto shadow-md mb-2">
            <span className="material-symbols-outlined text-on-tertiary-fixed text-2xl filled">military_tech</span>
          </div>
          <p className="font-body text-label-md text-on-surface font-semibold">{reward.badge}</p>
        </motion.div>
      )}

      {/* Learning Objective */}
      <motion.div
        className="bg-primary-fixed/10 rounded-[20px] p-4 mb-8 text-left"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="font-body text-caption text-primary font-semibold mb-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs filled">school</span>
          What you learned
        </p>
        <p className="font-body text-body-md text-on-surface">{level.levelData.learningObjective}</p>
      </motion.div>

      {/* Player Card */}
      <motion.div
        className="flex items-center gap-3 bg-surface-container-lowest rounded-full p-3 pr-6 shadow-card mx-auto w-fit mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
          <img src={avatar.imageUrl} alt={activeChild?.displayName} className="w-full h-full object-cover" />
        </div>
        <span className="font-body text-label-md text-on-surface">{activeChild?.displayName}</span>
        <span className="font-body text-caption text-primary">Level {levelInfo.level}</span>
      </motion.div>

      {/* Actions */}
      <div className="space-y-3">
        {level.type === 'daily_challenge' ? (
          <motion.button
            onClick={() => navigate(`/play/${childId}/map`, { replace: true })}
            className="w-full h-14 bg-primary-container text-on-primary-container font-headline text-title-lg rounded-full btn-tactile-primary flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="material-symbols-outlined filled">play_arrow</span>
            Play Games
          </motion.button>
        ) : (
          <>
            <motion.button
              onClick={() => navigate(`/play/${childId}/ai-hub`, { replace: true })}
              className="w-full h-14 bg-primary-container text-on-primary-container font-headline text-title-lg rounded-full btn-tactile-primary flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="material-symbols-outlined filled">auto_awesome</span>
              More AI Adventures
            </motion.button>

            <button
              onClick={() => navigate(`/play/${childId}/map`, { replace: true })}
              className="w-full h-12 text-primary font-body text-label-md hover:bg-primary-fixed/10 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">map</span>
              Back to Map
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AIQuestComplete;
