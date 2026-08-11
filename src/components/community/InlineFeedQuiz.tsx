import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import type { FeedQuiz, FeedQuizAttempt } from '../../types';
import { getQuizForPost, submitQuizAttempt, getQuizAttempt } from '../../firebase/communityFirestore';
import { XPRewardPopup } from './XPRewardPopup';

interface InlineFeedQuizProps {
  postId: string;
}

export const InlineFeedQuiz = ({ postId }: InlineFeedQuizProps) => {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<FeedQuiz | null>(null);
  const [attempt, setAttempt] = useState<FeedQuizAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const q = await getQuizForPost(postId);
      setQuiz(q);
      if (q && user) {
        const prev = await getQuizAttempt(q.id!, user.uid);
        if (prev) {
          setAttempt(prev);
          setAnswers(prev.answers);
          setSubmitted(true);
        }
      }
      setLoading(false);
    };
    load();
  }, [postId, user]);

  if (loading || !quiz || quiz.questions.length === 0) return null;

  const handleAnswer = (questionId: string, answer: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!user || !quiz || submitted) return;
    let correct = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    const score = correct;

    await submitQuizAttempt(quiz.id!, user.uid, answers, score, quiz.questions.length);
    setSubmitted(true);
    setAttempt({
      quizId: quiz.id!,
      userId: user.uid,
      answers,
      score,
      totalQuestions: quiz.questions.length,
      xpAwarded: true,
    } as FeedQuizAttempt);
    setShowXP(true);
  };

  const allAnswered = quiz.questions.every(q => answers[q.id]);
  const score = attempt ? attempt.score : 0;

  return (
    <>
      <div className="mt-4 pt-4 border-t border-surface-container">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-primary text-[20px]">quiz</span>
          <h4 className="font-headline text-label-lg text-on-surface">Quick Quiz</h4>
          {submitted && (
            <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
              {score}/{quiz.questions.length} correct
            </span>
          )}
          {!submitted && (
            <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-primary-container/30 text-primary font-body">
              +{quiz.rewardXP} XP
            </span>
          )}
        </div>

        <div className="space-y-3">
          {quiz.questions.map((q, qIdx) => {
            const userAnswer = answers[q.id];

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIdx * 0.05 }}
                className="bg-surface-container-high/50 rounded-xl p-3"
              >
                <p className="font-body text-body-md text-on-surface mb-2 font-medium">
                  {qIdx + 1}. {q.question}
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = userAnswer === opt;
                    const showCorrect = submitted && opt === q.correctAnswer;
                    const showWrong = submitted && isSelected && opt !== q.correctAnswer;

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleAnswer(q.id, opt)}
                        disabled={submitted}
                        className={`w-full text-left px-3 py-2 rounded-lg font-body text-caption transition-all ${
                          showCorrect ? 'bg-green-100 border border-green-400 text-green-700' :
                          showWrong ? 'bg-red-100 border border-red-400 text-red-700' :
                          isSelected ? 'bg-primary-container border border-primary text-on-primary-container' :
                          'bg-surface-container-lowest hover:bg-surface-container border border-transparent'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {showCorrect && <span className="material-symbols-outlined text-[14px] text-green-600">check_circle</span>}
                          {showWrong && <span className="material-symbols-outlined text-[14px] text-red-600">cancel</span>}
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                <AnimatePresence>
                  {submitted && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-2 px-3 py-2 bg-surface-container-lowest rounded-lg font-body text-caption text-on-surface-variant">
                        💡 {q.explanation}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {!submitted && allAnswered && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="w-full mt-3 py-2.5 bg-primary text-on-primary rounded-xl font-headline text-label-lg btn-tactile-primary"
          >
            Submit Quiz
          </motion.button>
        )}
      </div>

      <XPRewardPopup xp={quiz.rewardXP} show={showXP} onComplete={() => setShowXP(false)} label="Quiz Complete!" />
    </>
  );
};
