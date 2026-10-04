import React from 'react';
import {
  MapPin,
  Star,
  Sun,
  CloudRain,
  Calendar,
  Clock,
  DollarSign,
  Droplets,
  Wind,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { StatusBadge } from '../ui/StatusBadge';
import { Destination } from '../../types/travel';
import { DestinationWeatherService } from '../../services/destinationWeatherService';

export interface DestinationCardProps {
  destination: Destination;
  onClick?: (id: string) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ destination, onClick }) => {
  const liveWeather = DestinationWeatherService.getLiveWeather(
    destination.name,
    destination.region || destination.country
  );

  return (
    <Card
      hoverable
      className="p-0 overflow-hidden flex flex-col group rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-teal-300 transition-all duration-300"
      onClick={() => onClick?.(destination.id)}
    >
      {/* Image Header with Live Telemetry */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-200">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Left: Live Real-time Weather Telemetry */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-2 border border-white/20 z-10 shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-extrabold text-amber-300 flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            {liveWeather.currentTemp}°C
          </span>
          <span className="text-slate-400 text-[10px]">·</span>
          <span className="text-teal-200 font-semibold truncate max-w-[95px]">{liveWeather.condition}</span>
        </div>

        {/* Top Right: Status & Category Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <StatusBadge status={destination.status} />
          <Badge variant="primary">{destination.category}</Badge>
        </div>

        {/* Gradient Overlay & Name */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent p-4 flex flex-col justify-end text-white">
          <div className="flex items-center gap-1 text-xs text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#16A6A1]" />
            <span>
              {destination.region}, {destination.country}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <h3 className="text-base font-extrabold text-white tracking-tight group-hover:text-[#16A6A1] transition-colors leading-snug truncate">
              {destination.name}
            </h3>
            {destination.avgBudgetPerDay && (
              <span className="text-[11px] font-extrabold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/40 shrink-0">
                {destination.avgBudgetPerDay}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {destination.description}
        </p>

        {/* Planning Row: Best Time & Stay (if available) */}
        {(destination.bestTimeToVisit || destination.recommendedStayDays) && (
          <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[10.5px]">
            {destination.bestTimeToVisit && (
              <div className="flex items-center gap-1 text-slate-600 truncate" title={`Best Time: ${destination.bestTimeToVisit}`}>
                <Calendar className="w-3 h-3 text-[#16A6A1] shrink-0" />
                <span className="truncate font-semibold">{destination.bestTimeToVisit}</span>
              </div>
            )}
            {destination.recommendedStayDays && (
              <div className="flex items-center gap-1 text-slate-600 truncate" title={`Stay: ${destination.recommendedStayDays}`}>
                <Clock className="w-3 h-3 text-[#16A6A1] shrink-0" />
                <span className="truncate font-semibold">{destination.recommendedStayDays}</span>
              </div>
            )}
          </div>
        )}

        {/* Top Attractions Pills (if available) */}
        {destination.topAttractions && destination.topAttractions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {destination.topAttractions.slice(0, 2).map((attr) => (
              <span key={attr} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold truncate max-w-[120px]">
                {attr}
              </span>
            ))}
            {destination.topAttractions.length > 2 && (
              <span className="px-1.5 py-0.5 rounded-md bg-teal-50 text-[#146C86] text-[10px] font-bold">
                +{destination.topAttractions.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer: Rating & Live Telemetry Strip */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{destination.rating}</span>
          </div>

          <div className="flex items-center gap-2 text-[10.5px] font-semibold text-slate-500">
            <span className="flex items-center gap-1 text-sky-600" title="Humidity">
              <Droplets className="w-3 h-3 text-sky-500" />
              {liveWeather.humidity}%
            </span>
            <span className="flex items-center gap-1 text-slate-600" title="Wind">
              <Wind className="w-3 h-3 text-slate-400" />
              {liveWeather.windSpeed} km/h
            </span>
          </div>

          <div className="font-extrabold text-[#146C86] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px]">
            <span>Explore</span>
            <ArrowRight className="w-3 h-3 text-[#16A6A1]" />
          </div>
        </div>
      </div>
    </Card>
  );
};

