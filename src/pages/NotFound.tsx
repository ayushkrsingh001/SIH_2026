import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MASCOT_URL } from '../constants';

const NotFound = () => (
  <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8 text-center font-body">
    <motion.img
      src={MASCOT_URL}
      alt="Lost Mascot"
      className="w-40 h-40 mb-6 drop-shadow-lg"
      animate={{ rotate: [0, -5, 5, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <h1 className="font-headline text-display-lg-mobile text-on-surface mb-2">Oops! Page Not Found</h1>
    <p className="font-body text-body-lg text-on-surface-variant mb-8 max-w-md">
      It seems this quest doesn't exist. Let's get you back on track!
    </p>
    <Link
      to="/"
      className="bg-primary-container text-on-primary-container font-headline text-title-lg px-8 py-4 rounded-full btn-tactile-primary inline-flex items-center gap-2"
    >
      <span className="material-symbols-outlined">home</span>
      Go Home
    </Link>
  </div>
);

export default NotFound;
