import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { MASCOT_SMALL_URL } from '../constants';

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: "easeIn" } }
} as const;

export const ParentLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/play', icon: 'play_circle', label: 'Play' },
    { path: '/community', icon: 'forum', label: 'Community' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FDFBF7] font-body flex flex-col md:flex-row">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none animate-float" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-tertiary/5 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      {/* Mobile Top Bar */}
      <header className="md:hidden sticky top-0 z-50 bg-white/70 backdrop-blur-xl shadow-sm border-b border-outline-variant">
        <div className="flex justify-between items-center w-full px-4 py-4 max-w-container-max mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-on-surface-variant hover:text-primary transition-colors flex items-center bg-surface-container-high rounded-full p-2" aria-label="Go Back">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <Link to="/dashboard" className="font-headline text-headline-md-mobile font-extrabold text-primary">
              RightsQuest
            </Link>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/play')} className="text-on-surface-variant hover:text-primary transition-colors" aria-label="Play">
              <span className="material-symbols-outlined">play_circle</span>
            </button>
            <button onClick={handleLogout} className="text-on-surface-variant hover:text-primary transition-colors" aria-label="Logout">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex bg-white/70 backdrop-blur-xl shadow-lg border-r border-outline-variant fixed left-0 top-0 h-full w-64 z-40 flex-col py-6">
        <div className="px-6 mb-8 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-on-surface-variant hover:text-primary transition-colors flex items-center bg-surface-container-high rounded-full p-2" aria-label="Go Back">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
            <img alt="RightsQuest Mascot" className="w-full h-full object-cover" src={MASCOT_SMALL_URL} />
          </div>
          <div>
            <Link to="/dashboard" className="font-headline text-title-lg font-bold text-primary">RightsQuest</Link>
            <p className="font-body text-caption text-on-surface-variant truncate max-w-[120px]">{user?.displayName || 'Parent'}</p>
          </div>
        </div>

        <ul className="flex flex-col gap-2 flex-grow">
          {navItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-4 rounded-lg mx-2 px-4 py-3 transition-all ${
                  isActive(item.path)
                    ? 'bg-secondary-container text-on-secondary-container border-b-4 border-on-secondary-fixed-variant'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-body text-body-md font-semibold">{item.label}</span>
              </Link>
            </li>
          ))}
          {user?.role === 'admin' && (
            <li>
              <Link
                to="/admin"
                className={`flex items-center gap-4 rounded-lg mx-2 px-4 py-3 transition-all ${
                  isActive('/admin')
                    ? 'bg-secondary-container text-on-secondary-container border-b-4 border-on-secondary-fixed-variant'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined">admin_panel_settings</span>
                <span className="font-body text-body-md font-semibold">Admin</span>
              </Link>
            </li>
          )}
        </ul>

        <ul className="flex flex-col gap-2 mt-auto">
          <li>
            <Link to="/play" className="flex items-center gap-4 text-on-surface-variant hover:bg-surface-container-high rounded-lg mx-2 px-4 py-3 transition-all">
              <span className="material-symbols-outlined">help</span>
              <span className="font-body text-body-md font-semibold">Help Center</span>
            </Link>
          </li>
          <li>
            <button onClick={handleLogout} className="flex items-center gap-4 text-on-surface-variant hover:bg-surface-container-high rounded-lg mx-2 px-4 py-3 transition-all w-full text-left">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-body text-body-md font-semibold">Log Out</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-grow relative z-10 w-full max-w-container-max mx-auto px-4 md:px-gutter py-8 md:py-12 md:ml-64">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-white/80 backdrop-blur-xl rounded-t-xl shadow-nav border-t border-outline-variant">
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
    </div>
  );
};
