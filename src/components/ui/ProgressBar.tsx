import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'primary' | 'secondary' | 'tertiary';
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

const colorStyles = {
  primary: 'bg-primary-container',
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary-container',
};

export const ProgressBar = ({
  value,
  max = 100,
  color = 'secondary',
  showLabel = false,
  label,
  size = 'md',
}: ProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div>
      {(showLabel || label) && (
        <div className="flex justify-between font-body text-caption mb-1 text-on-surface-variant">
          <span>{label || 'Progress'}</span>
          <span className="font-bold text-primary">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full ${size === 'sm' ? 'h-2' : 'h-3'} bg-surface-container-high rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full rounded-full ${colorStyles[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};
