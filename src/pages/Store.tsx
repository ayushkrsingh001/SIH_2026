import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useChild } from '../contexts/ChildContext';
import { updateChild } from '../firebase/firestore';
import { AVATAR_OPTIONS } from '../constants';
import { staggerItem, bounceIn } from '../animations/variants';
import toast from 'react-hot-toast';

const TITLES = [
  { id: 't1', name: 'Rookie Explorer', cost: 50 },
  { id: 't2', name: 'Safety Scout', cost: 100 },
  { id: 't3', name: 'Rights Defender', cost: 250 },
  { id: 't4', name: 'Justice Knight', cost: 500 },
  { id: 't5', name: 'Grand Protector', cost: 1000 },
];

const PREMIUM_AVATARS = [
  { id: 'pa1', name: 'Super Hero', imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Hero&backgroundColor=FFD166', cost: 200 },
  { id: 'pa2', name: 'Ninja', imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ninja&backgroundColor=EF476F', cost: 300 },
  { id: 'pa3', name: 'Wizard', imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Wizard&backgroundColor=118AB2', cost: 500 },
];

const Store = () => {
  const { user } = useAuth();
  const { activeChild, setActiveChild } = useChild();
  const [tab, setTab] = useState<'avatars' | 'titles'>('avatars');
  const [purchasing, setPurchasing] = useState(false);

  if (!activeChild || !user) return null;

  const handlePurchaseTitle = async (titleId: string, cost: number) => {
    if (activeChild.coins < cost) {
      toast.error("Not enough coins!");
      return;
    }
    setPurchasing(true);
    try {
      const newCoins = activeChild.coins - cost;
      const newTitles = [...(activeChild.unlockedTitles || []), titleId];
      await updateChild(user.uid, activeChild.id!, { coins: newCoins, unlockedTitles: newTitles, currentTitle: titleId });
      setActiveChild({ ...activeChild, coins: newCoins, unlockedTitles: newTitles, currentTitle: titleId });
      toast.success("Title unlocked and equipped!");
    } catch {
      toast.error("Purchase failed");
    } finally {
      setPurchasing(false);
    }
  };

  const handleEquipTitle = async (titleId: string) => {
    try {
      await updateChild(user.uid, activeChild.id!, { currentTitle: titleId });
      setActiveChild({ ...activeChild, currentTitle: titleId });
      toast.success("Title equipped!");
    } catch {
      toast.error("Failed to equip");
    }
  };

  const handlePurchaseAvatar = async (avatarId: string, cost: number) => {
    if (activeChild.coins < cost) {
      toast.error("Not enough coins!");
      return;
    }
    setPurchasing(true);
    try {
      const newCoins = activeChild.coins - cost;
      const newAvatars = [...(activeChild.unlockedAvatarIds || []), avatarId];
      await updateChild(user.uid, activeChild.id!, { coins: newCoins, unlockedAvatarIds: newAvatars, avatarId });
      setActiveChild({ ...activeChild, coins: newCoins, unlockedAvatarIds: newAvatars, avatarId });
      toast.success("Avatar unlocked and equipped!");
    } catch {
      toast.error("Purchase failed");
    } finally {
      setPurchasing(false);
    }
  };

  const handleEquipAvatar = async (avatarId: string) => {
    try {
      await updateChild(user.uid, activeChild.id!, { avatarId });
      setActiveChild({ ...activeChild, avatarId });
      toast.success("Avatar equipped!");
    } catch {
      toast.error("Failed to equip");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-headline text-headline-md text-on-surface">Rewards Store</h1>
          <p className="font-body text-body-md text-on-surface-variant">Spend your hard-earned coins!</p>
        </div>
        <motion.div 
          className="bg-primary-container rounded-full px-6 py-3 flex items-center gap-3 shadow-sm"
          variants={bounceIn}
          initial="initial"
          animate="animate"
        >
          <span className="material-symbols-outlined text-primary text-2xl filled">monetization_on</span>
          <span className="font-headline text-title-lg text-on-primary-container">{activeChild.coins} Coins</span>
        </motion.div>
      </div>

      <div className="flex gap-4 mb-8 border-b-2 border-surface-dim">
        <button
          onClick={() => setTab('avatars')}
          className={`pb-4 font-headline text-title-lg px-4 transition-colors relative ${tab === 'avatars' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Avatars
          {tab === 'avatars' && <motion.div layoutId="storeTab" className="absolute bottom-[-2px] left-0 right-0 h-1 bg-primary rounded-t-full" />}
        </button>
        <button
          onClick={() => setTab('titles')}
          className={`pb-4 font-headline text-title-lg px-4 transition-colors relative ${tab === 'titles' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Titles
          {tab === 'titles' && <motion.div layoutId="storeTab" className="absolute bottom-[-2px] left-0 right-0 h-1 bg-primary rounded-t-full" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'avatars' ? (
            <div>
              <h2 className="font-headline text-title-lg text-on-surface mb-4">Premium Avatars</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {PREMIUM_AVATARS.map(avatar => {
                  const isUnlocked = activeChild.unlockedAvatarIds?.includes(avatar.id);
                  const isEquipped = activeChild.avatarId === avatar.id;
                  
                  return (
                    <motion.div key={avatar.id} variants={staggerItem} className="bg-surface-container-lowest rounded-[24px] p-6 shadow-card flex flex-col items-center text-center relative overflow-hidden group">
                      <div className={`w-24 h-24 rounded-full overflow-hidden border-4 mb-4 ${isEquipped ? 'border-secondary' : 'border-surface-dim'} bg-cream`}>
                        <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-headline text-title-md text-on-surface mb-2">{avatar.name}</h3>
                      
                      {isEquipped ? (
                        <span className="text-secondary font-bold font-body text-label-md flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Equipped</span>
                      ) : isUnlocked ? (
                        <button onClick={() => handleEquipAvatar(avatar.id)} className="bg-surface-container-high text-on-surface px-4 py-2 rounded-full font-body text-label-md hover:bg-surface-variant transition-colors w-full">Equip</button>
                      ) : (
                        <button 
                          disabled={purchasing || activeChild.coins < avatar.cost}
                          onClick={() => handlePurchaseAvatar(avatar.id, avatar.cost)}
                          className="bg-primary-container text-on-primary-container px-4 py-2 rounded-full font-body text-label-md btn-tactile-primary flex items-center justify-center gap-1 w-full disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[16px]">lock_open</span>
                          {avatar.cost} Coins
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <h2 className="font-headline text-title-lg text-on-surface mt-10 mb-4">Basic Avatars (Free)</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {AVATAR_OPTIONS.map(avatar => {
                  const isEquipped = activeChild.avatarId === avatar.id;
                  return (
                    <button key={avatar.id} onClick={() => handleEquipAvatar(avatar.id)} className={`flex flex-col items-center gap-2 p-3 rounded-[24px] transition-all ${isEquipped ? 'bg-secondary-container/20 border-2 border-secondary scale-105' : 'bg-surface-container-lowest border-2 border-transparent hover:border-outline-variant shadow-sm'}`}>
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-surface-dim">
                        <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-body text-caption text-on-surface">{avatar.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {TITLES.map(t => {
                const isUnlocked = activeChild.unlockedTitles?.includes(t.id);
                const isEquipped = activeChild.currentTitle === t.id;
                
                return (
                  <div key={t.id} className="bg-surface-container-lowest rounded-[24px] p-4 sm:p-6 shadow-card flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-tertiary-fixed/30 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-tertiary-fixed-dim">workspace_premium</span>
                      </div>
                      <div>
                        <h3 className="font-headline text-title-lg text-on-surface">{t.name}</h3>
                        <p className="font-body text-caption text-on-surface-variant">Display this title under your name</p>
                      </div>
                    </div>
                    
                    <div className="shrink-0">
                      {isEquipped ? (
                        <span className="text-secondary font-bold font-body text-label-md px-4 py-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Equipped</span>
                      ) : isUnlocked ? (
                        <button onClick={() => handleEquipTitle(t.id)} className="bg-surface-container-high text-on-surface px-6 py-2 rounded-full font-body text-label-md hover:bg-surface-variant transition-colors">Equip</button>
                      ) : (
                        <button 
                          disabled={purchasing || activeChild.coins < t.cost}
                          onClick={() => handlePurchaseTitle(t.id, t.cost)}
                          className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-body text-label-md btn-tactile-primary flex items-center gap-2 disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[16px]">lock_open</span>
                          {t.cost} Coins
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Store;
