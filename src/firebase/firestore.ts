import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  collectionGroup,
  limit,
  onSnapshot,
  increment
} from 'firebase/firestore';
import { db } from './config';
import type {
  Parent, Child, Module, Scene, Progress, Badge,
  SupportRequest, AvatarOption,
  ParentPost,
  PostComment,
  PostLike,
  PostBookmark,
  PostReport,
  Notification as AppNotification
} from '../types';

// ========== PARENTS ==========
export const getParent = async (parentId: string): Promise<Parent | null> => {
  const snap = await getDoc(doc(db, 'parents', parentId));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Parent : null;
};

export const updateParent = async (parentId: string, data: Partial<Parent>) => {
  await updateDoc(doc(db, 'parents', parentId), data);
};

// ========== CHILDREN ==========
export const getChildren = async (parentId: string): Promise<Child[]> => {
  const snapshot = await getDocs(collection(db, 'parents', parentId, 'children'));
  return snapshot.docs.map(d => ({ id: d.id, parentId, ...d.data() } as Child));
};

export const getAllChildren = async (): Promise<Child[]> => {
  const snapshot = await getDocs(query(collectionGroup(db, 'children'), orderBy('xp', 'desc'), limit(50)));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Child));
};

export const getChild = async (parentId: string, childId: string): Promise<Child | null> => {
  const snap = await getDoc(doc(db, 'parents', parentId, 'children', childId));
  return snap.exists() ? { id: snap.id, parentId, ...snap.data() } as Child : null;
};

export const addChild = async (parentId: string, child: Omit<Child, 'id' | 'parentId' | 'createdAt' | 'lastActive'>) => {
  const ref = await addDoc(collection(db, 'parents', parentId, 'children'), {
    ...child,
    createdAt: serverTimestamp(),
    lastActive: serverTimestamp(),
  });
  return ref.id;
};

export const updateChild = async (parentId: string, childId: string, data: Partial<Child>) => {
  await updateDoc(doc(db, 'parents', parentId, 'children', childId), data);
};

export const deleteChild = async (parentId: string, childId: string) => {
  await deleteDoc(doc(db, 'parents', parentId, 'children', childId));
};

// ========== MODULES ==========
export const getModules = async (): Promise<Module[]> => {
  const snapshot = await getDocs(query(collection(db, 'modules'), orderBy('order')));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Module));
};

export const getModule = async (moduleId: string): Promise<Module | null> => {
  const snap = await getDoc(doc(db, 'modules', moduleId));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Module : null;
};

export const addModule = async (module: Omit<Module, 'id'>) => {
  const ref = await addDoc(collection(db, 'modules'), module);
  return ref.id;
};

export const updateModule = async (moduleId: string, data: Partial<Module>) => {
  await updateDoc(doc(db, 'modules', moduleId), data);
};

export const deleteModule = async (moduleId: string) => {
  await deleteDoc(doc(db, 'modules', moduleId));
};

// ========== SCENES ==========
export const getScenes = async (moduleId: string): Promise<Scene[]> => {
  const snapshot = await getDocs(collection(db, 'modules', moduleId, 'scenes'));
  return snapshot.docs.map(d => ({ id: d.id, moduleId, ...d.data() } as Scene));
};

export const getScene = async (moduleId: string, sceneId: string): Promise<Scene | null> => {
  const snap = await getDoc(doc(db, 'modules', moduleId, 'scenes', sceneId));
  return snap.exists() ? { id: snap.id, moduleId, ...snap.data() } as Scene : null;
};

export const addScene = async (moduleId: string, scene: Omit<Scene, 'id' | 'moduleId'>) => {
  const ref = await addDoc(collection(db, 'modules', moduleId, 'scenes'), scene);
  return ref.id;
};

export const updateScene = async (moduleId: string, sceneId: string, data: Partial<Scene>) => {
  await updateDoc(doc(db, 'modules', moduleId, 'scenes', sceneId), data);
};

export const deleteScene = async (moduleId: string, sceneId: string) => {
  await deleteDoc(doc(db, 'modules', moduleId, 'scenes', sceneId));
};

// ========== PROGRESS ==========
export const getProgressId = (parentId: string, childId: string, moduleId: string) =>
  `${parentId}_${childId}_${moduleId}`;

