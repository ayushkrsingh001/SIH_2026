import { motion } from 'framer-motion';

export const SkeletonLoader = ({ className = '' }: { className?: string }) => (
  <motion.div
    className={`bg-surface-container-high rounded-[24px] ${className}`}
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  />
);

export const CardSkeleton = () => (
  <div className="bg-surface-container-lowest rounded-[24px] p-6 shadow-card">
    <div className="flex items-center gap-4 mb-6">
      <SkeletonLoader className="w-16 h-16 rounded-full" />
      <div className="flex-1">
        <SkeletonLoader className="h-5 w-24 mb-2 rounded-lg" />
        <SkeletonLoader className="h-4 w-16 rounded-lg" />
      </div>
    </div>
    <SkeletonLoader className="h-3 w-full mb-4 rounded-lg" />
    <SkeletonLoader className="h-10 w-full rounded-full" />
  </div>
);

export const PageSkeleton = () => (
  <div className="space-y-6 p-6">
    <SkeletonLoader className="h-10 w-64 rounded-lg" />
    <SkeletonLoader className="h-5 w-96 rounded-lg" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);
