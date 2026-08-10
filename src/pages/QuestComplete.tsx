import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useChild } from '../contexts/ChildContext';
import { 
  getModule, getProgress, getBadges, getChild, getAllChildProgress, updateChild,
  addLearningEvent, getLearningHistory, getSafetyTwinProfile, saveSafetyTwinProfile
} from '../firebase/firestore';
import { groqService } from '../services/groqService';
import { getNewlyEarnedBadges } from '../services/badgeSystem';
import { calculateLevel } from '../services/xpSystem';
import { AVATAR_OPTIONS } from '../constants';
import { StarRating } from '../components/ui/StarRating';
import { addFeedback } from '../firebase/firestore';
import { celebrationVariants, bounceIn, staggerContainer, staggerItem } from '../animations/variants';
import toast from 'react-hot-toast';
import type { Module, Badge } from '../types';
import { allLocalModules } from '../data';

const QuestComplete = () => {
  const { user } = useAuth();
  const { activeChild, setActiveChild } = useChild();
  const navigate = useNavigate();
  const { childId, moduleId } = useParams();

  const [module, setModule] = useState<Module | null>(null);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !childId || !moduleId) return;

      const [mod, progressData, allBadges, allProgress, child] = await Promise.all([
        Promise.resolve(allLocalModules.find(m => m.id === moduleId) || null),
        getProgress(user.uid, childId, moduleId),
        getBadges(),
        getAllChildProgress(user.uid, childId),
        activeChild ? Promise.resolve(activeChild) : getChild(user.uid, childId),
      ]);

      if (!mod) { navigate(`/play/${childId}/map`); return; }
      setModule(mod);
      setScore(progressData?.score || 0);
      setXpEarned(mod.xpReward);

      if (child) {
        if (!activeChild) setActiveChild(child);

        const earnedBadges = getNewlyEarnedBadges(allBadges, allProgress, child.badgeIds || []);
        setNewBadges(earnedBadges);

        const newCompletedCount = (child.completedLevelsCount || 0) + 1;
        const updates: any = { completedLevelsCount: newCompletedCount };
        
        if (earnedBadges.length > 0) {
          updates.badgeIds = [...(child.badgeIds || []), ...earnedBadges.map(b => b.id!)];
        }
        
        await updateChild(user.uid, childId, updates);
        
        // Update local state so trigger has fresh data
        child.completedLevelsCount = newCompletedCount;
        if (updates.badgeIds) child.badgeIds = updates.badgeIds;

        // AI Safety Twin Sync (Run async so it doesn't block UI)
        setTimeout(async () => {
          try {
            await addLearningEvent({
              childId,
              parentId: user.uid,
              activityType: 'module',
              topic: mod.category || 'General',
              score: progressData?.score || 0,
              mistakes: [], // Modules don't track detailed mistakes yet
              timeSpent: progressData?.timeSpent || 120, // default 2 mins if not tracked
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
      }

      setLoading(false);
    };
    loadData();
  }, [user, childId, moduleId, activeChild, setActiveChild, navigate]);

  const handleSubmitFeedback = async () => {
    if (!user || feedbackRating === 0) return;
    try {
      await addFeedback({
        parentId: user.uid,
        childRefPath: `parents/${user.uid}/children/${childId}`,
        rating: feedbackRating,
        comments: feedbackComment,
        screenContext: `module_complete_${moduleId}`,
      });
      toast.success('Thanks for your feedback!');
      setShowFeedback(false);
    } catch {
      toast.error('Failed to submit feedback.');
    }
  };

  const avatar = AVATAR_OPTIONS.find(a => a.id === activeChild?.avatarId) || AVATAR_OPTIONS[0];
  const levelInfo = activeChild ? calculateLevel((activeChild.xp || 0)) : { level: 1, title: 'Beginner' };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto text-center py-8">
      {/* Confetti-like decorative elements */}
      <div className="relative mb-8">
        <motion.div className="absolute -top-4 left-1/4 text-tertiary-fixed-dim" animate={{ rotate: 360, y: [0, -20, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <span className="material-symbols-outlined text-3xl filled">star</span>
        </motion.div>
        <motion.div className="absolute -top-2 right-1/4 text-primary-container" animate={{ rotate: -360, y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}>
          <span className="material-symbols-outlined text-2xl filled">celebration</span>
        </motion.div>
        <motion.div className="absolute top-8 right-8 text-secondary" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <span className="material-symbols-outlined text-xl filled">emoji_events</span>
        </motion.div>
      </div>

      {/* Trophy / Celebration */}
      <motion.div
        variants={celebrationVariants}
        initial="initial"
        animate="animate"
        className="mb-6"
      >
        <div className="w-28 h-28 mx-auto rounded-full bg-tertiary-fixed flex items-center justify-center shadow-card-hover">
          <span className="material-symbols-outlined text-6xl text-on-tertiary-fixed filled">emoji_events</span>
        </div>
      </motion.div>

      <motion.h1
        className="font-headline text-display-lg-mobile text-on-surface mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Quest Complete!
      </motion.h1>

      <motion.p
        className="font-body text-body-lg text-on-surface-variant mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Amazing work on "{module?.title}"!
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
          <p className="font-headline text-title-lg text-primary">+{xpEarned}</p>
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
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="absolute inset-0 bg-[#FFD166]/20 z-0"
          />
          <div className="w-10 h-10 rounded-full bg-[#FFD166]/30 flex items-center justify-center mx-auto mb-2 relative z-10">
            <span className="material-symbols-outlined text-[#FFB703] text-xl filled">monetization_on</span>
          </div>
          <p className="font-headline text-title-lg text-[#FFB703] relative z-10">+{module?.coinReward || 10}</p>
          <p className="font-body text-caption text-on-surface-variant relative z-10">Coins</p>
        </motion.div>

        <motion.div variants={staggerItem} className="bg-surface-container-lowest rounded-[24px] p-4 shadow-card">
          <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-tertiary text-xl filled">trending_up</span>
          </div>
          <p className="font-headline text-title-lg text-tertiary">Lvl {levelInfo.level}</p>
          <p className="font-body text-caption text-on-surface-variant">{levelInfo.title}</p>
        </motion.div>
      </motion.div>

      {/* New Badges */}
      {newBadges.length > 0 && (
        <motion.div
          className="bg-tertiary-fixed/10 rounded-[24px] p-6 mb-8"
          variants={bounceIn}
          initial="initial"
          animate="animate"
        >
          <h3 className="font-headline text-title-lg text-on-surface mb-4 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-tertiary filled">workspace_premium</span>
            New Badge{newBadges.length > 1 ? 's' : ''} Earned!
          </h3>
          <div className="flex justify-center gap-4">
            {newBadges.map(badge => (
              <div key={badge.id} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-on-tertiary-fixed text-2xl filled">{badge.icon || 'military_tech'}</span>
                </div>
                <span className="font-body text-caption text-on-surface font-semibold">{badge.title}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Player card */}
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
        <motion.button
          onClick={() => navigate(`/play/${childId}/map`, { state: { fromCompletedModuleId: moduleId }, replace: true })}
          className="w-full h-14 bg-primary-container text-on-primary-container font-headline text-title-lg rounded-full btn-tactile-primary flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue Adventure
          <span className="material-symbols-outlined">arrow_forward</span>
        </motion.button>

        <button
          onClick={() => setShowFeedback(true)}
          className="w-full h-12 text-primary font-body text-label-md hover:bg-primary-fixed/10 rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">rate_review</span>
          Rate this Quest
        </button>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="absolute inset-0 bg-inverse-surface/50 backdrop-blur-sm" onClick={() => setShowFeedback(false)} />
          <motion.div
            className="relative bg-surface-container-lowest rounded-[24px] p-8 shadow-card-hover max-w-sm w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="font-headline text-title-lg text-on-surface mb-4">How was this quest?</h3>
            <div className="flex justify-center mb-4">
              <StarRating value={feedbackRating} onChange={setFeedbackRating} size="lg" />
            </div>
            <textarea
              value={feedbackComment}
              onChange={e => setFeedbackComment(e.target.value)}
              placeholder="Tell us what you think... (optional)"
              className="w-full p-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright resize-none h-24"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowFeedback(false)} className="flex-1 h-12 border-2 border-outline-variant rounded-full font-body text-label-md text-on-surface hover:bg-surface-container-high transition-colors">
                Skip
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={feedbackRating === 0}
                className="flex-1 h-12 bg-primary-container text-on-primary-container rounded-full font-body text-label-md btn-tactile-primary disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default QuestComplete;
