import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import type { Campaign, CampaignParticipation } from '../../types';
import { subscribeToCampaigns, joinCampaign, getCampaignParticipation, updateCampaignParticipation } from '../../firebase/communityFirestore';
import { getCategoryById } from '../../constants';
import { SkeletonCampaignCard } from './SkeletonFeed';
import { XPRewardPopup } from './XPRewardPopup';
import toast from 'react-hot-toast';

export const CampaignCarousel = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [participation, setParticipation] = useState<CampaignParticipation | null>(null);
  const [joining, setJoining] = useState(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    const unsub = subscribeToCampaigns((data) => {
      setCampaigns(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loadParticipation = async (campaignId: string) => {
    if (!user) return;
    const p = await getCampaignParticipation(campaignId, user.uid);
    setParticipation(p);
  };

  const handleJoin = async (campaign: Campaign) => {
    if (!user || joining) return;
    setJoining(true);
    try {
      await joinCampaign(campaign.id!, user.uid);
      toast.success(`Joined ${campaign.title}!`);
      await loadParticipation(campaign.id!);
    } catch (e) {
      toast.error('Failed to join campaign');
    } finally {
      setJoining(false);
    }
  };

  const handleOpenDetails = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setCurrentQuizIdx(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    if (user) await loadParticipation(campaign.id!);
  };

  const handleQuizAnswer = (qIdx: number, answer: string) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: answer }));
  };

  const handleSubmitQuiz = async () => {
    if (!selectedCampaign || !participation?.id || quizSubmitted) return;
    const questions = selectedCampaign.quizQuestions;
    let correct = 0;
    questions.forEach((q, i) => {
      if (quizAnswers[i] === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    await updateCampaignParticipation(participation.id, {
      quizCompleted: true,
      quizScore: score,
    });
    setQuizSubmitted(true);
    if (score >= 60) {
      setShowXP(true);
    }
    toast.success(`Quiz complete! Score: ${score}%`);
  };

  const getRemainingDays = (campaign: Campaign) => {
    const end = campaign.endDate?.toDate?.() ? campaign.endDate.toDate() : new Date();
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 360;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      setScrollIndex(prev => direction === 'left' ? Math.max(0, prev - 1) : Math.min(campaigns.length - 1, prev + 1));
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="font-headline text-title-lg text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">campaign</span>
          Featured Campaigns
        </h2>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map(i => <SkeletonCampaignCard key={i} />)}
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) return null;

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-title-lg text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary filled">campaign</span>
            Featured Campaigns
          </h2>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {campaigns.map((campaign, idx) => {
            const category = getCategoryById(campaign.categoryId);
            const remaining = getRemainingDays(campaign);
            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="min-w-[340px] max-w-[340px] snap-start cursor-pointer"
                onClick={() => handleOpenDetails(campaign)}
              >
                <div
                  className="relative h-[220px] rounded-[24px] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group"
                  style={{ background: `linear-gradient(135deg, ${category.color}15, ${category.color}30)` }}
                >
                  {/* Decorative Background */}
                  <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 80% 20%, ${category.color}, transparent 60%)` }} />

                  {/* Content */}
                  <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: category.color }}>
                          {category.emoji} {category.label}
                        </span>
                        {remaining > 0 && (
                          <span className="px-2 py-1 rounded-full text-xs font-body bg-surface-container-lowest/80 text-on-surface">
                            {remaining}d left
                          </span>
                        )}
                      </div>
                      <h3 className="font-headline text-title-lg text-on-surface font-bold mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {campaign.title}
                      </h3>
                      <p className="font-body text-caption text-on-surface-variant line-clamp-2">
                        {campaign.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-surface-container-lowest/80 rounded-full px-3 py-1">
                          <span className="material-symbols-outlined text-[14px] text-primary filled">star</span>
                          <span className="font-headline text-caption font-bold text-primary">{campaign.rewardXP} XP</span>
                        </div>
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px]">group</span>
                          <span className="font-body text-caption">{campaign.participantCount}</span>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-primary text-on-primary px-4 py-2 rounded-full font-headline text-label-md"
                      >
                        View
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {campaigns.map((_, idx) => (
            <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === scrollIndex ? 'w-4 bg-primary' : 'bg-outline-variant'}`} />
          ))}
        </div>
      </div>

      {/* Campaign Detail Modal */}
      <AnimatePresence>
        {selectedCampaign && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedCampaign(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-surface-container-lowest w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[32px] shadow-card-hover p-6 md:p-8"
            >
              {/* Close */}
              <button onClick={() => setSelectedCampaign(null)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: getCategoryById(selectedCampaign.categoryId).color }}>
                    {getCategoryById(selectedCampaign.categoryId).emoji} {getCategoryById(selectedCampaign.categoryId).label}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-secondary-container text-on-secondary-container font-body">
                    {getRemainingDays(selectedCampaign)} days remaining
                  </span>
                </div>
                <h2 className="font-headline text-headline-md text-on-surface">{selectedCampaign.title}</h2>
                <p className="font-body text-body-lg text-on-surface-variant mt-2">{selectedCampaign.description}</p>
              </div>

              {/* Rewards */}
              <div className="flex items-center gap-4 p-4 bg-surface-container rounded-2xl mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary filled">star</span>
                  <span className="font-headline text-label-lg">{selectedCampaign.rewardXP} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary filled">monetization_on</span>
                  <span className="font-headline text-label-lg">{selectedCampaign.rewardCoins} Coins</span>
                </div>
                {selectedCampaign.rewardBadge && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary filled">military_tech</span>
                    <span className="font-headline text-label-lg">{selectedCampaign.rewardBadge}</span>
                  </div>
                )}
              </div>

              {/* Join / Status */}
              {!participation ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleJoin(selectedCampaign)}
                  disabled={joining}
                  className="w-full py-4 bg-primary text-on-primary rounded-2xl font-headline text-title-lg btn-tactile-primary mb-6 disabled:opacity-50"
                >
                  {joining ? 'Joining...' : '🚀 Join Campaign'}
                </motion.button>
              ) : (
                <div className="p-4 bg-secondary-container/30 rounded-2xl mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-secondary filled">check_circle</span>
                    <span className="font-headline text-label-lg text-on-secondary-container">Joined!</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-secondary transition-all" style={{ width: `${Math.round((participation.completedTasks / selectedCampaign.totalTasks) * 100)}%` }} />
                  </div>
                  <p className="font-body text-caption text-on-surface-variant mt-1">
                    {participation.completedTasks}/{selectedCampaign.totalTasks} tasks completed
                  </p>
                </div>
              )}

              {/* Mini Quiz */}
              {selectedCampaign.quizQuestions.length > 0 && participation && (
                <div className="mb-6">
                  <h3 className="font-headline text-title-lg text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">quiz</span>
                    Campaign Quiz
                  </h3>
                  {participation.quizCompleted ? (
                    <div className="p-4 bg-surface-container rounded-2xl text-center">
                      <span className="material-symbols-outlined text-[48px] text-secondary filled mb-2">emoji_events</span>
                      <p className="font-headline text-title-lg text-on-surface">Quiz Completed!</p>
                      <p className="font-body text-body-md text-on-surface-variant">Score: {participation.quizScore}%</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedCampaign.quizQuestions.map((q, qIdx) => (
                        <motion.div
                          key={qIdx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: qIdx * 0.1 }}
                          className="p-4 bg-surface-container rounded-2xl"
                        >
                          <p className="font-body text-body-md text-on-surface font-semibold mb-3">
                            {qIdx + 1}. {q.question}
                          </p>
                          <div className="space-y-2">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = quizAnswers[qIdx] === opt;
                              const isCorrect = quizSubmitted && opt === q.correctAnswer;
                              const isWrong = quizSubmitted && isSelected && opt !== q.correctAnswer;
                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleQuizAnswer(qIdx, opt)}
                                  disabled={quizSubmitted}
                                  className={`w-full text-left px-4 py-3 rounded-xl font-body text-body-md transition-all ${
                                    isCorrect ? 'bg-green-100 border-2 border-green-500 text-green-700' :
                                    isWrong ? 'bg-red-100 border-2 border-red-500 text-red-700' :
                                    isSelected ? 'bg-primary-container border-2 border-primary text-on-primary-container' :
                                    'bg-surface-container-high hover:bg-surface-container-highest'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {quizSubmitted && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-2 p-3 bg-surface-container-low rounded-xl font-body text-caption text-on-surface-variant"
                            >
                              💡 {q.explanation}
                            </motion.p>
                          )}
                        </motion.div>
                      ))}

                      {!quizSubmitted && Object.keys(quizAnswers).length === selectedCampaign.quizQuestions.length && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSubmitQuiz}
                          className="w-full py-3 bg-secondary text-on-secondary rounded-2xl font-headline text-label-lg btn-tactile-secondary"
                        >
                          Submit Quiz
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Learning Resources */}
              {selectedCampaign.learningResources.length > 0 && (
                <div>
                  <h3 className="font-headline text-title-lg text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary">auto_stories</span>
                    Learning Resources
                  </h3>
                  <div className="space-y-3">
                    {selectedCampaign.learningResources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-surface-container-high rounded-2xl hover:bg-surface-container-highest transition-colors group"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">
                          {res.type === 'video' ? 'play_circle' : res.type === 'infographic' ? 'image' : 'article'}
                        </span>
                        <div className="flex-1">
                          <p className="font-headline text-label-lg text-on-surface group-hover:text-primary">{res.title}</p>
                          <p className="font-body text-caption text-on-surface-variant">{res.description}</p>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant">open_in_new</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <XPRewardPopup xp={selectedCampaign?.rewardXP || 50} show={showXP} onComplete={() => setShowXP(false)} label="Campaign Quiz Bonus!" />
    </>
  );
};
