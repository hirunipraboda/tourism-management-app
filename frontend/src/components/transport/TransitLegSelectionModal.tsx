import React, { useState, useEffect } from 'react';
import {
  X,
  Bus,
  Train,
  Car,
  Clock,
  MapPin,
  ArrowRight,
  Check,
  Search,
  Sparkles,
  AlertCircle,
  RefreshCw,
  DollarSign,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { transportService, TransportOption } from '../../services/transportService';
import { SRI_LANKA_DESTINATIONS } from '../../mock/manualPlannerData';

export interface TripTransitLeg {
  id: string;
  fromDayNumber: number;
  toDayNumber?: number;
  fromDestination: string;
  toDestination: string;
  dateStr?: string;
  mode: 'PUBLIC_TRANSPORT' | 'PRIVATE';
  publicTransport?: TransportOption | null;
  privateVehicleType?: string;
  estimatedCostUSD: number;
  isCustom?: boolean;
}

export const PRIVATE_VEHICLE_OPTIONS = [
  {
    type: 'AC Sedan',
    pax: '3 Pax',
    rateUSD: 35,
    tag: 'Popular for Couples',
    desc: 'Comfortable air-conditioned private sedan with licensed English-speaking chauffeur.',
  },
  {
    type: 'Tourist Van',
    pax: '7 Pax',
    rateUSD: 55,
    tag: 'Best for Groups',
    desc: 'Spacious high-roof air-conditioned passenger van with dedicated luggage storage.',
  },
  {
    type: 'Luxury SUV',
    pax: '4 Pax',
    rateUSD: 75,
    tag: 'Premium Hill-Country',
    desc: 'Executive 4WD SUV with superior comfort, panoramic glass roof and scenic route handling.',
  },
  {
    type: 'Safari 4x4 Jeep',
    pax: '6 Pax',
    rateUSD: 45,
    tag: 'Wildlife & Park Hop',
    desc: 'Raised open-top 4x4 safari cruiser with national park clearance and spotter.',
  },
  {
    type: 'Traditional Tuk-Tuk',
    pax: '2 Pax',
    rateUSD: 20,
    tag: 'Local Scenic Hop',
    desc: 'Iconic Sri Lankan three-wheeler for short-range transfers and authentic local travel.',
  },
];

interface TransitLegSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  leg: TripTransitLeg | null;
  availableDestinations?: string[];
  travelersCount?: number;
  onSaveLeg: (updatedLeg: TripTransitLeg) => void;
}

