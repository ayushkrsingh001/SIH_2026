import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'text-xl', md: 'text-3xl', lg: 'text-4xl' };

export const StarRating = ({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`transition-transform ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          disabled={readonly}
          aria-label={`${star} star`}
        >
          <span
            className={`material-symbols-outlined ${sizeMap[size]} ${
              star <= (hover || value) ? 'text-tertiary-fixed-dim filled' : 'text-surface-dim'
            }`}
            style={{ fontVariationSettings: star <= (hover || value) ? "'FILL' 1" : "'FILL' 0" }}
          >
            star
          </span>
        </button>
      ))}
    </div>
  );
};
