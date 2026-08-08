import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useChild } from '../contexts/ChildContext';
import { groqService, EVENT_THEMES } from '../services/groqService';
import {
  getCachedAILevel,
  getDailyChallenge,
  cacheAILevel,
  getCachedAILevelById,
  updateCachedAILevel,
  getCompletedAILevels,
} from '../firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { AVATAR_OPTIONS } from '../constants';
import { calculateLevel } from '../services/xpSystem';
import toast from 'react-hot-toast';
import type { LevelContext, CachedAILevel, AIGeneratedLevel } from '../types';
import { staggerContainer, staggerItem } from '../animations/variants';

const AI_TOPICS = [
  'Child Rights', 'Cyber Safety', 'Girls Safety', 'Self Defence', 'Road Safety',
  'Emergency Numbers', 'Consumer Rights', 'Environmental Laws', 'Constitution',
  'Fundamental Rights', 'Digital Privacy', 'Bullying', 'Stranger Danger',
  'Disaster Management', 'Internet Scams', 'Legal Awareness',
];

const AIHub = () => {
  const { user } = useAuth();
  const { activeChild } = useChild();
  const navigate = useNavigate();
  const { childId } = useParams();

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<CachedAILevel | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatar = AVATAR_OPTIONS.find(a => a.id === activeChild?.avatarId) || AVATAR_OPTIONS[0];
  const levelInfo = activeChild ? calculateLevel(activeChild.xp || 0) : { level: 1, title: 'Beginner' };

  useEffect(() => {
    const loadData = async () => {
      if (!user || !childId) return;
      setLoading(true);
      try {
        const [daily, completed] = await Promise.all([
          getDailyChallenge(user.uid, childId),
          getCompletedAILevels(user.uid, childId),
        ]);
        setDailyChallenge(daily);
        setCompletedCount(completed.length);
      } catch (err) {
        console.error('Failed to load AI hub data:', err);
      }
      setLoading(false);
    };
    loadData();
  }, [user, childId]);

  const buildContext = (): LevelContext => {
    const ageGroup = activeChild?.ageGroup || '8-11';
    const worldNum = Math.min(5, Math.floor((activeChild?.completedLevelsCount || 0) / 10) + 1);
    
    return {
      playerAge: ageGroup,
      currentWorld: worldNum,
      currentLevel: (activeChild?.completedLevelsCount || 0) + 1,
      difficulty: ageGroup === '8-11' ? 'Easy' : 'Medium',
      completedTopics: activeChild?.strongTopics || [],
      weakTopics: activeChild?.weakTopics || [],
      strongTopics: activeChild?.strongTopics || [],
      language: activeChild?.languagePref || 'en',
      currentXp: activeChild?.xp || 0,
      badgesEarned: activeChild?.badgeIds || [],
      avoidQuestions: [],
    };
  };

  const handleGenerate = async (
    type: CachedAILevel['type'],
    generatorFn: () => Promise<AIGeneratedLevel>,
    topic?: string
  ) => {
    if (!user || !childId) return;
    setGenerating(type || undefined);
    setError(null);

    try {
      // Check cache first
      const cached = await getCachedAILevel(user.uid, childId, type);
      if (cached) {
        // Navigate to cached level
        navigate(`/play/${childId}/ai-level/${cached.id}`);
        return;
      }

      // Generate new level
      const aiLevel = await generatorFn();
      
      // Cache in Firestore
      const levelId = await cacheAILevel({
        childId,
        parentId: user.uid,
        type,
        topic: topic || null,
        generatedAt: Timestamp.now(),
        expiresAt: type === 'daily_challenge' 
          ? Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000))
          : null,
        levelData: aiLevel,
        status: 'unplayed',
      });

      toast.success(`🤖 AI generated "${aiLevel.title}"!`);
      navigate(`/play/${childId}/ai-level/${levelId}`);
    } catch (err: unknown) {
      console.error('AI generation failed:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      toast.error('AI generation failed. Try again!');
    } finally {
      setGenerating(null);
    }
  };

  const handleDailyChallenge = () => {
    if (dailyChallenge) {
      navigate(`/play/${childId}/ai-level/${dailyChallenge.id}`);
      return;
    }
    const ctx = buildContext();
    handleGenerate('daily_challenge', () => groqService.generateDailyChallenge(ctx));
  };

  const handleRevision = () => {
    const ctx = buildContext();
    const weakTopics = activeChild?.weakTopics || ['Child Rights', 'Cyber Safety'];
    handleGenerate('revision', () => groqService.generateRevisionQuiz(ctx, weakTopics));
  };

  const handleBonusStory = () => {
    const ctx = buildContext();
    const topic = activeChild?.strongTopics?.[0] || 'Child Rights';
    handleGenerate('bonus_story', () => groqService.generateBonusStory(ctx, topic), topic);
  };

  const handlePractice = (topic: string) => {
    const ctx = buildContext();
    setShowTopicPicker(false);
    handleGenerate('practice', () => groqService.generatePractice(ctx, topic), topic);
  };

  const handleEvent = (eventKey: string) => {
    const ctx = buildContext();
    handleGenerate('event', () => groqService.generateEventLevel(ctx, eventKey));
  };

  // Detect current events
  const currentEvents = getCurrentEvents();

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/play/${childId}/map`)}
          className="text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h1 className="font-headline text-title-lg text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary filled">auto_awesome</span>
            AI Adventure Hub
          </h1>
          <p className="font-body text-caption text-on-surface-variant">
            Fresh AI-generated challenges powered by Groq
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-lowest rounded-full px-3 py-1.5 shadow-sm">
          <img src={avatar.imageUrl} alt="" className="w-8 h-8 rounded-full" />
          <span className="font-body text-label-md text-on-surface">{activeChild?.displayName}</span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
        <div className="bg-surface-container-lowest rounded-2xl px-4 py-3 shadow-card flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-primary filled text-lg">bolt</span>
          <span className="font-body text-label-md text-on-surface">{activeChild?.xp?.toLocaleString() || 0} XP</span>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl px-4 py-3 shadow-card flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-secondary filled text-lg">emoji_events</span>
          <span className="font-body text-label-md text-on-surface">Lvl {levelInfo.level}</span>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl px-4 py-3 shadow-card flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-tertiary filled text-lg">auto_awesome</span>
          <span className="font-body text-label-md text-on-surface">{completedCount} AI Quests</span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error-container text-on-error-container rounded-2xl p-4 mb-6 flex items-start gap-3"
        >
          <span className="material-symbols-outlined filled">error</span>
          <div>
            <p className="font-body text-body-md font-semibold">AI Generation Failed</p>
            <p className="font-body text-caption opacity-80">{error}</p>
            <p className="font-body text-caption mt-1">Make sure your Groq API key is set in .env</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </motion.div>
      )}

      {/* Cards Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Daily Challenge */}
        <motion.div variants={staggerItem}>
          <AICard
            icon="calendar_today"
            iconColor="text-[#FF6B6B]"
            bgGradient="from-[#FF6B6B]/10 to-[#FF8E8E]/5"
            title="Daily Challenge"
            description={dailyChallenge ? 
              (dailyChallenge.status === 'completed' ? '✅ Completed today!' : 'Continue your challenge!') 
              : 'Fresh challenge every day!'}
            badge={dailyChallenge?.status === 'completed' ? '✅ Done' : '🔥 New'}
            badgeColor={dailyChallenge?.status === 'completed' ? 'bg-secondary' : 'bg-error'}
            loading={generating === 'daily_challenge'}
            disabled={dailyChallenge?.status === 'completed'}
            onClick={handleDailyChallenge}
          />
        </motion.div>

        {/* Weak Topic Quiz */}
        <motion.div variants={staggerItem}>
          <AICard
            icon="psychology"
            iconColor="text-[#4ECDC4]"
            bgGradient="from-[#4ECDC4]/10 to-[#45B7AA]/5"
            title="Weak Topic Quiz"
            description={`Focus on: ${(activeChild?.weakTopics || ['Your weak areas']).slice(0, 2).join(', ')}`}
            badge="🎯 Targeted"
            badgeColor="bg-secondary"
            loading={generating === 'revision'}
            onClick={handleRevision}
          />
        </motion.div>

        {/* Bonus Story */}
        <motion.div variants={staggerItem}>
          <AICard
            icon="auto_stories"
            iconColor="text-[#A78BFA]"
            bgGradient="from-[#A78BFA]/10 to-[#8B5CF6]/5"
            title="Bonus Story"
            description="An AI-crafted adventure with new characters!"
            badge="📖 Story"
            badgeColor="bg-tertiary"
            loading={generating === 'bonus_story'}
            onClick={handleBonusStory}
          />
        </motion.div>

        {/* Practice Mode */}
        <motion.div variants={staggerItem}>
          <AICard
            icon="fitness_center"
            iconColor="text-[#F59E0B]"
            bgGradient="from-[#F59E0B]/10 to-[#D97706]/5"
            title="Practice Mode"
            description="Choose a topic and practice with AI questions"
            badge="♾️ Unlimited"
            badgeColor="bg-primary"
            loading={generating === 'practice'}
            onClick={() => setShowTopicPicker(true)}
          />
        </motion.div>
      </motion.div>

      {/* Special Events */}
      {currentEvents.length > 0 && (
        <div className="mb-6">
          <h2 className="font-headline text-title-md text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary filled">celebration</span>
            Special Events
          </h2>
          <div className="space-y-3">
            {currentEvents.map(eventKey => {
              const event = EVENT_THEMES[eventKey];
              return (
                <motion.button
                  key={eventKey}
                  onClick={() => handleEvent(eventKey)}
                  disabled={generating === 'event'}
                  className="w-full bg-gradient-to-r from-tertiary-fixed/20 to-primary-fixed/20 rounded-2xl p-4 text-left flex items-center gap-4 border border-tertiary/20 hover:shadow-md transition-all"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-tertiary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-tertiary text-2xl filled">celebration</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline text-label-lg text-on-surface font-bold">{event.name}</p>
                    <p className="font-body text-caption text-on-surface-variant truncate">{event.description}</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-card">
        <h3 className="font-headline text-title-sm text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary filled">info</span>
          How AI Adventures Work
        </h3>
        <div className="space-y-2 font-body text-body-sm text-on-surface-variant">
          <p>🤖 Groq AI creates unique stories and questions just for you</p>
          <p>📚 Every session teaches real Indian laws and safety concepts</p>
          <p>🔄 No two sessions are ever the same</p>
          <p>💾 Your progress is saved — come back anytime to continue</p>
          <p>🎯 AI adapts to your weak topics for better learning</p>
        </div>
      </div>

      {/* Topic Picker Modal */}
      <AnimatePresence>
        {showTopicPicker && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-inverse-surface/50 backdrop-blur-sm" onClick={() => setShowTopicPicker(false)} />
            <motion.div
              className="relative bg-surface-container-lowest rounded-[24px] p-6 shadow-card-hover max-w-md w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="font-headline text-title-lg text-on-surface mb-1">Choose a Topic</h3>
              <p className="font-body text-caption text-on-surface-variant mb-4">AI will generate practice questions on this topic</p>
              <div className="grid grid-cols-2 gap-2">
                {AI_TOPICS.map(topic => (
                  <button
                    key={topic}
                    onClick={() => handlePractice(topic)}
                    className="p-3 bg-surface-bright border-2 border-outline-variant hover:border-primary rounded-xl text-left font-body text-label-md text-on-surface transition-all hover:shadow-sm"
                  >
                    {topic}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowTopicPicker(false)}
                className="w-full mt-4 py-3 text-on-surface-variant font-body text-label-md hover:bg-surface-container-high rounded-full transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generating Overlay */}
      <AnimatePresence>
        {generating && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-md" />
            <motion.div
              className="relative flex flex-col items-center gap-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center">
                <motion.span
                  className="material-symbols-outlined text-primary text-4xl filled"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  auto_awesome
                </motion.span>
              </div>
              <p className="font-headline text-title-lg text-white">AI is creating your adventure...</p>
              <p className="font-body text-body-md text-white/70">This may take a few seconds</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ========== Subcomponents ==========

interface AICardProps {
  icon: string;
  iconColor: string;
  bgGradient: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const AICard = ({ icon, iconColor, bgGradient, title, description, badge, badgeColor, loading, disabled, onClick }: AICardProps) => (
  <motion.button
    onClick={onClick}
    disabled={loading || disabled}
    className={`w-full bg-gradient-to-br ${bgGradient} rounded-[20px] p-5 text-left border border-outline-variant/10 shadow-card hover:shadow-card-hover transition-all relative overflow-hidden group ${disabled ? 'opacity-60' : ''}`}
    whileHover={!disabled ? { scale: 1.02 } : undefined}
    whileTap={!disabled ? { scale: 0.98 } : undefined}
  >
    {/* Badge */}
    <div className={`absolute top-3 right-3 ${badgeColor} text-white text-xs px-2.5 py-1 rounded-full font-body font-semibold`}>
      {badge}
    </div>

    {/* Icon */}
    <div className="w-12 h-12 rounded-xl bg-surface/80 backdrop-blur flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
      {loading ? (
        <motion.span
          className="material-symbols-outlined text-primary text-2xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          progress_activity
        </motion.span>
      ) : (
        <span className={`material-symbols-outlined ${iconColor} text-2xl filled`}>{icon}</span>
      )}
    </div>

    {/* Content */}
    <h3 className="font-headline text-title-sm text-on-surface mb-1">{title}</h3>
    <p className="font-body text-caption text-on-surface-variant line-clamp-2">{description}</p>
  </motion.button>
);

// ========== Helpers ==========

function getCurrentEvents(): string[] {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const events: string[] = [];

  // November 14 — Children's Day
  if (month === 11 && day >= 10 && day <= 18) events.push('childrens_day');
  // January 26 — Republic Day
  if (month === 1 && day >= 22 && day <= 30) events.push('republic_day');
  // August 15 — Independence Day
  if (month === 8 && day >= 11 && day <= 19) events.push('independence_day');
  // March 8 — Women's Day
  if (month === 3 && day >= 4 && day <= 12) events.push('womens_day');
  // June 5 — World Environment Day
  if (month === 6 && day >= 1 && day <= 9) events.push('environment_day');
  // October — Cyber Awareness Month
  if (month === 10) events.push('cyber_awareness');

  // Always show at least one event for demo purposes
  if (events.length === 0) {
    // Pick based on current month
    const fallbacks = ['cyber_awareness', 'childrens_day', 'republic_day', 'womens_day', 'environment_day', 'independence_day'];
    events.push(fallbacks[month % fallbacks.length]);
  }

  return events;
}

export default AIHub;
