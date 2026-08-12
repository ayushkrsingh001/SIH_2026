import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { loginWithEmail } from '../firebase/auth';
import { MASCOT_URL } from '../constants';
import toast from 'react-hot-toast';

interface LoginForm {
  email: string;
  password: string;
}

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await loginWithEmail(data.email.trim(), data.password);
      toast.success('Admin access granted.');
      // Auto-redirect to admin dashboard instead of play
      navigate('/admin', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.code === 'auth/invalid-credential' 
        ? 'Account not found or wrong password. Please signup first.' 
        : err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-gutter font-body text-on-surface bg-surface-container-highest relative">
      
      <Link to="/" className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors bg-surface-container-high hover:bg-surface-container-highest rounded-full px-4 py-2 shadow-sm z-50">
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        <span className="font-body text-label-md hidden sm:inline">Back to Home</span>
      </Link>

      <motion.div
        className="max-w-md w-full bg-surface-container-lowest rounded-xl card-shadow overflow-hidden flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Form */}
        <div className="w-full p-lg md:p-xl flex flex-col justify-center">
          <div className="text-center mb-8">
            <img className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-md grayscale opacity-80" src={MASCOT_URL} alt="Admin Portal" />
            <h1 className="font-headline text-headline-md text-error">System Admin</h1>
            <p className="font-body text-body-md text-on-surface-variant mt-2">Restricted access portal.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor="login-email">Admin Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">admin_panel_settings</span>
                <input
                  {...register('email', { required: 'Email is required' })}
                  className="w-full h-14 pl-12 pr-4 rounded-lg border-2 border-error/50 tactile-input font-body text-body-md bg-surface-bright focus:border-error"
                  id="login-email"
                  placeholder="admin@rightsquest.org"
                  type="email"
                />
              </div>
              {errors.email && <p className="text-caption text-error mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-body text-label-md text-on-surface-variant" htmlFor="login-password">Admin Password</label>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input
                  {...register('password', { required: 'Password is required' })}
                  className="w-full h-14 pl-12 pr-4 rounded-lg border-2 border-error/50 tactile-input font-body text-body-md bg-surface-bright focus:border-error"
                  id="login-password"
                  placeholder="Enter admin password"
                  type="password"
                />
              </div>
              {errors.password && <p className="text-caption text-error mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-error text-white font-headline text-title-lg rounded-full btn-tactile border-b-4 border-error/80 flex items-center justify-center gap-2 mt-4 hover:bg-error/90 transition-colors disabled:opacity-50"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                <>Authenticate <span className="material-symbols-outlined">shield</span></>
              )}
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
