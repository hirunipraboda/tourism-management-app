import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  X,
  Sparkles,
  Edit2,
  Loader2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Users,
  Clock,
  DollarSign,
  MapPin,
} from 'lucide-react';
import { tourPackageService, TourPackageResponse } from '../../services/tourPackageService';
import { guideService } from '../../services/guideService';

// ─── Local display type ───────────────────────────────────────────────────────

interface LocalPackage {
  id: number;
  guideId: number;
  guideName: string;
  name: string;
  description: string;
  destination: string;
  durationDays: number;
  price: number;
  maxGroupSize: number;
  isActive: boolean;
  createdAt: string;
  imageUrl?: string;
}

function toLocal(r: TourPackageResponse): LocalPackage {
  return {
    id: r.tourPackageId,
    guideId: r.guideId,
    guideName: r.guideName,
    name: r.packageName,
    description: r.description,
    destination: r.destination,
    durationDays: r.durationDays,
    price: r.price,
    maxGroupSize: r.maxGroupSize,
    isActive: r.isActive,
    createdAt: r.createdAt,
    imageUrl: r.imageUrl,
  };
}

const COVER_FALLBACK =
  'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80';

// ─── Component ────────────────────────────────────────────────────────────────

export const AdminToursPage: React.FC = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [packages, setPackages] = useState<LocalPackage[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Create wizard
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Wizard form fields
  const emptyWizard = {
    guideId: 0,
    name: '',
    destination: 'Kandy & Sigiriya',
    durationDays: 5,
    price: 890,
    maxGroupSize: 10,
    description: '',
    coverImage: '',
  };
  const [wForm, setWForm] = useState(emptyWizard);

  // Edit modal
  const [editingPkg, setEditingPkg] = useState<LocalPackage | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    destination: '',
    durationDays: 5,
    price: 0,
    maxGroupSize: 10,
    description: '',
    imageUrl: '',
    isActive: true,
  });
  const [isEditSaving, setIsEditSaving] = useState(false);

  // ── Load data on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    loadPackages();
    loadGuides();
  }, []);

  const loadPackages = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await tourPackageService.getAll();
      setPackages(data.map(toLocal));
    } catch {
      setApiError('Failed to load tour packages from server.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGuides = async () => {
    try {
      const data = await guideService.getGuides();
      setGuides(data);
    } catch {
      // non-critical — guide dropdown just stays empty
    }
  };

  // Helper: parse int guide id from Guid string returned by backend
  // e.g. "00000001-0000-0000-0000-000000000000" → 1
  const guidToInt = (guidStr: string): number => {
    try {
      return parseInt(guidStr.split('-')[0], 16);
    } catch {
      return 0;
    }
  };

  // ── CREATE ─────────────────────────────────────────────────────────────────
  const handlePublishTour = async () => {
    if (!wForm.name || !wForm.guideId) return;
    setIsSaving(true);
    try {
      const created = await tourPackageService.create({
        guideId: wForm.guideId,
        packageName: wForm.name,
        description: wForm.description || 'Scenic tour package with curated itineraries.',
        destination: wForm.destination,
        durationDays: wForm.durationDays,
        price: wForm.price,
        maxGroupSize: wForm.maxGroupSize,
        imageUrl: wForm.coverImage,
      });
      setPackages([toLocal(created), ...packages]);
      setIsWizardOpen(false);
      setWizardStep(1);
      setWForm(emptyWizard);
    } catch {
      alert('Failed to create tour package. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── UPDATE (edit details) ──────────────────────────────────────────────────
  const openEditModal = (pkg: LocalPackage) => {
    setEditingPkg(pkg);
    setEditForm({
      name: pkg.name,
      destination: pkg.destination,
      durationDays: pkg.durationDays,
      price: pkg.price,
      maxGroupSize: pkg.maxGroupSize,
      description: pkg.description,
      imageUrl: pkg.imageUrl || '',
      isActive: pkg.isActive,
    });
  };

  const handleEditSubmit = async () => {
    if (!editingPkg || !editForm.name) return;
    setIsEditSaving(true);
    try {
      const updated = await tourPackageService.update(editingPkg.id, {
        packageName: editForm.name,
        description: editForm.description,
        destination: editForm.destination,
        durationDays: editForm.durationDays,
        price: editForm.price,
        maxGroupSize: editForm.maxGroupSize,
        isActive: editForm.isActive,
        imageUrl: editForm.imageUrl,
      });
      setPackages(packages.map((p) => (p.id === editingPkg.id ? toLocal(updated) : p)));
      setEditingPkg(null);
    } catch {
      alert('Failed to update tour package. Please try again.');
    } finally {
      setIsEditSaving(false);
    }
  };

  // ── TOGGLE STATUS (Activate / Deactivate) ──────────────────────────────────
  const handleToggleStatus = async (pkg: LocalPackage) => {
    // Optimistic update
    setPackages(packages.map((p) => (p.id === pkg.id ? { ...p, isActive: !p.isActive } : p)));
    try {
      await tourPackageService.update(pkg.id, {
        packageName: pkg.name,
        description: pkg.description,
        destination: pkg.destination,
        durationDays: pkg.durationDays,
        price: pkg.price,
        maxGroupSize: pkg.maxGroupSize,
        isActive: !pkg.isActive,
      });
    } catch {
      // Revert on failure
      setPackages(packages.map((p) => (p.id === pkg.id ? { ...p, isActive: pkg.isActive } : p)));
      alert('Failed to update package status.');
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = packages.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.destination.toLowerCase().includes(search.toLowerCase()) ||
      p.guideName.toLowerCase().includes(search.toLowerCase())
  );
  const activeCount = packages.filter((p) => p.isActive).length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            Tour Package Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage Sri Lankan itinerary packages, pricing, transport options, and capacity.
          </p>
        </div>

        <button
          onClick={() => { setIsWizardOpen(true); setWizardStep(1); }}
          className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#16A6A1]" />
          <span>Create Tour Package</span>
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total Packages', value: packages.length, color: 'bg-slate-100 text-slate-700' },
          { label: 'Active', value: activeCount, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Inactive', value: packages.length - activeCount, color: 'bg-rose-50 text-rose-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black ${color}`}>
            <span>{label}:</span>
            <span>{value}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search packages…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4 py-2.5 w-full rounded-2xl bg-white border border-slate-200 text-xs font-bold text-[#0B3A53] focus:outline-none focus:border-[#16A6A1]"
        />
      </div>

      {/* Error */}
      {apiError && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {apiError}
          <button onClick={loadPackages} className="ml-auto underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-bold">Loading packages…</span>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !apiError && filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-bold text-sm">No tour packages found.</p>
          <p className="text-xs mt-1">Create your first package with the button above.</p>
        </div>
      )}

      {/* Package Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filtered.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              {/* Cover image area with status badge */}
              <div>
                <div className="relative h-44 w-full bg-slate-100">
                  <img
                    src={pkg.imageUrl || COVER_FALLBACK}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-3 right-3 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-md ${
                    pkg.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
                  }`}>
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 text-white text-[11px] font-black px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#16A6A1]" />
                    <span>Includes NOVA AI Guide</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#16A6A1]">
                      {pkg.destination}
                    </span>
                    <h3 className="text-base font-black text-[#0B3A53] font-heading leading-snug">{pkg.name}</h3>
                    {pkg.guideName && (
                      <p className="text-[11px] text-slate-400 font-bold mt-0.5">Guide: {pkg.guideName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="font-extrabold">{pkg.durationDays} Days</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#146C86]">
                      <DollarSign className="w-3 h-3" />
                      <span className="font-black">${pkg.price} / person</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 col-span-2">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="font-extrabold">Max {pkg.maxGroupSize} travelers</span>
                    </div>
                  </div>

                  {pkg.description && (
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                      {pkg.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="px-5 pb-5 flex items-center justify-between border-t border-slate-100 pt-4">
                {/* TOGGLE STATUS */}
                <button
                  onClick={() => handleToggleStatus(pkg)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    pkg.isActive
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {pkg.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                  {pkg.isActive ? 'Deactivate' : 'Activate'}
                </button>

                {/* EDIT */}
                <button
                  onClick={() => openEditModal(pkg)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B3A53] font-bold text-xs transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CREATE WIZARD MODAL                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-y-auto p-6 sm:p-8 space-y-6">

            {/* Header & Stepper */}
            <div className="space-y-4 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#16A6A1]">CREATE TOUR PACKAGE</span>
                  <h3 className="text-2xl font-black text-[#0B3A53] font-heading">
                    Step 0{wizardStep}:{' '}
                    {wizardStep === 1 ? 'Basic Information' :
                     wizardStep === 2 ? 'Guide Assignment' :
                     wizardStep === 3 ? 'Pricing & Capacity' :
                     wizardStep === 4 ? 'Description' :
                     wizardStep === 5 ? 'Cover Image' : 'Review & Publish'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsWizardOpen(false)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step indicators */}
              <div className="flex items-center justify-between text-xs font-bold border-t border-slate-100 pt-3">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <button
                    key={s}
                    onClick={() => setWizardStep(s)}
                    className={`transition-all cursor-pointer ${
                      wizardStep === s
                        ? 'text-[#0B3A53] font-black border-b-2 border-[#16A6A1] pb-1'
                        : 'text-slate-400'
                    }`}
                  >
                    Step {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 1 — Basic Info */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Package Name *</label>
                  <input
                    type="text"
                    value={wForm.name}
                    onChange={(e) => setWForm({ ...wForm, name: e.target.value })}
                    placeholder="e.g. Ceylon Highland Tea & Temple Discovery"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Destination</label>
                  <input
                    type="text"
                    value={wForm.destination}
                    onChange={(e) => setWForm({ ...wForm, destination: e.target.value })}
                    placeholder="e.g. Kandy & Sigiriya"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2 — Guide Assignment */}
            {wizardStep === 2 && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Assign Guide *</label>
                  <select
                    value={wForm.guideId}
                    onChange={(e) => {
                      const selected = guides.find((g: any) => String(g.id) === e.target.value);
                      const numericId = selected ? parseInt(String(selected.id).split('-')[0], 16) : 0;
                      setWForm({ ...wForm, guideId: numericId });
                    }}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none cursor-pointer"
                  >
                    <option value={0}>Select a guide…</option>
                    {guides
                      .filter((g: any) => (g.status ?? g.Status) === 'Available' || (g.status ?? g.Status) === 'Active')
                      .map((g: any) => (
                        <option key={g.id} value={g.id}>{g.name ?? g.Name}</option>
                      ))}
                  </select>
                  {guides.length === 0 && (
                    <p className="text-amber-600 text-[11px] font-bold">
                      ⚠ No guides loaded. Make sure the backend is running.
                    </p>
                  )}
                </div>
                <div className="p-4 rounded-2xl bg-[#16A6A1]/10 border border-[#16A6A1]/30 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#16A6A1] shrink-0" />
                  <span className="text-xs font-extrabold text-[#0B3A53]">
                    NOVA AI Guide Bot is automatically attached to this package for 24/7 tourist assistance.
                  </span>
                </div>
              </div>
            )}

            {/* Step 3 — Pricing & Capacity */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-bold block">Duration (days)</label>
                    <input
                      type="number"
                      min={1}
                      value={wForm.durationDays}
                      onChange={(e) => setWForm({ ...wForm, durationDays: Number(e.target.value) })}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-bold block">Price per Person ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={wForm.price}
                      onChange={(e) => setWForm({ ...wForm, price: Number(e.target.value) })}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-slate-600 font-bold block">Max Traveler Capacity</label>
                    <input
                      type="number"
                      min={1}
                      value={wForm.maxGroupSize}
                      onChange={(e) => setWForm({ ...wForm, maxGroupSize: Number(e.target.value) })}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 — Description */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Package Description</label>
                  <textarea
                    rows={5}
                    value={wForm.description}
                    onChange={(e) => setWForm({ ...wForm, description: e.target.value })}
                    placeholder="Describe the highlights, included meals, accommodation style, etc."
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 5 — Cover image */}
            {wizardStep === 5 && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Cover Image URL</label>
                  <input
                    type="text"
                    value={wForm.coverImage}
                    onChange={(e) => setWForm({ ...wForm, coverImage: e.target.value })}
                    placeholder="Paste image URL here (e.g. https://images.unsplash.com/...)"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 font-medium">
                    Paste a direct image web URL to display this exact picture on the tour package.
                  </p>
                </div>
                {wForm.coverImage ? (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Image Preview</span>
                    <img src={wForm.coverImage} alt="Preview" className="w-full h-48 object-cover rounded-2xl border border-slate-200" />
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold">
                    No image URL pasted yet (default fallback picture will be used)
                  </div>
                )}
              </div>
            )}

            {/* Step 6 — Review */}
            {wizardStep === 6 && (
              <div className="space-y-4 text-xs">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-base font-black text-[#0B3A53]">{wForm.name || '(No name)'}</h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 font-semibold">
                    <div><span className="font-black text-slate-400 uppercase text-[10px] block">Destination</span>{wForm.destination}</div>
                    <div><span className="font-black text-slate-400 uppercase text-[10px] block">Duration</span>{wForm.durationDays} days</div>
                    <div><span className="font-black text-slate-400 uppercase text-[10px] block">Price</span>${wForm.price} / person</div>
                    <div><span className="font-black text-slate-400 uppercase text-[10px] block">Capacity</span>{wForm.maxGroupSize} travelers</div>
                    <div className="col-span-2"><span className="font-black text-slate-400 uppercase text-[10px] block">Guide ID</span>{wForm.guideId || '⚠ Not selected'}</div>
                  </div>
                  {wForm.description && (
                    <p className="text-slate-500 font-medium leading-relaxed">{wForm.description}</p>
                  )}
                </div>
                {!wForm.guideId && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Please go back to Step 2 and select a guide before publishing.
                  </div>
                )}
              </div>
            )}

            {/* Wizard Navigation */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                disabled={wizardStep === 1}
                onClick={() => setWizardStep(wizardStep - 1)}
                className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                ← Back
              </button>

              {wizardStep < 6 ? (
                <button
                  onClick={() => setWizardStep(wizardStep + 1)}
                  className="bg-[#0B3A53] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md hover:bg-[#072537] cursor-pointer"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handlePublishTour}
                  disabled={!wForm.name || !wForm.guideId || isSaving}
                  className="bg-[#16A6A1] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-lg hover:bg-[#146C86] cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isSaving ? 'Publishing…' : 'Publish Tour Package'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* EDIT MODAL                                                              */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-y-auto">

            {/* Edit Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16A6A1]">TOUR PACKAGES</span>
                <h3 className="text-lg font-black text-[#0B3A53] font-heading">Edit Package</h3>
              </div>
              <button
                onClick={() => setEditingPkg(null)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Edit Form */}
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Package Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Destination</label>
                <input
                  type="text"
                  value={editForm.destination}
                  onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Duration (days)</label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.durationDays}
                    onChange={(e) => setEditForm({ ...editForm, durationDays: Number(e.target.value) })}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Max Group</label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.maxGroupSize}
                    onChange={(e) => setEditForm({ ...editForm, maxGroupSize: Number(e.target.value) })}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Image URL</label>
                <input
                  type="text"
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  placeholder="Paste image URL here (e.g. https://images.unsplash.com/...)"
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                />
                {editForm.imageUrl && (
                  <img src={editForm.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-2xl border border-slate-200 mt-2" />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none resize-none"
                />
              </div>

              {/* Status toggle inside edit */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-500">Status</span>
                <button
                  onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                  className={`px-4 py-1.5 rounded-full text-xs font-black cursor-pointer transition-colors ${
                    editForm.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {editForm.isActive ? '● Active' : '○ Inactive'}
                </button>
              </div>

              {/* Edit Footer */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setEditingPkg(null)}
                  className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={!editForm.name || isEditSaving}
                  className="bg-[#16A6A1] hover:bg-[#146C86] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md cursor-pointer transition-all flex items-center gap-2"
                >
                  {isEditSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isEditSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
