import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { signUpWithEmail, loginWithGoogle } from '../firebase/auth';
import { MASCOT_URL, GOOGLE_LOGO_URL } from '../constants';
import toast from 'react-hot-toast';

interface SignUpForm {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpForm>();
  const password = watch('password');

  const onSubmit = async (data: SignUpForm) => {
    setLoading(true);
    try {
      await signUpWithEmail(data.email, data.password, data.displayName);
      toast.success('Account created! Welcome to RightsQuest!');
      navigate('/play');
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Try logging in.');
      } else {
        toast.error('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome to RightsQuest!');
      navigate('/play');
    } catch {
      toast.error('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-gutter font-body text-on-surface bg-cream relative">
      <Link to="/" className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors bg-surface-container-high hover:bg-surface-container-highest rounded-full px-4 py-2 shadow-sm z-50">
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        <span className="font-body text-label-md hidden sm:inline">Back to Home</span>
      </Link>
      <motion.div
        className="max-w-4xl w-full bg-surface-container-lowest rounded-xl card-shadow overflow-hidden flex flex-col md:flex-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Illustration Side */}
        <div className="w-full md:w-1/2 bg-secondary-container p-lg flex-col justify-center items-center text-center relative overflow-hidden hidden md:flex">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: "url(\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0iIzAwNmY2NyIvPjwvc3ZnPg==\")"
          }} />
          <img className="w-64 h-64 object-contain mb-8 z-10 drop-shadow-md" src={MASCOT_URL} alt="RightsQuest Mascot" />
          <h2 className="font-headline text-headline-md text-on-secondary-container mb-4 z-10">Welcome to RightsQuest</h2>
          <p className="font-body text-body-lg text-on-secondary-container max-w-sm z-10">Join the learning adventure! Equip your children with knowledge and confidence in a safe, fun environment.</p>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-1/2 p-lg md:p-xl flex flex-col justify-center">
          <div className="text-center mb-8 md:hidden">
            <img className="w-24 h-24 object-contain mx-auto mb-4 drop-shadow-md" src={MASCOT_URL} alt="RightsQuest Mascot" />
            <h1 className="font-headline text-headline-md-mobile text-primary">RightsQuest</h1>
          </div>

          <div className="hidden md:block mb-8">
            <h1 className="font-headline text-headline-md text-primary">Create Your Account</h1>
            <p className="font-body text-body-md text-on-surface-variant mt-2">Start your child's learning journey today.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor="displayName">Your Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">person</span>
                <input
                  {...register('displayName', { required: 'Name is required' })}
                  className="w-full h-14 pl-12 pr-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright"
                  id="displayName"
                  placeholder="Your full name"
                  type="text"
                />
              </div>
              {errors.displayName && <p className="text-caption text-error mt-1">{errors.displayName.message}</p>}
            </div>

            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor="signup-email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">mail</span>
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                  className="w-full h-14 pl-12 pr-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright"
                  id="signup-email"
                  placeholder="parent@example.com"
                  type="email"
                />
              </div>
              {errors.email && <p className="text-caption text-error mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor="signup-password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                  className="w-full h-14 pl-12 pr-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright"
                  id="signup-password"
                  placeholder="••••••••"
                  type="password"
                />
              </div>
              {errors.password && <p className="text-caption text-error mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: v => v === password || 'Passwords do not match',
                  })}
                  className="w-full h-14 pl-12 pr-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright"
                  id="confirmPassword"
                  placeholder="••••••••"
                  type="password"
                />
              </div>
              {errors.confirmPassword && <p className="text-caption text-error mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary-container text-on-primary-container font-headline text-title-lg rounded-full btn-tactile border-b-4 border-primary flex items-center justify-center gap-2 mt-4 hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                <>Create Account <span className="material-symbols-outlined">arrow_forward</span></>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px bg-surface-dim flex-1" />
            <span className="font-body text-label-md text-on-surface-variant">OR</span>
            <div className="h-px bg-surface-dim flex-1" />
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-14 bg-surface-bright border-2 border-surface-dim text-on-surface font-headline text-title-lg rounded-full btn-tactile border-b-4 flex items-center justify-center gap-3 hover:bg-surface-container-low transition-colors disabled:opacity-50"
              type="button"
            >
              <img className="w-6 h-6" src={GOOGLE_LOGO_URL} alt="Google" />
              Continue with Google
            </button>
          </div>

          <p className="mt-8 text-center font-body text-body-md text-on-surface-variant">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
