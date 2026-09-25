import React, { useState, useMemo } from 'react';
import {
  Compass,
  Search,
  Plus,
  Grid,
  List,
  MapPin,
  X,
  CheckCircle2,
  SlidersHorizontal,
  Edit,
  Eye,
  TrendingUp,
  Globe,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminDestination } from '../../mock/mockAdminData';

export const AdminDestinationsPage: React.FC = () => {
  const [destinations, setDestinations] = useState<AdminDestination[]>(adminService.getDestinations());
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Destination Form State
  const [name, setName] = useState('');
  const [province, setProvince] = useState('Central Province');
  const [category, setCategory] = useState<AdminDestination['category']>('Cultural');
  const [location, setLocation] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1588598056972-2d12f6a73c1d?auto=format&fit=crop&w=800&q=80');
  const [description, setDescription] = useState('');
  const [accessibility, setAccessibility] = useState('Highway & Rail Connected');
  const [bestTimeToVisit, setBestTimeToVisit] = useState('December to April');

  const filteredDestinations = useMemo(() => {
    return destinations.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.province.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [destinations, searchQuery, selectedCategory]);

  const handleToggleStatus = (id: string) => {
    const updated = adminService.toggleDestinationStatus(id);
    setDestinations([...updated]);
  };

  const handleCreateDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;

    const created = adminService.addDestination({
      name,
      province,
      category,
      location,
      lat: 7.29,
      lng: 80.63,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1588598056972-2d12f6a73c1d?auto=format&fit=crop&w=800&q=80',
      status: 'Active',
      description,
      accessibility,
      bestTimeToVisit,
    });

    setDestinations([created, ...destinations]);
    setIsAddModalOpen(false);
    setName('');
    setLocation('');
    setDescription('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            Destination Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage Sri Lankan destinations, regional highlights, and catalog attraction entries.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#16A6A1]" />
          <span>Add New Destination</span>
        </button>
      </div>

      {/* Toolbar & View Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destination or province..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0B3A53] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#16A6A1]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] px-3 py-2 rounded-xl focus:outline-none focus:border-[#16A6A1] cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Cultural">Cultural</option>
              <option value="Heritage">Heritage</option>
              <option value="Nature">Nature</option>
              <option value="Beach">Beach</option>
              <option value="Wildlife">Wildlife</option>
            </select>
          </div>

          {/* Grid vs Table View Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#0B3A53] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#0B3A53] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={dest.coverImage}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-md ${
                        dest.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {dest.status}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full border border-white/20">
                    {dest.category}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-xl font-black text-[#0B3A53] font-heading">{dest.name}</h3>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#16A6A1]" />
                      <span>{dest.province} · {dest.location}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                    {dest.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                    <span className="font-bold text-slate-500">{dest.attractionsCount} Attractions</span>
                    <span className="font-extrabold text-[#0B3A53]">{dest.bookingsCount} Bookings</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                <button
                  onClick={() => handleToggleStatus(dest.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    dest.status === 'Active'
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {dest.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>

                <button
                  onClick={() => alert(`Editing ${dest.name}`)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B3A53] font-bold text-xs transition-colors cursor-pointer"
                >
                  Edit Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-5">Destination</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Province</th>
                  <th className="py-4 px-5">Attractions</th>
                  <th className="py-4 px-5">Bookings</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDestinations.map((dest) => (
                  <tr key={dest.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img src={dest.coverImage} alt="" className="w-10 h-10 rounded-xl object-cover border" />
                        <div>
                          <div className="font-extrabold text-[#0B3A53]">{dest.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{dest.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-700">{dest.category}</td>
                    <td className="py-4 px-5 text-slate-500">{dest.province}</td>
                    <td className="py-4 px-5 font-bold text-[#0B3A53]">{dest.attractionsCount} Listed</td>
                    <td className="py-4 px-5 font-bold text-[#0B3A53]">{dest.bookingsCount}</td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          dest.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {dest.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleToggleStatus(dest.id)}
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
      )}

      {/* ADD DESTINATION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-[#0B3A53] font-heading">Add New Destination</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDestination} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Destination Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Trincomalee"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Province / Region</label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="e.g. Eastern Province"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  >
                    <option value="Cultural">Cultural</option>
                    <option value="Heritage">Heritage</option>
                    <option value="Nature">Nature</option>
                    <option value="Beach">Beach</option>
                    <option value="Wildlife">Wildlife</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Specific Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Eastern Coast Bay"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-bold block">Cover Image URL</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-700 focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-bold block">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of the destination history, landscape, and attraction appeal..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-700 focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md transition-all cursor-pointer"
                >
                  Save Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
