import type { Timestamp } from 'firebase/firestore';

export interface Parent {
  id?: string;
  email: string;
  displayName: string;
  pin?: string;
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

// ========== COMMUNITY PLATFORM V2 TYPES ==========

export type CommunityCategoryId =
  | 'girls_safety'
  | 'child_rights'
  | 'cyber_safety'
  | 'self_defence'
  | 'police_awareness'
  | 'mental_health'
  | 'road_safety'
  | 'consumer_rights'
  | 'environment'
  | 'constitution'
  | 'school_safety'
  | 'digital_privacy';

export interface CommunityCategory {
  id: CommunityCategoryId;
  label: string;
  icon: string;
  emoji: string;
  color: string;
  bgAccent: string;
  badgeLabel: string;
}

export interface Campaign {
  id?: string;
  title: string;
  description: string;
  bannerUrl: string;
  imageUrl: string;
  categoryId: CommunityCategoryId;
  rewardXP: number;
  rewardCoins: number;
  rewardBadge?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  totalTasks: number;
  quizQuestions: CampaignQuizQuestion[];
  learningResources: LearningResource[];
  participantCount: number;
  status: 'active' | 'upcoming' | 'ended';
  createdAt: Timestamp;
}

export interface CampaignQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface LearningResource {
  title: string;
  type: 'article' | 'video' | 'infographic';
  url: string;
  description: string;
}

export interface CampaignParticipation {
  id?: string;
  campaignId: string;
  userId: string;
  joinedAt: Timestamp;
  completedTasks: number;
  quizScore: number;
  quizCompleted: boolean;
  resourcesRead: string[];
  completed: boolean;
  completedAt: Timestamp | null;
}

export interface WeeklyChallenge {
  id?: string;
  title: string;
  description: string;
  weekStartDate: Timestamp;
  weekEndDate: Timestamp;
  tasks: WeeklyChallengeTask[];
  rewardXP: number;
  rewardCoins: number;
  rewardBadge: string;
  status: 'active' | 'upcoming' | 'ended';
  createdAt: Timestamp;
}

export interface WeeklyChallengeTask {
  id: string;
  title: string;
  description: string;
  type: 'read_posts' | 'complete_quiz' | 'share_awareness' | 'learn_tips' | 'comment';
  targetCount: number;
  icon: string;
}

export interface WeeklyChallengeProgress {
  id?: string;
  challengeId: string;
  userId: string;
  taskProgress: Record<string, number>;
  completed: boolean;
  completedAt: Timestamp | null;
  createdAt: Timestamp;
}

export interface NearbyEvent {
  id?: string;
  title: string;
  description: string;
  type: 'police_workshop' | 'cyber_awareness' | 'legal_aid' | 'ngo_drive' | 'women_safety' | 'child_rights';
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  date: Timestamp;
  endDate?: Timestamp;
  organizerName: string;
  registeredCount: number;
  maxCapacity: number;
  imageUrl?: string;
  mapsLink: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  createdAt: Timestamp;
}

export interface EventRegistration {
  id?: string;
  eventId: string;
  userId: string;
  registeredAt: Timestamp;
}

export interface LegalAIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  relatedLevels?: string[];
  emergencyNumbers?: string[];
}

export interface ChatSession {
  id?: string;
  userId: string;
  messages: LegalAIChatMessage[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  title: string;
}

export interface NewsQuizEmbedded {
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    xpReward: number;
  }[];
}

export interface LegalNewsItem {
  id?: string;
  originalTitle: string;
  title: string;
  source: string;
  sourceUrl: string;
  image: string;
  category: string;
  summary: string;
  parentExplanation: string;
  whatHappened: string;
  lessons: string;
  safetyTips: string[];
  legalPoints: string;
  helplineNumbers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  relatedTopic: string;
  relatedLevel: string;
  quiz: NewsQuizEmbedded;
  xpReward: number;
  createdAt: Timestamp;
  status: 'active' | 'pending' | 'flagged' | 'deleted';
  
  // Interactions
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  sharesCount: number;
}

