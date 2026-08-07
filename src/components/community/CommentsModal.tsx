import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToComments, addPostComment } from '../../firebase/firestore';
import type { PostComment, ParentPost } from '../../types';

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

interface CommentsModalProps {
  post: ParentPost | null;
  onClose: () => void;
}

export const CommentsModal = ({ post, onClose }: CommentsModalProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (post?.id) {
      const unsubscribe = subscribeToComments(post.id, setComments);
      return () => unsubscribe();
    }
  }, [post]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !post?.id) return;
    
    setSubmitting(true);
    try {
      await addPostComment({
        postId: post.id,
        authorId: user.uid,
        authorName: user.displayName || 'Parent',
        text: newComment.trim()
      }, post.authorId);
      setNewComment('');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {post && (
        <div className="fixed inset-0 z-[110] flex md:items-center justify-center items-end p-0 md:p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="relative bg-surface-container-lowest w-full max-w-2xl h-[85vh] md:h-[70vh] rounded-t-[32px] md:rounded-[32px] shadow-elevation-3 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-surface-container bg-surface-container-lowest/80 backdrop-blur z-10">
              <h2 className="font-headline text-title-lg text-on-surface">Comments ({comments.length})</h2>
              <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">forum</span>
                  <p className="font-body text-body-lg">No comments yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    {comment.authorPhoto ? (
                      <img src={comment.authorPhoto} alt={comment.authorName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-on-secondary-container text-sm">person</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="bg-surface-container-low p-4 rounded-2xl rounded-tl-none">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-headline text-label-lg text-on-surface">{comment.authorName}</span>
                          <span className="font-body text-caption text-on-surface-variant">
                            {comment.createdAt?.toDate ? timeAgo(comment.createdAt.toDate()) : 'Recently'}
                          </span>
                        </div>
                        <p className="font-body text-body-md text-on-surface whitespace-pre-wrap">{comment.text}</p>
                      </div>
                      <div className="flex gap-4 mt-2 px-2">
                        <button className="font-body text-label-sm text-on-surface-variant hover:text-primary transition-colors">Like</button>
                        <button className="font-body text-label-sm text-on-surface-variant hover:text-primary transition-colors">Reply</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Comment Input */}
            <div className="p-4 bg-surface-container-lowest border-t border-surface-container">
              <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-surface-container-high rounded-full p-2 pl-4">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent border-none outline-none font-body text-body-lg text-on-surface"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary disabled:opacity-50 btn-tactile"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
