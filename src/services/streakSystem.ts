import { Timestamp } from 'firebase/firestore';
import type { Child } from '../types';

export const calculateStreak = (child: Child): { streak: number; highestStreak: number; lastLoginDate: Timestamp } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (!child.lastLoginDate) {
    return {
      streak: 1,
      highestStreak: Math.max(1, child.highestStreak || 0),
      lastLoginDate: Timestamp.fromDate(now),
    };
  }

  const lastLogin = child.lastLoginDate.toDate();
  const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
  
  const diffTime = Math.abs(today.getTime() - lastLoginDay.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = child.streak || 0;

  if (diffDays === 1) {
    // Logged in yesterday
    newStreak += 1;
  } else if (diffDays > 1) {
    // Missed a day
    newStreak = 1;
  } else {
    // Logged in today already
    return {
      streak: newStreak,
      highestStreak: child.highestStreak || 0,
      lastLoginDate: child.lastLoginDate,
    };
  }

  return {
    streak: newStreak,
    highestStreak: Math.max(newStreak, child.highestStreak || 0),
    lastLoginDate: Timestamp.fromDate(now),
  };
};
