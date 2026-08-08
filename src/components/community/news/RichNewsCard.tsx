import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { NewsQuizSection } from './NewsQuizSection';
import { likeNews, bookmarkNews, addViewToNews } from '../../../firebase/communityFirestore';
import type { LegalNewsItem } from '../../../types';
import { getCategoryById } from '../../../constants';
import toast from 'react-hot-toast';

interface RichNewsCardProps {
  news: LegalNewsItem;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
}

export const RichNewsCard = ({ news, isBookmarked, onBookmarkToggle }: RichNewsCardProps) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(news.likesCount || 0);
  
  useEffect(() => {
    // Increment view count when mounted (ideally you'd use intersection observer for true view)
    const timer = setTimeout(() => addViewToNews(news.id!), 3000);
    return () => clearTimeout(timer);
  }, [news.id]);

  // category string directly instead of getCategoryById if it's stored as a string

  const handleLike = async () => {
    if (!user) return;
    const isNowLiked = await likeNews(news.id!, user.uid);
    setLiked(isNowLiked);
    setLikesCount(prev => isNowLiked ? prev + 1 : prev - 1);
  };

  const handleBookmark = async () => {
    if (!user) return;
    await bookmarkNews(news.id!, user.uid);
    onBookmarkToggle();
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: news.title, url: news.sourceUrl || window.location.href }).catch(console.error);
    } else {
      navigator.clipboard.writeText(news.sourceUrl || window.location.href);
      toast.success('Link copied!');
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-lowest rounded-[24px] shadow-card overflow-hidden flex flex-col md:flex-row mb-6 border border-outline-variant/20"
    >
      {/* Left side: Image & Meta */}
      <div className="w-full md:w-2/5 lg:w-1/3 relative overflow-hidden group">
        <img 
          src={news.image || 'https://via.placeholder.com/600x400?text=News'} 
          alt={news.title} 
          className="w-full h-48 md:h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm bg-primary">
            {news.category}
          </span>
        </div>
        
        {news.difficulty && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full px-3 py-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              news.difficulty === 'easy' ? 'text-green-400' : 
              news.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {news.difficulty}
            </span>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div>
            <p className="text-white/80 font-body text-caption mb-1">{news.source}</p>
            <p className="text-white font-headline text-title-md line-clamp-2 leading-tight">{news.title}</p>
          </div>
        </div>
      </div>

      {/* Right side: Content */}
      <div className="w-full md:w-3/5 lg:w-2/3 p-5 md:p-6 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2">
            <span className="bg-surface-container px-2 py-1 rounded-md text-xs font-body font-semibold text-on-surface flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {news.readTimeMinutes} min read
            </span>
            <span className="bg-primary-container/20 text-primary px-2 py-1 rounded-md text-xs font-body font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">stars</span>
              +{news.rewardXP} XP
            </span>
          </div>
          <p className="font-body text-caption text-on-surface-variant">
            {news.createdAt?.toDate().toLocaleDateString()}
          </p>
        </div>

        <p className="font-body text-body-lg text-on-surface-variant leading-relaxed mb-4">
          {news.summary}
        </p>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {/* Detailed Breakdown */}
              <div className="space-y-4 mb-6 pt-4 border-t border-surface-container">
                <div>
                  <h4 className="font-headline text-label-lg text-primary flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    What Happened?
                  </h4>
                  <p className="font-body text-body-md text-on-surface">{news.whatHappened}</p>
                </div>
                
                <div>
                  <h4 className="font-headline text-label-lg text-secondary flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[18px]">school</span>
                    What Can We Learn?
                  </h4>
                  <p className="font-body text-body-md text-on-surface">{news.lessons}</p>
                </div>

                {news.safetyTips && news.safetyTips.length > 0 && (
                  <div className="bg-error-container/20 p-4 rounded-xl border border-error/20">
                    <h4 className="font-headline text-label-lg text-error flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-[18px]">gpp_maybe</span>
                      Safety Tips
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {news.safetyTips.map((tip, i) => (
                        <li key={i} className="font-body text-body-sm text-on-surface">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {news.legalPoints && (
                  <div className="bg-tertiary-container/20 p-4 rounded-xl border border-tertiary/20">
                    <h4 className="font-headline text-label-lg text-tertiary flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[18px]">gavel</span>
                      Know Your Rights
                    </h4>
                    <p className="font-body text-body-md text-on-surface">{news.legalPoints}</p>
                  </div>
                )}

                {news.helplineNumbers && news.helplineNumbers.length > 0 && (
                  <div className="bg-surface-container p-4 rounded-xl">
                    <h4 className="font-headline text-label-lg text-on-surface flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-[18px]">emergency</span>
                      Emergency Contacts
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {news.helplineNumbers.map((num, i) => (
                        <a key={i} href={`tel:${num}`} className="px-3 py-1 bg-surface-bright text-on-surface rounded-full text-sm font-bold border border-outline-variant hover:border-primary transition-colors">
                          📞 {num}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quiz */}
              {news.quiz && <NewsQuizSection quiz={news.quiz} />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="mt-auto pt-4 flex items-center justify-between gap-2 flex-wrap">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="font-headline text-label-md sm:text-label-lg text-primary hover:underline flex items-center gap-1"
          >
            {expanded ? 'Show Less' : 'Full Story & Quiz'}
            <span className="material-symbols-outlined text-[18px]">
              {expanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={handleLike} className={`p-2 rounded-full transition-colors flex items-center gap-1 ${liked ? 'text-primary bg-primary-container/20' : 'text-on-surface-variant hover:bg-surface-container'}`}>
              <span className={`material-symbols-outlined ${liked ? 'filled' : ''}`}>favorite</span>
              {likesCount > 0 && <span className="text-xs font-bold">{likesCount}</span>}
            </button>
            <button onClick={handleShare} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">share</span>
            </button>
            <button onClick={handleBookmark} className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-primary bg-primary-container/20' : 'text-on-surface-variant hover:bg-surface-container'}`}>
              <span className={`material-symbols-outlined ${isBookmarked ? 'filled' : ''}`}>bookmark</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
