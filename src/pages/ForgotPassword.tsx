import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { resetPassword } from '../firebase/auth';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      setSent(true);
      toast.success('Password reset email sent!');
    } catch {
      toast.error('Failed to send reset email. Check the email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-gutter font-body text-on-surface bg-cream">
      <motion.div
        className="max-w-md w-full bg-surface-container-lowest rounded-[24px] card-shadow p-8 md:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">lock_reset</span>
          </div>
          <h1 className="font-headline text-headline-md text-on-surface mb-2">Reset Password</h1>
          <p className="font-body text-body-md text-on-surface-variant">Enter your email and we'll send you a reset link.</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-secondary text-3xl filled">check_circle</span>
            </div>
            <p className="font-body text-body-lg text-on-surface">Check your email for the reset link!</p>
            <Link to="/login" className="block font-body text-label-md text-primary hover:underline">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor="reset-email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">mail</span>
                <input
                  {...register('email', { required: 'Email is required' })}
                  className="w-full h-14 pl-12 pr-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright"
                  id="reset-email"
                  placeholder="parent@example.com"
                  type="email"
                />
              </div>
              {errors.email && <p className="text-caption text-error mt-1">{errors.email.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary-container text-on-primary-container font-headline text-title-lg rounded-full btn-tactile-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Reset Link'}
            </button>
            <p className="text-center font-body text-body-md text-on-surface-variant">
              Remember your password? <Link to="/login" className="text-primary font-semibold hover:underline">Log In</Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
