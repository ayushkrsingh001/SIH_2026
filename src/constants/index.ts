import type { AvatarOption } from '../types';

export const MASCOT_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7u8ueoXNnH1HU2BuSuS4ip2x23h8g77oGg84H7mMsfThBZCMlfEfgxG5PmjyLsBhLL8dWc9Ys7CuiggGaJs8Zex8Kh5hpOtzOdzO7vzK7MHdRUmOBrH_nzgb-_eiVHL1AG94ViU6TDlaZi5AvJeIDkRzoBCKdNRHrGUOxiFuk3SevlVH8_740ZqFnPDkasNtVVxx6xiI9iHB5EhzmbowSy5gc5mU9Di7VdqwNadYyvk0LyqnZ5NQG';

export const MASCOT_SMALL_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB80KvVK5VNH-HAzQEnwqtBvJ6JfO5u-BlgEkhniY0rbITsGSYuPxyMmVeKnDGTWJxFfX14kGWCc-JOBWo7uYuc29OQmUn5nHe8I0SdMvn86slkrWothpnKeBZW5bysRBeLn_xpwBMnGajp5NrNrsBbj5Y7FzQ3RZaO9dnFB8-YFyudRQGBu5dHS-88EFCjjOSk6O9x-W16XccO_2AlXxbSVlomlMv468s0hWHidluc7YSTdfhtHnFD';

export const GOOGLE_LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYgXejh7myx13sm5G0IKsJq_0L8BcV2fE7FxiAVnBcX7J6MMkJFsFQ0NOQVc_ljTrNoX6BeZxg5TAvbfWHFk4vH_aaf8cGYvPweSoJcyz2kfaJw5Al2tQro3x8Th47mW4uQLLkRmuISi8rtj2q1fQivDUbEIHfaUc2ltoNWNcmNkOM1RqE2aP_0CFlvVSdUHmgZJKOZHLqnPhhY2rrkbR-YUvysXN2jdUF5t1evv561c9elZrw0_BU';

export interface PremiumAvatar {
  id: string;
  name: string;
  imageUrl: string;
  cost: number;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'avatar-leo',
    name: 'Leo',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1ZmeXLk4158yLc0DlO9XVVGGeCPFVrQ_qppOAoqhgzeYGbUmO3M85s90rrvJyhadOK4muMuZZpLdeDQ29v4RuVCTsC5qyZH0X7ABMwv9gg0PS2CqMtWyTFH-JCLpogDiAwKYl8X1C5E_SH4DgAEdJEOy6S6AOn5KGDMsrDH_xCWmouK2rJc_8Mw1lot0wfM7H16AFhplWUjplNuBwEu8Tec98ZQxuSHZ6POBnyjw1oNzj-6Y9yo1Y',
  },
  {
    id: 'avatar-maya',
    name: 'Maya',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2Mqvr3m4SCXlsf_kxX3VLETsAWdey0IEgRHzNCsXjH_MK3EICUX_wofneKx1Y-FI_xBRMuUDBXehYH9CCxO5xT1U86jsEaUr5vXc0HDCywWmlA7ObfxIbH4brpCdNMO7PjLHIAcjacx6KbxCxSK7kyNciOC14XfnXWHOxtIInMfIhFjXgq-oCjGMAslIA4Fy7On0VvAzQeekjq9PJKCLDWcsyXHQEgXe-Ck85hYMbPjeBQYxqWbPz',
  },
  {
    id: 'avatar-alex',
    name: 'Alex',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB80KvVK5VNH-HAzQEnwqtBvJ6JfO5u-BlgEkhniY0rbITsGSYuPxyMmVeKnDGTWJxFfX14kGWCc-JOBWo7uYuc29OQmUn5nHe8I0SdMvn86slkrWothpnKeBZW5bysRBeLn_xpwBMnGajp5NrNrsBbj5Y7FzQ3RZaO9dnFB8-YFyudRQGBu5dHS-88EFCjjOSk6O9x-W16XccO_2AlXxbSVlomlMv468s0hWHidluc7YSTdfhtHnFD',
  },
  {
    id: 'avatar-sam',
    name: 'Sam',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7u8ueoXNnH1HU2BuSuS4ip2x23h8g77oGg84H7mMsfThBZCMlfEfgxG5PmjyLsBhLL8dWc9Ys7CuiggGaJs8Zex8Kh5hpOtzOdzO7vzK7MHdRUmOBrH_nzgb-_eiVHL1AG94ViU6TDlaZi5AvJeIDkRzoBCKdNRHrGUOxiFuk3SevlVH8_740ZqFnPDkasNtVVxx6xiI9iHB5EhzmbowSy5gc5mU9Di7VdqwNadYyvk0LyqnZ5NQG',
  },
  {
    id: 'avatar-nora',
    name: 'Nora',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2Mqvr3m4SCXlsf_kxX3VLETsAWdey0IEgRHzNCsXjH_MK3EICUX_wofneKx1Y-FI_xBRMuUDBXehYH9CCxO5xT1U86jsEaUr5vXc0HDCywWmlA7ObfxIbH4brpCdNMO7PjLHIAcjacx6KbxCxSK7kyNciOC14XfnXWHOxtIInMfIhFjXgq-oCjGMAslIA4Fy7On0VvAzQeekjq9PJKCLDWcsyXHQEgXe-Ck85hYMbPjeBQYxqWbPz',
  },
  {
    id: 'avatar-ravi',
    name: 'Ravi',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1ZmeXLk4158yLc0DlO9XVVGGeCPFVrQ_qppOAoqhgzeYGbUmO3M85s90rrvJyhadOK4muMuZZpLdeDQ29v4RuVCTsC5qyZH0X7ABMwv9gg0PS2CqMtWyTFH-JCLpogDiAwKYl8X1C5E_SH4DgAEdJEOy6S6AOn5KGDMsrDH_xCWmouK2rJc_8Mw1lot0wfM7H16AFhplWUjplNuBwEu8Tec98ZQxuSHZ6POBnyjw1oNzj-6Y9yo1Y',
  },
  {
    id: 'avatar-zara',
    name: 'Zara',
    imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zara&backgroundColor=ffd5dc',
  },
  {
    id: 'avatar-kai',
    name: 'Kai',
    imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kai&backgroundColor=d1d4f9',
  },
  {
    id: 'avatar-mia',
    name: 'Mia',
    imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mia&backgroundColor=ffdfbf',
  },
  {
    id: 'avatar-jay',
    name: 'Jay',
    imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jay&backgroundColor=c0aede',
  },
];

