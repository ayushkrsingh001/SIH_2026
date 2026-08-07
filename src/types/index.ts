import type { Timestamp } from 'firebase/firestore';

export interface Parent {
  id?: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
}

export interface Child {
  id?: string;
  parentId?: string;
  displayName: string;
  avatarId: string;
  ageGroup: '8-11' | '12-16';
  pinHash: string;
  xp: number;
  level: number;
  coins: number;
  streak: number;
  highestStreak: number;
  lastLoginDate: Timestamp | null;
  badgeIds: string[];
  unlockedAvatarIds: string[];
  unlockedTitles: string[];
  currentTitle: string | null;
  languagePref: 'en' | 'hi';
  createdAt: Timestamp;
  lastActive: Timestamp;
  // New Analytics Fields
  safetyScore?: number; // 0-100 based on safety questions
  completedLevelsCount?: number;
  achievements?: string[];
  weakTopics?: string[];
  strongTopics?: string[];
}

export interface Module {
  id?: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Boss';
  estimatedMinutes: number;
  ageRange: '8-11' | '12-16' | 'all';
  order: number;
  xpReward: number;
  coinReward: number;
  coverImageUrl: string;
  prerequisiteModuleId: string | null;
  isBoss?: boolean;
}

export interface Choice {
  id?: string;
  text: string;
  isCorrect: boolean;
  feedbackText: string;
  nextSceneId: string | null;
  educationalTip?: string; // specific learning takeaway
}

export interface DangerZone {
  id: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  radius: number; // percentage
  description: string;
}

export interface DragItem {
  id: string;
  text: string;
  targetId: string;
}

export interface DragTarget {
  id: string;
  label: string;
}

export interface MatchPair {
  id: string;
  leftItem: string;
  rightItem: string;
}

export interface SequenceItem {
  id: string;
  text: string;
  correctOrder: number;
}

export interface Scene {
  id?: string;
  moduleId?: string;
  type: 'story' | 'choice' | 'spot_danger' | 'time_challenge' | 'drag_drop' | 'match_pair' | 'order_sequence' | 'puzzle' | 'conversation' | 'image_decision';
  text: string;
  scenario?: string; // Additional context
  mediaUrl: string | null;
  choices: Choice[];
  order?: number;
  nextSceneId?: string | null;
  educationalTip?: string;
  relatedLegalInfo?: string;
  
  // Specific to spot_danger
  dangerZones?: DangerZone[];
  
  // Specific to time_challenge
  timeLimit?: number; // in seconds
  
  // Specific to drag_drop
  dragItems?: DragItem[];
  dragTargets?: DragTarget[];
  
  // Specific to match_pair
  pairs?: MatchPair[];
  
  // Specific to order_sequence
  sequenceItems?: SequenceItem[];
}

export interface CategoryScore {
  totalAttempted: number;
  correctAnswers: number;
}

export interface Progress {
  id?: string;
  parentId: string;
  childId: string;
  moduleId: string;
  visitedSceneIds: string[];
  score: number;
  status: 'in_progress' | 'completed';
  categoryScores?: Record<string, CategoryScore>; // Maps category name to score for analytics
  completedAt: Timestamp | null;
  timeSpent?: number; // seconds
  accuracy?: number; // percentage
}

export interface Badge {
  id?: string;
  title: string;
  iconUrl: string;
  icon?: string;
  criteriaType: 'modules_completed' | 'perfect_score' | 'streak';
  criteriaValue: number;
  description?: string;
}

export interface StoreItem {
  id: string;
  type: 'avatar' | 'title';
  name: string;
  description: string;
  cost: number;
  imageUrl?: string;
}

// ========== COMMUNITY PLATFORM TYPES ==========

