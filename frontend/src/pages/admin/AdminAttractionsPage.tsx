import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Plus,
  X,
  CheckCircle2,
  Clock,
  DollarSign,
  Compass,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminAttraction } from '../../mock/mockAdminData';

export const AdminAttractionsPage: React.FC = () => {
  const [attractions, setAttractions] = useState<AdminAttraction[]>(adminService.getAttractions());
  const destinations = adminService.getDestinations();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [destId, setDestId] = useState(destinations[0]?.id || 'dest-kandy');
  const [category, setCategory] = useState('Cultural');
  const [openingHours, setOpeningHours] = useState('06:00 AM – 06:00 PM');
  const [entryFee, setEntryFee] = useState('$15 / LKR 4,500');
  const [duration, setDuration] = useState('2 – 3 Hours');
  const [description, setDescription] = useState('');

  const filteredAttractions = useMemo(() => {
    return attractions.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.destinationName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDest = selectedDestination === 'All' || a.destinationId === selectedDestination;
      return matchesSearch && matchesDest;
    });
  }, [attractions, searchQuery, selectedDestination]);

  const handleToggleStatus = (id: string) => {
    const updated = adminService.toggleAttractionStatus(id);
    setAttractions([...updated]);
  };

  const handleCreateAttraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const chosenDest = destinations.find((d) => d.id === destId);

    const created = adminService.addAttraction({
      name,
      destinationId: destId,
      destinationName: chosenDest?.name || 'Kandy',
      category,
      openingHours,
      entryFee,
      duration,
      availability: 'Open All Year',
      status: 'Active',
      description,
      imageUrl: 'https://images.unsplash.com/photo-1588598056972-2d12f6a73c1d?auto=format&fit=crop&w=600&q=80',
    });

    setAttractions([created, ...attractions]);
    setIsAddModalOpen(false);
    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            Attraction Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage tourist landmarks, heritage sites, opening hours, entry fees, and visit durations.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#16A6A1]" />
          <span>Add Attraction</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search attraction or destination..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0B3A53] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#16A6A1]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase">Filter Destination:</span>
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] px-3 py-2 rounded-xl focus:outline-none focus:border-[#16A6A1] cursor-pointer"
          >
            <option value="All">All Destinations</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attractions Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-5">Attraction Site</th>
                <th className="py-4 px-5">Destination</th>
                <th className="py-4 px-5">Opening Hours</th>
                <th className="py-4 px-5">Entry Fee</th>
                <th className="py-4 px-5">Est. Duration</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAttractions.map((attr) => (
                <tr key={attr.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <img src={attr.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover border" />
                      <div>
                        <div className="font-extrabold text-[#0B3A53]">{attr.name}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{attr.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-bold text-[#146C86]">{attr.destinationName}</td>
                  <td className="py-4 px-5 text-slate-600">{attr.openingHours}</td>
                  <td className="py-4 px-5 font-bold text-[#0B3A53]">{attr.entryFee}</td>
                  <td className="py-4 px-5 text-slate-500">{attr.duration}</td>
                  <td className="py-4 px-5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        attr.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {attr.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => handleToggleStatus(attr.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B3A53] font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Toggle Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ATTRACTION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-[#0B3A53] font-heading">Add Attraction Site</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAttraction} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-600 font-bold block">Attraction Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ravana Ella Falls"
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Destination</label>
                  <select
                    value={destId}
                    onChange={(e) => setDestId(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Waterfall & Trekking"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Opening Hours</label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Entry Fee</label>
                  <input
                    type="text"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Est. Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-3 rounded-full bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0B3A53] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md hover:bg-[#072537] cursor-pointer"
                >
                  Save Attraction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
