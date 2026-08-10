import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSafetyTwinProfile } from '../../firebase/firestore';
import type { SafetyTwinProfile } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  childId: string;
}

const AIMentorWidget = ({ childId }: Props) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<SafetyTwinProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const fetchTwin = async () => {
      if (!user?.uid) return;
      try {
        const p = await getSafetyTwinProfile(user.uid, childId);
        setProfile(p);
      } catch(e) {
        console.error(e);
      }
    };
    fetchTwin();
  }, [childId, user?.uid]);

  if (!profile) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.button 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 md:bottom-6 right-4 md:right-6 z-50 bg-secondary text-on-secondary w-16 h-16 rounded-full shadow-elevation-3 flex items-center justify-center btn-tactile border-4 border-white"
      >
        <span className="material-symbols-outlined text-3xl">psychology</span>
        
        {/* Pulse effect if they have a low score area */}
        {profile.weakAreas?.length > 0 && (
           <span className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-24 right-6 z-50 w-80 bg-surface-container-lowest rounded-3xl shadow-elevation-4 border border-outline-variant overflow-hidden"
            >
              <div className="bg-secondary p-4 text-on-secondary flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl">psychology</span>
                    <h3 className="font-headline font-bold text-title-md">AI Mentor</h3>
                 </div>
                 <button onClick={() => setIsOpen(false)}>
                   <span className="material-symbols-outlined hover:text-white/80 transition-colors">close</span>
                 </button>
              </div>
              
              <div className="p-5 font-body">
                 <p className="text-body-md text-on-surface mb-4">
                   Hi there! I'm your AI twin, tracking how safe you are online and offline. 
                 </p>
                 
                 <div className="bg-primary/10 rounded-2xl p-4 mb-4 text-center">
                    <p className="text-sm text-primary font-bold uppercase tracking-wider mb-1">Safety Power</p>
                    <p className="text-3xl font-headline font-bold text-primary">{profile.overallScore}%</p>
                 </div>
                 
                 {profile.weakAreas?.length > 0 && (
                   <div className="bg-error/10 rounded-2xl p-4 border border-error/20">
                      <p className="text-sm font-bold text-error flex items-center gap-1 mb-2">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        Needs a little practice:
                      </p>
                      <ul className="text-sm text-on-surface-variant list-disc pl-4 space-y-1">
                        {profile.weakAreas.slice(0,2).map(w => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                   </div>
                 )}
                 
                 <button 
                   onClick={() => setIsOpen(false)} 
                   className="w-full mt-4 bg-primary text-on-primary py-2 rounded-full font-bold btn-tactile"
                 >
                   Got it! Let's play!
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIMentorWidget;
