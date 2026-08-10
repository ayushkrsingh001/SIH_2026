import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { MASCOT_SMALL_URL } from '../constants';
import { useChild } from '../contexts/ChildContext';
import { useEffect, useState } from 'react';
import { getParent, updateParent, subscribeToNotifications } from '../firebase/firestore';

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: "easeIn" } }
} as const;

export const ParentLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setActiveChild } = useChild();

  const [isCheckingPin, setIsCheckingPin] = useState(true);
  const [hasPin, setHasPin] = useState(false);
  const [pinVerified, setPinVerified] = useState(() => sessionStorage.getItem('parentPinVerified') === 'true');
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [expectedPin, setExpectedPin] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToNotifications(user.uid, (data) => {
      setUnreadCount(data.filter(n => !n.read).length);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    setActiveChild(null);
  }, [setActiveChild]);

  useEffect(() => {
    const fetchParentData = async () => {
      if (user?.uid) {
        try {
          const parentData = await getParent(user.uid);
          if (parentData?.pin) {
            setHasPin(true);
            setExpectedPin(parentData.pin);
          } else {
            setHasPin(false);
          }
        } catch (err) {
          console.error("Failed to fetch parent PIN status", err);
        } finally {
          setIsCheckingPin(false);
        }
      }
    };
    fetchParentData();
  }, [user?.uid]);

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('parentPinVerified');
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    if (hasPin) {
      if (pinInput === expectedPin) {
        setPinVerified(true);
        sessionStorage.setItem('parentPinVerified', 'true');
        setError('');
      } else {
        setError("Incorrect PIN");
        setPinInput('');
      }
    } else {
      if (user?.uid) {
        try {
          setIsCheckingPin(true);
          await updateParent(user.uid, { pin: pinInput });
          setHasPin(true);
          setExpectedPin(pinInput);
          setPinVerified(true);
          sessionStorage.setItem('parentPinVerified', 'true');
          setError('');
        } catch (err) {
          console.error("Failed to save PIN", err);
          setError("Failed to save PIN");
        } finally {
          setIsCheckingPin(false);
        }
      }
    }
  };

  const navItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/incident-assistant', icon: 'report', label: 'Incident Assistant' },
    { path: '/community', icon: 'forum', label: 'Community' },
    { path: '/notifications', icon: 'notifications', label: 'Notifications', badge: unreadCount },
    { path: '/settings', icon: 'settings', label: 'Settings' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  if (isCheckingPin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pinVerified) {
    return (
      <div className="min-h-screen relative overflow-x-hidden bg-[#FDFBF7] font-body flex flex-col items-center justify-center p-4">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none animate-float" />
        <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-tertiary/5 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
        
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-outline-variant max-w-sm w-full z-10 relative">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center overflow-hidden mb-4">
              <img alt="RightsQuest Mascot" className="w-full h-full object-cover" src={MASCOT_SMALL_URL} />
            </div>
            <h2 className="text-headline-sm font-headline font-bold text-primary text-center">
              {hasPin ? "Enter Parent PIN" : "Create Parent PIN"}
            </h2>
            <p className="text-body-md text-on-surface-variant text-center mt-2">
              {hasPin ? "Enter your 4-digit PIN to access the dashboard." : "Set a 4-digit PIN to secure the parent dashboard from your child."}
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
            <div className="flex justify-center">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-32 text-center text-2xl tracking-widest p-3 rounded-lg border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="••••"
                autoFocus
              />
            </div>
            {error && <p className="text-error text-label-md text-center">{error}</p>}
            
            <button 
              type="submit"
              disabled={pinInput.length !== 4}
              className="bg-primary text-on-primary py-3 rounded-xl font-bold mt-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {hasPin ? "Unlock" : "Set PIN"}
            </button>
            <button 
              type="button"
              onClick={handleLogout}
              className="text-on-surface-variant py-2 rounded-xl text-label-md mt-2 hover:bg-surface-container transition-colors"
            >
              Log Out
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#FDFBF7] font-body flex flex-col md:flex-row">
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
            <button onClick={() => navigate('/play')} className="text-on-surface-variant hover:text-primary transition-colors flex items-center bg-surface-container-high rounded-full p-2" aria-label="Go Back">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <Link to="/dashboard" className="font-headline text-headline-md-mobile font-extrabold text-primary">
              RightsQuest
            </Link>
          </div>
          <div className="flex gap-3">
            <button onClick={handleLogout} className="text-on-surface-variant hover:text-primary transition-colors" aria-label="Logout">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex bg-white/70 backdrop-blur-xl shadow-lg border-r border-outline-variant fixed left-0 top-0 h-full w-64 z-40 flex-col py-6">
        <div className="px-6 mb-8 flex items-center gap-3">
          <button onClick={() => navigate('/play')} className="text-on-surface-variant hover:text-primary transition-colors flex items-center bg-surface-container-high rounded-full p-2" aria-label="Go Back">
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
                <div className="relative">
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.badge ? (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-error border-2 border-surface"></span>
                    </span>
                  ) : null}
                </div>
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
            <button onClick={handleLogout} className="flex items-center gap-4 text-on-surface-variant hover:bg-surface-container-high rounded-lg mx-2 px-4 py-3 transition-all w-full text-left">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-body text-body-md font-semibold">Log Out</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-grow relative z-10 w-full md:w-[calc(100%-16rem)] max-w-container-max mx-auto px-4 md:px-gutter py-8 pb-32 md:py-12 md:pb-8 md:ml-64">
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
            <div className="relative">
              <span className={`material-symbols-outlined ${isActive(item.path) ? 'filled' : ''}`}>{item.icon}</span>
              {item.badge ? (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-error border-2 border-surface"></span>
                </span>
              ) : null}
            </div>
            <span className="font-body text-label-md mt-1">{item.label}</span>
          </Link>
        ))}
      </nav>
      
      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
};
