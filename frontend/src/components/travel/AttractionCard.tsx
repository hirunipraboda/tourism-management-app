import React from 'react';
import { Star, Clock, DollarSign } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Attraction } from '../../types/travel';
import { formatCurrency } from '../../utils/formatters';

export interface AttractionCardProps {
  attraction: Attraction;
}

export const AttractionCard: React.FC<AttractionCardProps> = ({ attraction }) => {
  return (
    <Card hoverable className="p-0 overflow-hidden flex flex-col group">
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={attraction.imageUrl}
          alt={attraction.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2.5 left-2.5">
          <Badge variant="accent">{attraction.category}</Badge>
        </div>
      </div>
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#146C86] uppercase tracking-wider">
            {attraction.destinationName}
          </span>
          <h4 className="text-sm font-bold text-slate-900 mt-0.5">{attraction.name}</h4>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{attraction.durationHours}h</span>
          </div>
          <div className="flex items-center gap-1 text-amber-500 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{attraction.rating}</span>
          </div>
          <div className="font-extrabold text-[#0B3A53]">
            {attraction.pricePerPerson === 0 ? 'Free' : formatCurrency(attraction.pricePerPerson)}
          </div>
        </div>
      </div>
    </Card>
  );
};
