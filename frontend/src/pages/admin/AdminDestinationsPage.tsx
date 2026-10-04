import React, { useState, useMemo, useRef } from 'react';
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
  Upload,
  Trash2,
  Link,
  ImageIcon,
  Calendar,
  DollarSign,
  Users,
  Car,
  Briefcase,
  Sparkles,
  Check,
  Tag,
  ArrowRight,
  ShieldCheck,
  Clock,
  Power,
  Sun,
  CloudRain,
  Droplets,
  Wind,
  Thermometer,
  AlertCircle,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminDestination } from '../../mock/mockAdminData';
import { TRAVEL_PACKAGES, TravelPackage } from '../../mock/tourAndGuideData';
import { DestinationLiveWeatherModal } from '../../components/admin/DestinationLiveWeatherModal';
import { DestinationWeatherService } from '../../services/destinationWeatherService';

// Preset scenic travel package cover images
const PRESET_PACKAGE_IMAGES = [
  {
    name: 'Sigiriya Lion Rock',
    url: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Ella Nine Arch Bridge',
    url: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Mirissa Coastal Beach',
    url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Yala Wildlife Safari',
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Kandy Lake & Temple',
    url: 'https://images.unsplash.com/photo-1588598056972-2d12f6a73c1d?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Galle Dutch Fort',
    url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
  },
];

const POPULAR_DESTINATION_TAGS = [
  'Colombo',
  'Kandy',
  'Ella',
  'Galle',
  'Sigiriya',
  'Mirissa',
  'Yala',
  'Nuwara Eliya',
  'Anuradhapura',
  'Trincomalee',
  'Jaffna',
];

