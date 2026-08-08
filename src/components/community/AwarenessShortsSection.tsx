import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import type { AwarenessShort } from '../../types';
import { subscribeToShorts, toggleShortLike, updateShortInteraction, getShortInteraction } from '../../firebase/communityFirestore';
import { toggleBookmark, checkBookmarked } from '../../firebase/communityFirestore';
import { getCategoryById } from '../../constants';
import { XPRewardPopup } from './XPRewardPopup';
import toast from 'react-hot-toast';

export const AwarenessShortsSection = () => {
  const { user } = useAuth();
  const [shorts, setShorts] = useState<AwarenessShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [activeIdx, setActiveIdx] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeToShorts((data) => {
      setShorts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user && shorts.length > 0) {
      shorts.forEach(async (s) => {
        const interaction = await getShortInteraction(s.id!, user.uid);
        if (interaction) {
          if (interaction.liked) setLikedIds(prev => new Set([...prev, s.id!]));
          if (interaction.bookmarked) setBookmarkedIds(prev => new Set([...prev, s.id!]));
          if (interaction.watched) setWatchedIds(prev => new Set([...prev, s.id!]));
        }
      });
    }
  }, [user, shorts]);

  const handleLike = async (shortId: string) => {
    if (!user) return;
    const isLiked = await toggleShortLike(shortId, user.uid);
    if (isLiked) {
      setLikedIds(prev => new Set([...prev, shortId]));
    } else {
      setLikedIds(prev => { const n = new Set(prev); n.delete(shortId); return n; });
    }
  };

  const handleBookmark = async (shortId: string) => {
    if (!user) return;
    const isSaved = await toggleBookmark(user.uid, 'short', shortId);
    if (isSaved) {
      setBookmarkedIds(prev => new Set([...prev, shortId]));
      toast.success('Saved!');
    } else {
      setBookmarkedIds(prev => { const n = new Set(prev); n.delete(shortId); return n; });
    }
  };

  const handleWatch = async (short: AwarenessShort) => {
    if (!user || watchedIds.has(short.id!)) return;
    await updateShortInteraction(short.id!, user.uid, { watched: true, watchedPercent: 100, xpAwarded: true });
    setWatchedIds(prev => new Set([...prev, short.id!]));
    setXpAmount(short.rewardXP);
    setShowXP(true);
  };

  const handleShare = (short: AwarenessShort) => {
    if (navigator.share) {
      navigator.share({ title: short.title, text: short.description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  if (loading || shorts.length === 0) return null;

  return (
    <>
      <div className="mb-8">
        <h2 className="font-headline text-title-lg text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary filled">play_circle</span>
          Awareness Shorts
        </h2>

        <div ref={containerRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {shorts.map((short, idx) => {
            const category = getCategoryById(short.categoryId);
            const isLiked = likedIds.has(short.id!);
            const isBookmarked = bookmarkedIds.has(short.id!);
            const isWatched = watchedIds.has(short.id!);

            return (
              <motion.div
                key={short.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
                className="min-w-[200px] max-w-[200px] snap-start shrink-0"
              >
                {/* Vertical Card */}
                <div className="relative h-[320px] rounded-[20px] overflow-hidden shadow-card hover:shadow-card-hover transition-all bg-inverse-surface group">
                  {/* Media */}
                  {short.mediaType === 'video' ? (
                    <video
                      src={short.mediaUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      onEnded={() => handleWatch(short)}
                      onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                    />
                  ) : (
                    <img
                      src={short.thumbnailUrl || short.mediaUrl}
                      alt={short.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Duration Badge */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs font-body">
                    {short.durationSeconds > 60 ? '60s' : `${short.durationSeconds}s`}
                  </div>

                  {/* Category */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs text-white font-body" style={{ backgroundColor: category.color + 'CC' }}>
                    {category.emoji}
                  </div>

                  {/* Watched Badge */}
                  {isWatched && (
                    <div className="absolute top-10 right-2">
                      <span className="material-symbols-outlined text-green-400 filled text-[18px]">check_circle</span>
                    </div>
                  )}

                  {/* Actions (right side) */}
                  <div className="absolute right-2 bottom-20 flex flex-col items-center gap-3">
                    <button onClick={() => handleLike(short.id!)} className="flex flex-col items-center">
                      <motion.span
                        className={`material-symbols-outlined text-white text-[24px] ${isLiked ? 'filled text-red-400' : ''}`}
                        animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                      >
                        favorite
                      </motion.span>
                      <span className="text-white text-xs font-body">{short.likesCount + (isLiked ? 1 : 0)}</span>
                    </button>

                    <button onClick={() => handleBookmark(short.id!)} className="flex flex-col items-center">
                      <span className={`material-symbols-outlined text-white text-[24px] ${isBookmarked ? 'filled text-yellow-400' : ''}`}>
                        bookmark
                      </span>
                    </button>

                    <button onClick={() => handleShare(short)} className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-white text-[24px]">share</span>
                    </button>
                  </div>

                  {/* Bottom Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="font-headline text-label-md text-white mb-1 line-clamp-2">{short.title}</p>
                    <p className="font-body text-xs text-white/70 line-clamp-1">{short.description}</p>

                    {/* Watch for XP */}
                    {!isWatched && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleWatch(short)}
                        className="mt-2 w-full py-1.5 bg-white/20 backdrop-blur rounded-lg text-white font-headline text-xs flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        +{short.rewardXP} XP
                      </motion.button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                    <div className={`h-full rounded-full transition-all ${isWatched ? 'w-full bg-green-400' : 'w-0 bg-primary'}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <XPRewardPopup xp={xpAmount} show={showXP} onComplete={() => setShowXP(false)} label="Short Watched!" />
    </>
  );
};
