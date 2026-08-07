import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  error?: string;
  disabled?: boolean;
}

export const PinInput = ({ length = 4, onComplete, error, disabled = false }: PinInputProps) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (error) {
      setValues(Array(length).fill(''));
      inputs.current[0]?.focus();
    }
  }, [error, length]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newValues = [...values];
    newValues[index] = value.slice(-1);
    setValues(newValues);

    if (value && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (newValues.every(v => v !== '') && newValues.join('').length === length) {
      onComplete(newValues.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      <div className="flex gap-3 justify-center">
        {values.map((value, index) => (
          <motion.input
            key={index}
            ref={el => { inputs.current[index] = el; }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={value}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            disabled={disabled}
            className={`
              w-14 h-14 text-center text-title-lg font-headline rounded-lg border-2
              transition-all duration-200 bg-surface-bright
              ${error ? 'border-error animate-shake' : 'border-surface-dim tactile-input'}
              disabled:opacity-50
            `}
            whileFocus={{ scale: 1.05 }}
            aria-label={`PIN digit ${index + 1}`}
          />
        ))}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-caption font-body text-error mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
