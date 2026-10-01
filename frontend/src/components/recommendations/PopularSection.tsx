import React from 'react';
import { Recommendation } from '../../types/reviewsAndRecommendations';

interface PopularSectionProps {
  items: Recommendation[];
  onSelect?: (item: Recommendation) => void;
  loading?: boolean;
}

const CategoryColors: Record<string, { bg: string; text: string }> = {
  Culture:   { bg: 'bg-purple-100', text: 'text-purple-700' },
  History:   { bg: 'bg-amber-100',  text: 'text-amber-700'  },
  Nature:    { bg: 'bg-emerald-100',text: 'text-emerald-700'},
  Adventure: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Food:      { bg: 'bg-rose-100',   text: 'text-rose-700'   },
  Wildlife:  { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Beaches:   { bg: 'bg-sky-100',    text: 'text-sky-700'    },
};

/**
 * Horizontal-scroll strip of the most popular attractions.
 * Compact card format — click opens the details modal via onSelect.
 */
export const PopularSection: React.FC<PopularSectionProps> = ({ items, onSelect, loading }) => {
  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex-none w-52 h-24 bg-gray-100 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1 flex items-center gap-2">
        <span className="text-lg">🔥</span> Most Popular
      </h3>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
        {items.map((item) => {
          const colors = CategoryColors[item.category] ?? { bg: 'bg-teal-100', text: 'text-teal-700' };

          return (
            <button
              key={item.id}
              onClick={() => onSelect?.(item)}
              className="flex-none w-52 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden text-left group"
            >
              {/* Mini image */}
              <div className="relative h-24 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=70';
                  }}
                />
                {/* Category pill */}
                <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                  {item.category}
                </span>
              </div>

              {/* Content */}
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    ⭐ {item.rating > 0 ? item.rating.toFixed(1) : 'New'}
                    {item.reviewCount > 0 && (
                      <span className="text-gray-400">({item.reviewCount})</span>
                    )}
                  </span>
                  <span className="text-xs text-teal-600 font-medium">
                    {item.price}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PopularSection;
