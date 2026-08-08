import { getCategoryById } from '../../constants';
import type { CommunityCategoryId } from '../../types';

interface CategoryChipProps {
  categoryId: CommunityCategoryId;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showEmoji?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export const CategoryChip = ({
  categoryId,
  size = 'md',
  showIcon = false,
  showEmoji = true,
  selected = false,
  onClick,
}: CategoryChipProps) => {
  const category = getCategoryById(categoryId);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1.5 text-label-md gap-1.5',
    lg: 'px-4 py-2 text-body-md gap-2',
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center rounded-full font-body whitespace-nowrap transition-all duration-200 ${sizeClasses[size]} ${
        selected
          ? 'font-semibold shadow-sm'
          : 'hover:shadow-sm hover:scale-[1.02]'
      }`}
      style={{
        backgroundColor: selected ? category.color + '20' : category.bgAccent,
        color: category.color,
        borderColor: selected ? category.color : 'transparent',
        boxShadow: selected ? `0 0 0 2px ${category.color}40` : undefined,
      }}
    >
      {showEmoji && <span>{category.emoji}</span>}
      {showIcon && (
        <span className="material-symbols-outlined" style={{ fontSize: size === 'sm' ? '14px' : size === 'md' ? '16px' : '20px' }}>
          {category.icon}
        </span>
      )}
      <span>{category.label}</span>
    </button>
  );
};
