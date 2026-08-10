import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllChildren } from '../firebase/firestore';
import { calculateLevel } from '../services/xpSystem';
import { resolveAvatarUrl } from '../utils/avatar';
import { staggerContainer, staggerItem } from '../animations/variants';
import type { Child } from '../types';

const Leaderboard = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const sorted = await getAllChildren();
        setChildren(sorted);
      } catch (e) {
        console.error('Failed to load leaderboard', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="text-center mb-8">
        <h1 className="font-headline text-headline-md text-on-surface flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-4xl text-tertiary">social_leaderboard</span>
          Global Ranks
        </h1>
        <p className="font-body text-body-lg text-on-surface-variant mt-2">See who is mastering their rights!</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-surface-container-high rounded-[24px] animate-pulse" />)}
        </div>
      ) : (
        <motion.div className="space-y-3" variants={staggerContainer} initial="initial" animate="animate">
          {children.map((child, index) => {
            const levelInfo = calculateLevel(child.xp || 0);
            const avatarUrl = resolveAvatarUrl(child.avatarId);
            
            // Top 3 distinct styles
            let rankStyle = "bg-surface-container-lowest border-surface-dim";
            let rankIcon = <span className="font-headline text-title-lg text-on-surface-variant w-8 text-center">{index + 1}</span>;
            
            if (index === 0) {
              rankStyle = "bg-[#FFF8E1] border-[#FFC107]";
              rankIcon = <span className="material-symbols-outlined text-3xl text-[#FFC107] w-8 text-center filled">workspace_premium</span>;
            } else if (index === 1) {
              rankStyle = "bg-[#F5F5F5] border-[#9E9E9E]";
              rankIcon = <span className="material-symbols-outlined text-3xl text-[#9E9E9E] w-8 text-center filled">workspace_premium</span>;
            } else if (index === 2) {
              rankStyle = "bg-[#FFF3E0] border-[#FF9800]";
              rankIcon = <span className="material-symbols-outlined text-3xl text-[#FF9800] w-8 text-center filled">workspace_premium</span>;
            }

            return (
              <motion.div 
                key={child.id} 
                variants={staggerItem}
                className={`flex items-center gap-4 p-4 rounded-[24px] border-2 shadow-sm ${rankStyle}`}
              >
                {rankIcon}
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-surface-dim bg-cream shrink-0">
                  <img src={avatarUrl} alt={child.displayName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline text-title-md text-on-surface truncate">{child.displayName}</h3>
                    {child.currentTitle && (
                      <span className="bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded-full font-body text-[10px] uppercase font-bold shrink-0">{child.currentTitle}</span>
                    )}
                  </div>
                  <p className="font-body text-caption text-primary">Lvl {levelInfo.level} {levelInfo.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-headline text-title-lg text-on-surface">{child.xp}</div>
                  <div className="font-body text-caption text-on-surface-variant uppercase">XP</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default Leaderboard;
