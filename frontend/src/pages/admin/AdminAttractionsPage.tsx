import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Search,
  Plus,
  Pencil,
  X,
  CheckCircle2,
  Clock,
  DollarSign,
  Compass,
  Trash2,
  Upload,
  Link,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AttractionItem, DestinationItem } from '../../types/adminTypes';

export const AdminAttractionsPage: React.FC = () => {
  const [attractions, setAttractions] = useState<AttractionItem[]>([]);
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<AttractionItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [destId, setDestId] = useState('');
  const [category, setCategory] = useState('Cultural');
  const [openingHours, setOpeningHours] = useState('06:00 AM – 06:00 PM');
  const [entryFee, setEntryFee] = useState('$15 / LKR 4,500');
  const [duration, setDuration] = useState('2 – 3 Hours');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedImagePreview(reader.result);
        setImageUrl(reader.result);
        setUploadedFileName(file.name);
        setUploadedFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImagePreview(null);
    setUploadedFileName('');
    setUploadedFileSize('');
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setImageUrl('');
    setCategory('Cultural');
    setOpeningHours('06:00 AM – 06:00 PM');
    setEntryFee('$15 / LKR 4,500');
    setDuration('2 – 3 Hours');
    setUploadedImagePreview(null);
    setUploadedFileName('');
    setUploadedFileSize('');
    setImageInputMode('upload');
    setEditingAttraction(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (attr: AttractionItem) => {
    setEditingAttraction(attr);
    setName(attr.name || '');
    setDestId(attr.destinationId || destinations[0]?.id || '');
    setCategory(attr.category || 'Cultural');
    setOpeningHours(attr.openingHours || '06:00 AM – 06:00 PM');
    setEntryFee(attr.entryFee || '$15 / LKR 4,500');
    setDuration(attr.duration || '2 – 3 Hours');
    setDescription(attr.description || '');
    setImageUrl(attr.imageUrl || '');
    if (attr.imageUrl) {
      setUploadedImagePreview(attr.imageUrl);
      setUploadedFileName(attr.name ? `${attr.name} photo` : 'Attraction image');
    } else {
      setUploadedImagePreview(null);
      setUploadedFileName('');
    }
    setImageInputMode(attr.imageUrl && !attr.imageUrl.startsWith('data:') ? 'url' : 'upload');
    setIsAddModalOpen(true);
  };

  const handleSaveAttraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !destId) return;

    const chosenDest = destinations.find((d) => d.id === destId);

    try {
      if (editingAttraction) {
        const updatedPayload: Partial<AttractionItem> = {
          name,
          destinationId: destId,
          destinationName: chosenDest?.name || editingAttraction.destinationName || 'Sri Lanka',
          category,
          openingHours,
          entryFee,
          duration,
          description,
          imageUrl: imageUrl || editingAttraction.imageUrl || 'https://images.unsplash.com/photo-1588598056972-2d12f6a73c1d?auto=format&fit=crop&w=600&q=80',
          status: editingAttraction.status,
          availability: editingAttraction.availability || 'Open All Year',
        };
        await adminService.updateAttraction(editingAttraction.id, updatedPayload);
        setAttractions((prev) =>
          prev.map((a) => (a.id === editingAttraction.id ? { ...a, ...updatedPayload } : a))
        );
      } else {
        const created = await adminService.createAttraction({
          name,
          destinationId: destId,
          destinationName: chosenDest?.name || 'Sri Lanka',
          category,
          openingHours,
          entryFee,
          duration,
          availability: 'Open All Year',
          status: 'Active',
          description,
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1588598056972-2d12f6a73c1d?auto=format&fit=crop&w=600&q=80',
        });
        setAttractions([created, ...attractions]);
      }

      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save attraction', err);
      alert(editingAttraction ? 'Failed to update attraction.' : 'Failed to create attraction.');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [attrData, destData] = await Promise.all([
        adminService.fetchAttractions(),
        adminService.fetchDestinations(),
      ]);
      setAttractions(attrData);
      setDestinations(destData);
      if (destData.length > 0 && !destId) {
        setDestId(destData[0].id);
      }
    } catch (err) {
      console.error('Failed to load attractions data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAttractions = useMemo(() => {
    return attractions.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.destinationName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDest = selectedDestination === 'All' || a.destinationId === selectedDestination;
      return matchesSearch && matchesDest;
    });
  }, [attractions, searchQuery, selectedDestination]);

  const handleToggleStatus = async (attr: AttractionItem) => {
    const updatedStatus = attr.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await adminService.updateAttraction(attr.id, {
        ...attr,
        status: updatedStatus,
      });
      setAttractions((prev) =>
        prev.map((a) => (a.id === attr.id ? { ...a, status: updatedStatus } : a))
      );
    } catch (err) {
      console.error('Failed to update attraction status', err);
      alert('Failed to update attraction status.');
    }
  };

  const handleDeleteAttraction = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this attraction?')) return;
    try {
      await adminService.deleteAttraction(id);
      setAttractions((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete attraction', err);
      alert('Failed to delete attraction.');
    }
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
            Manage tourist landmarks, heritage sites, opening hours, entry fees, and visit durations across Sri Lanka.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={handleOpenCreate}
            className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#16A6A1]" />
            <span>Add Attraction</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search attraction or destination..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0B3A53] placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-[#16A6A1]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase">Filter Destination:</span>
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] px-3 py-2 rounded-xl focus:outline-hidden focus:border-[#16A6A1] cursor-pointer"
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading attractions from database...
                  </td>
                </tr>
              ) : filteredAttractions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No attractions found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredAttractions.map((attr) => (
                  <tr key={attr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={attr.imageUrl || 'https://images.unsplash.com/photo-1588598056972-2d12f6a73c1d?auto=format&fit=crop&w=600&q=80'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
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
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(attr)}
                        title={`Click to switch status to ${attr.status === 'Active' ? 'Inactive' : 'Active'}`}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs hover:opacity-90 hover:scale-105 active:scale-95 ${
                          attr.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            attr.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>{attr.status}</span>
                      </button>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(attr)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-[#16A6A1] hover:bg-teal-50 transition-colors cursor-pointer"
                          title="Edit Attraction"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAttraction(attr.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Attraction"
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

      {/* ADD / EDIT ATTRACTION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-[#0B3A53] font-heading">
                {editingAttraction ? 'Edit Attraction Site' : 'Add Attraction Site'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAttraction} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-600 font-bold block">Attraction Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ravana Ella Falls"
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Destination</label>
                  <select
                    value={destId}
                    onChange={(e) => setDestId(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-hidden"
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
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-hidden"
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
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Entry Fee</label>
                  <input
                    type="text"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Est. Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Attraction Cover Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-600 font-bold block">Attraction Image</label>
                  
                  {/* Selector Tabs: Upload File / Image URL */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        imageInputMode === 'upload'
                          ? 'bg-white text-[#0B3A53] shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        imageInputMode === 'url'
                          ? 'bg-white text-[#0B3A53] shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>Image URL</span>
                    </button>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {imageInputMode === 'upload' ? (
                  uploadedImagePreview ? (
                    <div className="relative rounded-2xl border border-teal-200 bg-teal-50/40 p-3 overflow-hidden">
                      <div className="flex items-center gap-4">
                        <div className="relative w-28 h-20 rounded-xl overflow-hidden shadow-inner border border-slate-200 shrink-0 bg-slate-100">
                          <img
                            src={uploadedImagePreview}
                            alt="Uploaded attraction preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5 text-[#16A6A1] font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Image uploaded successfully</span>
                          </div>
                          <p className="text-slate-700 font-semibold truncate text-xs">
                            {uploadedFileName || 'Attraction cover image'}
                          </p>
                          {uploadedFileSize && (
                            <p className="text-slate-400 text-[10px] font-medium">{uploadedFileSize}</p>
                          )}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-[11px] font-bold text-[#0B3A53] hover:text-[#16A6A1] cursor-pointer underline transition-colors"
                            >
                              Change photo
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="text-[11px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                        isDragging
                          ? 'border-[#16A6A1] bg-teal-50/60 scale-[1.01]'
                          : 'border-slate-200 hover:border-[#16A6A1] bg-slate-50/70 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-2.5 text-[#16A6A1]">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-[#0B3A53]">
                        Click to browse or drag & drop attraction image
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        Supports PNG, JPG, JPEG, WEBP (Max 10MB)
                      </p>
                    </div>
                  )
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full p-3 pl-9 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-hidden text-xs"
                      />
                      <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                    {imageUrl && (
                      <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={imageUrl}
                          alt="Attraction preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1588598056972-2d12f6a73c1d?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-slate-900/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Live Preview
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-bold block">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description of the attraction..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:bg-white focus:border-[#16A6A1] focus:outline-hidden"
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="px-6 py-3 rounded-full bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0B3A53] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md hover:bg-[#072537] cursor-pointer transition-all"
                >
                  {editingAttraction ? 'Update Attraction' : 'Save Attraction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