export interface ParentPost {
  id?: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  isAnonymous: boolean;
  title: string;
  description: string;
  category: string;
  mediaUrls: string[]; // URLs from Firebase Storage
  tags: string[];
  visibility: 'public' | 'connections_only'; // Ready for future connections feature
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  status: 'active' | 'deleted' | 'flagged';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PostComment {
  id?: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  text: string;
  likesCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PostLike {
  id?: string;
  postId: string;
  userId: string;
  createdAt: Timestamp;
}

export interface PostBookmark {
  id?: string;
  postId: string;
  userId: string;
  createdAt: Timestamp;
}

export interface PostReport {
  id?: string;
  postId: string;
  reporterId: string;
  reason: 'Spam' | 'Harassment' | 'False Information' | 'Child Safety Concern' | 'Violence' | 'Other';
  details: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Timestamp;
}

export interface Notification {
  id?: string;
  userId: string; // The user receiving the notification
  actorId: string; // The user who did the action
  actorName: string;
  actorPhoto?: string;
  type: 'like' | 'comment' | 'mention' | 'share';
  postId: string;
  read: boolean;
  createdAt: Timestamp;
}

export interface SupportRequest {
  id?: string;
  childRefPath: string | null;
  category: 'bullying' | 'safety' | 'rights_question' | 'other';
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  assignedOrgId: string | null;
  createdAt: Timestamp;
}

export interface Organization {
  id?: string;
  name: string;
  type: 'NGO' | 'LegalAid' | 'Helpline';
  verified: boolean;
  contactInfo: string;
  resourceLinks: string[];
  description?: string;
}

export interface Feedback {
  id?: string;
  parentId: string | null;
  childRefPath: string | null;
  rating: number;
  comments: string;
  screenContext: string;
  createdAt: Timestamp;
}

export interface AvatarOption {
  id: string;
  name: string;
  imageUrl: string;
}

export type UserRole = 'parent' | 'admin';

// ========== AI GENERATED LEVEL TYPES ==========

export interface AIQuestion {
  type: 'mcq' | 'true_false' | 'decision' | 'spot_danger' | 'order_sequence' | 'scenario';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  legalFact: string;
  xp: number;
}

export interface AIGeneratedLevel {
  world: string;
  level: number;
  title: string;
  story: string;
  difficulty: string;
  estimatedTime: string;
  learningObjective: string;
  questions: AIQuestion[];
  reward: { coins: number; xp: number; badge?: string };
}

export interface LevelContext {
  playerAge: string;
  currentWorld: number;
  currentLevel: number;
  difficulty: string;
  completedTopics: string[];
  weakTopics: string[];
  strongTopics: string[];
  language: string;
  currentXp: number;
  badgesEarned: string[];
  avoidQuestions: string[];
}

export interface CachedAILevel {
  id?: string;
  childId: string;
  parentId: string;
  type: 'bonus_story' | 'daily_challenge' | 'revision' | 'practice' | 'event';
  topic?: string;
  generatedAt: Timestamp;
  expiresAt: Timestamp | null;
  levelData: AIGeneratedLevel;
  status: 'unplayed' | 'in_progress' | 'completed';
  score?: number;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
}

export const XP_LEVELS: { level: number; minXp: number; title: string }[] = [
  { level: 1, minXp: 0, title: 'Beginner' },
  { level: 2, minXp: 100, title: 'Apprentice' },
  { level: 3, minXp: 250, title: 'Explorer' },
  { level: 4, minXp: 500, title: 'Adventurer' },
  { level: 5, minXp: 800, title: 'Navigator' },
  { level: 6, minXp: 1200, title: 'Scholar' },
  { level: 7, minXp: 1700, title: 'Champion' },
  { level: 8, minXp: 2300, title: 'Guardian' },
  { level: 9, minXp: 3000, title: 'Protector' },
  { level: 10, minXp: 4000, title: 'Rights Hero' },
  { level: 11, minXp: 5500, title: 'Master' },
  { level: 12, minXp: 7500, title: 'Grandmaster' },
  { level: 13, minXp: 10000, title: 'Legend' },
];
