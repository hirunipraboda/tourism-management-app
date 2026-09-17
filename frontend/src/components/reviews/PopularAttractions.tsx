import React from 'react';
import { Star, MapPin, Award, CheckCircle2 } from 'lucide-react';
import { PopularAttractionItem } from '../../types/reviewsAndRecommendations';

interface PopularAttractionsProps {
  attractions: PopularAttractionItem[];
  className?: string;
}

export const PopularAttractions: React.FC<PopularAttractionsProps> = ({
  attractions,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-black text-[#0B3A53] font-heading">
            Popular Attractions & Sights
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Customer satisfaction and review volume ranking across top visitor destinations
          </p>
        </div>

        <span className="text-xs font-bold text-slate-400">
          Ranked by visitor volume
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
              <th className="pb-3 font-black">Attraction</th>
              <th className="pb-3 text-right font-black">Rating</th>
              <th className="pb-3 text-right font-black">Reviews</th>
              <th className="pb-3 text-right font-black">Satisfaction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attractions.map((item, idx) => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-black text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">{item.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#16A6A1]" />
                        <span>{item.location}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-500">{item.category}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 text-right">
                  <div className="inline-flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full text-amber-700 font-black text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.rating.toFixed(1)}</span>
                  </div>
                </td>
                <td className="py-3.5 text-right font-black text-slate-700 text-xs">
                  {item.reviews.toLocaleString()}
                </td>
                <td className="py-3.5 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${item.satisfaction}%` }}
                      />
                    </div>
                    <span className="font-black text-emerald-600 text-xs min-w-[32px]">
                      {item.satisfaction}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Cards View */}
      <div className="md:hidden space-y-3">
        {attractions.map((item, idx) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-black text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="font-black text-slate-900 text-sm">{item.name}</span>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full text-amber-700 font-black text-[11px]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{item.rating.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/50">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#16A6A1]" />
                <span>{item.location}</span>
              </span>
              <span className="font-bold">{item.reviews} reviews</span>
              <span className="font-black text-emerald-600">{item.satisfaction}% Satisfied</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
