import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-7 h-7',
  };

  const currentVal = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, idx) => {
          const starVal = idx + 1;
          const isFilled = starVal <= currentVal;

          return (
            <button
              type="button"
              key={idx}
              disabled={!interactive}
              onClick={() => interactive && onChange?.(starVal)}
              onMouseEnter={() => interactive && setHoverRating(starVal)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`p-0.5 transition-transform ${
                interactive ? 'cursor-pointer hover:scale-125 focus:outline-none' : 'cursor-default'
              }`}
              title={interactive ? `${starVal} Star${starVal > 1 ? 's' : ''}` : undefined}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-2xs'
                    : 'text-slate-300 fill-transparent'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs font-black text-slate-800 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
