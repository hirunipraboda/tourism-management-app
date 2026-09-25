import React, { useState, useEffect } from 'react';
import { X, Upload, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { Review, TargetType } from '../../types/reviewsAndRecommendations';
import { RatingStars } from './RatingStars';
import sigiriyaImg from '../../assets/destinations/sigiriya.jpg';
import ellaImg from '../../assets/destinations/Ella.jpg';
import kandyImg from '../../assets/destinations/Kandy.jpg';
import galleImg from '../../assets/destinations/Galle.jpg';

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    touristName: string;
    touristCountry: string;
    travelerType: 'Solo' | 'Couple' | 'Family' | 'Friends';
    targetType: TargetType;
    targetId: string;
    targetName: string;
    rating: number;
    title: string;
    comment: string;
    photos: string[];
    tags: string[];
  }) => Promise<void>;
  initialData?: Review | null;
  defaultTarget?: {
    type: TargetType;
    id: string;
    name: string;
  };
}

const PRESET_PHOTOS = [
  { label: 'Scenic View', url: ellaImg },
  { label: 'Temple & Culture', url: kandyImg },
  { label: 'Heritage Fortress', url: sigiriyaImg },
  { label: 'Colonial Ramparts', url: galleImg },
];

const PRESET_TAGS = [
  'Culture',
  'Scenic',
  'Wildlife',
  'Photography',
  'Recommended',
  'History',
  'Adventure',
  'Nature',
  'Family-Friendly',
  'Must-Visit',
];

