import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { signUpWithEmail, loginWithGoogle } from '../firebase/auth';
import { MASCOT_URL, GOOGLE_LOGO_URL } from '../constants';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

interface SignUpForm {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpForm>();
  const password = watch('password');

  const onSubmit = async (data: SignUpForm) => {
    setLoading(true);
    try {
      await signUpWithEmail(data.email, data.password, data.displayName);
      toast.success('Account created! Welcome to RightsQuest!');
      navigate('/play', { replace: true });
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
      navigate('/play', { replace: true });
    } catch {
      toast.error('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-gutter font-body text-on-surface bg-cream relative">
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
        <LanguageSwitcher />
      </div>
      <Link to="/" className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors bg-surface-container-high hover:bg-surface-container-highest rounded-full px-4 py-2 shadow-sm z-50">
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        <span className="font-body text-label-md hidden sm:inline">{t('auth.backToHome')}</span>
      </Link>
      <motion.div
        className="max-w-4xl w-full bg-surface-container-lowest rounded-xl card-shadow overflow-hidden flex flex-col md:flex-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Illustration */}
        <div className="w-full md:w-1/2 bg-primary-container p-lg flex-col justify-center items-center text-center relative overflow-hidden hidden md:flex">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: "url(\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0iIzAwNmY2NyIvPjwvc3ZnPg==\")"
          }} />
          <img className="w-64 h-64 object-contain mb-8 z-10 drop-shadow-md" src={MASCOT_URL} alt="RightsQuest Mascot" />
          <h2 className="font-headline text-headline-md text-on-primary-container mb-4 z-10">{t('auth.welcomeTitle')}</h2>
          <p className="font-body text-body-lg text-on-primary-container max-w-sm z-10">{t('auth.welcomeDesc')}</p>
        </div>

        {/* Form */}
        <div className="w-full md:w-1/2 p-lg md:p-xl flex flex-col justify-center">
          <div className="text-center mb-8 md:hidden">
            <img className="w-24 h-24 object-contain mx-auto mb-4 drop-shadow-md" src={MASCOT_URL} alt="RightsQuest Mascot" />
            <h1 className="font-headline text-headline-md-mobile text-primary">RightsQuest</h1>
          </div>

          <div className="hidden md:block mb-8">
            <h1 className="font-headline text-headline-md text-primary">{t('auth.parentPortal')}</h1>
            <p className="font-body text-body-md text-on-surface-variant mt-2">{t('auth.signInDesc')}</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor="signup-name">{t('auth.displayNameLabel')}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">person</span>
                <input
                  {...register('displayName', { required: t('auth.displayNameRequired') })}
                  className="w-full h-12 pl-12 pr-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright"
                  id="signup-name"
                  placeholder={t('auth.displayNamePlaceholder')}
                  type="text"
                />
              </div>
              {errors.displayName && <p className="text-caption text-error mt-1">{errors.displayName.message}</p>}
            </div>

            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor="signup-email">{t('auth.emailLabel')}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">mail</span>
                <input
                  {...register('email', { required: t('auth.emailRequired') })}
                  className="w-full h-12 pl-12 pr-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright"
                  id="signup-email"
                  placeholder={t('auth.emailPlaceholder')}
                  type="email"
                />
              </div>
              {errors.email && <p className="text-caption text-error mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor="signup-password">{t('auth.passwordLabel')}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input
                  {...register('password', { required: t('auth.passwordRequired'), minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                  className="w-full h-12 pl-12 pr-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright"
                  id="signup-password"
                  placeholder={t('auth.passwordPlaceholder')}
                  type="password"
                />
              </div>
              {errors.password && <p className="text-caption text-error mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor="signup-confirm-password">{t('auth.confirmPasswordLabel')}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input
                  {...register('confirmPassword', { 
                    required: t('auth.confirmPasswordRequired'),
                    validate: (value) => value === password || t('auth.passwordsMustMatch')
                  })}
                  className="w-full h-12 pl-12 pr-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright"
                  id="signup-confirm-password"
                  placeholder={t('auth.passwordPlaceholder')}
                  type="password"
                />
              </div>
              {errors.confirmPassword && <p className="text-caption text-error mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary text-on-primary font-headline text-title-lg rounded-full btn-tactile border-b-4 border-primary-fixed-dim flex items-center justify-center gap-2 mt-6 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                <>{t('auth.createAccountBtn')} <span className="material-symbols-outlined">arrow_forward</span></>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px bg-surface-dim flex-1" />
            <span className="font-body text-label-md text-on-surface-variant">{t('auth.or')}</span>
            <div className="h-px bg-surface-dim flex-1" />
          </div>

          <div className="mt-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-14 bg-surface-bright border-2 border-surface-dim text-on-surface font-headline text-title-lg rounded-full btn-tactile border-b-4 flex items-center justify-center gap-3 hover:bg-surface-container-low transition-colors disabled:opacity-50"
              type="button"
            >
              <img className="w-6 h-6" src={GOOGLE_LOGO_URL} alt="Google" />
              {t('auth.continueWithGoogle')}
            </button>
          </div>

          <p className="mt-6 text-center font-body text-body-md text-on-surface-variant">
            {t('auth.alreadyHaveAccount')} <Link to="/login" className="text-primary font-semibold hover:underline">{t('auth.logInBtn')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