export const AdminDestinationsPage: React.FC = () => {
  // ── Tab State: 'destinations' | 'packages' ─────────────────────────────────
  const [activeTab, setActiveTab] = useState<'destinations' | 'packages'>('packages');

  // ── Toast Notification State ─────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Destinations State ───────────────────────────────────────────────────
  const [destinations, setDestinations] = useState<AdminDestination[]>(() => {
    const list = adminService.getDestinations();
    const seen = new Set<string>();
    return list.filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });
  });
  const [destViewMode, setDestViewMode] = useState<'grid' | 'table'>('grid');
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [selectedDestCategory, setSelectedDestCategory] = useState<string>('All');
  const [isAddDestModalOpen, setIsAddDestModalOpen] = useState(false);
  const [editingDestId, setEditingDestId] = useState<string | null>(null);

  // Live Weather & Details Modal State
  const [selectedWeatherDest, setSelectedWeatherDest] = useState<AdminDestination | null>(null);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);

  const handleOpenDestinationWeather = (dest: AdminDestination) => {
    setSelectedWeatherDest(dest);
    setIsWeatherModalOpen(true);
  };

  // Catalog attractions available in the system for selection
  const allAttractions = useMemo(() => adminService.getAttractions(), []);

  // Add / Edit Destination Form State
  const [destName, setDestName] = useState('');
  const [destProvince, setDestProvince] = useState('Central Province');
  const [destCategory, setDestCategory] = useState<AdminDestination['category']>('Cultural');
  const [destLocation, setDestLocation] = useState('');
  const [destCoverImage, setDestCoverImage] = useState('');
  const [destImageInputMode, setDestImageInputMode] = useState<'upload' | 'url'>('upload');
  const [destUploadedImagePreview, setDestUploadedImagePreview] = useState<string | null>(null);
  const [destUploadedFileName, setDestUploadedFileName] = useState<string>('');
  const [destUploadedFileSize, setDestUploadedFileSize] = useState<string>('');
  const [isDestDragging, setIsDestDragging] = useState(false);
  const destFileInputRef = useRef<HTMLInputElement>(null);
  const [destDescription, setDestDescription] = useState('');
  const [destAccessibility, setDestAccessibility] = useState('Highway & Rail Connected');

  // Requested additional columns:
  // 1. Best time
  const [destBestTimeToVisit, setDestBestTimeToVisit] = useState('December to April');
  // 2. Recommended stay period (in days)
  const [destRecommendedStayDays, setDestRecommendedStayDays] = useState('2 - 3 Days');
  // 3. Avg budget per day
  const [destAvgBudgetPerDay, setDestAvgBudgetPerDay] = useState('$60 - $95 / day');
  // 4. Top attractions (selectable out of added attractions)
  const [destTopAttractions, setDestTopAttractions] = useState<string[]>([]);
  const [attrSearchQuery, setAttrSearchQuery] = useState('');
  const [newAttractionInput, setNewAttractionInput] = useState('');
  // 5. Opening hours and entry fees (separate for both foreign and local)
  const [destOpeningHours, setDestOpeningHours] = useState('06:00 AM – 06:00 PM Daily');
  const [destEntryFeeLocal, setDestEntryFeeLocal] = useState('Free Entry');
  const [destEntryFeeForeign, setDestEntryFeeForeign] = useState('$25 / LKR 7,500');

  // Destination Validation Errors State
  const [destErrors, setDestErrors] = useState<Record<string, string>>({});

  const clearDestError = (field: string) => {
    setDestErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateDestForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Destination Name
    const trimmedName = destName.trim();
    if (!trimmedName) {
      errors.name = 'Destination name is required.';
    } else if (trimmedName.length < 3) {
      errors.name = 'Destination name must be at least 3 characters.';
    } else if (trimmedName.length > 80) {
      errors.name = 'Destination name cannot exceed 80 characters.';
    } else {
      const isDuplicate = destinations.some(
        (d) => d.name.toLowerCase() === trimmedName.toLowerCase() && d.id !== editingDestId
      );
      if (isDuplicate) {
        errors.name = 'A destination with this name already exists in the catalog.';
      }
    }

    // 2. Province / Region
    const trimmedProvince = destProvince.trim();
    if (!trimmedProvince) {
      errors.province = 'Province / Region is required.';
    } else if (trimmedProvince.length < 3) {
      errors.province = 'Please enter a valid province name (e.g. Central Province).';
    }

    // 3. Category
    if (!destCategory) {
      errors.category = 'Please select a destination category.';
    }

    // 4. Specific Location
    const trimmedLocation = destLocation.trim();
    if (!trimmedLocation) {
      errors.location = 'Specific location is required.';
    } else if (trimmedLocation.length < 3) {
      errors.location = 'Location must be at least 3 characters.';
    }

    // 5. Best time to visit
    const trimmedBestTime = destBestTimeToVisit.trim();
    if (!trimmedBestTime) {
      errors.bestTimeToVisit = 'Best time to visit is required (e.g. December to April).';
    } else if (trimmedBestTime.length < 3) {
      errors.bestTimeToVisit = 'Please provide a valid season or months.';
    }

    // 6. Recommended stay
    const trimmedStay = destRecommendedStayDays.trim();
    if (!trimmedStay) {
      errors.recommendedStayDays = 'Recommended stay period is required (e.g. 2 - 3 Days).';
    }

    // 7. Average budget per day
    const trimmedBudget = destAvgBudgetPerDay.trim();
    if (!trimmedBudget) {
      errors.avgBudgetPerDay = 'Average budget per day is required (e.g. $60 - $95 / day).';
    }

    // 8. Opening hours
    const trimmedHours = destOpeningHours.trim();
    if (!trimmedHours) {
      errors.openingHours = 'Opening hours are required (e.g. 06:00 AM – 06:00 PM Daily).';
    }

    // 9. Local Entry Fee
    const trimmedLocalFee = destEntryFeeLocal.trim();
    if (!trimmedLocalFee) {
      errors.entryFeeLocal = 'Local entry fee is required (e.g. Free Entry or LKR 200).';
    }

    // 10. Foreign Entry Fee
    const trimmedForeignFee = destEntryFeeForeign.trim();
    if (!trimmedForeignFee) {
      errors.entryFeeForeign = 'Foreign entry fee is required (e.g. $25 / LKR 7,500).';
    }

    // 11. Top Attractions
    if (destTopAttractions.length === 0) {
      errors.topAttractions = 'Please select or add at least 1 top attraction.';
    }

    // 12. Cover Image
    if (destImageInputMode === 'upload') {
      if (!destUploadedImagePreview && !destCoverImage) {
        errors.coverImage = 'Please upload a cover image for the destination.';
      }
    } else {
      const trimmedCover = destCoverImage.trim();
      if (!trimmedCover) {
        errors.coverImage = 'Please enter an image URL.';
      } else if (!/^https?:\/\/.+/i.test(trimmedCover)) {
        errors.coverImage = 'Image URL must start with http:// or https://';
      }
    }

    // 13. Description
    const trimmedDesc = destDescription.trim();
    if (!trimmedDesc) {
      errors.description = 'Description is required.';
    } else if (trimmedDesc.length < 15) {
      errors.description = 'Description must be at least 15 characters to provide visitor details.';
    }

    setDestErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Travel Packages State ────────────────────────────────────────────────
  const [travelPackages, setTravelPackages] = useState<TravelPackage[]>(() => {
    try {
      const stored = localStorage.getItem('nova_custom_travel_packages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const names = new Set(parsed.map((p: any) => p.name?.toLowerCase()));
          const nonDup = TRAVEL_PACKAGES.filter((p) => !names.has(p.name.toLowerCase()));
          return [...parsed, ...nonDup];
        }
      }
    } catch {}
    return TRAVEL_PACKAGES.map((p) => ({ ...p, status: p.status || 'Active' }));
  });

  const [packageViewMode, setPackageViewMode] = useState<'grid' | 'table'>('grid');
  const [packageSearchQuery, setPackageSearchQuery] = useState('');
  const [packageStyleFilter, setPackageStyleFilter] = useState<string>('All');
  const [isAddPackageModalOpen, setIsAddPackageModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  // Add/Edit Travel Package Form State
  const [pkgName, setPkgName] = useState('');
  const [pkgDestinations, setPkgDestinations] = useState('Colombo, Kandy, Ella, Galle');
  const [pkgDurationDays, setPkgDurationDays] = useState<number>(5);
  const [pkgDurationNights, setPkgDurationNights] = useState<number>(4);
  const [pkgPrice, setPkgPrice] = useState<number>(340);
  const [pkgGroupSize, setPkgGroupSize] = useState('Up to 8 travelers');
  const [pkgTravelStyle, setPkgTravelStyle] = useState('Cultural · Nature · Scenic');
  const [pkgBestFor, setPkgBestFor] = useState('Couples · Families · Small Groups');
  const [pkgAbout, setPkgAbout] = useState('');
  const [pkgInclusions, setPkgInclusions] = useState(
    'Licensed English-speaking Tour Guide, Private AC Transport throughout, Hotel Pickups & Dropoffs, Daily Breakfast, All Entry Permits'
  );
  const [pkgExclusions, setPkgExclusions] = useState(
    'International Flight Tickets, Personal Travel Insurance, Optional Watersports'
  );
  const [pkgTransportType, setPkgTransportType] = useState('Private AC Vehicle / Van');
  const [pkgGuideName, setPkgGuideName] = useState('Licensed Local Guide');
  const [pkgStatus, setPkgStatus] = useState<'Active' | 'Inactive'>('Active');

  // Package Cover Image State
  const [pkgImageMode, setPkgImageMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [pkgCoverImage, setPkgCoverImage] = useState<string>(PRESET_PACKAGE_IMAGES[0].url);
  const [pkgUploadedImagePreview, setPkgUploadedImagePreview] = useState<string | null>(null);
  const [pkgUploadedFileName, setPkgUploadedFileName] = useState<string>('');
  const [pkgUploadedFileSize, setPkgUploadedFileSize] = useState<string>('');
  const [isPkgDragging, setIsPkgDragging] = useState(false);
  const pkgFileInputRef = useRef<HTMLInputElement>(null);

  // ── Image Handlers: Destination ──────────────────────────────────────────
  const handleDestImageFile = (file: File) => {
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
        setDestUploadedImagePreview(reader.result);
        setDestCoverImage(reader.result);
        setDestUploadedFileName(file.name);
        setDestUploadedFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
        clearDestError('coverImage');
      }
    };
    reader.readAsDataURL(file);
  };

  const resetDestForm = () => {
    setEditingDestId(null);
    setDestName('');
    setDestProvince('Central Province');
    setDestCategory('Cultural');
    setDestLocation('');
    setDestCoverImage('');
    setDestUploadedImagePreview(null);
    setDestUploadedFileName('');
    setDestUploadedFileSize('');
    setDestDescription('');
    setDestAccessibility('Highway & Rail Connected');
    setDestBestTimeToVisit('December to April');
    setDestRecommendedStayDays('2 - 3 Days');
    setDestAvgBudgetPerDay('$60 - $95 / day');
    setDestTopAttractions([]);
    setAttrSearchQuery('');
    setNewAttractionInput('');
    setDestOpeningHours('06:00 AM – 06:00 PM Daily');
    setDestEntryFeeLocal('Free Entry');
    setDestEntryFeeForeign('$25 / LKR 7,500');
    setDestImageInputMode('upload');
    setDestErrors({});
    if (destFileInputRef.current) destFileInputRef.current.value = '';
  };

  const handleOpenEditDestination = (dest: AdminDestination) => {
    setDestErrors({});
    setEditingDestId(dest.id);
    setDestName(dest.name);
    setDestProvince(dest.province);
    setDestCategory(dest.category);
    setDestLocation(dest.location);
    setDestCoverImage(dest.coverImage);
    setDestDescription(dest.description);
    setDestAccessibility(dest.accessibility || 'Highway & Rail Connected');
    setDestBestTimeToVisit(dest.bestTimeToVisit || 'December to April');
    setDestRecommendedStayDays(String(dest.recommendedStayDays || '2 - 3 Days'));
    setDestAvgBudgetPerDay(dest.avgBudgetPerDay || '$60 - $95 / day');
    setDestTopAttractions(dest.topAttractions || []);
    setDestOpeningHours(dest.openingHours || '06:00 AM – 06:00 PM Daily');
    setDestEntryFeeLocal(dest.entryFeeLocal || 'Free Entry');
    setDestEntryFeeForeign(dest.entryFeeForeign || '$25 / LKR 7,500');
    setDestImageInputMode(dest.coverImage?.startsWith('data:') ? 'upload' : 'url');
    setIsAddDestModalOpen(true);
  };

  const toggleTopAttraction = (attrName: string) => {
    setDestTopAttractions((prev) =>
      prev.includes(attrName) ? prev.filter((a) => a !== attrName) : [...prev, attrName]
    );
    clearDestError('topAttractions');
  };

  const handleAddCustomAttraction = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newAttractionInput.trim();
    if (!trimmed) return;
    if (!destTopAttractions.includes(trimmed)) {
      setDestTopAttractions([...destTopAttractions, trimmed]);
      clearDestError('topAttractions');
    }
    setNewAttractionInput('');
  };

  // ── Image Handlers: Travel Package ───────────────────────────────────────
  const handlePkgImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPkgUploadedImagePreview(reader.result);
        setPkgCoverImage(reader.result);
        setPkgUploadedFileName(file.name);
        setPkgUploadedFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
      }
    };
    reader.readAsDataURL(file);
  };

  const resetPkgForm = () => {
    setEditingPackageId(null);
    setPkgName('');
    setPkgDestinations('Colombo, Kandy, Ella, Galle');
    setPkgDurationDays(5);
    setPkgDurationNights(4);
    setPkgPrice(340);
    setPkgGroupSize('Up to 8 travelers');
    setPkgTravelStyle('Cultural · Nature · Scenic');
    setPkgBestFor('Couples · Families · Small Groups');
    setPkgAbout('');
    setPkgCoverImage(PRESET_PACKAGE_IMAGES[0].url);
    setPkgUploadedImagePreview(null);
    setPkgUploadedFileName('');
    setPkgUploadedFileSize('');
    setPkgImageMode('preset');
    setPkgStatus('Active');
    if (pkgFileInputRef.current) pkgFileInputRef.current.value = '';
  };

  // Open Edit Package Modal with pre-filled details
  const handleOpenEditPackage = (pkg: TravelPackage) => {
    setEditingPackageId(pkg.id);
    setPkgName(pkg.name);
    setPkgDestinations(pkg.destinationsList.join(', '));
    const days = parseInt(pkg.duration) || 5;
    setPkgDurationDays(days);
    setPkgDurationNights(parseInt(pkg.nights) || Math.max(1, days - 1));
    const priceNum = parseFloat(pkg.priceFrom.replace(/[^0-9.]/g, '')) || 300;
    setPkgPrice(priceNum);
    setPkgGroupSize(pkg.groupSize || 'Up to 8 travelers');
    setPkgTravelStyle(pkg.travelStyle || 'Cultural · Nature · Scenic');
    setPkgBestFor(pkg.bestFor || 'Couples · Families · Small Groups');
    setPkgAbout(pkg.about || '');
    setPkgCoverImage(pkg.imageUrl);
    setPkgInclusions(pkg.inclusions.join(', '));
    setPkgExclusions(pkg.exclusions.join(', '));
    setPkgTransportType(pkg.transport?.type || 'Private AC Vehicle / Van');
    setPkgGuideName(pkg.guide?.name || 'Licensed Local Guide');
    setPkgStatus(pkg.status || 'Active');
    setPkgImageMode('preset');
    setIsAddPackageModalOpen(true);
  };

  // Toggle destination tag in package destinations field
  const toggleDestinationTag = (tag: string) => {
    const list = pkgDestinations
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
    if (list.includes(tag)) {
      setPkgDestinations(list.filter((d) => d !== tag).join(', '));
    } else {
      setPkgDestinations([...list, tag].join(', '));
    }
  };

  // Toggle Active / Inactive status of a travel package
  const handleTogglePackageStatus = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updatedStatus: 'Active' | 'Inactive' = 'Active';
    const updated: TravelPackage[] = travelPackages.map((pkg) => {
      if (pkg.id === id) {
        const next: 'Active' | 'Inactive' = (pkg.status ?? 'Active') === 'Active' ? 'Inactive' : 'Active';
        updatedStatus = next;
        return { ...pkg, status: next };
      }
      return pkg;
    });

    setTravelPackages(updated);

    // Sync to localStorage
    try {
      localStorage.setItem('nova_custom_travel_packages', JSON.stringify(updated));
    } catch {}

    // Sync to in-memory TRAVEL_PACKAGES array
    const target = TRAVEL_PACKAGES.find((p) => p.id === id);
    if (target) {
      target.status = updatedStatus;
    }

    const changedPkg = updated.find((p) => p.id === id);
    showToast(
      `Package "${changedPkg?.name}" is now ${
        updatedStatus === 'Active' ? 'ACTIVE (Visible on Tours Page)' : 'INACTIVE (Hidden from travelers)'
      }`
    );
  };

  // ── Delete Destination ───────────────────────────────────────────────────
  const handleDeleteDestination = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from destinations?`)) {
      const updated = adminService.deleteDestination(id);
      setDestinations(updated);
      showToast(`Destination "${name}" removed successfully.`);
    }
  };

  // ── Filtered Lists ───────────────────────────────────────────────────────
  const filteredDestinations = useMemo(() => {
    // Strictly de-duplicate destinations by ID and normalize entries
    const seenIds = new Set<string>();
    const uniqueList: AdminDestination[] = [];
    for (const d of destinations) {
      if (d && d.id && !seenIds.has(d.id)) {
        seenIds.add(d.id);
        uniqueList.push(d);
      }
    }

    return uniqueList.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(destSearchQuery.toLowerCase()) ||
        d.province.toLowerCase().includes(destSearchQuery.toLowerCase());
      const matchesCategory = selectedDestCategory === 'All' || d.category === selectedDestCategory;
      return matchesSearch && matchesCategory;
    });
  }, [destinations, destSearchQuery, selectedDestCategory]);

  const filteredPackages = useMemo(() => {
    return travelPackages.filter((pkg) => {
      const matchesSearch =
        pkg.name.toLowerCase().includes(packageSearchQuery.toLowerCase()) ||
        pkg.destinationsList.some((d) => d.toLowerCase().includes(packageSearchQuery.toLowerCase())) ||
        pkg.destination.toLowerCase().includes(packageSearchQuery.toLowerCase());
      const matchesStyle =
        packageStyleFilter === 'All' ||
        pkg.travelStyle.toLowerCase().includes(packageStyleFilter.toLowerCase());
      return matchesSearch && matchesStyle;
    });
  }, [travelPackages, packageSearchQuery, packageStyleFilter]);

  // ── Create or Update Destination ──────────────────────────────────────────
  const handleSaveDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDestForm()) {
      showToast('Please correct the highlighted validation errors before saving.');
      return;
    }

    const finalImage =
      destCoverImage ||
      destUploadedImagePreview ||
      'https://images.unsplash.com/photo-1588598056972-2d12f6a73c1d?auto=format&fit=crop&w=800&q=80';

    const payload: Partial<AdminDestination> = {
      name: destName.trim(),
      province: destProvince,
      category: destCategory,
      location: destLocation.trim(),
      coverImage: finalImage,
      description: destDescription.trim(),
      accessibility: destAccessibility,
      bestTimeToVisit: destBestTimeToVisit,
      recommendedStayDays: destRecommendedStayDays,
      avgBudgetPerDay: destAvgBudgetPerDay,
      topAttractions: destTopAttractions,
      openingHours: destOpeningHours,
      entryFeeLocal: destEntryFeeLocal,
      entryFeeForeign: destEntryFeeForeign,
      attractionsCount: Math.max(destTopAttractions.length, 1),
    };

    if (editingDestId) {
      adminService.updateDestination(editingDestId, payload);
      setDestinations((prev) =>
        prev.map((d) => (d.id === editingDestId ? { ...d, ...payload } : d))
      );
      showToast(`Destination "${destName}" updated successfully!`);
    } else {
      const created = adminService.addDestination({
        ...payload,
        status: 'Active',
        lat: 7.29,
        lng: 80.63,
        bookingsCount: 0,
        growthPercentage: 0,
      });
      // Prevent duplication: replace or prepend cleanly ensuring unique id
      setDestinations((prev) => [created, ...prev.filter((d) => d.id !== created.id)]);
      showToast(`Destination "${created.name}" created successfully!`);
    }

    setIsAddDestModalOpen(false);
    resetDestForm();
  };

  // ── Create or Update Travel Package ──────────────────────────────────────
  const handleSaveTravelPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName.trim()) {
      alert('Please enter a package title');
      return;
    }

    const destsArray = pkgDestinations
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    const destString = destsArray.length > 0 ? destsArray.join(' · ') : 'Sri Lanka';
    const finalImage =
      pkgCoverImage ||
      pkgUploadedImagePreview ||
      PRESET_PACKAGE_IMAGES[0].url;

    const inclusionsArray = pkgInclusions
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    const exclusionsArray = pkgExclusions
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    // Generate daily itinerary
    const dailyItinerary = Array.from({ length: Math.min(pkgDurationDays, 7) }, (_, idx) => {
      const dayNum = idx + 1;
      const currentDest = destsArray[idx % (destsArray.length || 1)] || 'Sri Lanka';
      return {
        day: dayNum,
        title:
          idx === 0
            ? 'Arrival & Welcome Reception'
            : idx === pkgDurationDays - 1
            ? 'Final Exploration & Departure'
            : `Guided Tour of ${currentDest}`,
        morning: idx === 0 ? 'Airport transfer & hotel check-in' : 'Morning sightseeing tour & breakfast',
        afternoon: 'Guided cultural visit & authentic cuisine experience',
        evening: idx === pkgDurationDays - 1 ? 'Departure transfer' : 'Leisure sunset walk & evening relaxation',
      };
    });

    if (editingPackageId) {
      // UPDATE EXISTING PACKAGE
      const updatedList = travelPackages.map((p) => {
        if (p.id === editingPackageId) {
          return {
            ...p,
            name: pkgName.trim(),
            destination: destString,
            destinationsList: destsArray.length > 0 ? destsArray : ['Sri Lanka'],
            duration: `${pkgDurationDays} Days`,
            nights: `${pkgDurationNights || Math.max(1, pkgDurationDays - 1)} Nights`,
            priceFrom: `$${pkgPrice}`,
            imageUrl: finalImage,
            inclusions:
              inclusionsArray.length > 0
                ? inclusionsArray
                : p.inclusions,
            exclusions:
              exclusionsArray.length > 0
                ? exclusionsArray
                : p.exclusions,
            about:
              pkgAbout.trim() ||
              `Experience ${destString} with a thoughtfully designed ${pkgDurationDays}-day journey.`,
            groupSize: pkgGroupSize || 'Up to 8 travelers',
            travelStyle: pkgTravelStyle || 'Cultural & Scenic Tour',
            bestFor: pkgBestFor || 'Couples, Families & Small Groups',
            dailyItinerary: dailyItinerary,
            status: pkgStatus,
            guide: {
              ...p.guide,
              name: pkgGuideName || p.guide?.name || 'Licensed Local Guide',
            },
            transport: {
              ...p.transport,
              type: pkgTransportType || 'Private AC Vehicle / Van',
            },
          };
        }
        return p;
      });

      setTravelPackages(updatedList);

      try {
        localStorage.setItem('nova_custom_travel_packages', JSON.stringify(updatedList));
      } catch {}

      // Update in-memory TRAVEL_PACKAGES
      const memPkg = TRAVEL_PACKAGES.find((p) => p.id === editingPackageId);
      if (memPkg) {
        Object.assign(memPkg, {
          name: pkgName.trim(),
          destination: destString,
          destinationsList: destsArray.length > 0 ? destsArray : ['Sri Lanka'],
          duration: `${pkgDurationDays} Days`,
          nights: `${pkgDurationNights || Math.max(1, pkgDurationDays - 1)} Nights`,
          priceFrom: `$${pkgPrice}`,
          imageUrl: finalImage,
          about: pkgAbout.trim(),
          status: pkgStatus,
        });
      }

      setIsAddPackageModalOpen(false);
      resetPkgForm();
      showToast(`Travel Package "${pkgName}" updated successfully!`);
    } else {
      // CREATE NEW PACKAGE
      const newPkg: TravelPackage = {
        id: `pkg-${Date.now()}`,
        name: pkgName.trim(),
        destination: destString,
        destinationsList: destsArray.length > 0 ? destsArray : ['Sri Lanka'],
        duration: `${pkgDurationDays} Days`,
        nights: `${pkgDurationNights || Math.max(1, pkgDurationDays - 1)} Nights`,
        priceFrom: `$${pkgPrice}`,
        imageUrl: finalImage,
        inclusions:
          inclusionsArray.length > 0
            ? inclusionsArray
            : [
                'Licensed English-speaking Tour Guide',
                'Private AC Transport throughout',
                'Hotel Pickups & Dropoffs',
                'NOVA AI Travel Assistant Access',
                'All Entry Tickets & Permits',
              ],
        exclusions:
          exclusionsArray.length > 0
            ? exclusionsArray
            : ['International Flight Tickets', 'Personal Travel Insurance', 'Personal Expenses'],
        about:
          pkgAbout.trim() ||
          `Experience ${destString} with a thoughtfully designed ${pkgDurationDays}-day journey featuring authentic Sri Lankan sights, culture, and personalized local guidance.`,
        groupSize: pkgGroupSize || 'Up to 8 travelers',
        travelStyle: pkgTravelStyle || 'Cultural & Scenic Tour',
        bestFor: pkgBestFor || 'Couples, Families & Small Groups',
        dailyItinerary: dailyItinerary,
        status: pkgStatus,
        guide: {
          name: pkgGuideName || 'Licensed Local Guide',
          title: 'Certified Tourist Guide',
          languages: 'English, Sinhala',
          rating: 4.9,
          experience: '5+ Years',
        },
        transport: {
          type: pkgTransportType || 'Private AC Vehicle / Van',
          capacity: pkgGroupSize || 'Up to 8 Seats',
          features: 'Free WiFi, Air Conditioning, Bottled Water',
        },
      };

      const updated = [newPkg, ...travelPackages];
      setTravelPackages(updated);
      TRAVEL_PACKAGES.unshift(newPkg);

      try {
        const stored = localStorage.getItem('nova_custom_travel_packages');
        const existing = stored ? JSON.parse(stored) : [];
        const combined = [newPkg, ...existing.filter((p: any) => p.name !== newPkg.name)];
        localStorage.setItem('nova_custom_travel_packages', JSON.stringify(combined));
      } catch (err) {
        console.warn('Could not persist to localStorage:', err);
      }

      adminService.addTour({
        name: newPkg.name,
        destinationName: destString,
        duration: newPkg.duration,
        daysCount: pkgDurationDays,
        price: pkgPrice,
        capacity: 8,
        transportOption: pkgTransportType,
        status: pkgStatus === 'Active' ? 'Active' : 'Draft',
        coverImage: finalImage,
        description: newPkg.about,
      });

      setIsAddPackageModalOpen(false);
      resetPkgForm();
      showToast(`Travel Package "${newPkg.name}" created and published!`);
    }
  };

  // ── Delete Package ───────────────────────────────────────────────────────
  const handleDeletePackage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this travel package?')) {
      const updated = travelPackages.filter((p) => p.id !== id);
      setTravelPackages(updated);
      try {
        localStorage.setItem('nova_custom_travel_packages', JSON.stringify(updated));
      } catch {}
      showToast('Travel package removed.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#0B3A53] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#16A6A1]/40 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#16A6A1]" />
            <span className="text-xs font-bold tracking-wide">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase text-[#16A6A1] tracking-wider">
              ADMIN CATALOG MANAGEMENT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            {activeTab === 'destinations' ? 'Destination Management' : 'Travel Packages Management'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {activeTab === 'destinations'
              ? 'Manage Sri Lankan destinations, regional highlights, and catalog attraction entries.'
              : 'Create, edit, toggle active status, and manage ready-made multi-day tour packages.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('packages');
              resetPkgForm();
              setIsAddPackageModalOpen(true);
            }}
            className="bg-gradient-to-r from-[#146C86] via-[#16A6A1] to-emerald-500 hover:from-[#0B3A53] hover:to-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-102"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Travel Package</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('destinations');
              setIsAddDestModalOpen(true);
            }}
            className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#16A6A1]" />
            <span>Add Destination</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Switcher */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('destinations')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
            activeTab === 'destinations'
              ? 'bg-[#0B3A53] text-white border-[#0B3A53] shadow-sm'
              : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <MapPin className={`w-4 h-4 ${activeTab === 'destinations' ? 'text-[#16A6A1]' : 'text-slate-400'}`} />
          <span>Destinations</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeTab === 'destinations' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {destinations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
            activeTab === 'packages'
              ? 'bg-[#0B3A53] text-white border-[#0B3A53] shadow-sm'
              : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <Briefcase className={`w-4 h-4 ${activeTab === 'packages' ? 'text-[#16A6A1]' : 'text-slate-400'}`} />
          <span>Travel Packages</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeTab === 'packages' ? 'bg-[#16A6A1] text-white' : 'bg-teal-50 text-[#146C86]'
            }`}
          >
            {travelPackages.length}
          </span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: DESTINATIONS TAB CONTENT                                   */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'destinations' && (
        <div className="space-y-6">
          {/* Toolbar & View Controls */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={destSearchQuery}
                onChange={(e) => setDestSearchQuery(e.target.value)}
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
                  value={selectedDestCategory}
                  onChange={(e) => setSelectedDestCategory(e.target.value)}
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
                  onClick={() => setDestViewMode('grid')}
                  className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    destViewMode === 'grid' ? 'bg-white text-[#0B3A53] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDestViewMode('table')}
                  className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    destViewMode === 'table' ? 'bg-white text-[#0B3A53] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* DESTINATIONS GRID VIEW */}
          {destViewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map((dest) => {
                const liveWeather = DestinationWeatherService.getLiveWeather(dest.name, dest.province);
                return (
                  <div
                    key={dest.id}
                    onClick={() => handleOpenDestinationWeather(dest)}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-teal-300 transition-all duration-300 space-y-3 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 relative"
                    title={`Click to view live real-time weather & details for ${dest.name}`}
                  >
                    <div>
                      {/* Image Header with Live Telemetry & Status Badges */}
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        <img
                          src={dest.coverImage}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30 pointer-events-none" />

                        {/* Top Left: Live Weather telemetry pill with active beacon */}
                        <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 shadow-lg group-hover:border-teal-400/50 transition-all">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                          <span className="font-black text-amber-300 flex items-center gap-1">
                            <Sun className="w-3.5 h-3.5 text-amber-400" />
                            {liveWeather.currentTemp}°C
                          </span>
                          <span className="text-slate-400 text-[10px]">·</span>
                          <span className="text-teal-200 font-semibold truncate max-w-[105px]">
                            {liveWeather.condition}
                          </span>
                        </div>

                        {/* Top Right: Status toggle indicator */}
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-md backdrop-blur-md ${
                              dest.status === 'Active'
                                ? 'bg-emerald-500/90 text-white border border-emerald-300/30'
                                : 'bg-slate-800/90 text-slate-300 border border-white/15'
                            }`}
                          >
                            {dest.status}
                          </span>
                        </div>

                        {/* Bottom Overlay: Category and Feels-Like */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <span className="bg-slate-950/75 backdrop-blur-md text-teal-300 text-[10px] font-black px-2.5 py-1 rounded-lg border border-teal-500/30 shadow-xs uppercase tracking-wide">
                            {dest.category}
                          </span>
                          <span className="bg-slate-950/75 backdrop-blur-md text-slate-200 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-white/15">
                            Feels {liveWeather.feelsLike}°C
                          </span>
                        </div>
                      </div>

                      {/* Card Details Body */}
                      <div className="p-5 space-y-3">
                        {/* Title, Province/Location & Avg Budget Per Day */}
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-black text-[#0B3A53] font-heading group-hover:text-[#146C86] transition-colors truncate">
                                {dest.name}
                              </h3>
                              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-[#16A6A1] shrink-0" />
                                <span className="truncate">
                                  {dest.province} · {dest.location}
                                </span>
                              </p>
                            </div>
                            {dest.avgBudgetPerDay && (
                              <div className="shrink-0 text-right">
                                <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-2xs">
                                  <DollarSign className="w-3 h-3 text-emerald-600" />
                                  <span>{dest.avgBudgetPerDay}</span>
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 block mt-0.5">Avg / Day</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                          {dest.description}
                        </p>

                        {/* Travel Planning Metrics: Best Time & Recommended Stay Days */}
                        <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50/90 rounded-2xl border border-slate-100 text-[11px]">
                          <div className="truncate">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                              Best Time
                            </span>
                            <div
                              className="flex items-center gap-1.5 font-bold text-[#0B3A53] truncate"
                              title={`Best Time: ${dest.bestTimeToVisit || 'Year-round'}`}
                            >
                              <Calendar className="w-3.5 h-3.5 text-[#16A6A1] shrink-0" />
                              <span className="truncate">{dest.bestTimeToVisit || 'Year-round'}</span>
                            </div>
                          </div>
                          <div className="truncate">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                              Recommended Stay
                            </span>
                            <div
                              className="flex items-center gap-1.5 font-bold text-[#0B3A53] truncate"
                              title={`Stay: ${dest.recommendedStayDays || '2 - 3 Days'}`}
                            >
                              <Clock className="w-3.5 h-3.5 text-[#16A6A1] shrink-0" />
                              <span className="truncate">{dest.recommendedStayDays || '2 - 3 Days'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Opening Hours & Separate Entry Fees (Local vs Foreign) */}
                        <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1.5">
                          {dest.openingHours && (
                            <div className="flex items-center justify-between text-[10.5px]">
                              <span className="text-slate-400 font-extrabold uppercase text-[9.5px]">Hours:</span>
                              <span className="font-bold text-slate-700 truncate max-w-[210px]">
                                {dest.openingHours}
                              </span>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                            <div
                              className="bg-emerald-50/80 border border-emerald-200/70 rounded-xl px-2.5 py-1 text-emerald-800 truncate"
                              title={`Local Entry: ${dest.entryFeeLocal || 'Free'}`}
                            >
                              <span className="text-[9px] uppercase font-black text-emerald-600 block">Local Entry</span>
                              <span className="truncate block font-extrabold">{dest.entryFeeLocal || 'Free Entry'}</span>
                            </div>
                            <div
                              className="bg-cyan-50/80 border border-cyan-200/70 rounded-xl px-2.5 py-1 text-[#0B3A53] truncate"
                              title={`Foreign Entry: ${dest.entryFeeForeign || '$25'}`}
                            >
                              <span className="text-[9px] uppercase font-black text-[#146C86] block">Foreign Entry</span>
                              <span className="truncate block font-extrabold">{dest.entryFeeForeign || '$25 USD'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Top Attractions Highlights */}
                        {dest.topAttractions && dest.topAttractions.length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3 text-[#16A6A1]" />
                                Top Attractions
                              </span>
                              <span className="text-[#146C86] font-bold text-[10px]">
                                {dest.topAttractions.length} Added
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {dest.topAttractions.slice(0, 3).map((attr) => (
                                <span
                                  key={attr}
                                  className="px-2 py-0.5 rounded-lg bg-slate-100 text-[#0B3A53] font-bold text-[10px] truncate max-w-[145px] border border-slate-200/60"
                                >
                                  {attr}
                                </span>
                              ))}
                              {dest.topAttractions.length > 3 && (
                                <span className="px-1.5 py-0.5 rounded-lg bg-teal-50 text-[#146C86] border border-teal-200/60 font-bold text-[10px]">
                                  +{dest.topAttractions.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Live Micro-Telemetry Strip */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500 bg-slate-50/70 -mx-5 px-5 py-2.5 mt-2">
                          <div className="flex items-center gap-3 text-[10.5px]">
                            <span className="flex items-center gap-1 text-sky-600 font-bold" title="Relative Humidity">
                              <Droplets className="w-3 h-3 text-sky-500" />
                              {liveWeather.humidity}%
                            </span>
                            <span className="flex items-center gap-1 text-slate-600 font-bold" title="Wind Speed">
                              <Wind className="w-3 h-3 text-slate-400" />
                              {liveWeather.windSpeed} km/h
                            </span>
                            <span className="flex items-center gap-1 text-amber-600 font-bold" title="UV Index">
                              <Sun className="w-3 h-3 text-amber-500" />
                              UV {liveWeather.uvIndex}
                            </span>
                          </div>
                          <span className="text-[10px] font-extrabold text-[#16A6A1] group-hover:underline flex items-center gap-1">
                            <span>Live Weather</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = adminService.toggleDestinationStatus(dest.id);
                          setDestinations([...updated]);
                          showToast(`Status updated for ${dest.name}`);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          dest.status === 'Active'
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {dest.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDestination(dest.id, dest.name);
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                          title={`Delete ${dest.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditDestination(dest);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#0B3A53] hover:bg-[#146C86] text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:scale-102"
                          title="Edit destination configuration"
                        >
                          <Edit className="w-3.5 h-3.5 text-[#16A6A1]" />
                          <span>Edit Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* DESTINATIONS TABLE VIEW */
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-5">Destination</th>
                      <th className="py-4 px-5">Category</th>
                      <th className="py-4 px-5">Best Time & Stay</th>
                      <th className="py-4 px-5">Budget & Fees</th>
                      <th className="py-4 px-5">Top Attractions</th>
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
                              <div className="text-[11px] text-slate-400 font-medium">{dest.province} · {dest.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-700">{dest.category}</td>
                        <td className="py-4 px-5">
                          <div className="font-bold text-[#0B3A53]">{dest.bestTimeToVisit || 'Year-round'}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{dest.recommendedStayDays || '2-3 Days'}</div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-bold text-emerald-700">{dest.avgBudgetPerDay || '$60 / day'}</div>
                          <div className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
                            L: {dest.entryFeeLocal || 'Free'} | F: {dest.entryFeeForeign || '$25'}
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-bold text-[#0B3A53]">
                            {dest.topAttractions?.length || dest.attractionsCount} Listed
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium truncate max-w-[160px]">
                            {dest.topAttractions?.slice(0, 2).join(', ') || 'Attractions catalog'}
                          </div>
                        </td>
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
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenDestinationWeather(dest)}
                              className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#146C86] font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 border border-teal-200/80"
                              title="View real-time weather & full details"
                            >
                              <Sun className="w-3 h-3 text-amber-500" />
                              <span>Weather</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditDestination(dest)}
                              className="px-3 py-1.5 rounded-xl bg-[#0B3A53] hover:bg-[#146C86] text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                              title="Edit destination"
                            >
                              <Edit className="w-3 h-3 text-[#16A6A1]" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                const updated = adminService.toggleDestinationStatus(dest.id);
                                setDestinations([...updated]);
                                showToast(`Status updated for ${dest.name}`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B3A53] font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Toggle
                            </button>
                            <button
                              onClick={() => handleDeleteDestination(dest.id, dest.name)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                              title={`Delete ${dest.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: TRAVEL PACKAGES TAB CONTENT                                */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'packages' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Package Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={packageSearchQuery}
                onChange={(e) => setPackageSearchQuery(e.target.value)}
                placeholder="Search travel package or destination..."
                className="w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0B3A53] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#16A6A1]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              {/* Style Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Style:</span>
                <select
                  value={packageStyleFilter}
                  onChange={(e) => setPackageStyleFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] px-3 py-2 rounded-xl focus:outline-none focus:border-[#16A6A1] cursor-pointer"
                >
                  <option value="All">All Styles</option>
                  <option value="Cultural">Cultural & Heritage</option>
                  <option value="Nature">Nature & Scenic</option>
                  <option value="Coastal">Coastal & Beach</option>
                  <option value="Wildlife">Wildlife Safari</option>
                  <option value="Adventure">Adventure</option>
                </select>
              </div>

              {/* Grid vs Table View Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setPackageViewMode('grid')}
                  className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    packageViewMode === 'grid'
                      ? 'bg-white text-[#0B3A53] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPackageViewMode('table')}
                  className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    packageViewMode === 'table'
                      ? 'bg-white text-[#0B3A53] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* TRAVEL PACKAGES GRID (Matching user screenshot with Edit & Active/Inactive toggle) */}
          {packageViewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => {
                const isActive = (pkg.status ?? 'Active') === 'Active';
                return (
                  <div
                    key={pkg.id}
                    className={`bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                      !isActive ? 'opacity-85 bg-slate-50/50' : ''
                    }`}
                  >
                    <div>
                      {/* Image Header with Duration & Status Badges */}
                      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                        <img
                          src={pkg.imageUrl}
                          alt={pkg.name}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                            !isActive ? 'grayscale-40' : ''
                          }`}
                        />
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-xs font-extrabold border border-white/15">
                          {pkg.duration}
                        </div>

                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-md transition-colors ${
                              isActive
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-700/90 text-slate-200'
                            }`}
                          >
                            {isActive ? 'Active Catalog' : 'Inactive'}
                          </span>
                          <button
                            onClick={(e) => handleDeletePackage(pkg.id, e)}
                            className="p-1.5 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-md"
                            title="Delete package"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 space-y-3">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#146C86] block truncate">
                          {pkg.destinationsList.join(' · ')}
                        </span>

                        <h3 className="text-xl font-black text-slate-900 font-heading leading-snug">
                          {pkg.name}
                        </h3>

                        <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                          {pkg.about}
                        </p>

                        {/* Travel Specs */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#16A6A1]" />
                            <span className="truncate">{pkg.groupSize}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-[#16A6A1]" />
                            <span className="truncate">{pkg.transport?.type || 'Private AC Vehicle'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Price + EDIT Button + ACTIVE / INACTIVE Toggle Button */}
                    <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          From
                        </span>
                        <span className="font-black text-[#0B3A53] text-lg">{pkg.priceFrom}</span>
                      </div>

                      {/* Action buttons requested: Edit + Active/Inactive toggle */}
                      <div className="flex items-center gap-2">
                        {/* Active / Inactive Toggle Button */}
                        <button
                          onClick={(e) => handleTogglePackageStatus(pkg.id, e)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
                            isActive
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
                          }`}
                          title={isActive ? 'Click to deactivate package' : 'Click to activate package'}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditPackage(pkg)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#0B3A53] hover:bg-[#146C86] text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:scale-102"
                          title="Edit travel package"
                        >
                          <Edit className="w-3.5 h-3.5 text-[#16A6A1]" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TRAVEL PACKAGES TABLE VIEW */
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-5">Travel Package</th>
                      <th className="py-4 px-5">Destinations Covered</th>
                      <th className="py-4 px-5">Duration</th>
                      <th className="py-4 px-5">Price From</th>
                      <th className="py-4 px-5">Travel Style</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredPackages.map((pkg) => {
                      const isActive = (pkg.status ?? 'Active') === 'Active';
                      return (
                        <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <img src={pkg.imageUrl} alt="" className="w-12 h-10 rounded-xl object-cover border" />
                              <div>
                                <div className="font-extrabold text-[#0B3A53]">{pkg.name}</div>
                                <div className="text-[11px] text-slate-400 font-medium">{pkg.groupSize}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5 font-bold text-slate-700">
                            {pkg.destinationsList.slice(0, 3).join(', ')}
                            {pkg.destinationsList.length > 3 ? '...' : ''}
                          </td>
                          <td className="py-4 px-5 font-bold text-[#146C86]">{pkg.duration}</td>
                          <td className="py-4 px-5 font-black text-[#0B3A53] text-sm">{pkg.priceFrom}</td>
                          <td className="py-4 px-5 text-slate-500">{pkg.travelStyle}</td>
                          <td className="py-4 px-5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Toggle Button in Table */}
                              <button
                                onClick={(e) => handleTogglePackageStatus(pkg.id, e)}
                                className={`px-2.5 py-1 rounded-xl font-bold text-[11px] border transition-colors cursor-pointer ${
                                  isActive
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {isActive ? 'Active' : 'Inactive'}
                              </button>

                              {/* Edit Button in Table */}
                              <button
                                onClick={() => handleOpenEditPackage(pkg)}
                                className="px-3 py-1.5 rounded-xl bg-[#0B3A53] hover:bg-[#146C86] text-white font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Edit className="w-3 h-3 text-[#16A6A1]" />
                                <span>Edit</span>
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={(e) => handleDeletePackage(pkg.id, e)}
                                className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: ADD / EDIT DESTINATION MODAL                                   */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isAddDestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-black uppercase text-[#16A6A1]">
                  {editingDestId ? 'DESTINATION CONFIGURATION' : 'CATALOG ENTRY'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#0B3A53] font-heading">
                  {editingDestId ? 'Edit Destination' : 'Add New Destination'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Configure stay duration, budget, visitor access fees, and top catalog attractions.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddDestModalOpen(false);
                  resetDestForm();
                }}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDestination} noValidate className="space-y-4 text-xs font-semibold">
              {/* Validation Alert Banner */}
              {Object.keys(destErrors).length > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs">Please fix the following validation errors:</p>
                    <p className="text-[11px] text-rose-600 font-medium">
                      {Object.values(destErrors)[0]}
                    </p>
                  </div>
                </div>
              )}

              {/* Row 1: Destination Name & Province */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block flex items-center justify-between">
                    <span>Destination Name</span>
                    <span className="text-[10px] text-rose-500 font-bold">*Required</span>
                  </label>
                  <input
                    type="text"
                    value={destName}
                    onChange={(e) => {
                      setDestName(e.target.value);
                      clearDestError('name');
                    }}
                    placeholder="e.g. Trincomalee"
                    className={`w-full p-3 rounded-2xl font-bold text-[#0B3A53] focus:bg-white focus:outline-none transition-all ${
                      destErrors.name
                        ? 'bg-rose-50/40 border-2 border-rose-400 focus:border-rose-500'
                        : 'bg-slate-50 border border-slate-200 focus:border-[#16A6A1]'
                    }`}
                  />
                  {destErrors.name && (
                    <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {destErrors.name}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block flex items-center justify-between">
                    <span>Province / Region</span>
                    <span className="text-[10px] text-rose-500 font-bold">*Required</span>
                  </label>
                  <input
                    type="text"
                    value={destProvince}
                    onChange={(e) => {
                      setDestProvince(e.target.value);
                      clearDestError('province');
                    }}
                    placeholder="e.g. Eastern Province"
                    className={`w-full p-3 rounded-2xl font-bold text-[#0B3A53] focus:bg-white focus:outline-none transition-all ${
                      destErrors.province
                        ? 'bg-rose-50/40 border-2 border-rose-400 focus:border-rose-500'
                        : 'bg-slate-50 border border-slate-200 focus:border-[#16A6A1]'
                    }`}
                  />
                  {destErrors.province && (
                    <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {destErrors.province}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Category & Specific Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block flex items-center justify-between">
                    <span>Category</span>
                    <span className="text-[10px] text-rose-500 font-bold">*Required</span>
                  </label>
                  <select
                    value={destCategory}
                    onChange={(e: any) => {
                      setDestCategory(e.target.value);
                      clearDestError('category');
                    }}
                    className={`w-full p-3 rounded-2xl font-bold text-[#0B3A53] focus:bg-white focus:outline-none cursor-pointer transition-all ${
                      destErrors.category
                        ? 'bg-rose-50/40 border-2 border-rose-400 focus:border-rose-500'
                        : 'bg-slate-50 border border-slate-200 focus:border-[#16A6A1]'
                    }`}
                  >
                    <option value="Cultural">Cultural</option>
                    <option value="Heritage">Heritage</option>
                    <option value="Nature">Nature</option>
                    <option value="Beach">Beach</option>
                    <option value="Wildlife">Wildlife</option>
                    <option value="Adventure">Adventure</option>
                  </select>
                  {destErrors.category && (
                    <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {destErrors.category}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block flex items-center justify-between">
                    <span>Specific Location</span>
                    <span className="text-[10px] text-rose-500 font-bold">*Required</span>
                  </label>
                  <input
                    type="text"
                    value={destLocation}
                    onChange={(e) => {
                      setDestLocation(e.target.value);
                      clearDestError('location');
                    }}
                    placeholder="e.g. Eastern Coast Bay"
                    className={`w-full p-3 rounded-2xl font-bold text-[#0B3A53] focus:bg-white focus:outline-none transition-all ${
                      destErrors.location
                        ? 'bg-rose-50/40 border-2 border-rose-400 focus:border-rose-500'
                        : 'bg-slate-50 border border-slate-200 focus:border-[#16A6A1]'
                    }`}
                  />
                  {destErrors.location && (
                    <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {destErrors.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Requested Travel & Stay Details (Best Time, Recommended Stay, Avg Budget) */}
              <div
                className={`p-4 rounded-2xl transition-all ${
                  destErrors.bestTimeToVisit || destErrors.recommendedStayDays || destErrors.avgBudgetPerDay
                    ? 'bg-rose-50/30 border border-rose-300'
                    : 'bg-slate-50/80 border border-slate-200/90'
                } space-y-3`}
              >
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#146C86]">
                  <Calendar className="w-3.5 h-3.5 text-[#16A6A1]" />
                  <span>Travel Planning & Budget Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Best Time to Visit */}
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold block flex items-center justify-between">
                      <span>Best Time to Visit</span>
                      <span className="text-[10px] text-rose-500 font-bold">*Required</span>
                    </label>
                    <input
                      type="text"
                      value={destBestTimeToVisit}
                      onChange={(e) => {
                        setDestBestTimeToVisit(e.target.value);
                        clearDestError('bestTimeToVisit');
                      }}
                      placeholder="e.g. December to April"
                      className={`w-full p-2.5 rounded-xl font-bold text-[#0B3A53] focus:outline-none text-xs transition-all ${
                        destErrors.bestTimeToVisit
                          ? 'bg-rose-50/40 border-2 border-rose-400'
                          : 'bg-white border border-slate-200 focus:border-[#16A6A1]'
                      }`}
                    />
                    <div className="flex flex-wrap gap-1 mt-1">
                      {['Dec – Apr', 'Jan – May', 'Nov – Apr', 'Year-round'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setDestBestTimeToVisit(s);
                            clearDestError('bestTimeToVisit');
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200/70 hover:bg-[#16A6A1] hover:text-white transition-colors cursor-pointer text-slate-600 font-semibold"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {destErrors.bestTimeToVisit && (
                      <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {destErrors.bestTimeToVisit}
                      </p>
                    )}
                  </div>

                  {/* 2. Recommended Stay Period (in days) */}
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold block flex items-center justify-between">
                      <span>
                        Recommended Stay <span className="text-slate-400 font-normal">(days)</span>
                      </span>
                      <span className="text-[10px] text-rose-500 font-bold">*Required</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={destRecommendedStayDays}
                        onChange={(e) => {
                          setDestRecommendedStayDays(e.target.value);
                          clearDestError('recommendedStayDays');
                        }}
                        placeholder="e.g. 2 - 3 Days"
                        className={`w-full p-2.5 pr-8 rounded-xl font-bold text-[#0B3A53] focus:outline-none text-xs transition-all ${
                          destErrors.recommendedStayDays
                            ? 'bg-rose-50/40 border-2 border-rose-400'
                            : 'bg-white border border-slate-200 focus:border-[#16A6A1]'
                        }`}
                      />
                      <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {['1 - 2 Days', '2 - 3 Days', '3 - 4 Days', '5+ Days'].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setDestRecommendedStayDays(d);
                            clearDestError('recommendedStayDays');
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200/70 hover:bg-[#16A6A1] hover:text-white transition-colors cursor-pointer text-slate-600 font-semibold"
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    {destErrors.recommendedStayDays && (
                      <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {destErrors.recommendedStayDays}
                      </p>
                    )}
                  </div>

                  {/* 3. Avg Budget Per Day */}
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold block flex items-center justify-between">
                      <span>Avg Budget Per Day</span>
                      <span className="text-[10px] text-rose-500 font-bold">*Required</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={destAvgBudgetPerDay}
                        onChange={(e) => {
                          setDestAvgBudgetPerDay(e.target.value);
                          clearDestError('avgBudgetPerDay');
                        }}
                        placeholder="e.g. $50 - $90 / day"
                        className={`w-full p-2.5 pl-7 rounded-xl font-bold text-[#0B3A53] focus:outline-none text-xs transition-all ${
                          destErrors.avgBudgetPerDay
                            ? 'bg-rose-50/40 border-2 border-rose-400'
                            : 'bg-white border border-slate-200 focus:border-[#16A6A1]'
                        }`}
                      />
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 absolute left-2 top-3" />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {['$40 - $70', '$60 - $100', '$100 - $160'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            setDestAvgBudgetPerDay(`${b} / day`);
                            clearDestError('avgBudgetPerDay');
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200/70 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer text-slate-600 font-semibold"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                    {destErrors.avgBudgetPerDay && (
                      <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {destErrors.avgBudgetPerDay}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 4: Requested Opening Hours & Entry Fees (Separate for Local & Foreign) */}
              <div
                className={`p-4 rounded-2xl transition-all ${
                  destErrors.openingHours || destErrors.entryFeeLocal || destErrors.entryFeeForeign
                    ? 'bg-rose-50/30 border border-rose-300'
                    : 'bg-teal-50/40 border border-teal-200/80'
                } space-y-3`}
              >
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#146C86]">
                  <Clock className="w-3.5 h-3.5 text-[#16A6A1]" />
                  <span>Visitor Access, Opening Hours & Entry Fees</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Opening Hours */}
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold block flex items-center justify-between">
                      <span>Opening Hours</span>
                      <span className="text-[10px] text-rose-500 font-bold">*Required</span>
                    </label>
                    <input
                      type="text"
                      value={destOpeningHours}
                      onChange={(e) => {
                        setDestOpeningHours(e.target.value);
                        clearDestError('openingHours');
                      }}
                      placeholder="e.g. 06:00 AM – 06:00 PM Daily"
                      className={`w-full p-2.5 rounded-xl font-bold text-[#0B3A53] focus:outline-none text-xs transition-all ${
                        destErrors.openingHours
                          ? 'bg-rose-50/40 border-2 border-rose-400'
                          : 'bg-white border border-slate-200 focus:border-[#16A6A1]'
                      }`}
                    />
                    <div className="flex gap-1 mt-1">
                      {['06:00 AM – 06:00 PM', '24 Hours Open'].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => {
                            setDestOpeningHours(h);
                            clearDestError('openingHours');
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-100/70 hover:bg-[#16A6A1] hover:text-white transition-colors cursor-pointer text-[#146C86] font-semibold truncate"
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                    {destErrors.openingHours && (
                      <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {destErrors.openingHours}
                      </p>
                    )}
                  </div>

                  {/* Local Entry Fee */}
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold block flex items-center justify-between">
                      <span>Local Entry Fee</span>
                      <span className="text-[10px] text-rose-500 font-bold">*Required</span>
                    </label>
                    <input
                      type="text"
                      value={destEntryFeeLocal}
                      onChange={(e) => {
                        setDestEntryFeeLocal(e.target.value);
                        clearDestError('entryFeeLocal');
                      }}
                      placeholder="e.g. Free Entry or LKR 200"
                      className={`w-full p-2.5 rounded-xl font-bold text-[#0B3A53] focus:outline-none text-xs transition-all ${
                        destErrors.entryFeeLocal
                          ? 'bg-rose-50/40 border-2 border-rose-400'
                          : 'bg-white border border-slate-200 focus:border-[#16A6A1]'
                      }`}
                    />
                    <div className="flex gap-1 mt-1">
                      {['Free Entry', 'LKR 100', 'LKR 250'].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => {
                            setDestEntryFeeLocal(f);
                            clearDestError('entryFeeLocal');
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-100/70 hover:bg-[#16A6A1] hover:text-white transition-colors cursor-pointer text-[#146C86] font-semibold"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    {destErrors.entryFeeLocal && (
                      <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {destErrors.entryFeeLocal}
                      </p>
                    )}
                  </div>

                  {/* Foreign Entry Fee */}
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold block flex items-center justify-between">
                      <span>Foreign Entry Fee</span>
                      <span className="text-[10px] text-rose-500 font-bold">*Required</span>
                    </label>
                    <input
                      type="text"
                      value={destEntryFeeForeign}
                      onChange={(e) => {
                        setDestEntryFeeForeign(e.target.value);
                        clearDestError('entryFeeForeign');
                      }}
                      placeholder="e.g. $25 / LKR 7,500"
                      className={`w-full p-2.5 rounded-xl font-bold text-[#0B3A53] focus:outline-none text-xs transition-all ${
                        destErrors.entryFeeForeign
                          ? 'bg-rose-50/40 border-2 border-rose-400'
                          : 'bg-white border border-slate-200 focus:border-[#16A6A1]'
                      }`}
                    />
                    <div className="flex gap-1 mt-1">
                      {['Free Entry', '$15 USD', '$25 USD', '$35 USD'].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => {
                            setDestEntryFeeForeign(f);
                            clearDestError('entryFeeForeign');
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-100/70 hover:bg-[#16A6A1] hover:text-white transition-colors cursor-pointer text-[#146C86] font-semibold"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    {destErrors.entryFeeForeign && (
                      <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {destErrors.entryFeeForeign}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 5: Requested Top Attractions (Multi-select from added attractions) */}
              <div
                className={`p-4 rounded-2xl transition-all ${
                  destErrors.topAttractions
                    ? 'bg-rose-50/30 border border-rose-300'
                    : 'bg-slate-50/80 border border-slate-200/90'
                } space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#146C86]">
                    <Sparkles className="w-3.5 h-3.5 text-[#16A6A1]" />
                    <span>Top Attractions</span>
                    <span className="text-[10px] text-rose-500 font-bold">*Min 1</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#16A6A1]/15 text-[#146C86]">
                    {destTopAttractions.length} Selected
                  </span>
                </div>

                {/* Filter and custom add toolbar */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative flex-1 w-full">
                    <input
                      type="text"
                      value={attrSearchQuery}
                      onChange={(e) => setAttrSearchQuery(e.target.value)}
                      placeholder="Search attractions catalog..."
                      className="w-full h-8 pl-8 pr-3 rounded-xl bg-white border border-slate-200 text-xs font-medium text-[#0B3A53] placeholder-slate-400 focus:outline-none focus:border-[#16A6A1]"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>

                  {/* Add custom attraction input */}
                  <div className="flex items-center gap-1 w-full sm:w-auto">
                    <input
                      type="text"
                      value={newAttractionInput}
                      onChange={(e) => setNewAttractionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomAttraction();
                        }
                      }}
                      placeholder="+ Custom attraction"
                      className="h-8 px-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-[#0B3A53] placeholder-slate-400 focus:outline-none focus:border-[#16A6A1] flex-1 sm:w-44"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomAttraction}
                      className="h-8 px-2.5 rounded-xl bg-[#0B3A53] hover:bg-[#146C86] text-white text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Clickable Selectable Attractions List from Catalog */}
                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2.5 bg-white rounded-xl border border-slate-200/80">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Select Attractions Out Of Added Catalog:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {allAttractions
                      .filter(
                        (a) =>
                          !attrSearchQuery ||
                          a.name.toLowerCase().includes(attrSearchQuery.toLowerCase()) ||
                          a.destinationName.toLowerCase().includes(attrSearchQuery.toLowerCase())
                      )
                      .map((attr) => {
                        const isSelected = destTopAttractions.includes(attr.name);
                        return (
                          <button
                            key={attr.id}
                            type="button"
                            onClick={() => toggleTopAttraction(attr.name)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                              isSelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                                isSelected ? 'bg-white text-teal-700 font-black' : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {isSelected ? '✓' : '+'}
                            </span>
                            <span>{attr.name}</span>
                            <span
                              className={`text-[10px] font-medium ${
                                isSelected ? 'text-teal-100' : 'text-slate-400'
                              }`}
                            >
                              ({attr.destinationName || attr.category})
                            </span>
                          </button>
                        );
                      })}

                    {/* Any custom selected attractions not in catalog list */}
                    {destTopAttractions
                      .filter((name) => !allAttractions.some((a) => a.name === name))
                      .map((customName) => (
                        <button
                          key={customName}
                          type="button"
                          onClick={() => toggleTopAttraction(customName)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border bg-teal-600 text-white border-teal-600 shadow-2xs"
                        >
                          <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] bg-white text-teal-700 font-black">
                            ✓
                          </span>
                          <span>{customName}</span>
                          <span className="text-[10px] text-teal-200 font-medium">(Custom)</span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Selected Attractions Badges Summary */}
                {destTopAttractions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Selected:</span>
                    {destTopAttractions.map((name) => (
                      <span
                        key={name}
                        className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-[#146C86] font-bold text-[11px] flex items-center gap-1"
                      >
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => toggleTopAttraction(name)}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer ml-0.5 text-xs font-black"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => setDestTopAttractions([])}
                      className="text-[10px] text-rose-500 hover:text-rose-700 font-bold ml-1 cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                )}

                {destErrors.topAttractions && (
                  <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {destErrors.topAttractions}
                  </p>
                )}
              </div>

              {/* Destination Cover Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-bold block flex items-center gap-1.5">
                    <span>Cover Image</span>
                    <span className="text-[10px] text-rose-500 font-bold">*Required</span>
                  </label>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setDestImageInputMode('upload');
                        clearDestError('coverImage');
                      }}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        destImageInputMode === 'upload'
                          ? 'bg-white text-[#0B3A53] shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDestImageInputMode('url');
                        clearDestError('coverImage');
                      }}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        destImageInputMode === 'url'
                          ? 'bg-white text-[#0B3A53] shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>Image URL</span>
                    </button>
                  </div>
                </div>

                <input
                  ref={destFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleDestImageFile(f);
                  }}
                  className="hidden"
                />

                {destImageInputMode === 'upload' ? (
                  destUploadedImagePreview ? (
                    <div className="relative rounded-2xl border border-teal-200 bg-teal-50/40 p-3 overflow-hidden">
                      <div className="flex items-center gap-4">
                        <div className="relative w-28 h-20 rounded-xl overflow-hidden shadow-inner border border-slate-200 shrink-0 bg-slate-100">
                          <img
                            src={destUploadedImagePreview}
                            alt="Uploaded preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#0B3A53] truncate">{destUploadedFileName}</p>
                          <p className="text-[11px] text-slate-500">{destUploadedFileSize}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setDestUploadedImagePreview(null);
                              setDestCoverImage('');
                            }}
                            className="text-[11px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDestDragging(true);
                      }}
                      onDragLeave={() => setIsDestDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDestDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleDestImageFile(file);
                      }}
                      onClick={() => destFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        destErrors.coverImage
                          ? 'border-rose-400 bg-rose-50/30'
                          : isDestDragging
                          ? 'border-[#16A6A1] bg-teal-50/60'
                          : 'border-slate-200 hover:border-[#16A6A1] bg-slate-50/70 hover:bg-slate-50'
                      }`}
                    >
                      <Upload className="w-6 h-6 text-[#16A6A1] mb-2" />
                      <p className="text-xs font-bold text-[#0B3A53]">Click to browse or drag & drop an image</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, JPEG, WEBP (Max 10MB)</p>
                    </div>
                  )
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={destCoverImage}
                      onChange={(e) => {
                        setDestCoverImage(e.target.value);
                        clearDestError('coverImage');
                      }}
                      placeholder="https://images.unsplash.com/photo-..."
                      className={`w-full p-3 pl-9 rounded-2xl font-medium focus:bg-white focus:outline-none text-xs transition-all ${
                        destErrors.coverImage
                          ? 'bg-rose-50/40 border-2 border-rose-400 text-rose-900'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 focus:border-[#16A6A1]'
                      }`}
                    />
                    <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                )}

                {destErrors.coverImage && (
                  <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {destErrors.coverImage}
                  </p>
                )}
              </div>

              {/* Row 7: Description */}
              <div className="space-y-1">
                <label className="text-slate-700 font-bold block flex items-center justify-between">
                  <span>Description</span>
                  <span className="text-[10px] text-rose-500 font-bold">*Min 15 chars</span>
                </label>
                <textarea
                  rows={3}
                  value={destDescription}
                  onChange={(e) => {
                    setDestDescription(e.target.value);
                    clearDestError('description');
                  }}
                  placeholder="Overview of the destination history, landscape, and attraction appeal..."
                  className={`w-full p-3 rounded-2xl font-medium focus:bg-white focus:outline-none leading-relaxed transition-all ${
                    destErrors.description
                      ? 'bg-rose-50/40 border-2 border-rose-400 text-rose-900'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 focus:border-[#16A6A1]'
                  }`}
                />
                {destErrors.description && (
                  <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {destErrors.description}
                  </p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddDestModalOpen(false);
                    resetDestForm();
                  }}
                  className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md transition-all cursor-pointer hover:scale-102"
                >
                  {editingDestId ? 'Update Destination' : 'Save Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: ADD / EDIT TRAVEL PACKAGE MODAL                               */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isAddPackageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#16A6A1]">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{editingPackageId ? 'EDIT TRAVEL PACKAGE' : 'READY-MADE JOURNEY CATALOG'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0B3A53] font-heading">
                  {editingPackageId ? 'Edit Travel Package' : 'Create New Travel Package'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {editingPackageId
                    ? 'Update the package details, pricing, destinations, or image.'
                    : 'This travel package will be published and immediately available for travelers on the Tours page.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddPackageModalOpen(false);
                  resetPkgForm();
                }}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTravelPackage} className="space-y-5 text-xs font-semibold">
              {/* Row 1: Title & Travel Style */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8 space-y-1">
                  <label className="text-slate-700 font-bold block">
                    Package Name / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pkgName}
                    onChange={(e) => setPkgName(e.target.value)}
                    placeholder="e.g. Southern Coast Scenic Explorer"
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-sm text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <label className="text-slate-700 font-bold block">Travel Style</label>
                  <select
                    value={pkgTravelStyle}
                    onChange={(e) => setPkgTravelStyle(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-xs text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  >
                    <option value="Cultural · Nature · Coastal">Culture · Nature · Coastal</option>
                    <option value="Hill Country · Scenic Views">Hill Country & Tea Escapes</option>
                    <option value="Coastal · Beaches · Marine">Coastal, Beach & Marine</option>
                    <option value="Wildlife Safari · Nature">Wildlife Safari & National Parks</option>
                    <option value="Heritage · Ancient Kingdoms">Heritage & Ancient Kingdoms</option>
                    <option value="Adventure · Hiking · Water">Adventure & Trekking</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Destinations Covered & Quick Tag Selector */}
              <div className="space-y-2">
                <label className="text-slate-700 font-bold block">
                  Destinations Covered <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pkgDestinations}
                  onChange={(e) => setPkgDestinations(e.target.value)}
                  placeholder="e.g. Colombo, Kandy, Ella, Galle"
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-[#0B3A53] focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                />

                {/* Quick select tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-bold mr-1">Quick Select:</span>
                  {POPULAR_DESTINATION_TAGS.map((tag) => {
                    const isSelected = pkgDestinations
                      .split(',')
                      .map((d) => d.trim().toLowerCase())
                      .includes(tag.toLowerCase());
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleDestinationTag(tag)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#16A6A1] text-white border-[#16A6A1]'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/70'
                        }`}
                      >
                        {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Duration & Price & Capacity */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-3xl border border-slate-200/80">
                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={pkgDurationDays}
                    onChange={(e) => {
                      const days = parseInt(e.target.value) || 1;
                      setPkgDurationDays(days);
                      setPkgDurationNights(Math.max(1, days - 1));
                    }}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-black text-sm text-[#0B3A53] focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Nights Count</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={pkgDurationNights}
                    onChange={(e) => setPkgDurationNights(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-black text-sm text-[#0B3A53] focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Price From (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-black">$</span>
                    <input
                      type="number"
                      min={10}
                      required
                      value={pkgPrice}
                      onChange={(e) => setPkgPrice(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 pl-7 rounded-xl bg-white border border-slate-200 font-black text-sm text-[#0B3A53] focus:border-[#16A6A1] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-bold block">Status</label>
                  <select
                    value={pkgStatus}
                    onChange={(e: any) => setPkgStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-bold text-xs text-[#0B3A53] focus:border-[#16A6A1] focus:outline-none"
                  >
                    <option value="Active">Active (Published)</option>
                    <option value="Inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Cover Image Picker (Preset Photos, File Upload, or Custom URL) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-bold block">Cover Image</label>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPkgImageMode('preset')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        pkgImageMode === 'preset' ? 'bg-white text-[#0B3A53] shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      Presets Gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => setPkgImageMode('upload')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        pkgImageMode === 'upload' ? 'bg-white text-[#0B3A53] shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setPkgImageMode('url')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        pkgImageMode === 'url' ? 'bg-white text-[#0B3A53] shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      Custom URL
                    </button>
                  </div>
                </div>

                {/* Preset Gallery Option */}
                {pkgImageMode === 'preset' && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_PACKAGE_IMAGES.map((preset) => (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => setPkgCoverImage(preset.url)}
                        className={`relative rounded-xl overflow-hidden h-20 border-2 transition-all cursor-pointer group ${
                          pkgCoverImage === preset.url
                            ? 'border-[#16A6A1] ring-2 ring-[#16A6A1]/40 scale-102'
                            : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-slate-950/70 text-white text-[9px] font-bold p-1 truncate text-center">
                          {preset.name}
                        </span>
                        {pkgCoverImage === preset.url && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#16A6A1] text-white flex items-center justify-center text-[10px] font-black">
                            ✓
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* File Upload Option */}
                {pkgImageMode === 'upload' && (
                  <>
                    <input
                      ref={pkgFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handlePkgImageFile(f);
                      }}
                      className="hidden"
                    />

                    {pkgUploadedImagePreview ? (
                      <div className="relative rounded-2xl border border-teal-200 bg-teal-50/40 p-3 overflow-hidden">
                        <div className="flex items-center gap-4">
                          <div className="relative w-28 h-20 rounded-xl overflow-hidden shadow-inner border border-slate-200 shrink-0 bg-slate-100">
                            <img
                              src={pkgUploadedImagePreview}
                              alt="Uploaded preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-1 min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#0B3A53] truncate">{pkgUploadedFileName}</p>
                            <p className="text-[11px] text-slate-500">{pkgUploadedFileSize}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setPkgUploadedImagePreview(null);
                                setPkgCoverImage(PRESET_PACKAGE_IMAGES[0].url);
                              }}
                              className="text-[11px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsPkgDragging(true);
                        }}
                        onDragLeave={() => setIsPkgDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsPkgDragging(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handlePkgImageFile(file);
                        }}
                        onClick={() => pkgFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                          isPkgDragging
                            ? 'border-[#16A6A1] bg-teal-50/60'
                            : 'border-slate-200 hover:border-[#16A6A1] bg-slate-50/70 hover:bg-slate-50'
                        }`}
                      >
                        <Upload className="w-6 h-6 text-[#16A6A1] mb-2" />
                        <p className="text-xs font-bold text-[#0B3A53]">Click to browse or drag & drop an image</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, JPEG, WEBP (Max 10MB)</p>
                      </div>
                    )}
                  </>
                )}

                {/* Custom URL Option */}
                {pkgImageMode === 'url' && (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={pkgCoverImage}
                        onChange={(e) => setPkgCoverImage(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full p-3 pl-9 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-700 focus:bg-white focus:border-[#16A6A1] focus:outline-none text-xs"
                      />
                      <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                  </div>
                )}
              </div>

              {/* Row 5: Description / About */}
              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Package Overview & Highlights</label>
                <textarea
                  rows={3}
                  value={pkgAbout}
                  onChange={(e) => setPkgAbout(e.target.value)}
                  placeholder="Describe the journey experience, highlights, scenic drives, and key cultural moments..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-700 focus:bg-white focus:border-[#16A6A1] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Row 6: Inclusions & Transport */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block">Inclusions (Comma separated)</label>
                  <input
                    type="text"
                    value={pkgInclusions}
                    onChange={(e) => setPkgInclusions(e.target.value)}
                    placeholder="Licensed Tour Guide, Private AC Van, Entry Tickets, Breakfast"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-700 focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block">Transport Vehicle Type</label>
                  <select
                    value={pkgTransportType}
                    onChange={(e) => setPkgTransportType(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:bg-white focus:border-[#16A6A1] focus:outline-none"
                  >
                    <option value="Private AC Vehicle / Van">Private AC Vehicle / Van (Seats 8)</option>
                    <option value="PickMe Ride Partner Transport">PickMe Ride Partner Transport</option>
                    <option value="Main Line Observation Train + Private Van">
                      Main Line Scenic Train + Private Van
                    </option>
                    <option value="Luxury SUV / Chauffeur">Luxury SUV / Chauffeur</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddPackageModalOpen(false);
                    resetPkgForm();
                  }}
                  className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#146C86] via-[#16A6A1] to-emerald-500 hover:from-[#0B3A53] hover:to-[#146C86] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-lg transition-all cursor-pointer hover:scale-102"
                >
                  {editingPackageId ? 'Update Travel Package' : 'Save & Publish Travel Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 3: DESTINATION DETAILS & REAL-TIME LIVE WEATHER MODAL             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <DestinationLiveWeatherModal
        destination={selectedWeatherDest}
        isOpen={isWeatherModalOpen}
        onClose={() => {
          setIsWeatherModalOpen(false);
          setSelectedWeatherDest(null);
        }}
        onEdit={(dest) => {
          handleOpenEditDestination(dest);
        }}
      />
    </div>
  );
};

export default AdminDestinationsPage;
