import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToPosts } from '../firebase/firestore';
import { searchPosts } from '../firebase/communityFirestore';
import type { ParentPost, CommunityCategoryId } from '../types';
import { COMMUNITY_CATEGORIES } from '../constants';

// Community Components
import { EmptyState } from '../components/ui/EmptyState';
import { CreatePostModal } from '../components/community/CreatePostModal';
import { PostCard } from '../components/community/PostCard';
import { CommentsModal } from '../components/community/CommentsModal';
import { CampaignCarousel } from '../components/community/CampaignCarousel';
import { WeeklyChallengeCard } from '../components/community/WeeklyChallengeCard';
import { NearbyEventsSection } from '../components/community/NearbyEventsSection';
import { LegalAIChat } from '../components/community/LegalAIChat';
import { DailyNewsSection } from '../components/community/DailyNewsSection';
import { MythFactCards } from '../components/community/MythFactCards';
import { AwarenessShortsSection } from '../components/community/AwarenessShortsSection';
import { RealStoriesSection } from '../components/community/RealStoriesSection';
import { ScamAlertSection } from '../components/community/ScamAlertSection';
import { SkeletonFeed } from '../components/community/SkeletonFeed';

import { staggerContainer } from '../animations/variants';
import { useTranslation } from 'react-i18next';

type TabType = 'feed' | 'stories' | 'shorts' | 'news' | 'alerts';

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'feed', label: 'Feed', icon: 'dynamic_feed' },
  { id: 'stories', label: 'Stories', icon: 'auto_stories' },
  { id: 'shorts', label: 'Shorts', icon: 'play_circle' },
  { id: 'news', label: 'News', icon: 'newspaper' },
  { id: 'alerts', label: 'Alerts', icon: 'warning' },
];

