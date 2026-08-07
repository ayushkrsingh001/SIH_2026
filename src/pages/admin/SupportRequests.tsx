import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSupportRequests, updateSupportRequestStatus } from '../../firebase/firestore';
import { EmptyState } from '../../components/ui/EmptyState';
import { staggerContainer, staggerItem } from '../../animations/variants';
import toast from 'react-hot-toast';
import type { SupportRequest } from '../../types';
import { Timestamp } from 'firebase/firestore';

const SupportRequests = () => {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('new');

  const loadRequests = async () => {
    const data = await getSupportRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => { loadRequests(); }, []);

  const handleStatusChange = async (id: string, status: SupportRequest['status']) => {
    try {
      await updateSupportRequestStatus(id, status);
      toast.success(`Request marked as ${status.replace('_', ' ')}`);
      loadRequests();
    } catch {
      toast.error('Failed to update request');
    }
  };

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);

  const getTimeAgo = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const categoryIcons: Record<string, string> = {
    bullying: 'person_off',
    safety: 'health_and_safety',
    rights_question: 'gavel',
    other: 'help',
  };

  const statusColors: Record<string, string> = {
    new: 'bg-error-container text-on-error-container',
    in_progress: 'bg-tertiary-fixed text-on-tertiary-fixed',
    resolved: 'bg-secondary-container text-on-secondary-container',
  };

  return (
    <div>
      <h1 className="font-headline text-headline-md text-on-surface mb-2">Support Requests</h1>
      <p className="font-body text-body-md text-on-surface-variant mb-6">Manage child support and safety requests.</p>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(['new', 'in_progress', 'resolved', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-body text-label-md capitalize transition-colors whitespace-nowrap ${
              filter === f ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            {f.replace('_', ' ')} {f !== 'all' && `(${requests.filter(r => r.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-surface-container-high rounded-[24px] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="support_agent" title="No requests" description="No support requests match this filter." />
      ) : (
        <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
          {filtered.map(req => (
            <motion.div
              key={req.id}
              variants={staggerItem}
              className="bg-surface-container-lowest rounded-[24px] shadow-card p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <div className={`w-8 h-8 rounded-full ${req.status === 'new' ? 'bg-error-container' : 'bg-surface-container-high'} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-sm">{categoryIcons[req.category] || 'help'}</span>
                    </div>
                    <span className="font-body text-label-md text-on-surface capitalize">{req.category.replace('_', ' ')}</span>
                    <span className="font-body text-caption text-on-surface-variant">{getTimeAgo(req.createdAt)}</span>
                    <span className={`px-2 py-0.5 rounded-full font-body text-caption ${statusColors[req.status]}`}>{req.status.replace('_', ' ')}</span>
                  </div>
                  <p className="font-body text-body-md text-on-surface">{req.message}</p>
                  {req.childRefPath && (
                    <p className="font-body text-caption text-on-surface-variant mt-1">
                      From: {req.childRefPath}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {req.status === 'new' && (
                    <button onClick={() => handleStatusChange(req.id!, 'in_progress')} className="px-3 py-2 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-body text-caption hover:opacity-80 transition-opacity">
                      Start Review
                    </button>
                  )}
                  {req.status === 'in_progress' && (
                    <button onClick={() => handleStatusChange(req.id!, 'resolved')} className="px-3 py-2 rounded-full bg-secondary text-on-secondary font-body text-caption hover:opacity-80 transition-opacity">
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default SupportRequests;
