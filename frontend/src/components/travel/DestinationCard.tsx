import React from 'react';
import { MapPin, Star, Sun, CloudRain } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { StatusBadge } from '../ui/StatusBadge';
import { Destination } from '../../types/travel';

export interface DestinationCardProps {
  destination: Destination;
  onClick?: (id: string) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ destination, onClick }) => {
  return (
    <Card hoverable className="p-0 overflow-hidden flex flex-col group" onClick={() => onClick?.(destination.id)}>
      {/* Image Header */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-200">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-3 left-3 flex gap-2 z-10">
          <StatusBadge status={destination.status} />
          <Badge variant="primary">{destination.category}</Badge>
        </div>

        {destination.weather && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20 z-10">
            {destination.weather.condition === 'Sunny' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span>{destination.weather.temp}°C</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-4 flex flex-col justify-end text-white">
          <div className="flex items-center gap-1 text-xs text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#16A6A1]" />
            <span>
              {destination.region}, {destination.country}
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white mt-0.5 tracking-tight group-hover:text-[#16A6A1] transition-colors leading-snug">
            {destination.name}
          </h3>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {destination.description}
        </p>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>{destination.rating}</span>
          </div>
          <div>
            <strong className="text-slate-800 font-bold">{destination.attractionsCount}</strong> Attractions
          </div>
          <div>
            <strong className="text-[#146C86] font-bold">{destination.activeTripsCount}</strong> Active Trips
          </div>
        </div>
      </div>
    </Card>
  );
};
