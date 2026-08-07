import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllFeedback } from '../../firebase/firestore';
import { EmptyState } from '../../components/ui/EmptyState';
import { StarRating } from '../../components/ui/StarRating';
import { staggerContainer, staggerItem } from '../../animations/variants';
import type { Feedback } from '../../types';
import { Timestamp } from 'firebase/firestore';

const FeedbackTable = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllFeedback().then(data => { setFeedback(data); setLoading(false); });
  }, []);

  const averageRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: feedback.filter(f => f.rating === r).length,
    pct: feedback.length > 0 ? (feedback.filter(f => f.rating === r).length / feedback.length) * 100 : 0,
  }));

  const getTimeAgo = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div>
      <h1 className="font-headline text-headline-md text-on-surface mb-2">Feedback</h1>
      <p className="font-body text-body-md text-on-surface-variant mb-8">View user ratings and comments.</p>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface-container-lowest rounded-[24px] shadow-card p-6 text-center">
          <p className="font-headline text-display-lg text-primary">{averageRating}</p>
          <StarRating value={Math.round(Number(averageRating))} readonly size="md" />
          <p className="font-body text-body-md text-on-surface-variant mt-2">{feedback.length} total reviews</p>
        </div>
        <div className="bg-surface-container-lowest rounded-[24px] shadow-card p-6">
          <h3 className="font-headline text-title-lg text-on-surface mb-4">Distribution</h3>
          {ratingDistribution.map(r => (
            <div key={r.rating} className="flex items-center gap-3 mb-2">
              <span className="font-body text-label-md text-on-surface w-4">{r.rating}</span>
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <div className="flex-1 h-3 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-tertiary-fixed-dim rounded-full transition-all" style={{ width: `${r.pct}%` }} />
              </div>
              <span className="font-body text-caption text-on-surface-variant w-8 text-right">{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-surface-container-high rounded-[24px] animate-pulse" />)}
        </div>
      ) : feedback.length === 0 ? (
        <EmptyState icon="reviews" title="No feedback yet" description="Feedback will appear here as users rate quests." />
      ) : (
        <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
          {feedback.map(fb => (
            <motion.div
              key={fb.id}
              variants={staggerItem}
              className="bg-surface-container-lowest rounded-[24px] shadow-card p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating value={fb.rating} readonly size="sm" />
                    <span className="font-body text-caption text-on-surface-variant">{getTimeAgo(fb.createdAt)}</span>
                  </div>
                  {fb.comments && (
                    <p className="font-body text-body-md text-on-surface">{fb.comments}</p>
                  )}
                  <p className="font-body text-caption text-on-surface-variant mt-1">
                    Context: {fb.screenContext}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default FeedbackTable;
