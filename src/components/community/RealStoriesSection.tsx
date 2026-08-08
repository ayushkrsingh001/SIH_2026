import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import type { RealStory, StoryType, PostComment } from '../../types';
import { subscribeToStories, createRealStory, toggleStoryLike, checkStoryLiked, subscribeToStoryComments, addStoryComment } from '../../firebase/communityFirestore';
import { toggleBookmark, checkBookmarked } from '../../firebase/communityFirestore';
import { groqService } from '../../services/groqService';
import { uploadMedia } from '../../firebase/storage';
import { STORY_TYPE_META, COMMUNITY_CATEGORIES, getCategoryById } from '../../constants';
import { VerifiedBadge } from './VerifiedBadge';
import { CategoryChip } from './CategoryChip';
import type { CommunityCategoryId } from '../../types';
import toast from 'react-hot-toast';

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

const STORY_TYPES: { value: StoryType; label: string; icon: string }[] = [
  { value: 'experience', label: 'Experience', icon: 'auto_stories' },
  { value: 'incident', label: 'Incident', icon: 'report' },
  { value: 'success_story', label: 'Success Story', icon: 'emoji_events' },
  { value: 'question', label: 'Question', icon: 'help' },
  { value: 'advice', label: 'Advice', icon: 'lightbulb' },
];

