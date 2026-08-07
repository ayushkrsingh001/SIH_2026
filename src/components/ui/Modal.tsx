import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalOverlay, modalContent } from '../../animations/variants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={modalOverlay}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="absolute inset-0 bg-inverse-surface/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className={`relative bg-surface-container-lowest rounded-[24px] shadow-card-hover w-full ${sizeStyles[size]} max-h-[90vh] overflow-y-auto p-6 md:p-8`}
            variants={modalContent}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {title && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline text-headline-md-mobile md:text-headline-md text-on-surface">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-variant flex items-center justify-center transition-colors"
                  aria-label="Close modal"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