export interface NewsQuizQuestion {
  question: string;
  type: 'mcq' | 'true_false' | 'decision';
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface NewsQuiz {
  id?: string;
  newsId: string;
  questions: NewsQuizQuestion[];
  totalXP: number;
}

export interface NewsComment {
  id?: string;
  newsId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  text: string;
  likesCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NewsLike {
  id?: string;
  newsId: string;
  userId: string;
  createdAt: Timestamp;
}

export interface NewsBookmark {
  id?: string;
  newsId: string;
  userId: string;
  createdAt: Timestamp;
}

export interface NewsReadStatus {
  id?: string;
  newsId: string;
  userId: string;
  readAt: Timestamp;
  xpAwarded: boolean;
}

export interface MythFact {
  id?: string;
  myth: string;
  fact: string;
  explanation: string;
  legalInfo: string;
  categoryId: CommunityCategoryId;
  rewardXP: number;
  order: number;
  createdAt: Timestamp;
}

export interface MythFactProgress {
  id?: string;
  mythFactId: string;
  userId: string;
  completed: boolean;
  completedAt: Timestamp;
}

export interface FeedQuiz {
  id?: string;
  postId: string;
  questions: FeedQuizQuestion[];
  rewardXP: number;
  createdAt: Timestamp;
}

export interface FeedQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface FeedQuizAttempt {
  id?: string;
  quizId: string;
  userId: string;
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  xpAwarded: boolean;
  completedAt: Timestamp;
}

export interface AwarenessShort {
  id?: string;
  title: string;
  description: string;
  categoryId: CommunityCategoryId;
  mediaUrl: string;
  mediaType: 'video' | 'animation' | 'image_slideshow';
  thumbnailUrl: string;
  durationSeconds: number;
  likesCount: number;
  bookmarksCount: number;
  sharesCount: number;
  viewsCount: number;
  rewardXP: number;
  tags: string[];
  createdAt: Timestamp;
}

export interface ShortInteraction {
  id?: string;
  shortId: string;
  userId: string;
  watched: boolean;
  watchedPercent: number;
  liked: boolean;
  bookmarked: boolean;
  xpAwarded: boolean;
  updatedAt: Timestamp;
}

export type StoryType = 'experience' | 'incident' | 'success_story' | 'question' | 'advice';

export interface RealStory {
  id?: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  isAnonymous: boolean;
  title: string;
  content: string;
  storyType: StoryType;
  categoryId: CommunityCategoryId;
  mediaUrls: string[];
  tags: string[];
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  sharesCount: number;
  isVerifiedAuthor: boolean;
  verifiedType?: VerifiedType;
  status: 'active' | 'pending' | 'flagged' | 'deleted';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type VerifiedType = 'legal_expert' | 'ngo' | 'police' | 'teacher' | 'parent_mentor';

export interface VerifiedUser {
  id?: string;
  userId: string;
  displayName: string;
  photoUrl?: string;
  verifiedType: VerifiedType;
  organization?: string;
  verifiedAt: Timestamp;
  verifiedBy: string;
  isActive: boolean;
}

export type ScamSeverity = 'high' | 'medium' | 'low';

export interface ScamAlert {
  id?: string;
  title: string;
  description: string;
  scamType: string;
  severity: ScamSeverity;
  howItWorks: string;
  howToStaySafe: string;
  reportLink?: string;
  categoryId: CommunityCategoryId;
  imageUrl?: string;
  rewardXP: number;
  quizQuestions: ScamQuizQuestion[];
  reportCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ScamQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ScamAlertInteraction {
  id?: string;
  alertId: string;
  userId: string;
  read: boolean;
  quizCompleted: boolean;
  quizScore: number;
  bookmarked: boolean;
  reported: boolean;
  xpAwarded: boolean;
  updatedAt: Timestamp;
}

export type BookmarkContentType = 'post' | 'story' | 'news' | 'event' | 'short' | 'scam_alert' | 'myth_fact';

export interface CommunityBookmark {
  id?: string;
  userId: string;
  contentType: BookmarkContentType;
  contentId: string;
  createdAt: Timestamp;
}

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
