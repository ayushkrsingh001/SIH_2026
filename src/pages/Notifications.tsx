import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToNotifications, markNotificationRead } from '../firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Notification } from '../types';
import { fadeInUp, staggerContainer } from '../animations/variants';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { showHelpRequestToast } from '../components/ui/HelpRequestToast';
import { resolveAvatarUrl } from '../utils/avatar';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToNotifications(user.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read && notification.id) {
      try {
        await markNotificationRead(notification.id);
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }

    if (notification.type === 'help_request') {
      try {
        const snap = await getDoc(doc(db, 'supportRequests', notification.postId));
        if (snap.exists()) {
          const reqData = snap.data();
          showHelpRequestToast(notification.actorName, reqData.category, reqData.message);
        } else {
          toast.error("Could not find the request details.");
        }
      } catch (err) {
        toast.error("Error loading request details.");
      }
    } else {
      navigate('/community');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return 'favorite';
      case 'comment': return 'chat_bubble';
      case 'help_request': return 'emergency';
      case 'mention': return 'alternate_email';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like': return 'text-error';
      case 'comment': return 'text-primary';
      case 'help_request': return 'text-error';
      default: return 'text-secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-[16px] bg-primary-container flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[24px]">notifications</span>
        </div>
        <div>
          <h1 className="font-headline text-headline-sm md:text-headline-md text-on-surface">Notifications</h1>
          <p className="font-body text-body-md text-on-surface-variant">Stay updated with activity around your account.</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest rounded-[24px] border border-outline-variant/30">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">notifications_off</span>
          <h3 className="font-headline text-title-lg text-on-surface mb-2">All Caught Up!</h3>
          <p className="font-body text-body-md text-on-surface-variant">You don't have any notifications right now.</p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-3"
        >
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              variants={fadeInUp}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 rounded-[16px] flex gap-4 cursor-pointer transition-all border-l-4 ${
                !notif.read 
                  ? 'bg-surface-container-low border-primary shadow-sm' 
                  : 'bg-surface-container-lowest border-transparent hover:bg-surface-container-lowest'
              }`}
            >
              <div className="shrink-0 relative">
                <div className="shrink-0 w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary text-lg font-bold overflow-hidden relative">
                  {notif.actorPhoto ? (
                    <img src={resolveAvatarUrl(notif.actorPhoto)} alt={notif.actorName} className="w-full h-full object-cover" />
                  ) : (
                    notif.actorName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm`}>
                  <span className={`material-symbols-outlined text-[14px] filled ${getNotificationColor(notif.type)}`}>
                    {getNotificationIcon(notif.type)}
                  </span>
                </div>
              </div>

              <div className="flex-grow">
                <p className="font-body text-body-md text-on-surface">
                  <span className="font-bold">{notif.actorName}</span>
                  {notif.type === 'like' && ' liked your post.'}
                  {notif.type === 'comment' && ' commented on your post.'}
                  {notif.type === 'help_request' && ' submitted a request for help.'}
                  {notif.type === 'mention' && ' mentioned you.'}
                </p>
                <p className="font-body text-label-sm text-on-surface-variant mt-1">
                  {notif.createdAt?.toDate() ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                </p>
              </div>

              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Notifications;
