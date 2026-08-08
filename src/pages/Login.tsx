import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { loginWithEmail, loginWithGoogle } from '../firebase/auth';
import { MASCOT_URL, GOOGLE_LOGO_URL } from '../constants';
import toast from 'react-hot-toast';

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await loginWithEmail(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/play');
    } catch {
      toast.error('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome back!');
      navigate('/play');
    } catch {
      toast.error('Google sign-in failed.');
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
        {/* Illustration */}
        <div className="w-full md:w-1/2 bg-secondary-container p-lg flex-col justify-center items-center text-center relative overflow-hidden hidden md:flex">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: "url(\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0iIzAwNmY2NyIvPjwvc3ZnPg==\")"
          }} />
          <img className="w-64 h-64 object-contain mb-8 z-10 drop-shadow-md" src={MASCOT_URL} alt="RightsQuest Mascot" />
          <h2 className="font-headline text-headline-md text-on-secondary-container mb-4 z-10">Welcome to RightsQuest</h2>
          <p className="font-body text-body-lg text-on-secondary-container max-w-sm z-10">Join the learning adventure! Equip your children with knowledge and confidence in a safe, fun environment.</p>
        </div>

        {/* Form */}
        <div className="w-full md:w-1/2 p-lg md:p-xl flex flex-col justify-center">
          <div className="text-center mb-8 md:hidden">
            <img className="w-24 h-24 object-contain mx-auto mb-4 drop-shadow-md" src={MASCOT_URL} alt="RightsQuest Mascot" />
            <h1 className="font-headline text-headline-md-mobile text-primary">RightsQuest</h1>
          </div>

          <div className="hidden md:block mb-8">
            <h1 className="font-headline text-headline-md text-primary">Parent Portal</h1>
            <p className="font-body text-body-md text-on-surface-variant mt-2">Sign in or create an account to manage your child's journey.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor="login-email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">mail</span>
                <input
                  {...register('email', { required: 'Email is required' })}
                  className="w-full h-14 pl-12 pr-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright"
                  id="login-email"
                  placeholder="parent@example.com"
                  type="email"
                />
              </div>
              {errors.email && <p className="text-caption text-error mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-body text-label-md text-on-surface-variant" htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="font-body text-label-md text-primary hover:text-primary-container transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input
                  {...register('password', { required: 'Password is required' })}
                  className="w-full h-14 pl-12 pr-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright"
                  id="login-password"
                  placeholder="••••••••"
                  type="password"
                />
              </div>
              {errors.password && <p className="text-caption text-error mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary-container text-on-primary-container font-headline text-title-lg rounded-full btn-tactile border-b-4 border-primary flex items-center justify-center gap-2 mt-4 hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                <>Log In <span className="material-symbols-outlined">arrow_forward</span></>
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
            New to RightsQuest? <Link to="/signup" className="text-primary font-semibold hover:underline">Create an account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
