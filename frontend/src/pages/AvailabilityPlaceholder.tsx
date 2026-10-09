import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Plus, Trash2, User, CheckCircle2, AlertCircle, Filter, Sparkles, MapPin } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { guideService } from '../services/guideService';
import { guideAvailabilityService, type AvailabilitySlotResponse } from '../services/guideAvailabilityService';
import type { Guide } from '../types/travel';

const FALLBACK_SLOTS: AvailabilitySlotResponse[] = [
  { availabilityId: 1, guideId: 1, guideName: 'Kasun Perera', availableDate: '2026-10-15', startTime: '08:30:00', endTime: '16:30:00', isBooked: false },
  { availabilityId: 2, guideId: 1, guideName: 'Kasun Perera', availableDate: '2026-10-16', startTime: '09:00:00', endTime: '17:00:00', isBooked: true },
  { availabilityId: 3, guideId: 2, guideName: 'Suresh Kumar', availableDate: '2026-10-17', startTime: '07:00:00', endTime: '15:00:00', isBooked: false },
  { availabilityId: 4, guideId: 3, guideName: 'Fatima Nazeer', availableDate: '2026-10-18', startTime: '10:00:00', endTime: '18:00:00', isBooked: false },
  { availabilityId: 5, guideId: 4, guideName: 'Dr. Jayatilleke', availableDate: '2026-10-19', startTime: '08:00:00', endTime: '14:00:00', isBooked: true },
];

export const AvailabilityPlaceholder: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlotResponse[]>(FALLBACK_SLOTS);
  const [loading, setLoading] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<number | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    guideId: 1,
    availableDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
  });

  useEffect(() => {
    setLoading(true);
    guideService.getGuides()
      .then((data) => {
        if (data && data.length > 0) {
          setGuides(data);
          const firstId = parseInt(String(data[0].id), 10) || 1;
          setForm(prev => ({ ...prev, guideId: firstId }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      guideId: form.guideId,
      availableDate: form.availableDate,
      startTime: form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime,
      endTime: form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime,
    };

    try {
      const created = await guideAvailabilityService.create(form.guideId, payload);
      setSlots(prev => [created, ...prev]);
    } catch {
      // Local fallback for offline/preview
      const matchedGuide = guides.find(g => parseInt(String(g.id), 10) === form.guideId);
      const fakeSlot: AvailabilitySlotResponse = {
        availabilityId: Date.now(),
        guideId: form.guideId,
        guideName: matchedGuide?.name || 'Licensed Guide',
        availableDate: payload.availableDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
        isBooked: false,
      };
      setSlots(prev => [fakeSlot, ...prev]);
    } finally {
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteSlot = async (guideId: number, slotId: number) => {
    try {
      await guideAvailabilityService.delete(guideId, slotId);
    } catch {}
    setSlots(prev => prev.filter(s => s.availabilityId !== slotId));
  };

  const filteredSlots = slots.filter(slot => {
    const matchesGuide = selectedGuideId === 'all' || slot.guideId === selectedGuideId;
    const matchesDate = !dateFilter || slot.availableDate === dateFilter;
    return matchesGuide && matchesDate;
  });

  const availableCount = filteredSlots.filter(s => !s.isBooked).length;
  const bookedCount = filteredSlots.filter(s => s.isBooked).length;

  return (
    <PageContainer>
      <PageHeader
        title="Guide & Resource Availability Dispatch"
        subtitle="Real-time capacity tracking and scheduling matrix for licensed tour guides across Sri Lanka"
        breadcrumbs={[{ label: 'Operations' }, { label: 'Availability' }]}
        actions={
          <Button
            variant="accent"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Availability Slot
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-3.5 bg-gradient-to-br from-white to-teal-50/30 border-teal-100">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0B3A53]">{filteredSlots.length}</div>
            <div className="text-xs font-semibold text-slate-500">Total Scheduled Slots</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 bg-gradient-to-br from-white to-emerald-50/30 border-emerald-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0B3A53]">{availableCount}</div>
            <div className="text-xs font-semibold text-slate-500">Available For Booking</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 bg-gradient-to-br from-white to-amber-50/30 border-amber-100">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0B3A53]">{bookedCount}</div>
            <div className="text-xs font-semibold text-slate-500">Assigned / Booked</div>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600 uppercase">Filters:</span>
            </div>

            <select
              value={selectedGuideId}
              onChange={(e) => setSelectedGuideId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">All Guides</option>
              {guides.map((g) => {
                const numericId = parseInt(String(g.id), 10) || 1;
                return (
                  <option key={g.id} value={numericId}>
                    {g.name}
                  </option>
                );
              })}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:outline-none"
            />

            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-teal-600 font-bold hover:underline cursor-pointer"
              >
                Clear Date
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-slate-400">
            Showing <strong className="text-slate-700">{filteredSlots.length}</strong> time windows
          </div>
        </div>
      </Card>

      {/* Slots List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSlots.map((slot) => (
          <Card key={slot.availabilityId} className="p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500/20 to-[#0B3A53]/10 border border-teal-500/20 flex items-center justify-center text-teal-700 font-bold text-sm">
                  {slot.guideName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#0B3A53] leading-tight">{slot.guideName}</h4>
                  <span className="text-[10px] font-bold text-slate-400">Guide ID #{slot.guideId}</span>
                </div>
              </div>

              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                slot.isBooked
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {slot.isBooked ? 'Booked' : 'Available'}
              </span>
            </div>

            <div className="space-y-2 py-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>{slot.availableDate}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 font-semibold">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{slot.startTime.substring(0, 5)} – {slot.endTime.substring(0, 5)}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Dispatch Slot #{slot.availabilityId}</span>
              <button
                onClick={() => handleDeleteSlot(slot.guideId, slot.availabilityId)}
                className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </Card>
        ))}
      </div>

      {filteredSlots.length === 0 && (
        <Card className="p-12 text-center text-slate-400 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-700">No availability slots found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your guide filter or date criteria, or click "Add Availability Slot" to schedule a new time window.
          </p>
        </Card>
      )}

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-[#0B3A53] to-[#146C86] p-6 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-300 tracking-wider">SCHEDULING ENGINE</span>
                <h3 className="text-lg font-black font-heading">Add Guide Availability</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Select Tour Guide *</label>
                <select
                  value={form.guideId}
                  onChange={(e) => setForm({ ...form, guideId: Number(e.target.value) })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:outline-none"
                >
                  {guides.length > 0 ? (
                    guides.map((g) => {
                      const id = parseInt(String(g.id), 10) || 1;
                      return (
                        <option key={g.id} value={id}>
                          {g.name} ({g.phone || 'Licensed'})
                        </option>
                      );
                    })
                  ) : (
                    <>
                      <option value={1}>Kasun Perera (Cultural Heritage)</option>
                      <option value={2}>Suresh Kumar (Hiking & Nature)</option>
                      <option value={3}>Fatima Nazeer (Colonial & Fort)</option>
                      <option value={4}>Dr. Jayatilleke (Ancient Kingdoms)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Available Date *</label>
                <input
                  type="date"
                  required
                  value={form.availableDate}
                  onChange={(e) => setForm({ ...form, availableDate: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">End Time *</label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="accent">
                  Confirm Availability
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