export const TransitLegSelectionModal: React.FC<TransitLegSelectionModalProps> = ({
  isOpen,
  onClose,
  leg,
  availableDestinations = [],
  travelersCount = 1,
  onSaveLeg,
}) => {
  if (!isOpen || !leg) return null;

  const [fromDest, setFromDest] = useState<string>(leg.fromDestination || 'Yala');
  const [toDest, setToDest] = useState<string>(leg.toDestination || 'Colombo');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(leg.fromDayNumber || 1);
  const [mode, setMode] = useState<'PUBLIC_TRANSPORT' | 'PRIVATE'>(leg.mode || 'PUBLIC_TRANSPORT');
  const [selectedPublicOption, setSelectedPublicOption] = useState<TransportOption | null>(
    leg.publicTransport || null
  );
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>(
    leg.privateVehicleType || 'AC Sedan'
  );

  // Search state
  const [isLoadingPublic, setIsLoadingPublic] = useState<boolean>(false);
  const [publicTransportResults, setPublicTransportResults] = useState<TransportOption[]>([]);
  const [publicSearchError, setPublicSearchError] = useState<string | null>(null);
  const [activePublicFilter, setActivePublicFilter] = useState<'ALL' | 'BUS' | 'TRAIN'>('ALL');

  // Destination options list
  const allDestOptions = Array.from(
    new Set([
      ...availableDestinations,
      ...SRI_LANKA_DESTINATIONS.map((d) => d.name),
      'Colombo',
      'Kandy',
      'Yala',
      'Galle',
      'Ella',
      'Sigiriya',
      'Mirissa',
      'Nuwara Eliya',
    ])
  ).filter(Boolean);

  // Auto search public transport when origin or destination changes
  useEffect(() => {
    let isCancelled = false;

    const performSearch = async () => {
      if (!fromDest || !toDest || fromDest.toLowerCase() === toDest.toLowerCase()) {
        setPublicTransportResults([]);
        return;
      }

      setIsLoadingPublic(true);
      setPublicSearchError(null);
      try {
        const dateParam = leg.dateStr ? new Date().toISOString().split('T')[0] : '2026-10-01';
        const res = await transportService.searchPublicTransport(
          fromDest,
          toDest,
          dateParam,
          undefined,
          travelersCount
        );
        if (!isCancelled) {
          const combined = [...(res.buses || []), ...(res.trains || [])];
          setPublicTransportResults(combined);
          if (combined.length === 0) {
            setPublicSearchError(`No direct scheduled public buses/trains found between ${fromDest} and ${toDest}. Consider private chauffeur vehicle.`);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn('Transport search fallback:', err);
          // Fallback options for smooth UX
          const fallbackOptions: TransportOption[] = [
            {
              id: `fallback-bus-${Date.now()}`,
              transportType: 'BUS',
              origin: fromDest,
              destination: toDest,
              travelDate: '2026-10-01',
              departureTime: '08:00 AM',
              arrivalTime: '12:30 PM',
              durationMinutes: 270,
              routeNumber: 'EX-01',
              routeName: `Express Coach (${fromDest} to ${toDest})`,
              estimatedFare: 1100,
              source: 'SLTB Express',
            },
            {
              id: `fallback-train-${Date.now()}`,
              transportType: 'TRAIN',
              origin: fromDest,
              destination: toDest,
              travelDate: '2026-10-01',
              departureTime: '09:15 AM',
              arrivalTime: '01:45 PM',
              durationMinutes: 270,
              trainNumber: '1021',
              trainName: `Intercity Express`,
              estimatedFare: 950,
              source: 'Sri Lanka Railways',
            },
          ];
          setPublicTransportResults(fallbackOptions);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingPublic(false);
        }
      }
    };

    if (mode === 'PUBLIC_TRANSPORT') {
      performSearch();
    }

    return () => {
      isCancelled = true;
    };
  }, [fromDest, toDest, mode, travelersCount]);

  const handleSwap = () => {
    const temp = fromDest;
    setFromDest(toDest);
    setToDest(temp);
    setSelectedPublicOption(null);
  };

  const filteredPublicResults = publicTransportResults.filter((opt) => {
    if (activePublicFilter === 'BUS') return opt.transportType === 'BUS';
    if (activePublicFilter === 'TRAIN') return opt.transportType === 'TRAIN';
    return true;
  });

  const calculateCostUSD = (): number => {
    if (mode === 'PUBLIC_TRANSPORT') {
      if (!selectedPublicOption) return 6 * Math.max(1, travelersCount);
      const fareUSD = selectedPublicOption.estimatedFare
        ? Math.round((selectedPublicOption.estimatedFare / 300) * Math.max(1, travelersCount))
        : 6 * Math.max(1, travelersCount);
      return Math.max(3, fareUSD);
    }
    const vehicle = PRIVATE_VEHICLE_OPTIONS.find((v) => v.type === selectedVehicleType);
    return vehicle ? vehicle.rateUSD : 35;
  };

  const handleApply = () => {
    const cost = calculateCostUSD();
    const updatedLeg: TripTransitLeg = {
      ...leg,
      fromDestination: fromDest,
      toDestination: toDest,
      fromDayNumber: selectedDayNumber,
      toDayNumber: selectedDayNumber + 1,
      mode,
      publicTransport: mode === 'PUBLIC_TRANSPORT' ? selectedPublicOption : null,
      privateVehicleType: mode === 'PRIVATE' ? selectedVehicleType : undefined,
      estimatedCostUSD: cost,
    };
    onSaveLeg(updatedLeg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0B3A53] via-[#0e4867] to-[#146C86] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  Configure Transit Method
                </h3>
                <span className="bg-teal-500/20 text-teal-200 border border-teal-300/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Day {selectedDayNumber} Route
                </span>
              </div>
              <p className="text-xs text-slate-200">
                Choose separate public transit or private chauffeur for this leg ({fromDest} ➔ {toDest}).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* 1. ROUTE SELECTOR: ORIGIN & DESTINATION */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Route Direction & Day
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {travelersCount} Traveler{travelersCount > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Origin */}
              <div className="sm:col-span-5 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" /> From Origin
                </label>
                <select
                  value={fromDest}
                  onChange={(e) => {
                    setFromDest(e.target.value);
                    setSelectedPublicOption(null);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-extrabold text-[#0B3A53] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]"
                >
                  {allDestOptions.map((d) => (
                    <option key={`from-${d}`} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="sm:col-span-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-2 rounded-xl border border-slate-300 hover:border-[#16A6A1] bg-white hover:bg-teal-50 text-slate-600 hover:text-[#16A6A1] transition-all cursor-pointer shadow-xs"
                  title="Swap Origin & Destination"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Destination */}
              <div className="sm:col-span-5 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-600" /> To Destination
                </label>
                <select
                  value={toDest}
                  onChange={(e) => {
                    setToDest(e.target.value);
                    setSelectedPublicOption(null);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-extrabold text-[#0B3A53] focus:outline-none focus:ring-2 focus:ring-[#16A6A1]"
                >
                  {allDestOptions.map((d) => (
                    <option key={`to-${d}`} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. MODE SWITCHER TABS: PUBLIC VS PRIVATE */}
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Choose Transport Category for {fromDest} ➔ {toDest}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('PUBLIC_TRANSPORT')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                  mode === 'PUBLIC_TRANSPORT'
                    ? 'border-[#16A6A1] bg-teal-50/70 ring-2 ring-[#16A6A1]/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-[#146C86] flex items-center justify-center shrink-0">
                    <div className="flex items-center">
                      <Bus className="w-4 h-4 text-[#16A6A1]" />
                      <Train className="w-4 h-4 text-[#0B3A53]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      Public Transport
                    </h4>
                    <p className="text-[11px] text-slate-500">Scheduled Buses & Trains</p>
                  </div>
                </div>
                {mode === 'PUBLIC_TRANSPORT' && (
                  <span className="w-5 h-5 rounded-full bg-[#16A6A1] text-white flex items-center justify-center text-xs">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode('PRIVATE')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                  mode === 'PRIVATE'
                    ? 'border-[#16A6A1] bg-teal-50/70 ring-2 ring-[#16A6A1]/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5 text-[#16A6A1]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      Private Chauffeur
                    </h4>
                    <p className="text-[11px] text-slate-500">AC Sedan, Van, SUV & Jeeps</p>
                  </div>
                </div>
                {mode === 'PRIVATE' && (
                  <span className="w-5 h-5 rounded-full bg-[#16A6A1] text-white flex items-center justify-center text-xs">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 3. OPTION DETAILS ACCORDING TO MODE */}
          {mode === 'PUBLIC_TRANSPORT' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-[#0B3A53] flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#16A6A1]" />
                  Available Timetables ({filteredPublicResults.length} Found)
                </span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setActivePublicFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                      activePublicFilter === 'ALL' ? 'bg-white shadow-xs text-[#0B3A53]' : 'text-slate-500'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePublicFilter('BUS')}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1 ${
                      activePublicFilter === 'BUS' ? 'bg-white shadow-xs text-[#0B3A53]' : 'text-slate-500'
                    }`}
                  >
                    <Bus className="w-3 h-3" /> Buses
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePublicFilter('TRAIN')}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1 ${
                      activePublicFilter === 'TRAIN' ? 'bg-white shadow-xs text-[#0B3A53]' : 'text-slate-500'
                    }`}
                  >
                    <Train className="w-3 h-3" /> Trains
                  </button>
                </div>
              </div>

              {isLoadingPublic ? (
                <div className="py-10 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-[#16A6A1] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold">
                    Searching official timetables between {fromDest} and {toDest}...
                  </p>
                </div>
              ) : filteredPublicResults.length === 0 ? (
                <div className="p-6 border border-dashed border-slate-300 rounded-2xl text-center space-y-3">
                  <p className="text-xs text-slate-500">
                    {publicSearchError || `No direct public transport records found for ${fromDest} to ${toDest}.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode('PRIVATE')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#16A6A1] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Switch to Private Chauffeur Vehicle</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {filteredPublicResults.map((opt) => {
                    const isSelected = selectedPublicOption?.id === opt.id;
                    const fareUSD = Math.round(((opt.estimatedFare || 0) / 300) * travelersCount);

                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedPublicOption(opt)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-[#16A6A1] bg-teal-50/70 shadow-xs ring-1 ring-[#16A6A1]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              opt.transportType === 'BUS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {opt.transportType === 'BUS' ? (
                              <Bus className="w-4 h-4" />
                            ) : (
                              <Train className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {opt.transportType === 'BUS'
                                  ? `Bus ${opt.routeNumber || 'Express'}`
                                  : `Train ${opt.trainNumber || 'Express'}`}
                              </span>
                              <span className="text-xs font-extrabold text-slate-800">
                                {opt.routeName || opt.trainName || `${opt.origin} → ${opt.destination}`}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>
                                {opt.departureTime} – {opt.arrivalTime} ({opt.durationMinutes} mins)
                              </span>
                              {opt.source && <span>· {opt.source}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                          <div className="text-left sm:text-right">
                            <span className="text-xs font-black text-[#0B3A53] block">
                              LKR {(opt.estimatedFare || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-teal-800 font-bold block">
                              ~${fareUSD > 0 ? fareUSD : 3} ({travelersCount} pax)
                            </span>
                          </div>
                          <button
                            type="button"
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#16A6A1] text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* PRIVATE TRANSPORT OPTIONS */
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#0B3A53] block">
                Select Dedicated Vehicle for {fromDest} ➔ {toDest}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRIVATE_VEHICLE_OPTIONS.map((v) => {
                  const isSelected = selectedVehicleType === v.type;
                  return (
                    <div
                      key={v.type}
                      onClick={() => setSelectedVehicleType(v.type)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'border-[#16A6A1] bg-teal-50/70 shadow-xs ring-1 ring-[#16A6A1]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-900">{v.type}</span>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800">
                            {v.pax}
                          </span>
                        </div>
                        <span className="text-xs font-black text-[#146C86]">${v.rateUSD}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{v.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. CURRENT SELECTION OVERVIEW */}
          <div className="p-3.5 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0B3A53] text-white flex items-center justify-center shrink-0">
                {mode === 'PUBLIC_TRANSPORT' ? (
                  selectedPublicOption?.transportType === 'BUS' ? (
                    <Bus className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <Train className="w-4 h-4 text-amber-300" />
                  )
                ) : (
                  <Car className="w-4 h-4 text-teal-300" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#0B3A53] block">
                  Chosen Method: {fromDest} → {toDest}
                </span>
                <span className="font-extrabold text-slate-800">
                  {mode === 'PUBLIC_TRANSPORT'
                    ? selectedPublicOption
                      ? `${selectedPublicOption.transportType === 'BUS' ? 'Bus Route ' + (selectedPublicOption.routeNumber || '') : 'Train ' + (selectedPublicOption.trainNumber || '')}: ${selectedPublicOption.departureTime}`
                      : 'Public Express (General Pass)'
                    : `Private ${selectedVehicleType}`}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-[#0B3A53] block">
                Estimated: ${calculateCostUSD()}
              </span>
              <span className="text-[10px] text-slate-500">Per Leg</span>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#16A6A1] hover:bg-[#146C86] text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Transit to Route</span>
          </button>
        </div>
      </div>
    </div>
  );
};
