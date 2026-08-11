import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
  onSnapshot,
  increment,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import type {
  Campaign,
  CampaignParticipation,
  WeeklyChallenge,
  WeeklyChallengeProgress,
  NearbyEvent,
  ChatSession,
  LegalNewsItem,
  MythFact,
  NewsQuiz,
  FeedQuiz,
  FeedQuizAttempt,
  AwarenessShort,
  ShortInteraction,
  RealStory,
  VerifiedUser,
  ScamAlert,
  ScamAlertInteraction,
  CommunityBookmark,
  BookmarkContentType,
  ParentPost,
  CommunityCategoryId,
  PostComment,
  LegalAIChatMessage,
} from '../types';

// ========== CAMPAIGNS ==========

export const subscribeToCampaigns = (callback: (campaigns: Campaign[]) => void) => {
  const q = query(
    collection(db, 'campaigns'),
    where('status', 'in', ['active', 'upcoming']),
    orderBy('startDate', 'desc'),
    limit(10)
  );
  return onSnapshot(q, (snapshot) => {
    const campaigns = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Campaign));
    callback(campaigns);
  }, (error) => {
    console.error('Campaigns subscription error:', error);
    callback([]);
  });
};

export const getCampaignById = async (campaignId: string): Promise<Campaign | null> => {
  const snap = await getDoc(doc(db, 'campaigns', campaignId));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Campaign : null;
};

export const joinCampaign = async (campaignId: string, userId: string): Promise<string> => {
  const participationRef = await addDoc(collection(db, 'campaignParticipations'), {
    campaignId,
    userId,
    joinedAt: serverTimestamp(),
    completedTasks: 0,
    quizScore: 0,
    quizCompleted: false,
    resourcesRead: [],
    completed: false,
    completedAt: null,
  });
  await updateDoc(doc(db, 'campaigns', campaignId), {
    participantCount: increment(1),
  });
  return participationRef.id;
};

export const getCampaignParticipation = async (
  campaignId: string,
  userId: string
): Promise<CampaignParticipation | null> => {
  const q = query(
    collection(db, 'campaignParticipations'),
    where('campaignId', '==', campaignId),
    where('userId', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as CampaignParticipation;
};

export const updateCampaignParticipation = async (
  participationId: string,
  data: Partial<CampaignParticipation>
) => {
  await updateDoc(doc(db, 'campaignParticipations', participationId), data);
};

// ========== WEEKLY CHALLENGES ==========

export const subscribeToActiveChallenge = (callback: (challenge: WeeklyChallenge | null) => void) => {
  const q = query(
    collection(db, 'weeklyChallenges'),
    where('status', '==', 'active'),
    limit(1)
  );
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
      return;
    }
    callback({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as WeeklyChallenge);
  }, (error) => {
    console.error('Weekly challenge subscription error:', error);
    callback(null);
  });
};

export const getChallengeProgress = async (
  challengeId: string,
  userId: string
): Promise<WeeklyChallengeProgress | null> => {
  const q = query(
    collection(db, 'weeklyChallengeProgress'),
    where('challengeId', '==', challengeId),
    where('userId', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as WeeklyChallengeProgress;
};

export const updateChallengeProgress = async (
  challengeId: string,
  userId: string,
  taskId: string,
  incrementBy: number = 1
) => {
  const existing = await getChallengeProgress(challengeId, userId);
  if (existing?.id) {
    const newProgress = { ...existing.taskProgress };
    newProgress[taskId] = (newProgress[taskId] || 0) + incrementBy;
    await updateDoc(doc(db, 'weeklyChallengeProgress', existing.id), {
      taskProgress: newProgress,
    });
  } else {
    await addDoc(collection(db, 'weeklyChallengeProgress'), {
      challengeId,
      userId,
      taskProgress: { [taskId]: incrementBy },
      completed: false,
      completedAt: null,
      createdAt: serverTimestamp(),
    });
  }
};

export const markChallengeComplete = async (progressId: string) => {
  await updateDoc(doc(db, 'weeklyChallengeProgress', progressId), {
    completed: true,
    completedAt: serverTimestamp(),
  });
};

// ========== NEARBY EVENTS ==========

export const subscribeToNearbyEvents = (callback: (events: NearbyEvent[]) => void) => {
  const q = query(
    collection(db, 'nearbyEvents'),
    where('status', 'in', ['upcoming', 'ongoing']),
    orderBy('date', 'asc'),
    limit(20)
  );
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NearbyEvent));
    callback(events);
  }, (error) => {
    console.error('Events subscription error:', error);
    callback([]);
  });
};

