import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  Plus,
  Compass,
  ArrowRight,
  Layers,
  FileText,
} from 'lucide-react';
import { Recommendation } from '../../types/reviewsAndRecommendations';
import { MOCK_USER_TRIPS, UserTrip, TripDayItinerary, TripActivityDetail } from '../../mock/tripsData';

interface AddToTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: Recommendation | null;
  onSuccess: (tripName: string, dayNumber: number, activityTitle: string, tripId: string) => void;
}

export const AddToTripModal: React.FC<AddToTripModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  onSuccess,
}) => {
  const [userTrips, setUserTrips] = useState<UserTrip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('02:00 PM');
  const [activityType, setActivityType] = useState<'Sightseeing' | 'Activity' | 'Dining'>('Sightseeing');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isCreatingNewTrip, setIsCreatingNewTrip] = useState<boolean>(false);
  const [newTripName, setNewTripName] = useState<string>('');

  // Load active user trips from localStorage or fallback to mock trips
  useEffect(() => {
    if (!isOpen) return;

    let deletedIds = new Set<string>();
    try {
      const deleted = localStorage.getItem('nova_deleted_trip_ids');
      if (deleted) deletedIds = new Set(JSON.parse(deleted));
    } catch {}

    const saved = localStorage.getItem('nova_user_trips');
    let loadedTrips: UserTrip[] = [];

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((t: UserTrip) => t.id));
          const uniqueMocks = MOCK_USER_TRIPS.filter((t) => !existingIds.has(t.id));
          loadedTrips = [...parsed, ...uniqueMocks].filter((t) => !deletedIds.has(t.id));
        }
      } catch (e) {
        console.error('Failed to parse trips', e);
      }
    }

    if (loadedTrips.length === 0) {
      loadedTrips = MOCK_USER_TRIPS.filter((t) => !deletedIds.has(t.id));
    }

    setUserTrips(loadedTrips);

    if (loadedTrips.length > 0) {
      // Default to the first upcoming/ongoing trip or match destination
      const match = recommendation
        ? loadedTrips.find((t) =>
            t.destination.toLowerCase().includes((recommendation.location || '').toLowerCase())
          )
        : null;
      const target = match || loadedTrips[0];
      setSelectedTripId(target.id);
      setSelectedDayNumber(1);
      setIsCreatingNewTrip(false);
    } else {
      setIsCreatingNewTrip(true);
      setNewTripName(
        recommendation
          ? `${recommendation.location || 'Sri Lanka'} Discovery Tour`
          : 'My Sri Lanka Trip'
      );
    }
  }, [isOpen, recommendation]);

  if (!isOpen || !recommendation) return null;

  const currentTrip = userTrips.find((t) => t.id === selectedTripId);
  const availableDays = currentTrip?.dailyItinerary || [];

  const handleSaveToItinerary = () => {
    let targetTripId = selectedTripId;
    let targetTripName = currentTrip?.name || 'My Trip';
    let updatedTrips = [...userTrips];

    const newActivity: TripActivityDetail = {
      time: selectedTimeSlot,
      title: recommendation.name,
      location: `${recommendation.location}, Sri Lanka`,
      description:
        customNotes.trim() ||
        recommendation.explanation ||
        `Visit ${recommendation.name} (${recommendation.category}) - ${recommendation.duration || '2-3 hours'}`,
      status: 'Planned',
      type: activityType,
    };

    if (isCreatingNewTrip || !currentTrip) {
      const tripTitle = newTripName.trim() || `${recommendation.location} Adventure`;
      const newTripId = `trip-custom-${Date.now()}`;
      targetTripId = newTripId;
      targetTripName = tripTitle;

      const createdTrip: UserTrip = {
        id: newTripId,
        name: tripTitle,
        destination: `${recommendation.location}, Sri Lanka`,
        destinationId: recommendation.location.toLowerCase().replace(/\s+/g, '-'),
        dates: 'Next Upcoming Trip',
        duration: '3 Days',
        travelers: 2,
        status: 'Planning',
        imageUrl: recommendation.image,
        budget: '$300',
        progress: {
          destination: true,
          preferences: true,
          aiPlanning: false,
          itinerary: true,
          bookings: false,
        },
        interests: [recommendation.category],
        dailyItinerary: [
          {
            day: 1,
            date: 'Day 1',
            title: `${recommendation.location} Arrival & Highlights`,
            activities: [newActivity],
          },
        ],
      };

      updatedTrips = [createdTrip, ...updatedTrips];
    } else {
      // Add activity to existing trip's selected day
      updatedTrips = updatedTrips.map((trip) => {
        if (trip.id !== targetTripId) return trip;

        const itinerary = trip.dailyItinerary ? [...trip.dailyItinerary] : [];
        const dayIndex = itinerary.findIndex((d) => d.day === selectedDayNumber);

        if (dayIndex >= 0) {
          const dayItem = itinerary[dayIndex];
          itinerary[dayIndex] = {
            ...dayItem,
            activities: [...(dayItem.activities || []), newActivity],
          };
        } else {
          // If day doesn't exist yet, create day
          itinerary.push({
            day: selectedDayNumber,
            date: `Day ${selectedDayNumber}`,
            title: `${recommendation.name} Visit & Exploration`,
            activities: [newActivity],
          });
          itinerary.sort((a, b) => a.day - b.day);
        }

        return {
          ...trip,
          dailyItinerary: itinerary,
        };
      });
    }

    // Persist to localStorage
    try {
      localStorage.setItem('nova_user_trips', JSON.stringify(updatedTrips));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Failed to save trip to localStorage', err);
    }

    onSuccess(targetTripName, selectedDayNumber, recommendation.name, targetTripId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-[#16A6A1]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#0B3A53] font-heading">
                Add to Trip Itinerary
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Schedule this destination into your personalized travel itinerary
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Selected Attraction Card Preview */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <img
              src={recommendation.image}
              alt={recommendation.name}
              className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-[#0B3A53] text-[10px] font-black uppercase tracking-wider">
                  {recommendation.category}
                </span>
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#16A6A1]" />
                  {recommendation.location}
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 truncate">
                {recommendation.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                {recommendation.explanation || `Estimated visit: ${recommendation.duration || '2-3 hours'}`}
              </p>
            </div>
          </div>

          {/* Form Options */}
          <div className="space-y-4 text-xs font-bold text-slate-700">
            {/* Choose Trip Mode */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-800 font-black uppercase tracking-wider text-[11px]">
                  Select Target Trip
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewTrip(!isCreatingNewTrip)}
                  className="text-[#16A6A1] hover:underline cursor-pointer font-black text-[11px]"
                >
                  {isCreatingNewTrip ? '← Choose Existing Trip' : '+ Create New Trip'}
                </button>
              </div>

              {!isCreatingNewTrip ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {userTrips.map((t) => {
                    const isSelected = t.id === selectedTripId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTripId(t.id);
                          setSelectedDayNumber(1);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#0B3A53] text-white border-[#0B3A53] shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className={`font-black text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {t.name}
                          </p>
                          <p className={`text-[10px] font-semibold truncate ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                            {t.destination} • {t.duration}
                          </p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="text"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  placeholder="e.g. Sri Lanka Discovery Tour 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#16A6A1] focus:ring-1 focus:ring-[#16A6A1] outline-none text-xs font-semibold text-slate-800"
                />
              )}
            </div>

            {/* Day Selector */}
            {!isCreatingNewTrip && currentTrip && (
              <div className="space-y-1.5">
                <label className="text-slate-800 font-black uppercase tracking-wider text-[11px]">
                  Itinerary Day
                </label>
                <div className="flex flex-wrap gap-2">
                  {(availableDays.length > 0
                    ? availableDays.map((d) => d.day)
                    : [1, 2, 3]
                  ).map((dayNum) => (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => setSelectedDayNumber(dayNum)}
                      className={`px-3.5 py-1.5 rounded-full font-black text-xs transition-all cursor-pointer ${
                        selectedDayNumber === dayNum
                          ? 'bg-[#16A6A1] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Day {dayNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const nextDay = (availableDays.length || 3) + 1;
                      setSelectedDayNumber(nextDay);
                    }}
                    className={`px-3 py-1.5 rounded-full font-bold text-xs border border-dashed transition-all cursor-pointer flex items-center gap-1 ${
                      selectedDayNumber > (availableDays.length || 3)
                        ? 'bg-[#16A6A1] text-white border-[#16A6A1]'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Plus className="w-3 h-3" /> Add Day {(availableDays.length || 3) + 1}
                  </button>
                </div>
              </div>
            )}

            {/* Preferred Time Slot & Activity Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-800 font-black uppercase tracking-wider text-[11px]">
                  Preferred Time
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['09:00 AM', '02:00 PM', '05:30 PM'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTimeSlot(time)}
                      className={`py-1.5 px-2 rounded-xl text-center font-bold text-[11px] transition-all cursor-pointer ${
                        selectedTimeSlot === time
                          ? 'bg-[#0B3A53] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-800 font-black uppercase tracking-wider text-[11px]">
                  Activity Classification
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Sightseeing', 'Activity', 'Dining'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActivityType(type)}
                      className={`py-1.5 px-2 rounded-xl text-center font-bold text-[11px] transition-all cursor-pointer ${
                        activityType === type
                          ? 'bg-[#16A6A1] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-slate-800 font-black uppercase tracking-wider text-[11px]">
                Traveler Notes (Optional)
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Remember to carry camera lenses and buy entry tickets online."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#16A6A1] focus:ring-1 focus:ring-[#16A6A1] outline-none text-xs font-medium text-slate-800 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveToItinerary}
            className="px-6 py-2.5 rounded-xl bg-[#16A6A1] hover:bg-[#138D89] text-white font-black text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Add to Itinerary</span>
          </button>
        </div>
      </div>
    </div>
  );
};
