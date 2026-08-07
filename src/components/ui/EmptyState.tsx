import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../animations/variants';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <motion.div
    className="flex flex-col items-center justify-center text-center py-16 px-8"
    variants={fadeInUp}
    initial="initial"
    animate="animate"
  >
    <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-6">
      <span className="material-symbols-outlined text-[40px] text-on-surface-variant">{icon}</span>
    </div>
    <h3 className="font-headline text-title-lg text-on-surface mb-2">{title}</h3>
    <p className="font-body text-body-md text-on-surface-variant max-w-md mb-6">{description}</p>
    {action}
  </motion.div>
);
