import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Sparkles,
  Sun,
  CloudSun,
  CloudRain,
  Cloud,
  Wind,
  Droplets,
  Eye,
  RefreshCw,
  Compass,
  Edit,
  Tag,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import { AdminDestination } from '../../mock/mockAdminData';
import {
  DestinationWeatherService,
  LiveDestinationWeather,
} from '../../services/destinationWeatherService';

interface DestinationLiveWeatherModalProps {
  destination: AdminDestination | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (dest: AdminDestination) => void;
}

export const DestinationLiveWeatherModal: React.FC<DestinationLiveWeatherModalProps> = ({
  destination,
  isOpen,
  onClose,
  onEdit,
}) => {
  const [weather, setWeather] = useState<LiveDestinationWeather | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Fetch or calculate fresh real-time weather
  const refreshWeatherData = useCallback(() => {
    if (!destination) return;
    setIsRefreshing(true);
    setTimeout(() => {
      const data = DestinationWeatherService.getLiveWeather(
        destination.name,
        destination.province
      );
      setWeather(data);
      setSecondsAgo(0);
      setIsRefreshing(false);
    }, 400);
  }, [destination]);

  // Initial load when destination changes
  useEffect(() => {
    if (isOpen && destination) {
      refreshWeatherData();
    }
  }, [isOpen, destination, refreshWeatherData]);

  // Real-time ticking timer (updates seconds ago and auto-refreshes every 45s)
  useEffect(() => {
    if (!isOpen || !destination) return;

    const interval = setInterval(() => {
      setSecondsAgo((prev) => {
        if (prev >= 45) {
          // Auto update real time
          const fresh = DestinationWeatherService.getLiveWeather(
            destination.name,
            destination.province
          );
          setWeather(fresh);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, destination]);

  if (!isOpen || !destination) return null;

  // Weather icon helper
  const renderWeatherIcon = (
    condition: string,
    sizeClass = 'w-8 h-8 text-amber-500'
  ) => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('shower')) {
      return <CloudRain className={`${sizeClass} text-sky-500`} />;
    }
    if (c.includes('mist') || c.includes('fog')) {
      return <Cloud className={`${sizeClass} text-teal-400`} />;
    }
    if (c.includes('partly') || c.includes('breeze')) {
      return <CloudSun className={`${sizeClass} text-amber-400`} />;
    }
    return <Sun className={`${sizeClass} text-amber-500`} />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-y-auto flex flex-col">
        {/* Hero Banner Header */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden shrink-0 bg-slate-900">
          <img
            src={destination.coverImage}
            alt={destination.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Top Bar Actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider border border-white/20">
                {destination.category}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase shadow-sm ${
                  destination.status === 'Active'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {destination.status}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-all cursor-pointer backdrop-blur-md border border-white/20"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner Title & Location */}
          <div className="absolute bottom-5 left-6 right-6 z-10 text-white space-y-1">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-2xl sm:text-4xl font-black font-heading tracking-tight drop-shadow-md">
                {destination.name}
              </h2>
              <span className="text-xs sm:text-sm font-semibold text-teal-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {destination.province} · {destination.location}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-medium line-clamp-1 max-w-2xl drop-shadow-xs">
              {destination.description}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6 overflow-y-auto">
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* REAL-TIME LIVE WEATHER SECTION                                    */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B3A53] to-[#146C86] p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
            {/* Background ambient glow circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#16A6A1]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Weather Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-teal-300">
                      LIVE REAL-TIME WEATHER
                    </span>
                    <span className="text-[10px] text-slate-300 font-bold bg-white/10 px-2 py-0.5 rounded-full">
                      Auto-syncs
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Updated {secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`}
                  </p>
                </div>
              </div>

              {/* Units Toggle and Manual Refresh Button */}
              <div className="flex items-center gap-2">
                {/* °C / °F Unit Toggle */}
                <div className="flex items-center bg-white/10 p-0.5 rounded-xl border border-white/15 text-xs font-bold">
                  <button
                    onClick={() => setTempUnit('C')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      tempUnit === 'C'
                        ? 'bg-white text-[#0B3A53] shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    °C
                  </button>
                  <button
                    onClick={() => setTempUnit('F')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      tempUnit === 'F'
                        ? 'bg-white text-[#0B3A53] shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    °F
                  </button>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={refreshWeatherData}
                  disabled={isRefreshing}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                  title="Refresh live telemetry now"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-teal-300 ${
                      isRefreshing ? 'animate-spin' : ''
                    }`}
                  />
                  <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
                </button>
              </div>
            </div>

            {/* Current Weather Main Display */}
            {weather && (
              <div className="pt-5 space-y-5 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  {/* Left: Temp and Primary Condition */}
                  <div className="flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                      {renderWeatherIcon(weather.condition, 'w-12 h-12')}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-black font-heading tracking-tight">
                          {tempUnit === 'C'
                            ? `${weather.currentTemp}°C`
                            : `${weather.currentTempF}°F`}
                        </span>
                        <span className="text-xs text-slate-300 font-semibold">
                          Feels like{' '}
                          {tempUnit === 'C'
                            ? `${weather.feelsLike}°C`
                            : `${Math.round((weather.feelsLike * 9) / 5 + 32)}°F`}
                        </span>
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-teal-200 mt-0.5">
                        {weather.condition}
                      </div>
                    </div>
                  </div>

                  {/* Right: Key Telemetry Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 bg-white/5 border border-white/10 p-3 sm:p-4 rounded-2xl">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px] text-teal-300 font-bold">
                        <Droplets className="w-3.5 h-3.5" />
                        <span>Humidity</span>
                      </div>
                      <div className="text-sm font-extrabold text-white">
                        {weather.humidity}%
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px] text-teal-300 font-bold">
                        <Wind className="w-3.5 h-3.5" />
                        <span>Wind Speed</span>
                      </div>
                      <div className="text-sm font-extrabold text-white">
                        {weather.windSpeed} km/h {weather.windDirection}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px] text-teal-300 font-bold">
                        <CloudRain className="w-3.5 h-3.5" />
                        <span>Precipitation</span>
                      </div>
                      <div className="text-sm font-extrabold text-white">
                        {weather.precipitationChance}%
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px] text-teal-300 font-bold">
                        <Sun className="w-3.5 h-3.5" />
                        <span>UV Index</span>
                      </div>
                      <div className="text-sm font-extrabold text-white">
                        {weather.uvIndex}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Weather Travel Advisory */}
                <div className="bg-teal-950/40 border border-teal-400/20 rounded-2xl p-3 sm:p-3.5 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                    <strong className="text-teal-300 font-black">
                      Live Travel Weather Advisory:
                    </strong>{' '}
                    {weather.travelAdvisory}
                  </p>
                </div>

                {/* 5-Day Forecast Row */}
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-300 mb-2">
                    5-Day Weather Forecast for {destination.name}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {weather.forecast.map((fc, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          idx === 0
                            ? 'bg-white/15 border-white/25 shadow-xs'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <p className="text-[11px] font-black text-slate-300 uppercase">
                          {fc.day}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {fc.date}
                        </p>
                        <div className="flex justify-center py-2">
                          {renderWeatherIcon(fc.condition, 'w-6 h-6')}
                        </div>
                        <div className="text-xs font-black text-white">
                          {tempUnit === 'C'
                            ? `${fc.tempMax}° / ${fc.tempMin}°`
                            : `${Math.round((fc.tempMax * 9) / 5 + 32)}° / ${Math.round(
                                (fc.tempMin * 9) / 5 + 32
                              )}°`}
                        </div>
                        <p className="text-[10px] font-bold text-sky-300 mt-1">
                          ☂ {fc.rainChance}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* DETAILS ADDED BY ADMIN WHEN CREATING DESTINATION                  */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <MapPin className="w-4 h-4 text-[#16A6A1]" />
              <h3 className="text-sm font-black text-[#0B3A53] font-heading uppercase tracking-wide">
                Details Added by Admin
              </h3>
            </div>

            {/* Travel Planning Metrics Grid (Best Time, Stay Period, Avg Budget) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Best Time to Visit */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#146C86] uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-[#16A6A1]" />
                  <span>Best Time to Visit</span>
                </div>
                <div className="text-base font-black text-[#0B3A53]">
                  {destination.bestTimeToVisit || 'Year-round'}
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Optimal season for sightseeing and comfortable touring
                </p>
              </div>

              {/* Recommended Stay Period */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#146C86] uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-[#16A6A1]" />
                  <span>Recommended Stay</span>
                </div>
                <div className="text-base font-black text-[#0B3A53]">
                  {destination.recommendedStayDays || '2 - 3 Days'}
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Recommended duration to cover top attractions comfortably
                </p>
              </div>

              {/* Avg Budget Per Day */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 uppercase tracking-wider">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Avg Budget Per Day</span>
                </div>
                <div className="text-base font-black text-emerald-800">
                  {destination.avgBudgetPerDay || '$60 - $95 / day'}
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Estimated meals, basic transfers, and standard lodging
                </p>
              </div>
            </div>

            {/* Visitor Access, Hours & Entry Fees */}
            <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#146C86] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#16A6A1]" />
                  <span>Visitor Access, Opening Hours & Entry Fees</span>
                </div>
                {destination.openingHours && (
                  <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-xl border border-teal-200 shadow-2xs">
                    🕒 {destination.openingHours}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Local Entry Fee */}
                <div className="bg-white p-3.5 rounded-xl border border-teal-200/70 space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider">
                    Local Citizens Entry Fee
                  </span>
                  <div className="text-sm font-black text-[#0B3A53]">
                    {destination.entryFeeLocal || 'Free Entry / Standard Permit'}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Applicable for Sri Lankan identity card holders & students
                  </p>
                </div>

                {/* Foreign Entry Fee */}
                <div className="bg-white p-3.5 rounded-xl border border-teal-200/70 space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-[#146C86] tracking-wider">
                    Foreign Tourists Entry Fee
                  </span>
                  <div className="text-sm font-black text-[#146C86]">
                    {destination.entryFeeForeign || '$25 / LKR 7,500'}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    International visitor ticket pricing including heritage pass
                  </p>
                </div>
              </div>
            </div>

            {/* Top Attractions Added by Admin */}
            {destination.topAttractions && destination.topAttractions.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#146C86] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#16A6A1]" />
                    <span>Top Attractions</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#16A6A1]/15 text-[#146C86]">
                    {destination.topAttractions.length} Attractions
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {destination.topAttractions.map((attr, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0B3A53] shadow-2xs flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#16A6A1]" />
                      <span>{attr}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Added by Admin */}
            {destination.description && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-xs font-black text-[#146C86] uppercase tracking-wider block">
                  Description
                </span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                  {destination.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer shadow-2xs transition-colors"
          >
            Close Details
          </button>

          {onEdit ? (
            <button
              onClick={() => {
                onClose();
                onEdit(destination);
              }}
              className="px-6 py-2.5 rounded-full bg-[#0B3A53] hover:bg-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-102"
            >
              <Edit className="w-3.5 h-3.5 text-[#16A6A1]" />
              <span>Edit Destination</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#146C86] to-[#16A6A1] hover:from-[#0B3A53] hover:to-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-102"
            >
              <span>Explore Destination</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
