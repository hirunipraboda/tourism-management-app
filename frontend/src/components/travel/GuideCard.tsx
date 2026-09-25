import React from 'react';
import { Star, Languages, Award } from 'lucide-react';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { StatusBadge } from '../ui/StatusBadge';
import { Badge } from '../ui/Badge';
import { Guide } from '../../types/travel';

export interface GuideCardProps {
  guide: Guide;
}

export const GuideCard: React.FC<GuideCardProps> = ({ guide }) => {
  return (
    <Card hoverable className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={guide.avatarUrl} name={guide.name} size="lg" />
          <div>
            <h4 className="text-sm font-bold text-slate-900">{guide.name}</h4>
            <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{guide.rating}</span>
              <span className="text-slate-400 font-normal">({guide.toursCompleted} tours)</span>
            </div>
          </div>
        </div>
        <StatusBadge status={guide.status} />
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Languages className="w-3.5 h-3.5 text-[#146C86]" />
          <span>{guide.languages.join(', ')}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {guide.specialties.map(spec => (
            <Badge key={spec} variant="outline" className="text-[10px]">
              {spec}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};
