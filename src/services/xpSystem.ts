import { XP_LEVELS } from '../types';

export const calculateLevel = (xp: number): { level: number; title: string } => {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].minXp) {
      return { level: XP_LEVELS[i].level, title: XP_LEVELS[i].title };
    }
  }
  return { level: 1, title: 'Beginner' };
};

export const getXpForNextLevel = (xp: number): { current: number; next: number; progress: number } => {
  const currentLevelData = calculateLevel(xp);
  const currentLevelIndex = XP_LEVELS.findIndex(l => l.level === currentLevelData.level);
  const nextLevelIndex = currentLevelIndex + 1;

  if (nextLevelIndex >= XP_LEVELS.length) {
    return { current: xp, next: xp, progress: 100 };
  }

  const currentMin = XP_LEVELS[currentLevelIndex].minXp;
  const nextMin = XP_LEVELS[nextLevelIndex].minXp;
  const progress = ((xp - currentMin) / (nextMin - currentMin)) * 100;

  return { current: xp - currentMin, next: nextMin - currentMin, progress: Math.min(progress, 100) };
};
