import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToPosts } from '../firebase/firestore';
import type { ParentPost } from '../types';
import { EmptyState } from '../components/ui/EmptyState';
import { CreatePostModal } from '../components/community/CreatePostModal';
import { PostCard } from '../components/community/PostCard';
import { CommentsModal } from '../components/community/CommentsModal';
import { staggerContainer, staggerItem } from '../animations/variants';

const CATEGORIES = ['All', 'Trending', 'Cyber Safety', 'Child Rights', 'Mental Health', 'Bullying', 'Legal Awareness'];

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ParentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOption, setSortOption] = useState<'latest' | 'trending' | 'most_liked'>('latest');
  const [selectedPostForComments, setSelectedPostForComments] = useState<ParentPost | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const filterCat = activeCategory === 'All' || activeCategory === 'Trending' ? undefined : activeCategory;
    const sort = activeCategory === 'Trending' ? 'trending' : sortOption;
    
    const unsubscribe = subscribeToPosts(
      (data) => {
        setPosts(data);
        setLoading(false);
      },
      filterCat,
      sort
    );
    return () => unsubscribe();
  }, [user, activeCategory, sortOption]);

  if (user?.role === 'child') {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <span className="material-symbols-outlined text-[64px] text-primary mb-4">gpp_good</span>
        <h1 className="font-headline text-headline-md text-on-surface mb-2">Parents Only Area</h1>
        <p className="font-body text-body-lg text-on-surface-variant">
          The community wall is a safe space for parents to discuss child safety and share experiences. Ask your parent to login!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-headline text-headline-lg text-on-surface">Parents Community</h1>
          <p className="font-body text-body-lg text-on-surface-variant mt-1">Share stories, ask for advice, and stay aware.</p>
        </div>
        <motion.button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary text-on-primary px-6 py-3 rounded-full font-headline text-label-lg btn-tactile-primary flex items-center gap-2 shrink-0 shadow-elevation-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="material-symbols-outlined text-[20px]">edit_square</span>
          Share Story
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-5 py-2 rounded-full font-body text-label-md transition-colors ${
              activeCategory === cat 
                ? 'bg-secondary-container text-on-secondary-container font-bold' 
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface-container-lowest rounded-[24px] p-6 shadow-card animate-pulse h-64" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon="forum"
          title="No stories yet"
          description={`Be the first to share in ${activeCategory}!`}
        />
      ) : (
        <motion.div
          className="space-y-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onOpenComments={setSelectedPostForComments} 
            />
          ))}
        </motion.div>
      )}

      {/* Modals */}
      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
      
      <CommentsModal 
        post={selectedPostForComments}
        onClose={() => setSelectedPostForComments(null)}
      />
    </div>
  );
};

export default Community;