export const PREMIUM_AVATARS: PremiumAvatar[] = [
  { id: 'pa1', name: 'Super Hero', imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Hero&backgroundColor=FFD166', cost: 200 },
  { id: 'pa2', name: 'Ninja', imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ninja&backgroundColor=EF476F', cost: 300 },
  { id: 'pa3', name: 'Wizard', imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Wizard&backgroundColor=118AB2', cost: 500 },
  { id: 'pa4', name: 'Astronaut', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Astro&backgroundColor=06D6A0', cost: 200 },
  { id: 'pa5', name: 'Pirate', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pirate&backgroundColor=EF476F', cost: 250 },
  { id: 'pa6', name: 'King', imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=King&backgroundColor=FFD166', cost: 400 },
  { id: 'pa7', name: 'Queen', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Queen&backgroundColor=118AB2', cost: 400 },
  { id: 'pa8', name: 'Knight', imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Knight&backgroundColor=06D6A0', cost: 350 },
  { id: 'pa9', name: 'Dragon', imageUrl: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Dragon&backgroundColor=EF476F', cost: 500 },
  { id: 'pa10', name: 'Unicorn', imageUrl: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Unicorn&backgroundColor=118AB2', cost: 500 },
  { id: 'pa11', name: 'Detective', imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Detective&backgroundColor=06D6A0', cost: 300 },
  { id: 'pa12', name: 'Explorer', imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Explore&backgroundColor=FFD166', cost: 200 },
  { id: 'pa13', name: 'Chef', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chef&backgroundColor=EF476F', cost: 150 },
  { id: 'pa14', name: 'Pilot', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pilot&backgroundColor=118AB2', cost: 250 },
  { id: 'pa15', name: 'Doctor', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Doc&backgroundColor=06D6A0', cost: 300 },
  { id: 'pa16', name: 'Artist', imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Artist&backgroundColor=FFD166', cost: 200 },
  { id: 'pa17', name: 'Musician', imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Music&backgroundColor=EF476F', cost: 200 },
  { id: 'pa18', name: 'Athlete', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sport&backgroundColor=118AB2', cost: 150 },
  { id: 'pa19', name: 'Scientist', imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Science&backgroundColor=06D6A0', cost: 400 },
  { id: 'pa20', name: 'Magician', imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Magic&backgroundColor=FFD166', cost: 450 },
];

export const HELP_CATEGORIES = [
  { value: 'bullying', label: 'Bullying' },
  { value: 'safety', label: 'Safety Concern' },
  { value: 'rights_question', label: 'Rights Question' },
  { value: 'other', label: 'Other' },
] as const;

export const MAX_CHILDREN = 5;

// ========== COMMUNITY PLATFORM CONSTANTS ==========

import type { CommunityCategory, CommunityCategoryId } from '../types';

export const COMMUNITY_CATEGORIES: CommunityCategory[] = [
  { id: 'girls_safety', label: 'Girls Safety', icon: 'female', emoji: '👧', color: '#E91E63', bgAccent: 'rgba(233, 30, 99, 0.08)', badgeLabel: 'Girls Safety Champion' },
  { id: 'child_rights', label: 'Child Rights', icon: 'child_care', emoji: '👦', color: '#2196F3', bgAccent: 'rgba(33, 150, 243, 0.08)', badgeLabel: 'Child Rights Advocate' },
  { id: 'cyber_safety', label: 'Cyber Safety', icon: 'security', emoji: '💻', color: '#9C27B0', bgAccent: 'rgba(156, 39, 176, 0.08)', badgeLabel: 'Cyber Guardian' },
  { id: 'self_defence', label: 'Self Defence', icon: 'shield', emoji: '🛡', color: '#FF5722', bgAccent: 'rgba(255, 87, 34, 0.08)', badgeLabel: 'Defence Expert' },
  { id: 'police_awareness', label: 'Police Awareness', icon: 'local_police', emoji: '🚔', color: '#3F51B5', bgAccent: 'rgba(63, 81, 181, 0.08)', badgeLabel: 'Law Aware' },
  { id: 'mental_health', label: 'Mental Health', icon: 'psychology', emoji: '🧠', color: '#00BCD4', bgAccent: 'rgba(0, 188, 212, 0.08)', badgeLabel: 'Wellness Champion' },
  { id: 'road_safety', label: 'Road Safety', icon: 'traffic', emoji: '🚦', color: '#FF9800', bgAccent: 'rgba(255, 152, 0, 0.08)', badgeLabel: 'Road Safety Star' },
  { id: 'consumer_rights', label: 'Consumer Rights', icon: 'gavel', emoji: '⚖', color: '#795548', bgAccent: 'rgba(121, 85, 72, 0.08)', badgeLabel: 'Consumer Champion' },
  { id: 'environment', label: 'Environment', icon: 'eco', emoji: '🌍', color: '#4CAF50', bgAccent: 'rgba(76, 175, 80, 0.08)', badgeLabel: 'Eco Warrior' },
  { id: 'constitution', label: 'Constitution', icon: 'account_balance', emoji: '📚', color: '#607D8B', bgAccent: 'rgba(96, 125, 139, 0.08)', badgeLabel: 'Constitution Scholar' },
  { id: 'school_safety', label: 'School Safety', icon: 'school', emoji: '🏫', color: '#009688', bgAccent: 'rgba(0, 150, 136, 0.08)', badgeLabel: 'School Safety Pro' },
  { id: 'digital_privacy', label: 'Digital Privacy', icon: 'phonelink_lock', emoji: '📱', color: '#673AB7', bgAccent: 'rgba(103, 58, 183, 0.08)', badgeLabel: 'Privacy Guardian' },
];

export const getCategoryById = (id: CommunityCategoryId): CommunityCategory =>
  COMMUNITY_CATEGORIES.find(c => c.id === id) || COMMUNITY_CATEGORIES[0];

export const EMERGENCY_NUMBERS = [
  { number: '112', label: 'National Emergency', icon: 'emergency' },
  { number: '1098', label: 'Childline', icon: 'child_care' },
  { number: '1091', label: 'Women Helpline', icon: 'female' },
  { number: '1930', label: 'Cyber Crime', icon: 'security' },
  { number: '100', label: 'Police', icon: 'local_police' },
  { number: '101', label: 'Fire', icon: 'local_fire_department' },
  { number: '108', label: 'Ambulance', icon: 'emergency' },
];

export const EVENT_TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  police_workshop: { label: 'Police Workshop', icon: 'local_police', color: '#3F51B5' },
  cyber_awareness: { label: 'Cyber Awareness Camp', icon: 'security', color: '#9C27B0' },
  legal_aid: { label: 'Legal Aid Camp', icon: 'gavel', color: '#795548' },
  ngo_drive: { label: 'NGO Awareness Drive', icon: 'volunteer_activism', color: '#4CAF50' },
  women_safety: { label: 'Women Safety Workshop', icon: 'female', color: '#E91E63' },
  child_rights: { label: 'Child Rights Event', icon: 'child_care', color: '#2196F3' },
};

export const STORY_TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  experience: { label: 'Experience', icon: 'auto_stories', color: '#2196F3' },
  incident: { label: 'Incident', icon: 'report', color: '#F44336' },
  success_story: { label: 'Success Story', icon: 'emoji_events', color: '#4CAF50' },
  question: { label: 'Question', icon: 'help', color: '#FF9800' },
  advice: { label: 'Advice', icon: 'lightbulb', color: '#9C27B0' },
};

export const VERIFIED_TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  legal_expert: { label: 'Verified Legal Expert', icon: 'verified', color: '#2196F3' },
  ngo: { label: 'Verified NGO', icon: 'volunteer_activism', color: '#4CAF50' },
  police: { label: 'Verified Police', icon: 'local_police', color: '#3F51B5' },
  teacher: { label: 'Verified Teacher', icon: 'school', color: '#FF9800' },
  parent_mentor: { label: 'Verified Parent Mentor', icon: 'supervisor_account', color: '#9C27B0' },
};

export const SCAM_SEVERITY_META: Record<string, { label: string; color: string; bgColor: string }> = {
  high: { label: 'High Risk', color: '#D32F2F', bgColor: 'rgba(211, 47, 47, 0.1)' },
  medium: { label: 'Medium Risk', color: '#F57C00', bgColor: 'rgba(245, 124, 0, 0.1)' },
  low: { label: 'Low Risk', color: '#FBC02D', bgColor: 'rgba(251, 192, 45, 0.1)' },
};

