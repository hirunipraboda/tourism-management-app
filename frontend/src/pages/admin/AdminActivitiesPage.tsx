import React, { useEffect, useState } from 'react';
import {
  Activity as ActivityIcon,
  Plus,
  Pencil,
  Trash2,
  X,
  Compass,
  Clock,
  DollarSign,
  Search,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any | null>(null);

  const [form, setForm] = useState({
    name: '',
    destinationId: '',
    category: 'culture',
    description: '',
    costPerPerson: 10,
    durationMinutes: 120,
    openingTime: '08:00:00',
    closingTime: '18:00:00',
  });

  const resetForm = () => {
    setForm({
      name: '',
      destinationId: destinations[0]?.id || '',
      category: 'culture',
      description: '',
      costPerPerson: 10,
      durationMinutes: 120,
      openingTime: '08:00:00',
      closingTime: '18:00:00',
    });
    setEditingActivity(null);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [acts, dests] = await Promise.all([
        adminService.fetchActivities(),
        adminService.fetchDestinations(),
      ]);
      setActivities(acts);
      setDestinations(dests);
      if (dests.length > 0 && !form.destinationId) {
        setForm((prev) => ({ ...prev, destinationId: dests[0].id }));
      }
    } catch (err) {
      console.error('Failed to load activities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (activity: any) => {
    setEditingActivity(activity);
    setForm({
      name: activity.name || '',
      destinationId: activity.destinationId || activity.destination?.id || destinations[0]?.id || '',
      category: activity.category || 'culture',
      description: activity.description || '',
      costPerPerson: activity.costPerPerson ?? 0,
      durationMinutes: activity.durationMinutes ?? 120,
      openingTime: activity.openingTime || '08:00:00',
      closingTime: activity.closingTime || '18:00:00',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.destinationId) return;
    try {
      if (editingActivity) {
        await adminService.updateActivity(editingActivity.id, {
          ...form,
          id: editingActivity.id,
        });
      } else {
        await adminService.createActivity(form);
      }
      setModalOpen(false);
      resetForm();
      loadData();
    } catch {
      alert(editingActivity ? 'Failed to update activity.' : 'Failed to save activity.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this tourism activity?')) return;
    try {
      await adminService.deleteActivity(id);
      loadData();
    } catch {
      alert('Failed to remove activity.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            Tourism Activities & Excursions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Attraction experiences, entrance fees, and visit durations utilized by the Travel Planning Agent.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-[#16A6A1] hover:bg-[#146C86] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-5">Activity Name</th>
                <th className="py-4 px-5">Destination</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Duration</th>
                <th className="py-4 px-5">Cost / Person</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading activities...</td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">No activities registered.</td>
                </tr>
              ) : (
                activities.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 font-black text-slate-800">{a.name}</td>
                    <td className="py-4 px-5 font-bold text-[#0B3A53]">
                      {a.destination?.name || 'Sri Lanka'}
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-50 text-[#146C86] border border-teal-200">
                        {a.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-600 font-medium">{a.durationMinutes} mins</td>
                    <td className="py-4 px-5 font-black text-[#146C86]">
                      ${a.costPerPerson}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(a)}
                          className="p-1.5 hover:bg-teal-50 text-slate-400 hover:text-[#16A6A1] rounded-lg transition-colors cursor-pointer"
                          title="Edit activity"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete activity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT ACTIVITY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-[#0B3A53]">
                {editingActivity ? 'Edit Tourism Activity' : 'Add Tourism Activity'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Activity Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                  placeholder="Nine Arches Colonial Bridge Walk"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Destination</label>
                <select
                  value={form.destinationId}
                  onChange={(e) => setForm({ ...form, destinationId: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                >
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.province})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  >
                    <option value="culture">Culture & Heritage</option>
                    <option value="nature">Nature & Scenic</option>
                    <option value="wildlife">Wildlife & Safari</option>
                    <option value="adventure">Adventure & Trekking</option>
                    <option value="beach">Coastal & Beach</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cost Per Person ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.costPerPerson}
                    onChange={(e) => setForm({ ...form, costPerPerson: parseFloat(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                  placeholder="Key highlight information for itinerary formulation..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#16A6A1] hover:bg-[#146C86] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-all"
              >
                {editingActivity ? 'Update Activity' : 'Save Activity'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
