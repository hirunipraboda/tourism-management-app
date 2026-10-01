import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Car,
  Users,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminTourPackage } from '../../mock/mockAdminData';

export const AdminToursPage: React.FC = () => {
  const [tours, setTours] = useState<AdminTourPackage[]>(adminService.getTours());
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Form Wizard State
  const [name, setName] = useState('');
  const [destinationName, setDestinationName] = useState('Kandy & Sigiriya');
  const [duration, setDuration] = useState('5 Days / 4 Nights');
  const [price, setPrice] = useState(890);
  const [capacity, setCapacity] = useState(10);
  const [transportOption, setTransportOption] = useState('Private AC Mini Van');
  const [vehicleType, setVehicleType] = useState('Toyota KDH Luxury Van');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80');

  const handleToggleStatus = (id: string) => {
    const updated = adminService.toggleTourStatus(id);
    setTours([...updated]);
  };

  const handlePublishTour = () => {
    if (!name) return;

    const created = adminService.addTour({
      name,
      destinationId: 'dest-kandy',
      destinationName,
      duration,
      daysCount: 5,
      price,
      capacity,
      transportOption,
      vehicleType,
      status: 'Active',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80',
      description: description || 'Scenic tour package with curated itineraries and NOVA AI Guide Bot assistance.',
      activities: ['Guided Cultural Exploration', 'Scenic Highland Transport', 'Sunset Viewpoint Safari'],
      includesGuideBot: true,
    });

    setTours([created, ...tours]);
    setIsWizardOpen(false);
    setWizardStep(1);
    setName('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            Tour Package Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage multi-day Sri Lankan itinerary packages, pricing, transport options, and capacity.
          </p>
        </div>

        <button
          onClick={() => {
            setIsWizardOpen(true);
            setWizardStep(1);
          }}
          className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#16A6A1]" />
          <span>Create Tour Package</span>
        </button>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tours.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-52 w-full bg-slate-100">
                <img src={pkg.coverImage} alt={pkg.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-emerald-500 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-md">
                  {pkg.status}
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-950/80 text-white text-[11px] font-black px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#16A6A1]" />
                  <span>Includes NOVA AI Guide</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#16A6A1]">
                    {pkg.destinationName}
                  </span>
                  <h3 className="text-lg font-black text-[#0B3A53] font-heading leading-snug">{pkg.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Duration</span>
                    <div className="font-extrabold text-[#0B3A53]">{pkg.duration}</div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Price / Person</span>
                    <div className="font-black text-[#146C86]">${pkg.price}</div>
                  </div>
                  <div className="space-y-0.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Vehicle</span>
                    <div className="font-extrabold text-slate-700 truncate">{pkg.vehicleType}</div>
                  </div>
                  <div className="space-y-0.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Max Capacity</span>
                    <div className="font-extrabold text-slate-700">{pkg.capacity} Travelers</div>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Activities Included:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.activities.map((act, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        • {act}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                onClick={() => handleToggleStatus(pkg.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  pkg.status === 'Active' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                {pkg.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>

              <button
                onClick={() => alert(`Editing package ${pkg.name}`)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B3A53] font-bold text-xs transition-colors cursor-pointer"
              >
                Edit Package
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MULTI-STEP TOUR PACKAGE WIZARD MODAL */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-y-auto p-6 sm:p-8 space-y-6">
            
            {/* Modal Header & Stepper */}
            <div className="space-y-4 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#16A6A1]">CREATE TOUR PACKAGE</span>
                  <h3 className="text-2xl font-black text-[#0B3A53] font-heading">
                    Step 0{wizardStep}: {
                      wizardStep === 1 ? 'Basic Information' :
                      wizardStep === 2 ? 'Activities & Attractions' :
                      wizardStep === 3 ? 'Transportation & Guide' :
                      wizardStep === 4 ? 'Availability & Capacity' :
                      wizardStep === 5 ? 'Cover & Media Asset' : 'Review & Publish'
                    }
                  </h3>
                </div>
                <button
                  onClick={() => setIsWizardOpen(false)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Steps Indicator */}
              <div className="flex items-center justify-between text-xs font-bold border-t border-slate-100 pt-3">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <button
                    key={s}
                    onClick={() => setWizardStep(s)}
                    className={`transition-all cursor-pointer ${
                      wizardStep === s ? 'text-[#0B3A53] font-black border-b-2 border-[#16A6A1] pb-1' : 'text-slate-400'
                    }`}
                  >
                    Step {s}
                  </button>
                ))}
              </div>
            </div>

            {/* STEP CONTENT */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Package Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ceylon Highland Tea & Temple Discovery"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-bold block">Destination</label>
                    <input
                      type="text"
                      value={destinationName}
                      onChange={(e) => setDestinationName(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-bold block">Duration</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-bold block">Price per Person ($)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-bold block">Max Traveler Capacity</label>
                    <input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4 text-xs font-semibold">
                <p className="text-slate-500">Configure activities included in this tour package:</p>
                <div className="space-y-2">
                  {['Temple of Tooth Ceremony', 'Nine Arch Bridge Walk', 'Ravana Falls Hike', 'Tea Factory Tasting Session'].map((act, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="font-extrabold text-[#0B3A53]">{act}</span>
                      <span className="text-[#16A6A1] font-bold">Included ✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Transport Option</label>
                  <input
                    type="text"
                    value={transportOption}
                    onChange={(e) => setTransportOption(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Vehicle Model</label>
                  <input
                    type="text"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53]"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-[#16A6A1]/10 border border-[#16A6A1]/30 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#16A6A1] shrink-0" />
                  <span className="text-xs font-extrabold text-[#0B3A53]">
                    NOVA AI Guide Bot is automatically attached to this package for 24/7 tourist assistance.
                  </span>
                </div>
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-extrabold text-[#0B3A53]">Available Departure Days:</div>
                  <p className="text-slate-500">Every Monday & Thursday. Maximum {capacity} travelers per group.</p>
                </div>
              </div>
            )}

            {wizardStep === 5 && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Cover Image URL</label>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53]"
                  />
                </div>
                {coverImage && (
                  <img src={coverImage} alt="Preview" className="w-full h-40 object-cover rounded-2xl border" />
                )}
              </div>
            )}

            {wizardStep === 6 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-base font-black text-[#0B3A53]">{name || 'New Tour Package'}</h4>
                  <div className="text-slate-500 font-semibold">{destinationName} · {duration} · ${price}</div>
                  <div className="text-slate-600 leading-relaxed font-medium">{transportOption} ({vehicleType})</div>
                </div>
              </div>
            )}

            {/* Modal Navigation Buttons */}
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
                  className="bg-[#16A6A1] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-lg hover:bg-[#146C86] cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Publish Tour Package</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
