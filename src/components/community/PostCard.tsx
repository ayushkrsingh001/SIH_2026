import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ParentPost } from '../../types';
import { togglePostLike, checkIsLiked } from '../../firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

const timeAgo = (date: Date) => {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

interface PostCardProps {
  post: ParentPost;
  onOpenComments: (post: ParentPost) => void;
}

export const PostCard = ({ post, onOpenComments }: PostCardProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (user) {
      checkIsLiked(post.id!, user.uid).then(setIsLiked);
    }
  }, [post.id, user]);

  const handleLike = async () => {
    if (!user || isLiking) return;
    setIsLiking(true);
    
    // Optimistic update
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      const currentIsLiked = await togglePostLike(post.id!, user.uid, post.authorId, user?.displayName || 'Parent', undefined);
      if (currentIsLiked !== !wasLiked) {
        // Revert if mismatch
        setIsLiked(currentIsLiked);
        setLikesCount(post.likesCount);
      }
    } catch (e) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-lowest rounded-[24px] p-5 sm:p-6 shadow-card mb-6 overflow-hidden"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {post.authorPhoto ? (
            <img src={post.authorPhoto} alt={post.authorName} className="w-12 h-12 rounded-full object-cover bg-surface-container-high" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-secondary-container">person</span>
            </div>
          )}
          <div>
            <h3 className="font-headline text-title-md text-on-surface">
              {post.authorName}
              {!post.isAnonymous && <span className="material-symbols-outlined text-primary text-[16px] ml-1 align-middle" title="Verified Parent">verified</span>}
            </h3>
            <div className="flex items-center gap-2 font-body text-caption text-on-surface-variant">
              <span>{post.createdAt?.toDate ? timeAgo(post.createdAt.toDate()) : 'Recently'}</span>
              <span>•</span>
              <span className="bg-surface-container-high px-2 py-0.5 rounded-full text-xs">{post.category}</span>
            </div>
          </div>
        </div>
        
        <button className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>

      {/* Content */}
      <h4 className="font-headline text-title-lg text-on-surface mb-2">{post.title}</h4>
      <p className="font-body text-body-lg text-on-surface-variant whitespace-pre-wrap leading-relaxed mb-4">
        {post.description}
      </p>

      {/* Media Grid */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className={`grid gap-2 mb-4 ${post.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.mediaUrls.map((url, index) => (
            <div key={index} className="relative rounded-2xl overflow-hidden bg-surface-container-high max-h-80 w-full" onDoubleClick={handleLike}>
              {url.includes('.mp4') || url.includes('.mov') ? (
                <video src={url} controls className="w-full h-full object-cover" />
              ) : (
                <img src={url} alt="Post media" className="w-full h-full object-cover" loading="lazy" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, i) => (
            <span key={i} className="font-body text-label-sm text-primary bg-primary-container/30 px-3 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-container">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            <motion.span 
              className={`material-symbols-outlined ${isLiked ? 'fill-current' : ''}`}
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
            >
              favorite
            </motion.span>
            <span className="font-headline text-label-lg">{likesCount}</span>
          </button>
          
          <button 
            onClick={() => onOpenComments(post)}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-secondary transition-colors"
          >
            <span className="material-symbols-outlined">chat_bubble</span>
            <span className="font-headline text-label-lg">{post.commentsCount}</span>
          </button>

          <button 
            onClick={handleShare}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-tertiary transition-colors"
          >
            <span className="material-symbols-outlined">share</span>
            <span className="font-headline text-label-lg">{post.sharesCount > 0 ? post.sharesCount : 'Share'}</span>
          </button>
        </div>

        <button className="text-on-surface-variant hover:text-primary transition-colors p-2">
          <span className="material-symbols-outlined">bookmark</span>
        </button>
      </div>
    </motion.div>
  );
};
