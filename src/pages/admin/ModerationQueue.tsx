import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { EmptyState } from '../../components/ui/EmptyState';
import { staggerContainer, staggerItem } from '../../animations/variants';
import toast from 'react-hot-toast';
import type { ParentPost } from '../../types';
import { Timestamp } from 'firebase/firestore';

const ModerationQueue = () => {
  const [posts, setPosts] = useState<ParentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'flagged' | 'deleted'>('active');

  const loadPosts = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc')));
      const allPosts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ParentPost));
      setPosts(allPosts);
    } catch (e) {
      console.error('Failed to load posts:', e);
    }
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, []);

  const handleAction = async (postId: string, status: 'active' | 'deleted' | 'flagged') => {
    try {
      await updateDoc(doc(db, 'communityPosts', postId), { status });
      toast.success(`Post ${status}`);
      loadPosts();
    } catch {
      toast.error('Failed to update post');
    }
  };

  const filteredPosts = posts.filter(p => filter === 'all' || p.status === filter);

  const getTimeAgo = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const statusColors: Record<string, string> = {
    active: 'bg-secondary-container text-on-secondary-container',
    flagged: 'bg-tertiary-fixed text-on-tertiary-fixed',
    deleted: 'bg-error-container text-on-error-container',
  };

  return (
    <div>
      <h1 className="font-headline text-headline-md text-on-surface mb-2">Content Moderation</h1>
      <p className="font-body text-body-md text-on-surface-variant mb-6">Review and moderate community posts.</p>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(['active', 'flagged', 'deleted', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-body text-label-md capitalize transition-colors whitespace-nowrap ${
              filter === f ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            {f} {f !== 'all' && `(${posts.filter(p => p.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-surface-container-high rounded-[24px] animate-pulse" />)}
        </div>
      ) : filteredPosts.length === 0 ? (
        <EmptyState icon="fact_check" title="No posts to review" description="No posts match this filter." />
      ) : (
        <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
          {filteredPosts.map(post => (
            <motion.div
              key={post.id}
              variants={staggerItem}
              className="bg-surface-container-lowest rounded-[24px] shadow-card p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-secondary-container text-sm">person</span>
                    </div>
                    <span className="font-body text-label-md text-on-surface">{post.authorName}</span>
                    <span className="font-body text-caption text-on-surface-variant">{getTimeAgo(post.createdAt)}</span>
                    <span className={`px-2 py-0.5 rounded-full font-body text-caption ${statusColors[post.status] || ''}`}>{post.status}</span>
                  </div>
                  <p className="font-headline text-title-md text-on-surface mb-1">{post.title}</p>
                  <p className="font-body text-body-md text-on-surface-variant">{post.description}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {post.status !== 'active' && (
                    <button
                      onClick={() => handleAction(post.id!, 'active')}
                      className="w-10 h-10 rounded-full bg-secondary-container hover:bg-secondary/20 flex items-center justify-center transition-colors"
                      aria-label="Approve"
                    >
                      <span className="material-symbols-outlined text-secondary text-sm">check</span>
                    </button>
                  )}
                  {post.status !== 'deleted' && (
                    <button
                      onClick={() => handleAction(post.id!, 'deleted')}
                      className="w-10 h-10 rounded-full bg-error-container/30 hover:bg-error-container flex items-center justify-center transition-colors"
                      aria-label="Delete"
                    >
                      <span className="material-symbols-outlined text-error text-sm">close</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ModerationQueue;
