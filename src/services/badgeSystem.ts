import type { Badge, Progress } from '../types';

export const checkBadgeEligibility = (
  badge: Badge,
  allProgress: Progress[],
  currentBadgeIds: string[]
): boolean => {
  if (currentBadgeIds.includes(badge.id!)) return false;

  const completedModules = allProgress.filter(p => p.status === 'completed');

  switch (badge.criteriaType) {
    case 'modules_completed':
      return completedModules.length >= badge.criteriaValue;
    case 'perfect_score':
      return completedModules.filter(p => p.score === 100).length >= badge.criteriaValue;
    case 'streak':
      return completedModules.length >= badge.criteriaValue;
    default:
      return false;
  }
};

export const getNewlyEarnedBadges = (
  allBadges: Badge[],
  allProgress: Progress[],
  currentBadgeIds: string[]
): Badge[] => {
  return allBadges.filter(badge =>
    checkBadgeEligibility(badge, allProgress, currentBadgeIds)
  );
};
