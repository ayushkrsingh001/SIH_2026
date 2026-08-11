import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export const LanguageSwitcher = ({ align = 'right' }: { align?: 'left' | 'right' }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिंदी', short: 'HI' }
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
    document.documentElement.lang = code;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-1 font-body text-label-md text-on-surface-variant hover:text-primary bg-surface-container-high hover:bg-surface-container-highest px-3 py-1.5 rounded-full transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{currentLang.short}</span>
        <span className="material-symbols-outlined text-[18px]">
          {isOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'} mt-2 w-32 rounded-xl bg-surface-container-lowest shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[100] border border-outline-variant overflow-hidden`}
          >
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-left px-4 py-2 font-body text-label-md transition-colors ${
                    i18n.language === lang.code
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
