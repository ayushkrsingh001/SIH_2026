import { useState } from 'react';
import { Outlet, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useChild } from '../contexts/ChildContext';
import { MASCOT_SMALL_URL } from '../constants';
import { resolveAvatarUrl } from '../utils/avatar';
import { calculateLevel } from '../services/xpSystem';
import AIMentorWidget from '../components/ui/AIMentorWidget';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { logOut } from '../firebase/auth';

export const ChildLayout = () => {
  const { t } = useTranslation();
  const { activeChild } = useChild();
  const navigate = useNavigate();
  const { childId } = useParams();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);

  const avatarUrl = resolveAvatarUrl(activeChild?.avatarId);
  const levelInfo = calculateLevel(activeChild?.xp || 0);

  const navItems = [
    { path: `/play/${childId}/map`, icon: 'map', label: t('layouts.child.map') },
    { path: `/play/${childId}/chat`, icon: 'chat', label: t('layouts.child.aiChat') },
    { path: `/play/${childId}/progress`, icon: 'emoji_events', label: t('layouts.child.progress') },
    { path: `/play/${childId}/image-decision`, icon: 'image_search', label: 'Spot Right' },
    { path: `/play/${childId}/detective`, icon: 'search', label: 'Detective' },
    { path: `/play/${childId}/need-help`, icon: 'sos', label: t('layouts.child.help') },
    { path: `/play/${childId}/store`, icon: 'storefront', label: t('layouts.child.store') },
    { path: `/play/${childId}/daily-quiz`, icon: 'calendar_month', label: t('layouts.child.dailyQuiz') },
    { path: `/play/${childId}/multiplayer`, icon: 'swords', label: t('layouts.child.battle') },
    { path: `/play/${childId}/leaderboard`, icon: 'leaderboard', label: t('layouts.child.ranks') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#FDFBF7] font-body flex flex-col">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none animate-float" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-tertiary/5 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl shadow-sm border-b border-outline-variant">
        <div className="flex justify-between items-center w-full px-4 md:px-gutter py-3 max-w-container-max mx-auto">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/play')} className="text-on-surface-variant hover:text-primary transition-colors flex items-center bg-surface-container-high rounded-full p-2" aria-label="Go Back to Profile Selection">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <img src={MASCOT_SMALL_URL} alt="RightsQuest Mascot" className="w-10 h-10 rounded-full object-cover hidden sm:block" />
            <span className="font-headline text-title-lg font-bold text-primary hidden sm:block">RightsQuest</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 relative">
            {navItems.slice(0, 5).map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  isActive(item.path)
                    ? 'bg-primary-container text-on-primary-container font-bold border-b-2 border-on-primary-fixed-variant'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className={`material-symbols-outlined ${isActive(item.path) ? 'filled' : ''} text-[20px]`}>{item.icon}</span>
                <span className="font-body text-label-lg whitespace-nowrap">{item.label}</span>
              </Link>
            ))}
            
            {/* Desktop More Button */}
            <div className="relative">
              <button
                onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isDesktopMenuOpen 
                    ? 'bg-secondary-container text-on-secondary-container font-bold' 
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="font-body text-label-lg">{t('layouts.child.more')}</span>
                <span className="material-symbols-outlined text-[20px]">{isDesktopMenuOpen ? 'expand_less' : 'expand_more'}</span>
              </button>
              
              <AnimatePresence>
                {isDesktopMenuOpen && (
                  <>
                    {/* Invisible backdrop to close dropdown when clicking outside */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDesktopMenuOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest rounded-xl overflow-hidden shadow-elevation-3 border border-outline-variant z-50 flex flex-col"
                    >
                      {navItems.slice(5).map(item => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsDesktopMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                            isActive(item.path)
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          <span className={`material-symbols-outlined ${isActive(item.path) ? 'filled' : ''} text-[20px]`}>{item.icon}</span>
                          <span className="font-body text-label-lg">{item.label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Actions Section */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            
            {/* Child Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-container bg-cream">
                <img src={avatarUrl} alt={activeChild?.displayName || 'Player'} className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <p className="font-body text-label-md text-on-surface leading-tight">{activeChild?.displayName}</p>
                <p className="font-body text-caption text-primary leading-tight">Lvl {levelInfo.level} {levelInfo.title}</p>
              </div>
            </div>

            <Link to="/play" className="text-on-surface-variant hover:text-primary transition-colors" aria-label="Switch player">
              <span className="material-symbols-outlined">swap_horiz</span>
            </Link>
            
            <button 
              onClick={async () => {
                await logOut();
                navigate('/');
              }} 
              className="text-on-surface-variant hover:text-error transition-colors" 
              aria-label="Logout"
              title="Logout"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-10 w-full max-w-container-max mx-auto px-4 md:px-gutter py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white/80 backdrop-blur-xl rounded-t-xl shadow-nav border-t border-outline-variant">
        {navItems.slice(0, 4).map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex flex-col items-center justify-center min-w-[64px] px-1 py-2 rounded-xl transition-all ${
              isActive(item.path)
                ? 'bg-primary-container text-on-primary-container border-b-4 border-on-primary-fixed-variant scale-95'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className={`material-symbols-outlined ${isActive(item.path) ? 'filled' : ''}`}>{item.icon}</span>
            <span className="font-body text-[10px] sm:text-xs mt-1 text-center leading-tight whitespace-nowrap">{item.label}</span>
          </Link>
        ))}
        
        {/* More Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center justify-center min-w-[64px] px-1 py-2 rounded-xl transition-all ${
            isMobileMenuOpen
              ? 'bg-secondary-container text-on-secondary-container border-b-4 border-on-secondary-fixed-variant scale-95'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'more_horiz'}</span>
          <span className="font-body text-[10px] sm:text-xs mt-1 text-center leading-tight">{t('layouts.child.more')}</span>
        </button>
      </nav>

      {/* Mobile More Menu Popup */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="md:hidden fixed bottom-[80px] right-2 left-2 z-40 bg-surface-container-lowest rounded-2xl shadow-elevation-4 border border-outline-variant p-4 grid grid-cols-3 sm:grid-cols-4 gap-3"
          >
            {navItems.slice(4).map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                  isActive(item.path)
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className={`material-symbols-outlined text-2xl ${isActive(item.path) ? 'filled text-primary' : ''}`}>{item.icon}</span>
                <span className="font-body text-xs mt-2 text-center leading-tight">{item.label}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:hidden" />

      {childId && <AIMentorWidget childId={childId} />}
    </div>
  );
};
