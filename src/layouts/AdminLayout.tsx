import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../firebase/auth';
import toast from 'react-hot-toast';

export const AdminLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const navItems = [
    { path: '/admin', icon: 'dashboard', label: 'Overview', exact: true },
    { path: '/admin/modules', icon: 'menu_book', label: 'Modules' },
    { path: '/admin/moderation', icon: 'fact_check', label: 'Moderation' },
    { path: '/admin/support-requests', icon: 'support_agent', label: 'Support' },
    { path: '/admin/feedback', icon: 'reviews', label: 'Feedback' },
    { path: '/admin/help-services', icon: 'local_hospital', label: 'Help Services' },
  ];

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-cream font-body flex">
      {/* Sidebar */}
      <nav className="hidden md:flex bg-inverse-surface fixed left-0 top-0 h-full w-64 z-40 flex-col py-6">
        <div className="px-6 mb-8">
          <Link to="/admin" className="font-headline text-title-lg font-bold text-inverse-on-surface">Admin Panel</Link>
          <p className="font-body text-caption text-inverse-on-surface/70 mt-1">{user?.email}</p>
        </div>

        <ul className="flex flex-col gap-1 flex-grow">
          {navItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-4 mx-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path, item.exact)
                    ? 'bg-inverse-primary text-on-primary-fixed'
                    : 'text-inverse-on-surface/80 hover:bg-inverse-on-surface/10'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-body text-body-md font-semibold">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="px-3 mt-auto space-y-1">
          <Link to="/dashboard" className="flex items-center gap-4 text-inverse-on-surface/80 hover:bg-inverse-on-surface/10 rounded-lg px-4 py-3 transition-all">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-body text-body-md font-semibold">Back to App</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-4 text-inverse-on-surface/80 hover:bg-inverse-on-surface/10 rounded-lg px-4 py-3 transition-all w-full text-left">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body text-body-md font-semibold">Log Out</span>
          </button>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 w-full z-50 bg-inverse-surface px-4 py-4">
        <div className="flex justify-between items-center">
          <span className="font-headline text-title-lg font-bold text-inverse-on-surface">Admin</span>
          <Link to="/dashboard" className="text-inverse-on-surface">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow md:ml-64 p-4 md:p-8 mt-16 md:mt-0">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};
