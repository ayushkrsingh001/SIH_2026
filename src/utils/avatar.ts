import { AVATAR_OPTIONS, PREMIUM_AVATARS } from '../constants';

export const resolveAvatarUrl = (avatarIdOrUrl?: string): string => {
  if (!avatarIdOrUrl) return AVATAR_OPTIONS[0].imageUrl;
  
  // If it's already a full URL or data URI, return as is
  if (avatarIdOrUrl.startsWith('http') || avatarIdOrUrl.startsWith('data:')) {
    return avatarIdOrUrl;
  }
  
  // Check premium avatars
  const premium = PREMIUM_AVATARS.find(a => a.id === avatarIdOrUrl);
  if (premium) {
    return premium.imageUrl;
  }
  
  // Check basic options
  const basic = AVATAR_OPTIONS.find(a => a.id === avatarIdOrUrl);
  if (basic) {
    return basic.imageUrl;
  }
  
  // Fallback
  return AVATAR_OPTIONS[0].imageUrl;
};
