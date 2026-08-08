import { VERIFIED_TYPE_META } from '../../constants';
import type { VerifiedType } from '../../types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VerifiedBadgeProps {
  verifiedType: VerifiedType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  organization?: string;
}

export const VerifiedBadge = ({ verifiedType, size = 'md', showLabel = false, organization }: VerifiedBadgeProps) => {
  const [showCard, setShowCard] = useState(false);
  const meta = VERIFIED_TYPE_META[verifiedType];
  if (!meta) return null;

  const iconSize = size === 'sm' ? '14px' : size === 'md' ? '18px' : '22px';

  return (
    <div className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setShowCard(true)}
        onMouseLeave={() => setShowCard(false)}
        onClick={() => setShowCard(!showCard)}
        className="inline-flex items-center gap-1 cursor-pointer"
      >
        <span
          className="material-symbols-outlined filled"
          style={{ fontSize: iconSize, color: meta.color }}
        >
          {meta.icon}
        </span>
        {showLabel && (
          <span
            className="font-body text-label-sm font-semibold"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
        )}
      </button>

      {/* Verification Info Card */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-surface-container-lowest rounded-2xl shadow-card-hover p-4 min-w-[200px] border border-surface-container"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="material-symbols-outlined filled"
                style={{ fontSize: '24px', color: meta.color }}
              >
                {meta.icon}
              </span>
              <div>
                <p className="font-headline text-label-md text-on-surface font-semibold">{meta.label}</p>
                {organization && (
                  <p className="font-body text-caption text-on-surface-variant">{organization}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              <span className="font-body text-caption">Identity verified by RightsQuest</span>
            </div>
            {/* Arrow pointer */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-surface-container-lowest border-r border-b border-surface-container rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
