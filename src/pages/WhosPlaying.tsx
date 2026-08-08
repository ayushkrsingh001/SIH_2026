import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useChild } from '../contexts/ChildContext';
import { getChildren, updateChild } from '../firebase/firestore';
import { verifyPin } from '../utils';
import { calculateStreak } from '../services/streakSystem';
import { AVATAR_OPTIONS, MASCOT_URL } from '../constants';
import { calculateLevel } from '../services/xpSystem';
import { PinInput } from '../components/ui/PinInput';
import { CardSkeleton } from '../components/ui/SkeletonLoader';
import type { Child } from '../types';

const WhosPlaying = () => {
  const { user } = useAuth();
  const { setActiveChild } = useChild();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [pinError, setPinError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (user) {
      getChildren(user.uid).then(data => {
        setChildren(data);
        setLoading(false);
      });
    }
  }, [user]);

  const handleChildSelect = (child: Child) => {
    setSelectedChild(child);
    setPinError('');
  };

  const handlePinComplete = async (pin: string) => {
    if (!selectedChild) return;
    setVerifying(true);
    setPinError('');

    const isValid = await verifyPin(pin, selectedChild.pinHash);
    if (isValid && user) {
      const { streak, highestStreak, lastLoginDate } = calculateStreak(selectedChild);
      
      const updatedChild = {
        ...selectedChild,
        streak,
        highestStreak,
        lastLoginDate
      };
      
      updateChild(user.uid, selectedChild.id!, { streak, highestStreak, lastLoginDate });
      setActiveChild(updatedChild);
      navigate(`/play/${selectedChild.id}/map`);
    } else {
      setPinError('Wrong PIN! Try again.');
    }
    setVerifying(false);
  };

  const getAvatar = (avatarId: string) => AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl w-full">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 font-body bg-[#FDFBF7]">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-tertiary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">
        
        {/* Header Section */}
        <motion.div
          className="text-center mb-12 flex flex-col items-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="relative mb-6">
            <motion.div 
              className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.img
              src={MASCOT_URL}
              alt="RightsQuest Mascot"
              className="relative w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl z-10"
              animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          <h1 className="font-headline text-display-md md:text-display-lg text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary mb-3 drop-shadow-sm font-black tracking-tight">
            Who are you?
          </h1>
          <p className="font-body text-title-lg text-on-surface-variant max-w-md mx-auto">
            {selectedChild ? `Unlock ${selectedChild.displayName}'s world` : 'Select your profile to continue.'}
          </p>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {!selectedChild ? (
            <motion.div
              key="grid"
              className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-3xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ duration: 0.3 }}
            >
              {/* Parent Card */}
              <motion.button
                key="parent"
                onClick={() => navigate('/dashboard')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0, type: 'spring', stiffness: 300, damping: 24 }}
                className="group relative bg-white rounded-[32px] p-6 shadow-elevation-2 hover:shadow-elevation-4 transition-all duration-300 flex flex-col items-center text-center overflow-hidden border-2 border-transparent hover:border-primary/20"
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white shadow-md group-hover:border-primary-container transition-colors duration-300 bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-[48px] md:text-[56px] text-primary">admin_panel_settings</span>
                  </div>
                </div>

                <h3 className="relative z-10 font-headline text-headline-sm text-on-surface mt-2 truncate w-full group-hover:text-primary transition-colors">
                  Parent Dashboard
                </h3>
              </motion.button>

              {children.map((child, index) => {
                const avatar = getAvatar(child.avatarId);
                const levelInfo = calculateLevel(child.xp);
                return (
                  <motion.button
                    key={child.id}
                    onClick={() => handleChildSelect(child)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index + 1) * 0.1, type: 'spring', stiffness: 300, damping: 24 }}
                    className="group relative bg-white rounded-[32px] p-6 shadow-elevation-2 hover:shadow-elevation-4 transition-all duration-300 flex flex-col items-center text-center overflow-hidden border-2 border-transparent hover:border-primary/20"
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {/* Decorative Card Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10 mb-4">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-md scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white shadow-md group-hover:border-primary-container transition-colors duration-300 bg-surface-container-high">
                        <img src={avatar.imageUrl} alt={child.displayName} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      
                      {/* Level Badge */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-3 py-1 rounded-full border-2 border-white shadow-sm flex items-center justify-center min-w-[80px]">
                        <span className="font-headline text-label-md font-bold whitespace-nowrap">Lv {levelInfo.level}</span>
                      </div>
                    </div>

                    <h3 className="relative z-10 font-headline text-headline-sm text-on-surface mt-2 truncate w-full group-hover:text-primary transition-colors">
                      {child.displayName}
                    </h3>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="pin"
              className="bg-white/80 backdrop-blur-xl rounded-[40px] p-8 md:p-10 shadow-elevation-3 border border-white max-w-md w-full text-center relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Glassmorphism shine */}
              <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite]" />

              <div className="relative w-28 h-28 mx-auto mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg bg-surface-container-high">
                  <img src={getAvatar(selectedChild.avatarId).imageUrl} alt={selectedChild.displayName} className="w-full h-full object-cover" />
                </div>
              </div>
              
              <h2 className="font-headline text-headline-md text-on-surface mb-2">
                Welcome back, {selectedChild.displayName}!
              </h2>
              <p className="font-body text-body-md text-on-surface-variant mb-8">
                Enter your secret PIN to play
              </p>

              <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-inner border border-outline-variant/30">
                <PinInput
                  onComplete={handlePinComplete}
                  error={pinError}
                  disabled={verifying}
                />
              </div>

              <button
                onClick={() => { setSelectedChild(null); setPinError(''); }}
                className="mt-8 font-headline text-label-lg text-on-surface-variant hover:text-primary transition-colors px-6 py-2 rounded-full hover:bg-primary/5"
              >
                Choose another player
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WhosPlaying;