export const ReviewForm: React.FC<ReviewFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultTarget,
}) => {
  const [touristName, setTouristName] = useState('Sarah Jenkins');
  const [touristCountry, setTouristCountry] = useState('United Kingdom');
  const [travelerType, setTravelerType] = useState<'Solo' | 'Couple' | 'Family' | 'Friends'>('Solo');
  const [targetType, setTargetType] = useState<TargetType>('attraction');
  const [targetName, setTargetName] = useState('Temple of the Tooth');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('Culture, Scenic, Recommended');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTouristName(initialData.touristName);
      setTouristCountry(initialData.touristCountry);
      setTravelerType(initialData.travelerType);
      setTargetType(initialData.targetType);
      setTargetName(initialData.targetName);
      setRating(initialData.rating);
      setTitle(initialData.title);
      setComment(initialData.comment);
      setPhotos(initialData.photos || []);
      setTagInput(initialData.tags ? initialData.tags.join(', ') : '');
    } else if (defaultTarget) {
      setTargetType(defaultTarget.type);
      setTargetName(defaultTarget.name);
    }
  }, [initialData, defaultTarget, isOpen]);

  if (!isOpen) return null;

  const handleValidate = () => {
    const errs: Record<string, string> = {};
    if (!touristName.trim()) errs.touristName = 'Please provide your name';
    if (!title.trim()) errs.title = 'Please enter a review headline';
    else if (title.trim().length < 5) errs.title = 'Title must be at least 5 characters';

    if (!comment.trim()) errs.comment = 'Please provide detailed review feedback';
    else if (comment.trim().length < 20) errs.comment = 'Review must be at least 20 characters long';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidate()) return;

    setIsSubmitting(true);

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await onSubmit({
        touristName,
        touristCountry,
        travelerType,
        targetType,
        targetId: `target-${targetName.toLowerCase().replace(/\s+/g, '-')}`,
        targetName,
        rating,
        title,
        comment,
        photos,
        tags,
      });
    } finally {
      setIsSubmitting(false);
    }

  };

  const handleAddPresetPhoto = (url: string) => {
    if (!photos.includes(url)) {
      setPhotos([...photos, url]);
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  // Mock file picker upload simulation
  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          setPhotos((prev) => [...prev, loadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const targetOptions = {
    destination: ['Sigiriya Ancient Citadel', 'Ella Highlands', 'Galle Southern Coast', 'Mirissa Bay', 'Kandy Hills'],
    attraction: [
      'Temple of the Tooth',
      'Nine Arches Bridge & Ella Gap',
      'Sigiriya Rock Fortress',
      'Galle Dutch Fort Ramparts',
      'Horton Plains & World’s End',
      'Knuckles Cloud Forest',
    ],
    tour: [
      'Mirissa Blue Whale Ocean Expedition',
      'Yala National Park 4x4 Leopard Safari',
      'Ella Rock Guided Ridge Trek',
      'Halpewatte Ceylon Artisan Tea Masterclass',
      'Nilaveli Coral Snorkeling Tour',
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header (Sticky Top) */}
        <div className="bg-gradient-to-r from-[#0B3A53] to-[#146C86] text-white p-5 sm:p-6 flex items-center justify-between shrink-0 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h3 className="text-xl font-black font-heading">
                {initialData ? 'Edit Your Review' : 'Write a Verified Review'}
              </h3>
            </div>
            <p className="text-xs text-slate-200 mt-1 font-medium">
              Share honest feedback to help tourists explore Sri Lanka and empower smart recommendations.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form with Scrollable Body & Sticky Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                1. What Are You Reviewing? *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['attraction', 'destination', 'tour'] as TargetType[]).map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => {
                      setTargetType(type);
                      setTargetName(targetOptions[type][0]);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black capitalize transition-all cursor-pointer border ${
                      targetType === type
                        ? 'bg-[#0B3A53] text-white border-[#0B3A53] shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type === 'tour' ? 'Tour Package' : type}
                  </button>
                ))}
              </div>

              {/* Target Name Dropdown */}
              <select
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                className="w-full mt-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#16A6A1] focus:outline-none"
              >
                {targetOptions[targetType].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Star Rating Selection */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                  2. Overall Rating *
                </label>
                <p className="text-xs text-slate-500 font-medium">Click to select 1 to 5 stars</p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2 sm:pt-0">
                <RatingStars
                  rating={rating}
                  size="xl"
                  interactive
                  onChange={(newRating) => setRating(newRating)}
                />
                <span className="text-sm font-black text-[#0B3A53] min-w-[50px]">
                  {rating}.0 / 5
                </span>
              </div>
            </div>

            {/* Review Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Review Title *</label>
                <span className="text-[11px] text-slate-400">{title.length}/100</span>
              </div>
              <input
                type="text"
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Unforgettable cultural rituals and panoramic sunset views"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#16A6A1] focus:outline-none ${
                  errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {errors.title && (
                <p className="text-xs text-rose-600 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Detailed Review with Character Counter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Detailed Review *</label>
                <span className={`text-[11px] font-semibold ${comment.length < 20 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {comment.length} / 500 characters (min 20)
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe your journey, highlights, tips on timing, guides, crowd levels, safety, or culinary recommendations..."
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#16A6A1] focus:outline-none ${
                  errors.comment ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {errors.comment && (
                <p className="text-xs text-rose-600 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.comment}
                </p>
              )}
            </div>

            {/* Traveler Photographs Component */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Add Traveler Photographs
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* File Input Mock Trigger */}
                <label className="border-2 border-dashed border-slate-300 hover:border-[#16A6A1] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-white">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <div>
                    <span className="text-xs font-extrabold text-[#0B3A53] block">Upload Photo</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG up to 5MB</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSimulatedFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Sample Photo Presets */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    Quick Add Sample Photo:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRESET_PHOTOS.map((preset, pIdx) => (
                      <button
                        type="button"
                        key={pIdx}
                        onClick={() => handleAddPresetPhoto(preset.url)}
                        className="text-left text-[10px] font-bold text-slate-700 hover:text-[#0B3A53] bg-white p-1.5 rounded-lg border border-slate-200/70 hover:border-[#16A6A1] transition-all truncate"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Photos Preview Tray */}
              {photos.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {photos.map((pic, idx) => (
                    <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shadow-2xs">
                      <img src={pic} alt="Upload preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white p-0.5 rounded-full cursor-pointer transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Tags & Highlights</label>
                <span className="text-[11px] text-slate-400">Add or click tags below</span>
              </div>

              {/* Active Tags Chips */}
              {tagInput
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean).length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200/80">
                  {tagInput
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#16A6A1]/15 text-[#146C86] border border-[#16A6A1]/30 text-xs font-bold"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => {
                            const remaining = tagInput
                              .split(',')
                              .map((x) => x.trim())
                              .filter((x) => x && x !== t);
                            setTagInput(remaining.join(', '));
                          }}
                          className="hover:text-rose-600 rounded-full p-0.5 cursor-pointer transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}

              {/* Input for Custom Tags */}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Type tags separated by comma (e.g., Scenic, Wildlife, Photography)"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#16A6A1] focus:outline-none"
              />

              {/* Quick Add Tag Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500 block">
                  Quick Add Suggested Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS.map((t) => {
                    const activeTags = tagInput
                      .split(',')
                      .map((x) => x.trim())
                      .filter(Boolean);
                    const isSelected = activeTags.includes(t);
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => {
                          if (isSelected) {
                            setTagInput(activeTags.filter((x) => x !== t).join(', '));
                          } else {
                            setTagInput([...activeTags, t].join(', '));
                          }
                        }}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#16A6A1] text-white border-[#16A6A1] shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-[#16A6A1] hover:text-[#0B3A53]'
                        }`}
                      >
                        {isSelected ? `✓ ${t}` : `+ ${t}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Modal Footer (Always Visible at Bottom) */}
          <div className="flex items-center justify-end gap-3 p-4 sm:px-8 bg-slate-50 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-2.5 rounded-xl bg-[#16A6A1] hover:bg-[#138D89] disabled:opacity-60 disabled:cursor-wait text-white font-black text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Review' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
