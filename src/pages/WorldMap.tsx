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

  const fullPathData = generateSvgPath(nodes);
  
  // Split path for colored dashed lines (we overlap at the highestUnlockedIndex to connect them smoothly)
  const completedNodes = nodes.slice(0, highestUnlockedIndex + 1);
  const upcomingNodes = nodes.slice(highestUnlockedIndex);
  
  const completedPathData = generateSvgPath(completedNodes);
  const upcomingPathData = generateSvgPath(upcomingNodes);

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
      // Just normal loading, scroll to active node instantly after render delay
      setTimeout(() => {
        scrollToNode(activeNode, 'instant');
      }, 500);
    }
  }, [activeNode, previousNode, nodes.length, loading, highestUnlockedIndex, previousIndex]);

  if (loading) return <PageSkeleton />;

  return (
    <div className="flex flex-col h-[calc(100vh-240px)] md:h-[calc(100vh-100px)]">
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
        className="relative w-full max-w-container-max mx-auto overflow-y-auto overflow-x-hidden flex-grow rounded-[32px] shadow-[inset_0_8px_30px_rgba(0,0,0,0.08)] border-8 border-white"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', backgroundColor: '#FFFBF5' }} 
      >
        <div className="relative w-full" style={{ height: `${containerHeight}px` }}>
          
          {/* Animated Background Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.15] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(#a43c12 2px, transparent 2px)', backgroundSize: '30px 30px' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-secondary-container/20 via-transparent to-primary-container/10 pointer-events-none animate-pulse-glow"></div>
          
          {/* Connection Path */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 100 ${containerHeight}`}
            preserveAspectRatio="none"
          >
            <path
              className="opacity-50"
              d={fullPathData}
              fill="none"
              stroke="#dec0b6" // Background path outline
              strokeWidth="40"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            {/* Completed Path (Teal/Green) */}
            <path
              className="path-line"
              d={completedPathData}
              fill="none"
              stroke="#008080" // Dark Teal for completed
              strokeWidth="12"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            {/* Upcoming Path (Orange) */}
            {upcomingNodes.length > 1 && (
              <path
                className="path-line"
                d={upcomingPathData}
                fill="none"
                stroke="#ff7f50" // Orange for upcoming
                strokeWidth="12"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* Module Nodes */}
          {modules.map((mod, idx) => {
            const status = getModuleStatus(mod.id!, mod.prerequisiteModuleId);
            const node = nodes[idx];
            if (!node) return null;

            const isLocked = status === 'locked';
            const isAvailable = idx === highestUnlockedIndex;
            const isCompleted = status === 'completed' || (!isAvailable && !isLocked);

            const iconMap: Record<number, string> = {
              0: 'child_care', 1: 'family_restroom', 2: 'security',
              3: 'devices', 4: 'record_voice_over',
            };
            const iconName = iconMap[idx % 5] || 'explore';

            return (
              <div
                key={mod.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto group ${isLocked ? 'cursor-not-allowed opacity-70 grayscale' : 'cursor-pointer'}`}
                style={{ left: `${node.xPercent}%`, top: node.yPx, zIndex: isAvailable ? 20 : 10 }}
                onClick={() => !isLocked && navigate(`/play/${childId}/module/${mod.id}`)}
              >
                {isCompleted && !isAvailable && (
                  <>
                    <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary-container rounded-2xl floating-shadow flex flex-col items-center justify-center border-2 border-secondary transition-transform group-hover:-translate-y-2 group-hover:active-shadow z-10">
                        <span className="material-symbols-outlined text-3xl md:text-4xl text-secondary mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>{iconName}</span>
                        <div className="bg-secondary text-on-secondary font-caption px-2 py-0.5 rounded-full text-[8px] uppercase font-bold tracking-wider absolute -bottom-2">Completed</div>
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute -right-2 top-2 w-4 h-4 bg-white rounded-full opacity-60"></div>
                      <div className="absolute -left-1 bottom-4 w-3 h-3 bg-white rounded-full opacity-60"></div>
                    </div>
                    <div className="text-center mt-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/40 shadow-sm mx-auto min-w-[110px] max-w-[130px]">
                      <h3 className="font-headline font-semibold text-on-surface text-xs md:text-sm leading-tight">{mod.title}</h3>
                      <div className="flex justify-center gap-1 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                      </div>
                    </div>
                  </>
                )}

                {isAvailable && (
                  <>
                    <div className="relative w-28 h-28 md:w-32 md:h-32 flex items-center justify-center">
                      <div className="absolute inset-0 bg-primary-container opacity-20 rounded-full animate-ping"></div>
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl active-shadow flex flex-col items-center justify-center border-4 border-primary-container relative z-10 tactile-button group-hover:-translate-y-2">
                        <span className="material-symbols-outlined text-4xl md:text-5xl text-primary mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>{iconName}</span>
                        <div className="w-3/4 h-2 bg-surface-container-high rounded-full overflow-hidden mt-1 border border-outline-variant">
                          <div className="h-full bg-primary-container rounded-full w-[40%]"></div>
                        </div>
                      </div>
                      <div className="absolute -top-8 -right-4 w-16 h-16 z-30 animate-bounce" style={{ animationDuration: '2s' }}>
                        <img alt="Mascot Avatar on current quest" className="w-full h-full object-contain filter drop-shadow-lg" src={avatar.imageUrl} />
                      </div>
                    </div>
                    <div className="text-center mt-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border-2 border-primary-container shadow-md mx-auto min-w-[140px] max-w-[170px] transform transition-transform hover:scale-105">
                      <h3 className="font-headline font-bold text-primary text-sm md:text-base leading-tight drop-shadow-sm">{mod.title}</h3>
                      <div className="font-body font-bold text-secondary text-[10px] uppercase tracking-wider mt-1">Level {idx + 1} of {modules.length}</div>
                    </div>
                  </>
                )}

                {isLocked && (
                  <>
                    <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-surface-container-high rounded-2xl floating-shadow flex flex-col items-center justify-center border-2 border-outline-variant z-10">
                        <span className="material-symbols-outlined text-3xl md:text-4xl text-on-surface-variant mb-1">lock</span>
                      </div>
                    </div>
                    <div className="text-center mt-2 bg-surface/50 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-outline-variant/30 shadow-sm mx-auto min-w-[110px] max-w-[130px]">
                      <h3 className="font-headline font-medium text-on-surface-variant text-xs md:text-sm leading-tight">{mod.title}</h3>
                      <div className="font-body text-outline text-[10px] uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">lock</span> Locked
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating AI Hub Button */}
      <motion.button
        onClick={() => navigate(`/play/${childId}/ai-hub`)}
        className="fixed bottom-28 md:bottom-6 left-4 md:left-6 z-30 bg-gradient-to-r from-primary to-secondary text-white rounded-full px-5 py-3.5 shadow-lg flex items-center gap-2 hover:shadow-xl transition-shadow whitespace-nowrap"
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
