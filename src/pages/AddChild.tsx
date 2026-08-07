import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { addChild } from '../firebase/firestore';
import { hashPin } from '../utils';
import { AVATAR_OPTIONS } from '../constants';
import { staggerContainer, staggerItem } from '../animations/variants';
import toast from 'react-hot-toast';

interface AddChildForm {
  displayName: string;
  ageGroup: '8-11' | '12-16';
  pin: string;
  confirmPin: string;
}

const AddChild = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].id);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<AddChildForm>();
  const pin = watch('pin');

  const onSubmit = async (data: AddChildForm) => {
    if (!user) return;
    setLoading(true);
    try {
      const pinHash = await hashPin(data.pin);
      await addChild(user.uid, {
        displayName: data.displayName,
        avatarId: selectedAvatar,
        ageGroup: data.ageGroup,
        pinHash,
        xp: 0,
        level: 1,
        coins: 0,
        streak: 0,
        highestStreak: 0,
        lastLoginDate: null,
        badgeIds: [],
        unlockedAvatarIds: [selectedAvatar],
        unlockedTitles: [],
        currentTitle: null,
        languagePref: 'en',
      });
      toast.success(`${data.displayName}'s profile created!`);
      navigate('/dashboard');
    } catch {
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-6 transition-colors">
        <span className="material-symbols-outlined">arrow_back</span>
        <span className="font-body text-label-md">Back to Dashboard</span>
      </button>

      <motion.div
        className="bg-surface-container-lowest rounded-[24px] p-6 md:p-10 shadow-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-headline text-headline-md text-on-surface mb-2">Add New Explorer</h1>
        <p className="font-body text-body-md text-on-surface-variant mb-8">Create a profile for your child to begin their learning adventure.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Avatar Selection */}
          <div>
            <label className="block font-body text-label-md text-on-surface-variant mb-4">Choose an Avatar</label>
            <motion.div
              className="grid grid-cols-3 sm:grid-cols-6 gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {AVATAR_OPTIONS.map(avatar => (
                <motion.button
                  key={avatar.id}
                  type="button"
                  variants={staggerItem}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-[24px] transition-all ${
                    selectedAvatar === avatar.id
                      ? 'bg-primary-container/20 border-2 border-primary scale-105'
                      : 'bg-surface-container-low border-2 border-transparent hover:border-outline-variant'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-cream">
                    <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-body text-caption text-on-surface">{avatar.name}</span>
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor="childName">Explorer Name</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">badge</span>
              <input
                {...register('displayName', { required: 'Name is required', maxLength: { value: 20, message: 'Max 20 characters' } })}
                className="w-full h-14 pl-12 pr-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright"
                id="childName"
                placeholder="Enter child's name"
              />
            </div>
            {errors.displayName && <p className="text-caption text-error mt-1">{errors.displayName.message}</p>}
          </div>

          {/* Age Group */}
          <div>
            <label className="block font-body text-label-md text-on-surface-variant mb-4">Age Group</label>
            <div className="flex gap-4">
              {[
                { value: '8-11' as const, label: '8-11 years', icon: 'child_care' },
                { value: '12-16' as const, label: '12-16 years', icon: 'school' },
              ].map(age => (
                <label
                  key={age.value}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-[16px] border-2 cursor-pointer transition-all ${
                    watch('ageGroup') === age.value
                      ? 'border-primary bg-primary-fixed/20'
                      : 'border-surface-dim hover:border-outline-variant'
                  }`}
                >
                  <input {...register('ageGroup', { required: 'Select an age group' })} type="radio" value={age.value} className="hidden" />
                  <span className="material-symbols-outlined text-primary">{age.icon}</span>
                  <span className="font-body text-body-md text-on-surface">{age.label}</span>
                </label>
              ))}
            </div>
            {errors.ageGroup && <p className="text-caption text-error mt-1">{errors.ageGroup.message}</p>}
          </div>

          {/* PIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor="pin">4-Digit PIN</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">pin</span>
                <input
                  {...register('pin', {
                    required: 'PIN is required',
                    pattern: { value: /^\d{4}$/, message: 'Must be exactly 4 digits' },
                  })}
                  className="w-full h-14 pl-12 pr-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright"
                  id="pin"
                  placeholder="••••"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                />
              </div>
              {errors.pin && <p className="text-caption text-error mt-1">{errors.pin.message}</p>}
            </div>
            <div>
              <label className="block font-body text-label-md text-on-surface-variant mb-2" htmlFor="confirmPin">Confirm PIN</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">pin</span>
                <input
                  {...register('confirmPin', {
                    required: 'Confirm your PIN',
                    validate: v => v === pin || 'PINs do not match',
                  })}
                  className="w-full h-14 pl-12 pr-4 rounded-lg border-2 border-surface-dim tactile-input font-body text-body-md bg-surface-bright"
                  id="confirmPin"
                  placeholder="••••"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                />
              </div>
              {errors.confirmPin && <p className="text-caption text-error mt-1">{errors.confirmPin.message}</p>}
            </div>
          </div>

          <p className="font-body text-caption text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">info</span>
            The PIN is used for your child to access their profile. Keep it memorable but secret.
          </p>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 h-14 bg-surface border-2 border-outline-variant text-on-surface font-headline text-title-lg rounded-full hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-14 bg-primary-container text-on-primary-container font-headline text-title-lg rounded-full btn-tactile-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined">person_add</span>
                  Create Profile
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddChild;
