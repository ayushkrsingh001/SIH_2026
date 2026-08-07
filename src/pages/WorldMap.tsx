import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useChild } from '../contexts/ChildContext';
import { getAllChildProgress, getChild } from '../firebase/firestore';
import { calculateLevel, getXpForNextLevel } from '../services/xpSystem';
import { AVATAR_OPTIONS } from '../constants';
import { PageSkeleton } from '../components/ui/SkeletonLoader';
import { generateMapNodes, generateSvgPath } from '../utils/mapGenerator';
import type { MapNode } from '../utils/mapGenerator';
import type { Module, Progress } from '../types';
import { allLocalModules } from '../data';

const WorldMap = () => {
  const { user } = useAuth();
  const { activeChild, setActiveChild } = useChild();
  const navigate = useNavigate();
  const location = useLocation();
  const { childId } = useParams();
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !childId) return;
      if (!activeChild) {
        const child = await getChild(user.uid, childId);
        if (child) setActiveChild(child);
        else { navigate('/play'); return; }
      }
      
      const prog = await getAllChildProgress(user.uid, childId);
      
      // Sort modules by order so they form a linear progression
      const sortedMods = [...allLocalModules].sort((a, b) => a.order - b.order);
      setModules(sortedMods);
      setProgress(prog);
      setLoading(false);
    };
    loadData();
  }, [user, childId, activeChild, setActiveChild, navigate]);

  const getModuleStatus = (moduleId: string, prerequisiteModuleId: string | null) => {
    const moduleProgress = progress.find(p => p.moduleId === moduleId);
    if (moduleProgress?.status === 'completed') return 'completed';
    if (moduleProgress?.status === 'in_progress') return 'in_progress';
    if (prerequisiteModuleId) {
      // In the local static version, prerequisiteModuleId might be 'W1_L1' or 'level_1'.
      // Let's normalize it just in case, but realistically the logic is: if previous level is done, this is unlocked.
      // Since they are ordered, we can just check if the level before it (by order) is completed.
      const currentMod = modules.find(m => m.id === moduleId);
      if (currentMod && currentMod.order > 1) {
        const prevMod = modules.find(m => m.order === currentMod.order - 1);
        if (prevMod) {
          const prevProgress = progress.find(p => p.moduleId === prevMod.id);
          if (!prevProgress || prevProgress.status !== 'completed') return 'locked';
        }
      }
    }
    return 'available';
  };

  const avatar = AVATAR_OPTIONS.find(a => a.id === activeChild?.avatarId) || AVATAR_OPTIONS[0];
  const levelInfo = activeChild ? calculateLevel(activeChild.xp) : { level: 1, title: 'Beginner' };
  const xpProgress = activeChild ? getXpForNextLevel(activeChild.xp) : { progress: 0 };

  const completedCount = progress.filter(p => p.status === 'completed').length;
  
  const { nodes, containerHeight } = generateMapNodes(modules.length);
  const pathData = generateSvgPath(nodes);

  // Find the highest unlocked node to scroll to
  let highestUnlockedIndex = 0;
  let previousIndex = -1;
  const fromCompletedModuleId = location.state?.fromCompletedModuleId;

  modules.forEach((mod, idx) => {
    const status = getModuleStatus(mod.id!, mod.prerequisiteModuleId);
    if (status !== 'locked') {
      highestUnlockedIndex = idx;
    }
    if (mod.id === fromCompletedModuleId) {
      previousIndex = idx;
    }
  });

  const activeNode = nodes[highestUnlockedIndex];
  const previousNode = previousIndex >= 0 ? nodes[previousIndex] : null;

  const hasScrolledRef = useRef(false);

  // Auto-scroll logic
  useEffect(() => {
    if (hasScrolledRef.current || !scrollContainerRef.current || nodes.length === 0 || loading) return;

    const container = scrollContainerRef.current;
    
    // Helper to scroll to a specific node
    const scrollToNode = (node: MapNode, behavior: ScrollBehavior = 'smooth') => {
      const scrollY = node.yPx - (container.clientHeight / 2);
      container.scrollTo({ top: scrollY, behavior });
    };

    if (previousNode && previousIndex !== highestUnlockedIndex) {
      hasScrolledRef.current = true;
      // Tiny delay to ensure DOM is ready
      setTimeout(() => {
        scrollToNode(previousNode, 'instant');
        
        // Wait for a moment, then animate scrolling to the newly unlocked node
        setTimeout(() => {
          if (activeNode) scrollToNode(activeNode, 'smooth');
        }, 1000); // 1 second delay
      }, 100);
    } else if (activeNode) {
      hasScrolledRef.current = true;
      // Just normal loading, scroll to active node smoothly after brief render delay
      setTimeout(() => {
        scrollToNode(activeNode, 'smooth');
      }, 300);
    }
  }, [activeNode, previousNode, nodes.length, loading, highestUnlockedIndex, previousIndex]);

  if (loading) return <PageSkeleton />;

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Status Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border-4 border-primary-container shadow-md">
            <img src={avatar.imageUrl} alt={activeChild?.displayName} className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-headline text-title-lg text-on-surface">{activeChild?.displayName}'s Quest Map</h2>
            <p className="font-body text-caption text-primary">Level {levelInfo.level} {levelInfo.title} · {activeChild?.xp?.toLocaleString()} XP</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface-container-lowest rounded-full px-4 py-2 shadow-card flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-sm filled">emoji_events</span>
            <span className="font-body text-label-md text-on-surface">{completedCount}/{modules.length} Complete</span>
          </div>
          <div className="w-32">
            <div className="font-body text-caption text-on-surface-variant mb-1">Next Level</div>
            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress.progress}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Quest Map */}
      <div 
        ref={scrollContainerRef}
        className="relative bg-gradient-to-b from-secondary-container/30 via-primary-fixed/20 to-tertiary-fixed/30 rounded-[32px] shadow-inner overflow-y-auto overflow-x-hidden flex-grow"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // hide scrollbar for clean look
      >
        <div className="relative w-full" style={{ height: `${containerHeight}px` }}>
          
          {/* Decorative Clouds & Islands (Randomized based on nodes) */}
          {nodes.map((node, i) => (
            i % 2 === 0 ? (
              <div key={`deco-${i}`} className="absolute opacity-40 animate-float" style={{ top: node.yPx, left: node.isLeft ? '80%' : '10%' }}>
                <span className="material-symbols-outlined text-6xl text-white filled">cloud</span>
              </div>
            ) : null
          ))}

          {/* Connection Path */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 100 ${containerHeight}`}
            preserveAspectRatio="none"
          >
            <path
              d={pathData}
              fill="none"
              stroke="#dec0b6" // Path color
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={pathData}
              fill="none"
              stroke="#ffffff" // Inner highlight for path
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="16 16"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* World Labels */}
          {modules.map((mod, idx) => {
            if (idx % 5 === 0) {
              const node = nodes[idx];
              if (!node) return null;
              const worldNames = [
                "Child Rights Island",
                "Cyber Safety Island",
                "Girls Safety Island",
                "Self Defence Island",
                "Emergency Response Island",
                "Environmental Awareness Island",
                "Legal Hero Island"
              ];
              const worldIndex = Math.floor(idx / 5);
              const worldName = worldNames[worldIndex] || `World ${worldIndex + 1}`;
              
              return (
                <div 
                  key={`world-${worldIndex}`} 
                  className="absolute w-full flex flex-col items-center justify-center pointer-events-none"
                  style={{ top: node.yPx + 100 }}
                >
                  <div className="bg-surface/80 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-surface-dim shadow-sm">
                    <span className="font-headline text-title-lg font-bold text-on-surface text-center">
                      World {worldIndex + 1}: {worldName}
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          })}

          {/* Module Nodes */}
          {modules.map((mod, idx) => {
            const status = getModuleStatus(mod.id!, mod.prerequisiteModuleId);
            const node = nodes[idx];
            if (!node) return null;

            const isLocked = status === 'locked';
            const isCompleted = status === 'completed';
            const isAvailable = status === 'available' || status === 'in_progress';
            const isBoss = mod.isBoss; 
            const isMysteryBox = (idx + 1) % 5 === 0 && !isBoss;

            // Colors based on status
            let btnColor = 'bg-primary-container';
            let borderColor = 'border-primary';
            let iconColor = 'text-on-primary-container';
            
            if (isLocked) {
              btnColor = 'bg-surface-dim';
              borderColor = 'border-surface-container-high';
              iconColor = 'text-outline';
            } else if (isCompleted) {
              btnColor = 'bg-secondary';
              borderColor = 'border-secondary-fixed';
              iconColor = 'text-on-secondary';
            } else if (isBoss) {
              btnColor = 'bg-error-container';
              borderColor = 'border-error';
              iconColor = 'text-error';
            } else if (isMysteryBox) {
              btnColor = 'bg-tertiary-container';
              borderColor = 'border-tertiary';
              iconColor = 'text-tertiary';
            }

            const iconMap: Record<number, string> = {
              0: 'menu_book', 1: 'sports_esports', 2: 'factory',
              3: 'devices', 4: 'record_voice_over',
            };

            return (
              <div
                key={mod.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${node.xPercent}%`, top: node.yPx }}
              >
                <div className="relative group flex flex-col items-center">
                  {/* Floating Title (shows on hover or if it's the current node) */}
                  <div className={`mb-3 px-4 py-2 rounded-2xl text-center min-w-[140px] shadow-md transition-opacity duration-300 ${isAvailable ? 'opacity-100 bg-surface' : 'opacity-0 group-hover:opacity-100 bg-surface-container-high'}`}>
                     <span className={`font-headline text-label-md font-bold block ${isLocked ? 'text-outline' : 'text-on-surface'}`}>
                       Level {idx + 1}
                     </span>
                     <span className={`font-body text-caption block truncate ${isLocked ? 'text-outline' : 'text-on-surface-variant'}`}>
                       {mod.title}
                     </span>
                  </div>

                  <motion.button
                    onClick={() => !isLocked && navigate(`/play/${childId}/module/${mod.id}`)}
                    disabled={isLocked}
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full ${btnColor} border-b-[8px] border-x-[4px] border-t-[2px] ${borderColor} flex items-center justify-center shadow-lg transition-transform ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:-translate-y-2 active:translate-y-0 active:border-b-[2px]'}`}
                    whileHover={!isLocked ? { scale: 1.05 } : undefined}
                    whileTap={!isLocked ? { scale: 0.95 } : undefined}
                  >
                    {isLocked ? (
                      <span className={`material-symbols-outlined text-4xl ${iconColor}`}>lock</span>
                    ) : isCompleted ? (
                      <span className={`material-symbols-outlined text-4xl ${iconColor} filled`}>star</span>
                    ) : isBoss ? (
                      <span className={`material-symbols-outlined text-4xl ${iconColor} filled animate-pulse`}>swords</span>
                    ) : isMysteryBox ? (
                      <span className={`material-symbols-outlined text-4xl ${iconColor} filled animate-bounce`}>redeem</span>
                    ) : (
                      <span className={`material-symbols-outlined text-4xl ${iconColor} filled`}>{iconMap[idx % 5] || 'play_arrow'}</span>
                    )}
                  </motion.button>
                  
                  {/* Avatar jumping on the current available level */}
                  {isAvailable && (
                    <motion.div 
                      className="absolute -top-12 z-20 pointer-events-none"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <img src={avatar.imageUrl} alt="You are here" className="w-16 h-16 object-contain drop-shadow-xl" />
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating AI Hub Button */}
      <motion.button
        onClick={() => navigate(`/play/${childId}/ai-hub`)}
        className="fixed bottom-6 right-6 z-30 bg-gradient-to-r from-primary to-secondary text-white rounded-full px-5 py-3.5 shadow-lg flex items-center gap-2 hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        <motion.span 
          className="material-symbols-outlined filled"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          auto_awesome
        </motion.span>
        <span className="font-headline text-label-lg">AI Adventures</span>
      </motion.button>
    </div>
  );
};

export default WorldMap;
