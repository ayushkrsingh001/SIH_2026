import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { UserRole } from '../types';

const googleProvider = new GoogleAuthProvider();

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  await setDoc(doc(db, 'parents', userCredential.user.uid), {
    email,
    displayName,
    createdAt: serverTimestamp(),
  });
  return userCredential.user;
};

export const loginWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const loginWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const userDoc = await getDoc(doc(db, 'parents', userCredential.user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'parents', userCredential.user.uid), {
      email: userCredential.user.email,
      displayName: userCredential.user.displayName || 'Parent',
      createdAt: serverTimestamp(),
    });
  }
  return userCredential.user;
};

export const logOut = async () => {
  await signOut(auth);
};

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

export const getUserRole = async (user: User): Promise<UserRole> => {
  // Hardcoded admin access for testing
  if (user.email === 'ayushkrsingh91131@gmail.com') {
    return 'admin';
  }

  const tokenResult = await user.getIdTokenResult();
  if (tokenResult.claims.role === 'admin') {
    return 'admin';
  }
  return 'parent';
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