const Community = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [posts, setPosts] = useState<ParentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CommunityCategoryId | 'all'>('all');
  const [sortOption, setSortOption] = useState<'latest' | 'trending' | 'most_liked'>('latest');
  const [selectedPostForComments, setSelectedPostForComments] = useState<ParentPost | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ParentPost[] | null>(null);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const filterCat = activeCategory === 'all' ? undefined : activeCategory;
    
    const unsubscribe = subscribeToPosts(
      (data) => {
        let filtered = data;
        if (filterCat) {
          filtered = data.filter(p => {
            const catMatch = COMMUNITY_CATEGORIES.find(c => c.id === filterCat);
            return catMatch && (p.category === catMatch.label || p.category === catMatch.id);
          });
        }
        if (sortOption === 'most_liked') {
          filtered.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
        } else if (sortOption === 'trending') {
          filtered.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
        }
        setPosts(filtered);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user, activeCategory, sortOption]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    searchTimeout.current = window.setTimeout(async () => {
      const results = await searchPosts(query);
      setSearchResults(results);
      setSearching(false);
    }, 500);
  }, []);

  if (user?.role === 'parent') {
    // Note: Assuming 'parent' and 'admin' are the only roles allowed here based on earlier context. If 'child' exists, it's blocked.
    // Since UserRole might only be 'parent' | 'admin', we just check for anything that isn't 'parent' or 'admin' or if 'child' is specifically added to types later.
  }
  // To avoid TS overlap error for user?.role === 'child', since UserRole currently is 'parent' | 'admin', we'll check by string casting if needed, or just remove the check.
  if ((user?.role as string) === 'child') {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <span className="material-symbols-outlined text-[64px] text-primary mb-4">gpp_good</span>
        <h1 className="font-headline text-headline-md text-on-surface mb-2">{t('community.parentsOnlyArea')}</h1>
        <p className="font-body text-body-lg text-on-surface-variant">
          {t('community.parentsOnlyDesc')}
        </p>
      </div>
    );
  }

  const displayPosts = searchResults !== null ? searchResults : posts;

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="font-headline text-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary filled text-[32px]">forum</span>
              {t('community.title')}
            </h1>
            <p className="font-body text-body-lg text-on-surface-variant mt-1">{t('community.subtitle')}</p>
          </div>
          <motion.button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary text-on-primary px-6 py-3 rounded-full font-headline text-label-lg btn-tactile-primary flex items-center gap-2 shrink-0 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="material-symbols-outlined text-[20px]">edit_square</span>
            {t('community.shareStory')}
          </motion.button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="flex items-center gap-3 bg-surface-container-lowest rounded-full px-4 py-3 shadow-card border border-surface-container focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t('community.searchPlaceholder')}
              className="flex-1 bg-transparent border-none outline-none font-body text-body-md text-on-surface"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults(null); }} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
            {searching && <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-surface-container rounded-2xl p-1 mb-4 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-body text-label-md whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-surface-container-lowest shadow-sm text-on-surface font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${activeTab === tab.id ? 'filled text-primary' : ''}`}>{tab.icon}</span>
              {t(`community.${tab.id}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'feed' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Featured Campaigns Carousel */}
            <CampaignCarousel />

            {/* Two-column layout on desktop */}
            <div className="flex flex-col xl:flex-row gap-6">
              {/* Main Feed */}
              <div className="flex-1 min-w-0">
                {/* Category Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full font-body text-label-md transition-colors ${
                      activeCategory === 'all'
                        ? 'bg-secondary-container text-on-secondary-container font-bold'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    🌐 {t('community.all')}
                  </button>
                  {COMMUNITY_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full font-body text-label-md transition-all flex items-center gap-1 ${
                        activeCategory === cat.id ? 'font-bold shadow-sm ring-1' : 'hover:scale-[1.02]'
                      }`}
                      style={{
                        backgroundColor: activeCategory === cat.id ? cat.color + '20' : cat.bgAccent,
                        color: cat.color,
                        boxShadow: activeCategory === cat.id ? `0 0 0 1px ${cat.color}` : undefined,
                      }}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-body text-caption text-on-surface-variant">{t('community.sortBy')}</span>
                  {(['latest', 'trending', 'most_liked'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setSortOption(opt)}
                      className={`px-3 py-1 rounded-full font-body text-caption transition-colors ${
                        sortOption === opt
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                      }`}
                    >
                      {opt === 'latest' ? `🕐 ${t('community.latest')}` : opt === 'trending' ? `🔥 ${t('community.trending')}` : `❤️ ${t('community.mostLiked')}`}
                    </button>
                  ))}
                </div>

                {/* Feed */}
                {loading ? (
                  <SkeletonFeed count={3} />
                ) : displayPosts.length === 0 ? (
                  <EmptyState
                    icon="forum"
                    title={searchResults !== null ? t('community.noResultsFound') : t('community.noPostsYet')}
                    description={searchResults !== null ? t('community.tryDifferentSearch') : t('community.beTheFirstToShare', { category: activeCategory === 'all' ? t('community.all').toLowerCase() : COMMUNITY_CATEGORIES.find(c => c.id === activeCategory)?.label })}
                  />
                ) : (
                  <motion.div
                    className="space-y-0"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {displayPosts.map(post => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onOpenComments={setSelectedPostForComments}
                      />
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Sidebar (Desktop) */}
              <div className="hidden xl:block w-[380px] shrink-0 space-y-6">
                {/* Weekly Challenge */}
                <WeeklyChallengeCard />

                {/* Myth vs Fact */}
                <MythFactCards />

                {/* Nearby Events */}
                <NearbyEventsSection />
              </div>
            </div>

            {/* Mobile: Show sidebar content below feed */}
            <div className="xl:hidden mt-8 space-y-8">
              <WeeklyChallengeCard />
              <MythFactCards />
              <NearbyEventsSection />
            </div>
          </motion.div>
        )}

        {activeTab === 'stories' && (
          <motion.div
            key="stories"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <RealStoriesSection />
          </motion.div>
        )}

        {activeTab === 'shorts' && (
          <motion.div
            key="shorts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <AwarenessShortsSection />
          </motion.div>
        )}

        {activeTab === 'news' && (
          <motion.div
            key="news"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <DailyNewsSection />
          </motion.div>
        )}

        {activeTab === 'alerts' && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ScamAlertSection />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Legal AI Chat */}
      <LegalAIChat />

      {/* Mobile FAB for Create Post */}
      <motion.button
        onClick={() => setIsCreateModalOpen(true)}
        className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-primary text-on-primary rounded-full shadow-card flex items-center justify-center z-[45]"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="material-symbols-outlined text-[24px]">edit_square</span>
      </motion.button>

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
