import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import type { LegalNewsItem } from '../../types';
import { subscribeToLegalNews } from '../../firebase/communityFirestore';
import { SkeletonNewsCard } from './SkeletonFeed';
import { RichNewsCard } from './news/RichNewsCard';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

type NewsTab = 'latest' | 'trending' | 'cyber' | 'girls_safety' | 'child_rights' | 'legal' | 'daily_learning' | 'bookmarks';

export const DailyNewsSection = () => {
  const { user } = useAuth();
  const [news, setNews] = useState<LegalNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NewsTab>('latest');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    // Fetch user bookmarks
    const fetchBookmarks = async () => {
      if (!user) return;
      const q = query(collection(db, 'newsBookmarks'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      setBookmarkedIds(new Set(snap.docs.map(d => d.data().newsId)));
    };
    fetchBookmarks();
  }, [user]);

  useEffect(() => {
    const unsub = subscribeToLegalNews((data) => {
      setNews(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleBookmarkToggle = (newsId: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(newsId)) next.delete(newsId);
      else next.add(newsId);
      return next;
    });
  };

  const filteredNews = () => {
    let sorted = [...news];
    if (activeTab === 'trending') {
      sorted.sort((a, b) => (b.viewsCount + b.likesCount) - (a.viewsCount + a.likesCount));
    } else if (activeTab === 'bookmarks') {
      sorted = sorted.filter(n => bookmarkedIds.has(n.id!));
    } else if (activeTab === 'cyber') {
      sorted = sorted.filter(n => n.category?.toLowerCase().includes('cyber'));
    } else if (activeTab === 'girls_safety' || activeTab === 'women_safety') {
      sorted = sorted.filter(n => n.category?.toLowerCase().includes('women') || n.category?.toLowerCase().includes('girls'));
    } else if (activeTab === 'child_rights') {
      sorted = sorted.filter(n => n.category?.toLowerCase().includes('child'));
    } else if (activeTab === 'legal') {
      sorted = sorted.filter(n => n.category?.toLowerCase().includes('law') || n.category?.toLowerCase().includes('legal'));
    } else if (activeTab === 'daily_learning') {
      sorted = sorted.filter(n => n.difficulty === 'easy');
    }
    return sorted;
  };

  if (loading) {
    return (
      <div className="mb-8 w-full max-w-4xl mx-auto">
        <h2 className="font-headline text-title-lg text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary animate-pulse">newspaper</span>
          Loading Awareness Feed...
        </h2>
        <div className="flex flex-col gap-4">
          {[1, 2].map(i => <div key={i} className="w-full h-64 bg-surface-container-high animate-pulse rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const displayNews = filteredNews();

  return (
    <div className="mb-12 w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="font-headline text-headline-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary filled text-[32px]">campaign</span>
          Legal Awareness Feed
        </h2>

        {/* Tabs */}
        <div className="flex bg-surface-container-high rounded-full p-1 overflow-x-auto scrollbar-hide">
          {(['latest', 'trending', 'cyber', 'girls_safety', 'child_rights', 'legal', 'daily_learning', 'bookmarks'] as NewsTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2 rounded-full font-headline text-label-md capitalize whitespace-nowrap transition-colors ${
                activeTab === tab ? 'text-on-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="newsTabIndicator"
                  className="absolute inset-0 bg-primary rounded-full z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab === 'latest' && <><span className="material-symbols-outlined text-[16px]">today</span> Latest Awareness</>}
                {tab === 'trending' && <><span className="material-symbols-outlined text-[16px]">trending_up</span> Trending Safety News</>}
                {tab === 'cyber' && <><span className="material-symbols-outlined text-[16px]">security</span> Cyber Alerts</>}
                {tab === 'girls_safety' && <><span className="material-symbols-outlined text-[16px]">female</span> Girls Safety</>}
                {tab === 'child_rights' && <><span className="material-symbols-outlined text-[16px]">child_care</span> Child Rights</>}
                {tab === 'legal' && <><span className="material-symbols-outlined text-[16px]">gavel</span> Legal Updates</>}
                {tab === 'daily_learning' && <><span className="material-symbols-outlined text-[16px]">school</span> Daily Learning</>}
                {tab === 'bookmarks' && <><span className="material-symbols-outlined text-[16px]">bookmark</span> Bookmarks</>}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {displayNews.length > 0 ? (
            displayNews.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.1 }}
              >
                <RichNewsCard 
                  news={item} 
                  isBookmarked={bookmarkedIds.has(item.id!)} 
                  onBookmarkToggle={() => handleBookmarkToggle(item.id!)}
                />
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-surface-container-low rounded-2xl border border-dashed border-outline"
            >
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-2">article</span>
              <p className="font-headline text-title-md text-on-surface mb-1">No news found</p>
              <p className="font-body text-body-sm text-on-surface-variant">
                {activeTab === 'bookmarks' ? 'You haven\'t bookmarked any articles yet.' : 'Check back later for fresh updates.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