export const getProgress = async (parentId: string, childId: string, moduleId: string): Promise<Progress | null> => {
  const id = getProgressId(parentId, childId, moduleId);
  const snap = await getDoc(doc(db, 'progress', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Progress : null;
};

export const getAllChildProgress = async (parentId: string, childId: string): Promise<Progress[]> => {
  const snapshot = await getDocs(
    query(collection(db, 'progress'), where('parentId', '==', parentId), where('childId', '==', childId))
  );
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Progress));
};

export const setProgress = async (progress: Progress) => {
  const id = getProgressId(progress.parentId, progress.childId, progress.moduleId);
  await setDoc(doc(db, 'progress', id), progress);
};

export const updateProgress = async (progressId: string, data: Partial<Progress>) => {
  await updateDoc(doc(db, 'progress', progressId), data);
};

// ========== BADGES ==========
export const getBadges = async (): Promise<Badge[]> => {
  const snapshot = await getDocs(collection(db, 'badges'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Badge));
};

export const addBadge = async (badge: Omit<Badge, 'id'>) => {
  const ref = await addDoc(collection(db, 'badges'), badge);
  return ref.id;
};

// ========== COMMUNITY WALL (REALTIME) ==========


export const subscribeToPosts = (
  callback: (posts: ParentPost[]) => void,
  categoryFilter?: string,
  sortOption: 'latest' | 'trending' | 'most_liked' = 'latest'
) => {
  // Simple query - just get latest posts to avoid composite index requirements
  const q = query(
    collection(db, 'communityPosts'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    let posts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ParentPost));
    
    // Client-side filtering/sorting to avoid composite index issues
    posts = posts.filter(p => p.status === 'active');
    
    if (categoryFilter && categoryFilter !== 'All') {
      posts = posts.filter(p => p.category === categoryFilter);
    }
    if (sortOption === 'most_liked') {
      posts.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (sortOption === 'trending') {
      posts.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
    }
    
    callback(posts);
  }, (error) => {
    console.error('Firestore subscription error:', error);
    callback([]); // Return empty on error so UI doesn't crash
  });
};

export const createParentPost = async (post: Omit<ParentPost, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'status'>) => {
  const ref = await addDoc(collection(db, 'communityPosts'), {
    ...post,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const subscribeToComments = (postId: string, callback: (comments: PostComment[]) => void) => {
  const q = query(
    collection(db, 'communityComments'),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostComment));
    callback(comments);
  }, (error) => {
    console.error('Comments subscription error:', error);
    callback([]);
  });
};

export const addPostComment = async (comment: Omit<PostComment, 'id' | 'createdAt' | 'updatedAt' | 'likesCount'>, postAuthorId: string) => {
  const ref = await addDoc(collection(db, 'communityComments'), {
    ...comment,
    likesCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // Increment comment count on post
  await updateDoc(doc(db, 'communityPosts', comment.postId), {
    commentsCount: increment(1)
  });
  
  // Notify author
  if (comment.authorId !== postAuthorId) {
    await addDoc(collection(db, 'notifications'), {
      userId: postAuthorId,
      actorId: comment.authorId,
      actorName: comment.authorName,
      actorPhoto: comment.authorPhoto || null,
      type: 'comment',
      postId: comment.postId,
      read: false,
      createdAt: serverTimestamp()
    });
  }
  return ref.id;
};

export const togglePostLike = async (postId: string, userId: string, postAuthorId: string, actorName: string, actorPhoto?: string): Promise<boolean> => {
  const q = query(collection(db, 'communityLikes'), where('postId', '==', postId), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    // Like
    await addDoc(collection(db, 'communityLikes'), { postId, userId, createdAt: serverTimestamp() });
    await updateDoc(doc(db, 'communityPosts', postId), { likesCount: increment(1) });
    
    // Notify author
    if (userId !== postAuthorId) {
      await addDoc(collection(db, 'notifications'), {
        userId: postAuthorId,
        actorId: userId,
        actorName,
        actorPhoto: actorPhoto || null,
        type: 'like',
        postId,
        read: false,
        createdAt: serverTimestamp()
      });
    }
    return true; // isLiked
  } else {
    // Unlike
    await deleteDoc(snapshot.docs[0].ref);
    await updateDoc(doc(db, 'communityPosts', postId), { likesCount: increment(-1) });
    return false; // isNotLiked
  }
};

export const checkIsLiked = async (postId: string, userId: string): Promise<boolean> => {
  const q = query(collection(db, 'communityLikes'), where('postId', '==', postId), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

export const reportPost = async (report: Omit<PostReport, 'id' | 'createdAt' | 'status'>) => {
  await addDoc(collection(db, 'communityReports'), {
    ...report,
    status: 'pending',
    createdAt: serverTimestamp()
  });
};

export const subscribeToNotifications = (userId: string, callback: (notifications: AppNotification[]) => void) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
    callback(notifications);
  });
};

export const markNotificationRead = async (notificationId: string) => {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true });
};

