import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import type { ScamAlert, ScamAlertInteraction } from '../../types';
import { subscribeToScamAlerts, getScamAlertInteraction, updateScamAlertInteraction, reportScam } from '../../firebase/communityFirestore';
import { toggleBookmark, checkBookmarked } from '../../firebase/communityFirestore';
import { SCAM_SEVERITY_META, getCategoryById } from '../../constants';
import { XPRewardPopup } from './XPRewardPopup';
import toast from 'react-hot-toast';

export const ScamAlertSection = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<Record<string, ScamAlertInteraction>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<number, string>>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Set<string>>(new Set());
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);

  useEffect(() => {
    const unsub = subscribeToScamAlerts((data) => {
      setAlerts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user && alerts.length > 0) {
      alerts.forEach(async (alert) => {
        const interaction = await getScamAlertInteraction(alert.id!, user.uid);
        if (interaction) {
          setInteractions(prev => ({ ...prev, [alert.id!]: interaction }));
          if (interaction.quizCompleted) setQuizSubmitted(prev => new Set([...prev, alert.id!]));
        }
        const saved = await checkBookmarked(user.uid, 'scam_alert', alert.id!);
        if (saved) setBookmarkedIds(prev => new Set([...prev, alert.id!]));
      });
    }
  }, [user, alerts]);

  const handleBookmark = async (alertId: string) => {
    if (!user) return;
    const isSaved = await toggleBookmark(user.uid, 'scam_alert', alertId);
    if (isSaved) { setBookmarkedIds(prev => new Set([...prev, alertId])); toast.success('Saved!'); }
    else setBookmarkedIds(prev => { const n = new Set(prev); n.delete(alertId); return n; });
  };

  const handleReport = async (alertId: string) => {
    if (!user) return;
    await reportScam(alertId, user.uid);
    toast.success('Report submitted. Thank you for keeping the community safe!');
  };

  const handleShare = (alert: ScamAlert) => {
    if (navigator.share) {
      navigator.share({ title: `⚠️ Scam Alert: ${alert.title}`, text: alert.description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`⚠️ Scam Alert: ${alert.title}\n${alert.description}`);
      toast.success('Alert copied!');
    }
  };

  const handleQuizAnswer = (alertId: string, qIdx: number, answer: string) => {
    if (quizSubmitted.has(alertId)) return;
    setQuizAnswers(prev => ({
      ...prev,
      [alertId]: { ...(prev[alertId] || {}), [qIdx]: answer },
    }));
  };

  const handleSubmitQuiz = async (alert: ScamAlert) => {
    if (!user || quizSubmitted.has(alert.id!)) return;
    const answers = quizAnswers[alert.id!] || {};
    let correct = 0;
    alert.quizQuestions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / alert.quizQuestions.length) * 100);
    await updateScamAlertInteraction(alert.id!, user.uid, {
      quizCompleted: true,
      quizScore: score,
      xpAwarded: true,
    });
    setQuizSubmitted(prev => new Set([...prev, alert.id!]));
    setXpAmount(alert.rewardXP);
    setShowXP(true);
  };

  if (loading) {
    return (
      <div>
        <h2 className="font-headline text-title-lg text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-error">warning</span>
          Scam Alert Center
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-[20px] bg-surface-container animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (alerts.length === 0) return null;

  return (
    <>
      <div>
        <h2 className="font-headline text-title-lg text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-error filled">warning</span>
          Scam Alert Center
        </h2>

        <div className="space-y-4">
          {alerts.map((alert, idx) => {
            const severityMeta = SCAM_SEVERITY_META[alert.severity];
            const category = getCategoryById(alert.categoryId);
            const isExpanded = expandedId === alert.id;
            const interaction = interactions[alert.id!];
            const isBookmarked = bookmarkedIds.has(alert.id!);
            const isQuizDone = quizSubmitted.has(alert.id!);
            const alertAnswers = quizAnswers[alert.id!] || {};

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-surface-container-lowest rounded-[20px] shadow-card overflow-hidden"
              >
                {/* Severity Bar */}
                <div className="h-1.5" style={{ backgroundColor: severityMeta.color }} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: severityMeta.bgColor }}>
                        <span className="material-symbols-outlined text-[24px]" style={{ color: severityMeta.color }}>warning</span>
                      </div>
                      <div>
                        <h3 className="font-headline text-label-lg text-on-surface">{alert.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: severityMeta.bgColor, color: severityMeta.color }}>
                            {severityMeta.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: category.bgAccent, color: category.color }}>
                            {category.emoji} {category.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleBookmark(alert.id!)} className="p-1.5 rounded-full hover:bg-surface-container transition-colors">
                      <span className={`material-symbols-outlined text-[20px] ${isBookmarked ? 'filled text-primary' : 'text-on-surface-variant'}`}>bookmark</span>
                    </button>
                  </div>

                  <p className="font-body text-body-md text-on-surface-variant mb-3">{alert.description}</p>

                  {/* Expandable Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        {/* How Scam Works */}
                        <div className="p-4 bg-red-50 rounded-xl mb-3">
                          <h4 className="font-headline text-label-lg text-red-700 mb-2 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px]">report</span>
                            How This Scam Works
                          </h4>
                          <p className="font-body text-caption text-red-800 whitespace-pre-wrap">{alert.howItWorks}</p>
                        </div>

                        {/* How to Stay Safe */}
                        <div className="p-4 bg-green-50 rounded-xl mb-3">
                          <h4 className="font-headline text-label-lg text-green-700 mb-2 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px]">shield</span>
                            How to Stay Safe
                          </h4>
                          <p className="font-body text-caption text-green-800 whitespace-pre-wrap">{alert.howToStaySafe}</p>
                        </div>

                        {/* Mini Quiz */}
                        {alert.quizQuestions.length > 0 && (
                          <div className="p-4 bg-surface-container-high/50 rounded-xl mb-3">
                            <h4 className="font-headline text-label-lg text-on-surface mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-[18px]">quiz</span>
                              Test Your Knowledge
                              {!isQuizDone && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-primary-container/30 text-primary font-body ml-auto">
                                  +{alert.rewardXP} XP
                                </span>
                              )}
                            </h4>
                            <div className="space-y-3">
                              {alert.quizQuestions.map((q, qIdx) => {
                                const userAns = alertAnswers[qIdx];
                                const isCorrect = isQuizDone && userAns === q.correctAnswer;
                                const isWrong = isQuizDone && userAns && userAns !== q.correctAnswer;

                                return (
                                  <div key={qIdx}>
                                    <p className="font-body text-body-md text-on-surface mb-2 font-medium">{qIdx + 1}. {q.question}</p>
                                    <div className="grid gap-1.5">
                                      {q.options.map((opt, oIdx) => {
                                        const sel = userAns === opt;
                                        const showC = isQuizDone && opt === q.correctAnswer;
                                        const showW = isQuizDone && sel && opt !== q.correctAnswer;
                                        return (
                                          <button
                                            key={oIdx}
                                            onClick={() => handleQuizAnswer(alert.id!, qIdx, opt)}
                                            disabled={isQuizDone}
                                            className={`text-left px-3 py-2 rounded-lg font-body text-caption transition-all ${
                                              showC ? 'bg-green-100 border border-green-400 text-green-700' :
                                              showW ? 'bg-red-100 border border-red-400 text-red-700' :
                                              sel ? 'bg-primary-container border border-primary text-on-primary-container' :
                                              'bg-surface-container-lowest hover:bg-surface-container border border-transparent'
                                            }`}
                                          >
                                            {opt}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    {isQuizDone && (
                                      <p className="mt-1 px-3 py-1.5 bg-surface-container-lowest rounded-lg font-body text-caption text-on-surface-variant">
                                        💡 {q.explanation}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {!isQuizDone && Object.keys(alertAnswers).length === alert.quizQuestions.length && (
                              <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSubmitQuiz(alert)}
                                className="w-full mt-3 py-2.5 bg-primary text-on-primary rounded-xl font-headline text-label-lg btn-tactile-primary"
                              >
                                Submit Quiz
                              </motion.button>
                            )}
                            {isQuizDone && (
                              <div className="flex items-center justify-center gap-2 mt-3 text-green-600">
                                <span className="material-symbols-outlined text-[18px] filled">check_circle</span>
                                <span className="font-body text-label-md">Quiz Complete! Score: {interaction?.quizScore || 0}%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : alert.id!)}
                      className="font-body text-label-md text-primary hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                      {isExpanded ? 'Show Less' : 'Read More'}
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleReport(alert.id!)} className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant hover:text-error" title="Report">
                        <span className="material-symbols-outlined text-[20px]">flag</span>
                      </button>
                      <button onClick={() => handleShare(alert)} className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant" title="Share">
                        <span className="material-symbols-outlined text-[20px]">share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <XPRewardPopup xp={xpAmount} show={showXP} onComplete={() => setShowXP(false)} label="Scam Awareness!" />
    </>
  );
};