export const RealStoriesSection = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<RealStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<StoryType | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Create modal state
  const [newStory, setNewStory] = useState({ title: '', content: '', storyType: 'experience' as StoryType, categoryId: 'child_rights' as CommunityCategoryId, isAnonymous: false, tags: '' });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsub = subscribeToStories(
      (data) => { setStories(data); setLoading(false); },
      activeType || undefined
    );
    return () => unsub();
  }, [activeType]);

  useEffect(() => {
    if (user && stories.length > 0) {
      stories.forEach(async (s) => {
        const liked = await checkStoryLiked(s.id!, user.uid);
        if (liked) setLikedIds(prev => new Set([...prev, s.id!]));
        const saved = await checkBookmarked(user.uid, 'story', s.id!);
        if (saved) setBookmarkedIds(prev => new Set([...prev, s.id!]));
      });
    }
  }, [user, stories]);

  useEffect(() => {
    if (expandedStoryId) {
      const unsub = subscribeToStoryComments(expandedStoryId, setComments);
      return () => unsub();
    }
  }, [expandedStoryId]);

  const handleLike = async (story: RealStory) => {
    if (!user) return;
    const isLiked = await toggleStoryLike(story.id!, user.uid, story.authorId, user.displayName || 'Parent');
    if (isLiked) setLikedIds(prev => new Set([...prev, story.id!]));
    else setLikedIds(prev => { const n = new Set(prev); n.delete(story.id!); return n; });
  };

  const handleBookmark = async (storyId: string) => {
    if (!user) return;
    const isSaved = await toggleBookmark(user.uid, 'story', storyId);
    if (isSaved) { setBookmarkedIds(prev => new Set([...prev, storyId])); toast.success('Saved!'); }
    else setBookmarkedIds(prev => { const n = new Set(prev); n.delete(storyId); return n; });
  };

  const handleShare = (story: RealStory) => {
    if (navigator.share) {
      navigator.share({ title: story.title, text: story.content.substring(0, 100), url: window.location.href }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const handleComment = async (storyId: string) => {
    if (!user || !commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      await addStoryComment(storyId, {
        postId: storyId,
        authorId: user.uid,
        authorName: user.displayName || 'Parent',
        text: commentText.trim(),
      });
      setCommentText('');
    } catch { toast.error('Failed to comment'); }
    finally { setSubmittingComment(false); }
  };

  const handleCreate = async () => {
    if (!user || creating) return;
    setCreating(true);
    try {
      // 1. AI Moderation via Groq
      const mod = await groqService.moderateStory(newStory.title, newStory.content, newStory.storyType);
      if (!mod.isSafe) {
        toast.error(`Story blocked: ${mod.reason || 'Violates guidelines'}`);
        setCreating(false);
        return;
      }

      // Upload media
      const mediaUrls: string[] = [];
      for (const file of mediaFiles) {
        const url = await uploadMedia(file, `stories/${user.uid}`);
        mediaUrls.push(url);
      }

      const tags = newStory.tags.split(',').map(t => t.trim()).filter(t => t);

      await createRealStory({
        authorId: user.uid,
        authorName: newStory.isAnonymous ? 'Anonymous Parent' : user.displayName || 'Parent',
        isAnonymous: newStory.isAnonymous,
        title: newStory.title,
        content: newStory.content,
        storyType: newStory.storyType,
        categoryId: newStory.categoryId,
        mediaUrls,
        tags,
        isVerifiedAuthor: false,
      });

      toast.success('Story shared!');
      setShowCreateModal(false);
      setNewStory({ title: '', content: '', storyType: 'experience', categoryId: 'child_rights', isAnonymous: false, tags: '' });
      setMediaFiles([]);
    } catch { toast.error('Failed to create story'); }
    finally { setCreating(false); }
  };

  return (
    <>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-title-lg text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary filled">auto_stories</span>
            Real Stories
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-on-primary px-4 py-2 rounded-full font-headline text-label-md flex items-center gap-1.5 btn-tactile-primary"
          >
            <span className="material-symbols-outlined text-[18px]">edit_square</span>
            Share
          </motion.button>
        </div>

        {/* Type Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4">
          <button
            onClick={() => setActiveType('')}
            className={`px-4 py-2 rounded-full font-body text-label-md whitespace-nowrap transition-colors ${
              !activeType ? 'bg-secondary-container text-on-secondary-container font-bold' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            All
          </button>
          {STORY_TYPES.map(st => {
            const meta = STORY_TYPE_META[st.value];
            return (
              <button
                key={st.value}
                onClick={() => setActiveType(st.value)}
                className={`px-4 py-2 rounded-full font-body text-label-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeType === st.value ? 'font-bold shadow-sm' : 'hover:bg-surface-container-highest'
                }`}
                style={{
                  backgroundColor: activeType === st.value ? meta.color + '20' : undefined,
                  color: activeType === st.value ? meta.color : undefined,
                }}
              >
                <span className="material-symbols-outlined text-[16px]">{st.icon}</span>
                {st.label}
              </button>
            );
          })}
        </div>

        {/* Stories List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-48 rounded-[24px] bg-surface-container animate-pulse" />)}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-50 mb-2">auto_stories</span>
            <p className="font-body text-body-lg text-on-surface-variant">No stories yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => {
              const stMeta = STORY_TYPE_META[story.storyType];
              const isLiked = likedIds.has(story.id!);
              const isBookmarked = bookmarkedIds.has(story.id!);
              const isExpanded = expandedStoryId === story.id;

              return (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface-container-lowest rounded-[24px] shadow-card overflow-hidden"
                >
                  {/* Story Type Banner */}
                  <div className="h-1" style={{ backgroundColor: stMeta?.color || '#607D8B' }} />

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-on-secondary-container text-[18px]">person</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-headline text-label-lg text-on-surface">{story.authorName}</span>
                          {story.isVerifiedAuthor && story.verifiedType && (
                            <VerifiedBadge verifiedType={story.verifiedType} size="sm" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <span className="font-body text-caption">{story.createdAt?.toDate ? timeAgo(story.createdAt.toDate()) : 'Recently'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-xs" style={{ color: stMeta?.color }}>
                            <span className="material-symbols-outlined text-[12px]">{stMeta?.icon}</span>
                            {stMeta?.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <h4 className="font-headline text-label-lg text-on-surface mb-1">{story.title || 'Untitled'}</h4>
                    <p className={`font-body text-body-md text-on-surface-variant whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''}`}>
                      {story.content || ''}
                    </p>
                    {(story.content || '').length > 200 && (
                      <button onClick={() => setExpandedStoryId(isExpanded ? null : story.id!)} className="font-body text-label-md text-primary mt-1">
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}

                    {/* Media */}
                    {(story.mediaUrls || []).length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                        {story.mediaUrls.map((url, i) => (
                          <img key={i} src={url} alt="" className="h-32 rounded-xl object-cover shrink-0" loading="lazy" />
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    {(story.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {story.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-body">#{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-container">
                      <div className="flex items-center gap-5">
                        <button onClick={() => handleLike(story)} className={`flex items-center gap-1 ${isLiked ? 'text-primary' : 'text-on-surface-variant hover:text-primary'} transition-colors`}>
                          <motion.span className={`material-symbols-outlined ${isLiked ? 'filled' : ''}`} animate={isLiked ? { scale: [1, 1.3, 1] } : {}}>favorite</motion.span>
                          <span className="font-body text-label-md">{story.likesCount}</span>
                        </button>
                        <button onClick={() => setExpandedStoryId(isExpanded ? null : story.id!)} className="flex items-center gap-1 text-on-surface-variant hover:text-secondary transition-colors">
                          <span className="material-symbols-outlined">chat_bubble</span>
                          <span className="font-body text-label-md">{story.commentsCount}</span>
                        </button>
                        <button onClick={() => handleShare(story)} className="flex items-center gap-1 text-on-surface-variant hover:text-tertiary transition-colors">
                          <span className="material-symbols-outlined">share</span>
                          <span className="font-body text-label-md">Share</span>
                        </button>
                      </div>
                      <button onClick={() => handleBookmark(story.id!)} className="text-on-surface-variant hover:text-primary transition-colors">
                        <span className={`material-symbols-outlined ${isBookmarked ? 'filled text-primary' : ''}`}>bookmark</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-3 border-t border-surface-container space-y-3">
                            {comments.map(c => (
                              <div key={c.id} className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">person</span>
                                </div>
                                <div className="flex-1 bg-surface-container-low p-3 rounded-xl rounded-tl-none">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="font-headline text-label-md text-on-surface">{c.authorName}</span>
                                    <span className="font-body text-caption text-on-surface-variant">{c.createdAt?.toDate ? timeAgo(c.createdAt.toDate()) : ''}</span>
                                  </div>
                                  <p className="font-body text-caption text-on-surface">{c.text}</p>
                                </div>
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <input
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Add comment..."
                                className="flex-1 bg-surface-container-high rounded-full px-4 py-2 font-body text-caption text-on-surface outline-none focus:ring-1 focus:ring-primary"
                                onKeyDown={e => e.key === 'Enter' && handleComment(story.id!)}
                              />
                              <button
                                onClick={() => handleComment(story.id!)}
                                disabled={!commentText.trim() || submittingComment}
                                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined text-[16px]">send</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Story Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !creating && setShowCreateModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-surface-container-lowest w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-card-hover p-6 md:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline text-headline-md-mobile text-on-surface">Share Your Story</h2>
                <button onClick={() => setShowCreateModal(false)} disabled={creating} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-[28px]">close</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Story Type */}
                <div>
                  <label className="block font-body text-label-md text-on-surface mb-2">Story Type</label>
                  <div className="flex flex-wrap gap-2">
                    {STORY_TYPES.map(st => (
                      <button
                        key={st.value}
                        onClick={() => setNewStory(prev => ({ ...prev, storyType: st.value }))}
                        className={`px-3 py-2 rounded-xl font-body text-label-md flex items-center gap-1.5 transition-all ${
                          newStory.storyType === st.value
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{st.icon}</span>
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block font-body text-label-md text-on-surface mb-2">Category</label>
                  <select
                    value={newStory.categoryId}
                    onChange={e => setNewStory(prev => ({ ...prev, categoryId: e.target.value as CommunityCategoryId }))}
                    className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-3 font-body text-body-md text-on-surface outline-none focus:border-primary"
                  >
                    {COMMUNITY_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <input
                  value={newStory.title}
                  onChange={e => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Title..."
                  className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-3 font-body text-body-md text-on-surface outline-none focus:border-primary"
                />

                {/* Content */}
                <textarea
                  value={newStory.content}
                  onChange={e => setNewStory(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your story..."
                  rows={5}
                  className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-3 font-body text-body-md text-on-surface outline-none focus:border-primary resize-none"
                />

                {/* Media */}
                <label className="flex items-center gap-3 p-4 bg-surface-container-high border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant">add_photo_alternate</span>
                  <span className="font-body text-label-md text-on-surface-variant">Add photos/videos ({mediaFiles.length} selected)</span>
                  <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => setMediaFiles(Array.from(e.target.files || []).slice(0, 3))} />
                </label>

                {/* Anonymous + Tags */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newStory.isAnonymous}
                      onChange={e => setNewStory(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <span className="font-body text-label-md text-on-surface-variant">Post Anonymously</span>
                  </label>
                </div>
                <input
                  value={newStory.tags}
                  onChange={e => setNewStory(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Tags (comma separated)"
                  className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-3 font-body text-body-md text-on-surface outline-none focus:border-primary"
                />

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setShowCreateModal(false)} disabled={creating} className="px-6 py-3 rounded-full font-headline text-label-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">Cancel</button>
                  <button
                    onClick={handleCreate}
                    disabled={creating || !newStory.title.trim() || !newStory.content.trim()}
                    className="px-8 py-3 rounded-full font-headline text-label-lg bg-primary text-on-primary btn-tactile-primary disabled:opacity-50 flex items-center gap-2"
                  >
                    {creating && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {creating ? 'Publishing...' : 'Share Story'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
