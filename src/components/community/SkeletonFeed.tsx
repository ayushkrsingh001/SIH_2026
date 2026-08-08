import { motion } from 'framer-motion';

const shimmer = 'bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-high bg-[length:200%_100%] animate-pulse';

export const SkeletonPostCard = () => (
  <div className="bg-surface-container-lowest rounded-[24px] p-5 sm:p-6 shadow-card mb-6 overflow-hidden">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-12 h-12 rounded-full ${shimmer}`} />
      <div className="flex-1">
        <div className={`h-4 w-32 rounded-full mb-2 ${shimmer}`} />
        <div className={`h-3 w-24 rounded-full ${shimmer}`} />
      </div>
    </div>
    <div className={`h-5 w-3/4 rounded-full mb-3 ${shimmer}`} />
    <div className={`h-4 w-full rounded-full mb-2 ${shimmer}`} />
    <div className={`h-4 w-5/6 rounded-full mb-4 ${shimmer}`} />
    <div className={`h-48 w-full rounded-2xl mb-4 ${shimmer}`} />
    <div className="flex items-center justify-between pt-4 border-t border-surface-container">
      <div className="flex gap-6">
        <div className={`h-4 w-16 rounded-full ${shimmer}`} />
        <div className={`h-4 w-16 rounded-full ${shimmer}`} />
        <div className={`h-4 w-16 rounded-full ${shimmer}`} />
      </div>
      <div className={`h-4 w-8 rounded-full ${shimmer}`} />
    </div>
  </div>
);

export const SkeletonCampaignCard = () => (
  <div className={`w-[340px] h-[220px] rounded-[24px] ${shimmer} shrink-0`} />
);

export const SkeletonNewsCard = () => (
  <div className="bg-surface-container-lowest rounded-[20px] p-4 shadow-card min-w-[260px] shrink-0">
    <div className={`h-32 w-full rounded-2xl mb-3 ${shimmer}`} />
    <div className={`h-4 w-3/4 rounded-full mb-2 ${shimmer}`} />
    <div className={`h-3 w-1/2 rounded-full ${shimmer}`} />
  </div>
);

export const SkeletonEventCard = () => (
  <div className="bg-surface-container-lowest rounded-[20px] p-4 shadow-card min-w-[280px] shrink-0">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-10 h-10 rounded-full ${shimmer}`} />
      <div className="flex-1">
        <div className={`h-4 w-3/4 rounded-full mb-1 ${shimmer}`} />
        <div className={`h-3 w-1/2 rounded-full ${shimmer}`} />
      </div>
    </div>
    <div className={`h-3 w-full rounded-full mb-2 ${shimmer}`} />
    <div className={`h-8 w-24 rounded-full mt-3 ${shimmer}`} />
  </div>
);

export const SkeletonChallengeCard = () => (
  <div className="bg-surface-container-lowest rounded-[24px] p-6 shadow-card">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-12 h-12 rounded-full ${shimmer}`} />
      <div className="flex-1">
        <div className={`h-5 w-48 rounded-full mb-2 ${shimmer}`} />
        <div className={`h-3 w-32 rounded-full ${shimmer}`} />
      </div>
    </div>
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className={`h-10 w-full rounded-xl ${shimmer}`} />
      ))}
    </div>
  </div>
);

export const SkeletonFeed = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-6">
    {Array.from({ length: count }, (_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1 }}
      >
        <SkeletonPostCard />
      </motion.div>
    ))}
  </div>
);
