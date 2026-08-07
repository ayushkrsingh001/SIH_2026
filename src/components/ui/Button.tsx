import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles = {
  primary: 'bg-primary-container text-on-primary-container btn-tactile-primary hover:shadow-card-hover',
  secondary: 'bg-secondary text-on-secondary btn-tactile-secondary hover:shadow-card-hover',
  outline: 'bg-surface border-2 border-outline-variant text-on-surface hover:bg-surface-container-high btn-tactile border-outline-variant',
  ghost: 'text-primary hover:bg-primary-fixed/20',
  danger: 'bg-error text-on-error btn-tactile border-error hover:bg-error/90',
};

const sizeStyles = {
  sm: 'h-10 px-4 text-label-md font-body rounded-full',
  md: 'h-14 px-6 text-title-lg font-headline rounded-full',
  lg: 'h-16 px-8 text-title-lg font-headline rounded-full',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <>{icon}</>
      ) : null}
      {children}
    </motion.button>
  );
};
