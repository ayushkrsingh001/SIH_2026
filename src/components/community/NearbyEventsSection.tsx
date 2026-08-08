import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import type { NearbyEvent } from '../../types';
import { subscribeToNearbyEvents, registerForEvent, checkEventRegistration, unregisterFromEvent } from '../../firebase/communityFirestore';
import { toggleBookmark, checkBookmarked } from '../../firebase/communityFirestore';
import { EVENT_TYPE_META } from '../../constants';
import { SkeletonEventCard } from './SkeletonFeed';
import toast from 'react-hot-toast';

export const NearbyEventsSection = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<NearbyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToNearbyEvents((data) => {
      setEvents(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user && events.length > 0) {
      events.forEach(async (event) => {
        const isReg = await checkEventRegistration(event.id!, user.uid);
        if (isReg) setRegisteredIds(prev => new Set([...prev, event.id!]));
        const isSaved = await checkBookmarked(user.uid, 'event', event.id!);
        if (isSaved) setSavedIds(prev => new Set([...prev, event.id!]));
      });
    }
  }, [user, events]);

  const handleRegister = async (event: NearbyEvent) => {
    if (!user || registeringId) return;
    setRegisteringId(event.id!);
    try {
      if (registeredIds.has(event.id!)) {
        await unregisterFromEvent(event.id!, user.uid);
        setRegisteredIds(prev => { const n = new Set(prev); n.delete(event.id!); return n; });
        toast.success('Unregistered');
      } else {
        await registerForEvent(event.id!, user.uid);
        setRegisteredIds(prev => new Set([...prev, event.id!]));
        toast.success('Registered! 🎉');
      }
    } catch { toast.error('Failed'); }
    finally { setRegisteringId(null); }
  };

  const handleSave = async (eventId: string) => {
    if (!user) return;
    const isSaved = await toggleBookmark(user.uid, 'event', eventId);
    if (isSaved) {
      setSavedIds(prev => new Set([...prev, eventId]));
      toast.success('Event saved');
    } else {
      setSavedIds(prev => { const n = new Set(prev); n.delete(eventId); return n; });
    }
  };

  const formatDate = (event: NearbyEvent) => {
    const d = event.date?.toDate?.() ? event.date.toDate() : new Date();
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="font-headline text-title-lg text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">location_on</span>
          Nearby Events
        </h2>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map(i => <SkeletonEventCard key={i} />)}
        </div>
      </div>
    );
  }

  if (events.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="font-headline text-title-lg text-on-surface mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary filled">location_on</span>
        Nearby Awareness Events
      </h2>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {events.map((event, idx) => {
          const meta = EVENT_TYPE_META[event.type] || { label: event.type, icon: 'event', color: '#607D8B' };
          const isRegistered = registeredIds.has(event.id!);
          const isSaved = savedIds.has(event.id!);

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="min-w-[300px] max-w-[300px] bg-surface-container-lowest rounded-[20px] p-4 shadow-card hover:shadow-card-hover transition-all shrink-0"
            >
              {/* Type Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: meta.color + '20' }}>
                    <span className="material-symbols-outlined text-[20px]" style={{ color: meta.color }}>{meta.icon}</span>
                  </div>
                  <span className="font-body text-label-md font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                </div>
                <button onClick={() => handleSave(event.id!)} className="p-1.5 rounded-full hover:bg-surface-container transition-colors">
                  <span className={`material-symbols-outlined text-[20px] ${isSaved ? 'filled text-primary' : 'text-on-surface-variant'}`}>
                    bookmark
                  </span>
                </button>
              </div>

              {/* Event Details */}
              <h4 className="font-headline text-label-lg text-on-surface mb-2 line-clamp-2">{event.title}</h4>

              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  <span className="font-body text-caption">{formatDate(event)}</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span className="font-body text-caption line-clamp-1">{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">group</span>
                  <span className="font-body text-caption">{event.registeredCount}/{event.maxCapacity} registered</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRegister(event)}
                  disabled={registeringId === event.id}
                  className={`flex-1 py-2.5 rounded-xl font-headline text-label-md transition-all ${
                    isRegistered
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-primary text-on-primary btn-tactile-primary'
                  }`}
                >
                  {registeringId === event.id ? '...' : isRegistered ? '✓ Registered' : 'Register'}
                </motion.button>
                <a
                  href={event.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant">map</span>
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
