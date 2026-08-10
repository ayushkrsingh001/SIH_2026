import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getChildren, updateChild, getParent, updateParent } from '../firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase/config';
import { hashPin } from '../utils';
import { AVATAR_OPTIONS } from '../constants';
import toast from 'react-hot-toast';
import type { Child, Parent } from '../types';

export default function Settings() {
  const { user } = useAuth();
  const [parentData, setParentData] = useState<Parent | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  // Parent Edit State
  const [isEditingParent, setIsEditingParent] = useState(false);
  const [parentName, setParentName] = useState('');
  const [parentPin, setParentPin] = useState('');
  const [parentConfirmPin, setParentConfirmPin] = useState('');

  // Child Edit State
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState('');
  const [childAgeGroup, setChildAgeGroup] = useState<'8-11' | '12-16'>('8-11');
  const [childAvatar, setChildAvatar] = useState(AVATAR_OPTIONS[0].id);
  const [childPin, setChildPin] = useState('');
  const [childConfirmPin, setChildConfirmPin] = useState('');

  const loadData = async () => {
    if (!user) return;
    try {
      const [parentDoc, childrenDocs] = await Promise.all([
        getParent(user.uid),
        getChildren(user.uid)
      ]);
      setParentData(parentDoc);
      setParentName(parentDoc?.displayName || user.displayName || '');
      setChildren(childrenDocs);
    } catch (error) {
      console.error("Failed to load settings data", error);
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleParentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (parentPin && parentPin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }
    if (parentPin && parentPin !== parentConfirmPin) {
      toast.error('PINs do not match');
      return;
    }

    try {
      const updates: Partial<Parent> = { displayName: parentName };
      if (parentPin) {
        updates.pin = parentPin;
      }
      
      await updateParent(user.uid, updates);
      
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: parentName });
      }

      toast.success('Parent profile updated!');
      setIsEditingParent(false);
      setParentPin('');
      setParentConfirmPin('');
      loadData();
    } catch (error) {
      console.error("Failed to update parent", error);
      toast.error('Failed to update profile');
    }
  };

  const startEditChild = (child: Child) => {
    setEditingChildId(child.id!);
    setChildName(child.displayName);
    setChildAgeGroup(child.ageGroup);
    setChildAvatar(child.avatarId);
    setChildPin('');
    setChildConfirmPin('');
  };

  const cancelEditChild = () => {
    setEditingChildId(null);
  };

  const handleChildSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingChildId) return;

    if (childPin && childPin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }
    if (childPin && childPin !== childConfirmPin) {
      toast.error('PINs do not match');
      return;
    }

    try {
      const updates: Partial<Child> = {
        displayName: childName,
        ageGroup: childAgeGroup,
        avatarId: childAvatar,
      };

      if (childPin) {
        updates.pinHash = await hashPin(childPin);
      }

      await updateChild(user.uid, editingChildId, updates);
      toast.success('Child profile updated!');
      setEditingChildId(null);
      loadData();
    } catch (error) {
      console.error("Failed to update child", error);
      toast.error('Failed to update child profile');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="font-headline text-headline-lg text-on-surface mb-8">Settings & Profiles</h1>

      {/* Parent Settings Section */}
      <motion.section 
        className="bg-surface-container-lowest rounded-[24px] p-6 shadow-card mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-headline text-headline-sm text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">shield_person</span>
              Parent Profile
            </h2>
            <p className="text-body-md text-on-surface-variant mt-1">Manage your account and master PIN.</p>
          </div>
          {!isEditingParent && (
            <button 
              onClick={() => setIsEditingParent(true)}
              className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-secondary-container/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Profile
            </button>
          )}
        </div>

        {isEditingParent ? (
          <form onSubmit={handleParentSave} className="space-y-6 bg-surface-container-low p-6 rounded-[16px]">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-2">Display Name</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                required
                className="w-full p-3 rounded-lg border border-outline bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            
            <div className="pt-4 border-t border-outline-variant">
              <h3 className="text-label-lg font-bold mb-4">Change Master PIN</h3>
              <p className="text-caption text-on-surface-variant mb-4">Leave blank if you do not want to change your PIN.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-2">New PIN (4 digits)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={parentPin}
                    onChange={(e) => setParentPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-3 text-center tracking-widest rounded-lg border border-outline bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="••••"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-2">Confirm New PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={parentConfirmPin}
                    onChange={(e) => setParentConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-3 text-center tracking-widest rounded-lg border border-outline bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setIsEditingParent(false)}
                className="px-6 py-2 rounded-full border border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 rounded-full bg-primary text-on-primary font-bold hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-surface-container-low p-6 rounded-[16px]">
            <div>
              <p className="text-label-md text-on-surface-variant mb-1">Display Name</p>
              <p className="text-body-lg font-bold text-on-surface">{parentData?.displayName || user?.displayName}</p>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant mb-1">Email</p>
              <p className="text-body-lg text-on-surface">{parentData?.email || user?.email}</p>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant mb-1">Master PIN</p>
              <p className="text-body-lg font-mono text-on-surface">{parentData?.pin ? '••••' : 'Not Set'}</p>
            </div>
          </div>
        )}
      </motion.section>

      {/* Children Settings Section */}
      <motion.section 
        className="bg-surface-container-lowest rounded-[24px] p-6 shadow-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-headline text-headline-sm text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined">child_care</span>
              Children Profiles
            </h2>
            <p className="text-body-md text-on-surface-variant mt-1">Manage your kids' accounts, avatars, and PINs.</p>
          </div>
        </div>

        {children.length === 0 ? (
          <div className="text-center py-8 bg-surface-container-low rounded-[16px]">
            <span className="material-symbols-outlined text-[48px] text-outline mb-2">sentiment_dissatisfied</span>
            <p className="text-body-lg text-on-surface-variant">No children added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {children.map((child) => (
              <div key={child.id!} className="bg-surface-container-low rounded-[16px] overflow-hidden border border-outline-variant/30">
                
                {/* Child Display Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-secondary-container bg-surface-bright">
                      <img src={AVATAR_OPTIONS.find(a => a.id === child.avatarId)?.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-title-md">{child.displayName}</h3>
                      <p className="text-label-sm text-on-surface-variant">Level {child.level} • {child.ageGroup} years</p>
                    </div>
                  </div>
                  
                  {editingChildId !== child.id! && (
                    <button 
                      onClick={() => startEditChild(child)}
                      className="text-primary hover:bg-primary-container/20 p-2 rounded-full transition-colors flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  )}
                </div>

                {/* Edit Form */}
                <AnimatePresence>
                  {editingChildId === child.id! && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-outline-variant bg-surface-bright"
                    >
                      <form onSubmit={handleChildSave} className="p-6 space-y-6">
                        {/* Avatar Selection */}
                        <div>
                          <label className="block text-label-md text-on-surface-variant mb-4">Update Avatar</label>
                          <div className="flex flex-wrap gap-3">
                            {AVATAR_OPTIONS.map(avatar => (
                              <button
                                key={avatar.id}
                                type="button"
                                onClick={() => setChildAvatar(avatar.id)}
                                className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
                                  childAvatar === avatar.id ? 'border-primary scale-110 shadow-sm' : 'border-transparent hover:border-outline opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-label-md text-on-surface-variant mb-2">Explorer Name</label>
                            <input
                              type="text"
                              value={childName}
                              onChange={(e) => setChildName(e.target.value)}
                              required
                              className="w-full p-3 rounded-lg border border-outline bg-surface-container-low focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-label-md text-on-surface-variant mb-2">Age Group</label>
                            <div className="flex gap-2 h-[50px]">
                              {(['8-11', '12-16'] as const).map(age => (
                                <button
                                  key={age}
                                  type="button"
                                  onClick={() => setChildAgeGroup(age)}
                                  className={`flex-1 rounded-lg border text-label-md transition-colors ${
                                    childAgeGroup === age ? 'bg-primary-container border-primary text-on-primary-container font-bold' : 'bg-surface-container-low border-outline text-on-surface-variant'
                                  }`}
                                >
                                  {age} years
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-outline-variant">
                          <h4 className="text-label-lg font-bold mb-4">Change Child PIN</h4>
                          <p className="text-caption text-on-surface-variant mb-4">Leave blank to keep their current PIN.</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <input
                                type="password"
                                maxLength={4}
                                value={childPin}
                                onChange={(e) => setChildPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full p-3 text-center tracking-widest rounded-lg border border-outline bg-surface-container-low focus:border-primary outline-none"
                                placeholder="New PIN (••••)"
                              />
                            </div>
                            <div>
                              <input
                                type="password"
                                maxLength={4}
                                value={childConfirmPin}
                                onChange={(e) => setChildConfirmPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full p-3 text-center tracking-widest rounded-lg border border-outline bg-surface-container-low focus:border-primary outline-none"
                                placeholder="Confirm New PIN (••••)"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <button 
                            type="button" 
                            onClick={cancelEditChild}
                            className="px-6 py-2 rounded-full border border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="px-6 py-2 rounded-full bg-secondary text-on-secondary font-bold hover:bg-secondary/90 transition-colors"
                          >
                            Save Child Profile
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
