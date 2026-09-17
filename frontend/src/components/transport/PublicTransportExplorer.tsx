import React, { useState, useEffect, useId } from 'react';
import {
  Bus,
  Train,
  Clock,
  MapPin,
  Calendar,
  ArrowRight,
  Check,
  Search,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Compass,
  Tag,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { transportService, TransportOption } from '../../services/transportService';

interface PublicTransportExplorerProps {
  defaultOrigin?: string;
  defaultDestination?: string;
  defaultDate?: string;
  travelersCount?: number;
  availableDestinations?: string[];
  selectedTransport?: TransportOption | null;
  onSelectTransport: (option: TransportOption) => void;
  onClearTransport?: () => void;
}

export const PublicTransportExplorer: React.FC<PublicTransportExplorerProps> = ({
  defaultOrigin = 'Colombo Fort',
  defaultDestination = 'Kandy',
  defaultDate = '',
  travelersCount = 1,
  availableDestinations = [],
  selectedTransport = null,
  onSelectTransport,
  onClearTransport,
}) => {
  const originInputId = useId();
  const destinationInputId = useId();
  const dateInputId = useId();
  const departureTimeInputId = useId();

  // Active filter tab: 'ALL' | 'BUS' | 'TRAIN'
  const [activeTab, setActiveTab] = useState<'ALL' | 'BUS' | 'TRAIN'>('ALL');

  // Search parameters
  const [origin, setOrigin] = useState<string>(defaultOrigin);
  const [destination, setDestination] = useState<string>(defaultDestination);
  const [travelDate, setTravelDate] = useState<string>(
    defaultDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [departureTime, setDepartureTime] = useState<string>('07:00');

  // API State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [buses, setBuses] = useState<TransportOption[]>([]);
  const [trains, setTrains] = useState<TransportOption[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Accordion for intermediate stops
  const [expandedStopsId, setExpandedStopsId] = useState<string | null>(null);

  // Quick swap origin and destination
  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Perform search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      setError('Please specify both an origin and a destination.');
      return;
    }
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setError('Origin and destination cannot be the same location.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await transportService.searchPublicTransport(
        origin.trim(),
        destination.trim(),
        travelDate,
        departureTime || undefined,
        travelersCount
      );

      setBuses(res.buses || []);
      setTrains(res.trains || []);
      setHasSearched(true);
    } catch (err: unknown) {
      console.warn('Public transport search failed:', err);
      const errMsg = err instanceof Error ? err.message : 'Unable to connect to public transport service.';
      setError(`Public transport information is temporarily unavailable: ${errMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger initial search if defaults present
  useEffect(() => {
    if (defaultOrigin && defaultDestination) {
      handleSearch();
    }
  }, [defaultOrigin, defaultDestination]);

  // Filtered options based on tab
  const displayedOptions = React.useMemo(() => {
    if (activeTab === 'BUS') return buses;
    if (activeTab === 'TRAIN') return trains;
    return [...trains, ...buses];
  }, [activeTab, buses, trains]);

  return (
    <div className="space-y-6">
      {/* Header & Mode Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[11px] font-black uppercase text-[#16A6A1] tracking-widest block">
            SRI LANKA TRANSIT NETWORK
          </span>
          <h3 className="text-xl font-black text-[#0B3A53] flex items-center gap-2">
            <span>Public Transit Schedule Explorer</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time intercity buses (SLTB / Expressway) and Sri Lanka Railways Main & Coastal line trains.
          </p>
        </div>

        {/* Selected pill summary */}
        {selectedTransport && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-2xl">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <div className="text-left">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block leading-none">
                Selected for Trip
              </span>
              <span className="text-xs font-black text-emerald-950">
                {selectedTransport.transportType === 'TRAIN'
                  ? `🚆 ${selectedTransport.trainName || 'Train'}`
                  : `🚌 Bus ${selectedTransport.routeNumber || 'Route'}`}{' '}
                ({selectedTransport.departureTime} ➔ {selectedTransport.arrivalTime})
              </span>
            </div>
            {onClearTransport && (
              <button
                type="button"
                onClick={onClearTransport}
                className="ml-2 text-[10px] font-bold text-slate-400 hover:text-rose-600 underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Search Bar / Input Card */}
      <div className="bg-gradient-to-r from-slate-900 to-[#0B3A53] rounded-3xl p-5 sm:p-6 text-white shadow-lg space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Origin Input */}
            <div className="space-y-1">
              <label htmlFor={originInputId} className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#16A6A1]" /> Origin / Station
              </label>
              <div className="relative">
                <input
                  id={originInputId}
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Colombo Fort"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-[#16A6A1]"
                />
              </div>
            </div>

            {/* Destination Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor={destinationInputId} className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-amber-300" /> Destination
                </label>
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  className="text-[10px] text-teal-300 hover:text-white flex items-center gap-0.5 cursor-pointer font-bold"
                  title="Swap Origin and Destination"
                >
                  ⇄ Swap
                </button>
              </div>
              <div className="relative">
                <input
                  id={destinationInputId}
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Kandy"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Travel Date */}
            <div className="space-y-1">
              <label htmlFor={dateInputId} className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-sky-300" /> Travel Date
              </label>
              <input
                id={dateInputId}
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#16A6A1]"
              />
            </div>

            {/* Departure Time */}
            <div className="space-y-1">
              <label htmlFor={departureTimeInputId} className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-300" /> Pref. Departure Time
              </label>
              <input
                id={departureTimeInputId}
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#16A6A1]"
              />
            </div>
          </div>

          {/* Quick Destination Tags & Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Quick Select:</span>
              {availableDestinations.length > 0
                ? availableDestinations.slice(0, 4).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDestination(d)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                        destination === d
                          ? 'bg-[#16A6A1] text-white'
                          : 'bg-white/10 hover:bg-white/20 text-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))
                : ['Kandy', 'Galle', 'Ella', 'Sigiriya'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDestination(d)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                        destination === d
                          ? 'bg-[#16A6A1] text-white'
                          : 'bg-white/10 hover:bg-white/20 text-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#16A6A1] hover:bg-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching Schedules...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Live Schedules</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-900 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Public Transport Search Notice</p>
            <p className="text-[11px] text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs: ALL, BUS, TRAIN */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ALL'
                ? 'bg-white text-[#0B3A53] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All Options</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
              {buses.length + trains.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BUS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'BUS'
                ? 'bg-[#16A6A1] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>Bus Only</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-bold">
              {buses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TRAIN')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'TRAIN'
                ? 'bg-[#0B3A53] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>Train Only</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-bold">
              {trains.length}
            </span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <strong>{displayedOptions.length}</strong> available transit services
        </span>
      </div>

      {/* Transit Options Grid */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#16A6A1] animate-spin mx-auto" />
          <p className="text-sm font-extrabold text-[#0B3A53]">Retrieving Verified Public Transport Schedules...</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Checking Google Maps Platform transit feeds and verified Sri Lanka Railways / SLTB intercity routes.
          </p>
        </div>
      ) : displayedOptions.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto text-slate-500">
            {activeTab === 'TRAIN' ? <Train className="w-6 h-6" /> : <Bus className="w-6 h-6" />}
          </div>
          <h4 className="text-base font-black text-slate-800">No public transit schedules found for this route</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {hasSearched
              ? `No direct public transport matches found between "${origin}" and "${destination}". Try searching between major hubs like "Colombo Fort", "Kandy", "Galle", or choose PickMe private mobility.`
              : 'Enter an origin and destination above and click "Search Live Schedules" to find train and bus options.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedOptions.map((opt) => {
            const isTrain = opt.transportType === 'TRAIN';
            const isChosen = selectedTransport?.id === opt.id;
            const isExpandedStops = expandedStopsId === opt.id;

            return (
              <div
                key={opt.id}
                className={`relative bg-white rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isChosen
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {/* Card Top Header */}
                <div className="p-5 border-b border-slate-100 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isTrain
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {isTrain ? <Train className="w-3 h-3" /> : <Bus className="w-3 h-3" />}
                        <span>{isTrain ? 'Train' : 'Express Bus'}</span>
                      </span>

                      {/* Route or Train Number Badge */}
                      {(opt.routeNumber || opt.trainNumber) && (
                        <span className="text-[10px] font-mono font-extrabold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                          {isTrain ? `#${opt.trainNumber}` : `Route ${opt.routeNumber}`}
                        </span>
                      )}
                    </div>

                    {/* Source Badge */}
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{opt.source || 'Google'}</span>
                    </span>
                  </div>

                  {/* Title & Service Name */}
                  <div>
                    <h4 className="text-base font-black text-[#0B3A53] leading-snug">
                      {isTrain
                        ? opt.trainName || 'Sri Lanka Railways Service'
                        : opt.routeName || `${opt.origin} - ${opt.destination}`}
                    </h4>
                    {isTrain && opt.trainType && (
                      <span className="text-[11px] font-medium text-slate-500 block">
                        {opt.trainType}
                      </span>
                    )}
                    {!isTrain && opt.direction && (
                      <span className="text-[11px] font-medium text-slate-500 block">
                        Towards: {opt.direction}
                      </span>
                    )}
                  </div>

                  {/* Stations / Timeline */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs font-extrabold">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Departure</span>
                        <span className="text-sm font-black text-slate-900">{opt.departureTime}</span>
                        <span className="text-[10px] text-slate-600 font-medium truncate block max-w-[120px]">
                          {opt.departureStation || opt.origin}
                        </span>
                      </div>

                      <div className="flex flex-col items-center px-2">
                        <span className="text-[10px] font-bold text-[#16A6A1]">
                          {opt.durationMinutes} mins
                        </span>
                        <div className="w-16 sm:w-20 h-0.5 bg-slate-300 relative my-1">
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#16A6A1]"></div>
                        </div>
                        <span className="text-[9px] text-slate-400 font-medium">Direct Service</span>
                      </div>

                      <div className="space-y-0.5 text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Arrival</span>
                        <span className="text-sm font-black text-slate-900">{opt.arrivalTime}</span>
                        <span className="text-[10px] text-slate-600 font-medium truncate block max-w-[120px]">
                          {opt.arrivalStation || opt.destination}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Intermediate Stops Accordion (if bus or train stops available) */}
                  {(() => {
                    const rawStops = opt.intermediateStops;
                    const parsedStops: string[] = Array.isArray(rawStops)
                      ? rawStops
                      : typeof rawStops === 'string' && rawStops.trim().length > 0
                      ? rawStops.includes(',')
                        ? rawStops.split(',').map((s) => s.trim()).filter(Boolean)
                        : rawStops.split(/\s{2,}|\t|\n/).length > 1
                        ? rawStops.split(/\s{2,}|\t|\n/).map((s) => s.trim()).filter(Boolean)
                        : rawStops.split(' ').filter(Boolean)
                      : [];

                    if (parsedStops.length === 0) return null;

                    return (
                      <div>
                        <button
                          type="button"
                          onClick={() => setExpandedStopsId(isExpandedStops ? null : opt.id)}
                          className="text-[11px] font-bold text-[#16A6A1] hover:text-[#146C86] flex items-center gap-1 cursor-pointer"
                        >
                          <span>
                            {isExpandedStops ? 'Hide stops' : `View ${parsedStops.length} stops along route`}
                          </span>
                          {isExpandedStops ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {isExpandedStops && (
                          <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-1">
                            <span className="font-bold text-slate-500 uppercase block text-[9px]">Stops Sequence:</span>
                            <div className="flex flex-wrap gap-1">
                              {parsedStops.map((stop, sIdx) => (
                                <span key={sIdx} className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                                  {stop}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Card Bottom: Fare & Select Button */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {opt.estimatedFare ? (
                      <div>
                        <span className="text-sm font-black text-[#0B3A53]">
                          Rs. {opt.estimatedFare.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium ml-1">
                          (~${(opt.estimatedFare / 300).toFixed(2)})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-500">Standard Transit Fare</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectTransport(opt)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      isChosen
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : isTrain
                        ? 'bg-[#0B3A53] hover:bg-[#146C86] text-white shadow-sm'
                        : 'bg-[#16A6A1] hover:bg-[#146C86] text-white shadow-sm'
                    }`}
                  >
                    {isChosen ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <span>Select Transit</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
