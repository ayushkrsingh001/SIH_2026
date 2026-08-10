import { Outlet, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useChild } from '../contexts/ChildContext';
import { MASCOT_SMALL_URL } from '../constants';
import { resolveAvatarUrl } from '../utils/avatar';
import { calculateLevel } from '../services/xpSystem';
import AIMentorWidget from '../components/ui/AIMentorWidget';

export const ChildLayout = () => {
  const { activeChild } = useChild();
  const navigate = useNavigate();
  const { childId } = useParams();
  const location = useLocation();

  const avatarUrl = resolveAvatarUrl(activeChild?.avatarId);
  const levelInfo = calculateLevel(activeChild?.xp || 0);

  const navItems = [
    { path: `/play/${childId}/daily-quiz`, icon: 'calendar_month', label: 'Daily Quiz' },
    { path: `/play/${childId}/incident-assistant`, icon: 'report', label: 'Report Incident' },
    { path: `/play/${childId}/map`, icon: 'map', label: 'Map' },
    { path: `/play/${childId}/progress`, icon: 'emoji_events', label: 'Progress' },
    { path: `/play/${childId}/store`, icon: 'storefront', label: 'Store' },
    { path: `/play/${childId}/leaderboard`, icon: 'leaderboard', label: 'Ranks' },
    { path: `/play/${childId}/multiplayer`, icon: 'swords', label: 'Battle' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FDFBF7] font-body flex flex-col">
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
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map(item => (
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
                <span className="font-body text-label-lg">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Actions Section */}
          <div className="flex items-center gap-3">
            {/* Get Help Button - Always Visible */}
            <motion.button
              onClick={() => navigate(`/play/${childId}/get-help`)}
              className="bg-error text-on-error px-4 py-2 rounded-full font-body text-label-md flex items-center gap-1 btn-tactile border-on-error-container"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Get Help"
            >
              <span className="material-symbols-outlined text-[18px]">emergency</span>
              <span className="hidden sm:inline">Get Help</span>
            </motion.button>

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
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface rounded-t-xl shadow-nav">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all ${
              isActive(item.path)
                ? 'bg-primary-container text-on-primary-container border-b-4 border-on-primary-fixed-variant scale-95'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className={`material-symbols-outlined ${isActive(item.path) ? 'filled' : ''}`}>{item.icon}</span>
            <span className="font-body text-label-md mt-1">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:hidden" />

      {childId && <AIMentorWidget childId={childId} />}
    </div>
  );
};
