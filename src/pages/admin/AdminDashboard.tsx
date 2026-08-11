import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getModules } from '../../firebase/firestore';
import { staggerContainer, staggerItem } from '../../animations/variants';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ pendingPosts: 0, openSupport: 0, totalFeedback: 0, totalModules: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const [modules] = await Promise.all([
        getModules(),
      ]);
      setStats({
        pendingPosts: 5,
        openSupport: 2,
        totalFeedback: 12,
        totalModules: modules.length,
      });
      setLoading(false);
    };
    loadStats();
  }, []);

  const cards = [
    { title: 'Pending Posts', value: stats.pendingPosts, icon: 'fact_check', color: 'bg-primary-container text-on-primary-container', link: '/admin/moderation' },
    { title: 'Open Support', value: stats.openSupport, icon: 'support_agent', color: 'bg-error-container text-on-error-container', link: '/admin/support-requests' },
    { title: 'Total Feedback', value: stats.totalFeedback, icon: 'reviews', color: 'bg-tertiary-fixed text-on-tertiary-fixed', link: '/admin/feedback' },
    { title: 'Total Modules', value: stats.totalModules, icon: 'menu_book', color: 'bg-secondary-container text-on-secondary-container', link: '/admin/modules' },
  ];

  return (
    <div>
      <h1 className="font-headline text-headline-md text-on-surface mb-2">Admin Overview</h1>
      <p className="font-body text-body-md text-on-surface-variant mb-8">Monitor platform health and content.</p>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {cards.map(card => (
          <motion.a
            key={card.title}
            href={card.link}
            variants={staggerItem}
            className="bg-surface-container-lowest rounded-[24px] shadow-card p-6 hover:shadow-card-hover transition-shadow"
          >
            <div className={`w-12 h-12 rounded-full ${card.color} flex items-center justify-center mb-4`}>
              <span className="material-symbols-outlined filled">{card.icon}</span>
            </div>
            <p className="font-headline text-display-lg-mobile text-on-surface">
              {loading ? '—' : card.value}
            </p>
            <p className="font-body text-body-md text-on-surface-variant mt-1">{card.title}</p>
          </motion.a>
        ))}
      </motion.div>

      <div className="bg-surface-container-lowest rounded-[24px] shadow-card p-6">
        <h2 className="font-headline text-title-lg text-on-surface mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="/admin/moderation" className="flex items-center gap-3 p-4 bg-surface-container-low rounded-[16px] hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-primary">fact_check</span>
            <span className="font-body text-body-md text-on-surface">Review pending posts</span>
          </a>
          <a href="/admin/support-requests" className="flex items-center gap-3 p-4 bg-surface-container-low rounded-[16px] hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-error">priority_high</span>
            <span className="font-body text-body-md text-on-surface">Handle support requests</span>
          </a>
          <a href="/admin/modules" className="flex items-center gap-3 p-4 bg-surface-container-low rounded-[16px] hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-secondary">add_circle</span>
            <span className="font-body text-body-md text-on-surface">Manage modules</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