// ========== SUPPORT REQUESTS ==========
export const getSupportRequests = async (): Promise<SupportRequest[]> => {
  const snapshot = await getDocs(
    query(collection(db, 'supportRequests'), orderBy('createdAt', 'desc'))
  );
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SupportRequest));
};

export const addSupportRequest = async (request: Omit<SupportRequest, 'id' | 'createdAt'>) => {
  const ref = await addDoc(collection(db, 'supportRequests'), {
    ...request,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateSupportRequestStatus = async (requestId: string, status: SupportRequest['status'], assignedOrgId?: string) => {
  const data: Record<string, unknown> = { status };
  if (assignedOrgId) data.assignedOrgId = assignedOrgId;
  await updateDoc(doc(db, 'supportRequests', requestId), data);
};

// ========== ORGANIZATIONS ==========
export const getOrganizations = async (): Promise<Organization[]> => {
  const snapshot = await getDocs(collection(db, 'organizations'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Organization));
};

export const addOrganization = async (org: Omit<Organization, 'id'>) => {
  const ref = await addDoc(collection(db, 'organizations'), org);
  return ref.id;
};

// ========== FEEDBACK ==========
export const addFeedback = async (feedback: Omit<Feedback, 'id' | 'createdAt'>) => {
  const ref = await addDoc(collection(db, 'feedback'), {
    ...feedback,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getAllFeedback = async (): Promise<Feedback[]> => {
  const snapshot = await getDocs(
    query(collection(db, 'feedback'), orderBy('createdAt', 'desc'))
  );
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Feedback));
};

// ========== AI LEVEL CACHE ==========
import type { CachedAILevel } from '../types';
import { Timestamp } from 'firebase/firestore';

export const getCachedAILevel = async (
  parentId: string, childId: string, type: string
): Promise<CachedAILevel | null> => {
  const snapshot = await getDocs(
    query(
      collection(db, 'aiLevelCache'),
      where('parentId', '==', parentId),
      where('childId', '==', childId),
      where('type', '==', type),
      where('status', 'in', ['unplayed', 'in_progress']),
      limit(1)
    )
  );
  if (snapshot.empty) return null;
  const doc_ = snapshot.docs[0];
  return { id: doc_.id, ...doc_.data() } as CachedAILevel;
};

export const getCachedAILevelById = async (levelId: string): Promise<CachedAILevel | null> => {
  const snap = await getDoc(doc(db, 'aiLevelCache', levelId));
  return snap.exists() ? { id: snap.id, ...snap.data() } as CachedAILevel : null;
};

export const cacheAILevel = async (level: Omit<CachedAILevel, 'id'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'aiLevelCache'), level);
  return ref.id;
};

export const updateCachedAILevel = async (levelId: string, data: Partial<CachedAILevel>): Promise<void> => {
  await updateDoc(doc(db, 'aiLevelCache', levelId), data);
};

export const getDailyChallenge = async (
  parentId: string, childId: string
): Promise<CachedAILevel | null> => {
  // Check for a daily challenge created today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const snapshot = await getDocs(
    query(
      collection(db, 'aiLevelCache'),
      where('parentId', '==', parentId),
      where('childId', '==', childId),
      where('type', '==', 'daily_challenge'),
      where('generatedAt', '>=', Timestamp.fromDate(todayStart)),
      limit(1)
    )
  );
  if (snapshot.empty) return null;
  const doc_ = snapshot.docs[0];
  return { id: doc_.id, ...doc_.data() } as CachedAILevel;
};

export const getCompletedAILevels = async (
  parentId: string, childId: string
): Promise<CachedAILevel[]> => {
  const snapshot = await getDocs(
    query(
      collection(db, 'aiLevelCache'),
      where('parentId', '==', parentId),
      where('childId', '==', childId),
      where('status', '==', 'completed'),
      orderBy('generatedAt', 'desc'),
      limit(20)
    )
  );
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CachedAILevel));
};