export const registerForEvent = async (eventId: string, userId: string): Promise<string> => {
  const ref = await addDoc(collection(db, 'eventRegistrations'), {
    eventId,
    userId,
    registeredAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'nearbyEvents', eventId), {
    registeredCount: increment(1),
  });
  return ref.id;
};

export const unregisterFromEvent = async (eventId: string, userId: string) => {
  const q = query(
    collection(db, 'eventRegistrations'),
    where('eventId', '==', eventId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    await deleteDoc(snapshot.docs[0].ref);
    await updateDoc(doc(db, 'nearbyEvents', eventId), {
      registeredCount: increment(-1),
    });
  }
};

export const checkEventRegistration = async (eventId: string, userId: string): Promise<boolean> => {
  const q = query(
    collection(db, 'eventRegistrations'),
    where('eventId', '==', eventId),
    where('userId', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// ========== LEGAL AI CHAT ==========

export const saveChatSession = async (
  userId: string,
  messages: LegalAIChatMessage[],
  title: string,
  existingSessionId?: string
): Promise<string> => {
  if (existingSessionId) {
    await updateDoc(doc(db, 'chatSessions', existingSessionId), {
      messages,
      updatedAt: serverTimestamp(),
      title,
    });
    return existingSessionId;
  }
  const ref = await addDoc(collection(db, 'chatSessions'), {
    userId,
    messages,
    title,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const getChatSessions = async (userId: string): Promise<ChatSession[]> => {
  const q = query(
    collection(db, 'chatSessions'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatSession));
};

export const getChatSession = async (sessionId: string): Promise<ChatSession | null> => {
  const snap = await getDoc(doc(db, 'chatSessions', sessionId));
  return snap.exists() ? { id: snap.id, ...snap.data() } as ChatSession : null;
};

export const deleteChatSession = async (sessionId: string) => {
  await deleteDoc(doc(db, 'chatSessions', sessionId));
};

// ========== LEGAL NEWS ==========

export const subscribeToLegalNews = (callback: (news: LegalNewsItem[]) => void) => {
  const q = query(
    collection(db, 'legalNews'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snapshot) => {
    const news = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LegalNewsItem));
    callback(news);
  }, (error) => {
    console.error('Legal news subscription error:', error);
    callback([]);
  });
};

export const markNewsRead = async (newsId: string, userId: string): Promise<boolean> => {
  const q = query(
    collection(db, 'newsReadStatus'),
    where('newsId', '==', newsId),
    where('userId', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    await addDoc(collection(db, 'newsReadStatus'), {
      newsId,
      userId,
      readAt: serverTimestamp(),
      xpAwarded: true
    });
    return true; // First time reading
  }
  return false;
};

// --- New Automated News Interactions ---

export const getNewsQuiz = async (newsId: string) => {
  const q = query(collection(db, 'newsQuiz'), where('newsId', '==', newsId), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as NewsQuiz;
};

export const likeNews = async (newsId: string, userId: string): Promise<boolean> => {
  const q = query(collection(db, 'newsLikes'), where('newsId', '==', newsId), where('userId', '==', userId));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    await addDoc(collection(db, 'newsLikes'), { newsId, userId, createdAt: serverTimestamp() });
    await updateDoc(doc(db, 'legalNews', newsId), { likesCount: increment(1) });
    return true;
  } else {
    await deleteDoc(snap.docs[0].ref);
    await updateDoc(doc(db, 'legalNews', newsId), { likesCount: increment(-1) });
    return false;
  }
};

export const bookmarkNews = async (newsId: string, userId: string): Promise<boolean> => {
  const q = query(collection(db, 'newsBookmarks'), where('newsId', '==', newsId), where('userId', '==', userId));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    await addDoc(collection(db, 'newsBookmarks'), { newsId, userId, createdAt: serverTimestamp() });
    await updateDoc(doc(db, 'legalNews', newsId), { bookmarksCount: increment(1) });
    return true;
  } else {
    await deleteDoc(snap.docs[0].ref);
    await updateDoc(doc(db, 'legalNews', newsId), { bookmarksCount: increment(-1) });
    return false;
  }
};

export const addViewToNews = async (newsId: string) => {
  const newsRef = doc(db, 'legalNews', newsId);
  await updateDoc(newsRef, { viewsCount: increment(1) }).catch(() => {});
};

export const subscribeToNewsComments = (newsId: string, callback: (comments: any[]) => void) => {
  const q = query(collection(db, 'newsComments'), where('newsId', '==', newsId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};

export const addNewsComment = async (comment: any) => {
  const ref = await addDoc(collection(db, 'newsComments'), {
    ...comment,
    likesCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'legalNews', comment.newsId), { commentsCount: increment(1) });
  return ref.id;
};

export const getReadNewsIds = async (userId: string): Promise<string[]> => {
  const q = query(
    collection(db, 'newsReadStatus'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => d.data().newsId);
};

// ========== MYTH VS FACT ==========

export const subscribeToMythFacts = (callback: (mythFacts: MythFact[]) => void) => {
  const q = query(
    collection(db, 'mythFacts'),
    orderBy('order', 'asc'),
    limit(30)
  );
  return onSnapshot(q, (snapshot) => {
    const mythFacts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MythFact));
    callback(mythFacts);
  }, (error) => {
    console.error('Myth facts subscription error:', error);
    callback([]);
  });
};

export const markMythFactCompleted = async (mythFactId: string, userId: string): Promise<boolean> => {
  const q = query(
    collection(db, 'mythFactProgress'),
    where('mythFactId', '==', mythFactId),
    where('userId', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) return false;
  await addDoc(collection(db, 'mythFactProgress'), {
    mythFactId,
    userId,
    completed: true,
    completedAt: serverTimestamp(),
  });
  return true;
};

export const getCompletedMythFactIds = async (userId: string): Promise<string[]> => {
  const q = query(
    collection(db, 'mythFactProgress'),
    where('userId', '==', userId),
    where('completed', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => d.data().mythFactId);
};

// ========== FEED QUIZZES ==========

export const getQuizForPost = async (postId: string): Promise<FeedQuiz | null> => {
  const q = query(
    collection(db, 'feedQuizzes'),
    where('postId', '==', postId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as FeedQuiz;
};

export const submitQuizAttempt = async (
  quizId: string,
  userId: string,
  answers: Record<string, string>,
  score: number,
  totalQuestions: number
): Promise<string> => {
  const ref = await addDoc(collection(db, 'feedQuizAttempts'), {
    quizId,
    userId,
    answers,
    score,
    totalQuestions,
    xpAwarded: true,
    completedAt: serverTimestamp(),
  });
  return ref.id;
};

export const getQuizAttempt = async (quizId: string, userId: string): Promise<FeedQuizAttempt | null> => {
  const q = query(
    collection(db, 'feedQuizAttempts'),
    where('quizId', '==', quizId),
    where('userId', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as FeedQuizAttempt;
};

// ========== AWARENESS SHORTS ==========

export const subscribeToShorts = (callback: (shorts: AwarenessShort[]) => void) => {
  const q = query(
    collection(db, 'awarenessShorts'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snapshot) => {
    const shorts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AwarenessShort));
    callback(shorts);
  }, (error) => {
    console.error('Shorts subscription error:', error);
    callback([]);
  });
};

export const updateShortInteraction = async (
  shortId: string,
  userId: string,
  data: Partial<ShortInteraction>
) => {
  const q = query(
    collection(db, 'shortInteractions'),
    where('shortId', '==', shortId),
    where('userId', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    await addDoc(collection(db, 'shortInteractions'), {
      shortId,
      userId,
      watched: false,
      watchedPercent: 0,
      liked: false,
      bookmarked: false,
      xpAwarded: false,
      ...data,
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(snapshot.docs[0].ref, { ...data, updatedAt: serverTimestamp() });
  }
};

export const toggleShortLike = async (shortId: string, userId: string): Promise<boolean> => {
  const q = query(
    collection(db, 'shortInteractions'),
    where('shortId', '==', shortId),
    where('userId', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    await addDoc(collection(db, 'shortInteractions'), {
      shortId,
      userId,
      watched: false,
      watchedPercent: 0,
      liked: true,
      bookmarked: false,
      xpAwarded: false,
      updatedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'awarenessShorts', shortId), { likesCount: increment(1) });
    return true;
  }
  const current = snapshot.docs[0].data();
  const newLiked = !current.liked;
  await updateDoc(snapshot.docs[0].ref, { liked: newLiked, updatedAt: serverTimestamp() });
  await updateDoc(doc(db, 'awarenessShorts', shortId), { likesCount: increment(newLiked ? 1 : -1) });
  return newLiked;
};

export const getShortInteraction = async (shortId: string, userId: string): Promise<ShortInteraction | null> => {
  const q = query(
    collection(db, 'shortInteractions'),
    where('shortId', '==', shortId),
    where('userId', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ShortInteraction;
};

// ========== REAL STORIES ==========

export const subscribeToStories = (
  callback: (stories: RealStory[]) => void,
  storyTypeFilter?: string,
  categoryFilter?: CommunityCategoryId
) => {
  const q = query(
    collection(db, 'realStories'),
    orderBy('createdAt', 'desc'),
    limit(30)
  );
  return onSnapshot(q, (snapshot) => {
    let stories = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as RealStory));
    stories = stories.filter(s => s.status === 'active');
    if (storyTypeFilter) {
      stories = stories.filter(s => s.storyType === storyTypeFilter);
    }
    if (categoryFilter) {
      stories = stories.filter(s => s.categoryId === categoryFilter);
    }
    callback(stories);
  }, (error) => {
    console.error('Stories subscription error:', error);
    callback([]);
  });
};

export const createRealStory = async (story: Omit<RealStory, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'commentsCount' | 'bookmarksCount' | 'sharesCount' | 'status'>) => {
  const ref = await addDoc(collection(db, 'realStories'), {
    ...story,
    likesCount: 0,
    commentsCount: 0,
    bookmarksCount: 0,
    sharesCount: 0,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const toggleStoryLike = async (storyId: string, userId: string): Promise<boolean> => {
  const q = query(
    collection(db, 'storyLikes'),
    where('storyId', '==', storyId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    await addDoc(collection(db, 'storyLikes'), { storyId, userId, createdAt: serverTimestamp() });
    await updateDoc(doc(db, 'realStories', storyId), { likesCount: increment(1) });
    return true;
  }
  await deleteDoc(snapshot.docs[0].ref);
  await updateDoc(doc(db, 'realStories', storyId), { likesCount: increment(-1) });
  return false;
};

export const checkStoryLiked = async (storyId: string, userId: string): Promise<boolean> => {
  const q = query(
    collection(db, 'storyLikes'),
    where('storyId', '==', storyId),
    where('userId', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

export const subscribeToStoryComments = (storyId: string, callback: (comments: PostComment[]) => void) => {
  const q = query(
    collection(db, 'storyComments'),
    where('postId', '==', storyId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PostComment)));
  }, () => callback([]));
};

export const addStoryComment = async (storyId: string, comment: Omit<PostComment, 'id' | 'createdAt' | 'updatedAt' | 'likesCount'>) => {
  const ref = await addDoc(collection(db, 'storyComments'), {
    ...comment,
    postId: storyId,
    likesCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'realStories', storyId), { commentsCount: increment(1) });
  return ref.id;
};

// ========== VERIFIED USERS ==========

export const getVerifiedUser = async (userId: string): Promise<VerifiedUser | null> => {
  const q = query(
    collection(db, 'verifiedUsers'),
    where('userId', '==', userId),
    where('isActive', '==', true),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as VerifiedUser;
};

export const getVerifiedUsers = async (): Promise<VerifiedUser[]> => {
  const q = query(
    collection(db, 'verifiedUsers'),
    where('isActive', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VerifiedUser));
};

// ========== SCAM ALERTS ==========

export const subscribeToScamAlerts = (callback: (alerts: ScamAlert[]) => void) => {
  const q = query(
    collection(db, 'scamAlerts'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ScamAlert));
    callback(alerts);
  }, (error) => {
    console.error('Scam alerts subscription error:', error);
    callback([]);
  });
};

export const getScamAlertInteraction = async (alertId: string, userId: string): Promise<ScamAlertInteraction | null> => {
  const q = query(
    collection(db, 'scamAlertInteractions'),
    where('alertId', '==', alertId),
    where('userId', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ScamAlertInteraction;
};

export const updateScamAlertInteraction = async (
  alertId: string,
  userId: string,
  data: Partial<ScamAlertInteraction>
) => {
  const existing = await getScamAlertInteraction(alertId, userId);
  if (existing?.id) {
    await updateDoc(doc(db, 'scamAlertInteractions', existing.id), { ...data, updatedAt: serverTimestamp() });
  } else {
    await addDoc(collection(db, 'scamAlertInteractions'), {
      alertId,
      userId,
      read: false,
      quizCompleted: false,
      quizScore: 0,
      bookmarked: false,
      reported: false,
      xpAwarded: false,
      ...data,
      updatedAt: serverTimestamp(),
    });
  }
};

export const reportScam = async (alertId: string, userId: string) => {
  await updateScamAlertInteraction(alertId, userId, { reported: true });
  await updateDoc(doc(db, 'scamAlerts', alertId), { reportCount: increment(1) });
};

// ========== BOOKMARKS (polymorphic) ==========

export const toggleBookmark = async (
  userId: string,
  contentType: BookmarkContentType,
  contentId: string
): Promise<boolean> => {
  const q = query(
    collection(db, 'communityBookmarks'),
    where('userId', '==', userId),
    where('contentType', '==', contentType),
    where('contentId', '==', contentId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    await addDoc(collection(db, 'communityBookmarks'), {
      userId,
      contentType,
      contentId,
      createdAt: serverTimestamp(),
    });
    // Update the content's bookmark count if applicable
    const collectionMap: Record<string, string> = {
      post: 'communityPosts',
      story: 'realStories',
      short: 'awarenessShorts',
    };
    if (collectionMap[contentType]) {
      try {
        await updateDoc(doc(db, collectionMap[contentType], contentId), { bookmarksCount: increment(1) });
      } catch { /* some collections may not have bookmarksCount */ }
    }
    return true;
  }
  await deleteDoc(snapshot.docs[0].ref);
  const collectionMap: Record<string, string> = {
    post: 'communityPosts',
    story: 'realStories',
    short: 'awarenessShorts',
  };
  if (collectionMap[contentType]) {
    try {
      await updateDoc(doc(db, collectionMap[contentType], contentId), { bookmarksCount: increment(-1) });
    } catch { /* ignore */ }
  }
  return false;
};

export const checkBookmarked = async (
  userId: string,
  contentType: BookmarkContentType,
  contentId: string
): Promise<boolean> => {
  const q = query(
    collection(db, 'communityBookmarks'),
    where('userId', '==', userId),
    where('contentType', '==', contentType),
    where('contentId', '==', contentId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

export const getUserBookmarks = async (
  userId: string,
  contentType?: BookmarkContentType
): Promise<CommunityBookmark[]> => {
  const constraints: QueryConstraint[] = [where('userId', '==', userId), orderBy('createdAt', 'desc')];
  if (contentType) constraints.push(where('contentType', '==', contentType));
  const q = query(collection(db, 'communityBookmarks'), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CommunityBookmark));
};

// ========== ENHANCED POSTS WITH PAGINATION ==========

export const subscribeToPostsPaginated = (
  callback: (posts: ParentPost[]) => void,
  categoryFilter?: CommunityCategoryId,
  sortOption: 'latest' | 'trending' | 'most_liked' = 'latest',
  pageSize: number = 20
) => {
  const q = query(
    collection(db, 'communityPosts'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  return onSnapshot(q, (snapshot) => {
    let posts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ParentPost));
    posts = posts.filter(p => p.status === 'active');

    if (categoryFilter) {
      posts = posts.filter(p => p.category === categoryFilter);
    }
    if (sortOption === 'most_liked') {
      posts.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (sortOption === 'trending') {
      posts.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
    }
    callback(posts);
  }, (error) => {
    console.error('Posts subscription error:', error);
    callback([]);
  });
};

export const searchPosts = async (searchTerm: string): Promise<ParentPost[]> => {
  // Client-side search: get recent posts and filter
  const q = query(
    collection(db, 'communityPosts'),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ParentPost));
  const term = searchTerm.toLowerCase();
  return posts.filter(p =>
    p.status === 'active' && (
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.tags?.some(t => t.toLowerCase().includes(term)) ||
      p.category.toLowerCase().includes(term)
    )
  );
};
