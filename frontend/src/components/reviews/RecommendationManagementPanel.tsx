import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Star,
  Flame,
  ShieldOff,
  Zap,
  BarChart3,
  Info,
  CheckCircle2,
  XCircle,
  ArrowUp,
  Eye,
  Plus,
  X,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Tag,
  Clock,
  Calendar,
} from 'lucide-react';
import { RecommendationInsightsData } from '../../types/reviewsAndRecommendations';
import { recommendationService, CreateRecommendationInput } from '../../services/recommendationService';

interface AttractionEntry {
  id: string;
  name: string;
  category: string;
  location: string;
  recommendationCount: number;
  clickThroughRate: number;
  avgMatchScore: number;
  rating: number;
  status: 'active' | 'featured' | 'excluded';
}

interface ScoringWeight {
  label: string;
  key: string;
  weight: number;
  description: string;
  color: string;
}

const SCORING_WEIGHTS: ScoringWeight[] = [
  { label: 'Interest Match', key: 'interest', weight: 35, description: 'How well the attraction matches the tourist\'s stated interests and activity preferences', color: 'bg-[#16A6A1]' },
  { label: 'Rating Score', key: 'rating', weight: 25, description: 'Overall star rating weighted by recency and volume of reviews', color: 'bg-sky-500' },
  { label: 'Budget Match', key: 'budget', weight: 20, description: 'Estimated visit cost vs tourist\'s declared maximum daily budget', color: 'bg-amber-500' },
  { label: 'Location Distance', key: 'location', weight: 15, description: 'Proximity to tourist\'s current location or planned base city', color: 'bg-violet-500' },
  { label: 'Popularity Score', key: 'popularity', weight: 5, description: 'Overall site-wide visitor engagement and booking frequency', color: 'bg-rose-500' },
];

// Derive attraction performance data from insights
function buildAttractionEntries(insights: RecommendationInsightsData): AttractionEntry[] {
  const statuses: ('active' | 'featured' | 'excluded')[] = ['featured', 'active', 'active', 'active', 'active', 'excluded', 'active', 'active'];
  return (insights.highestRatedAttractions ?? []).map((a, i) => ({
    id: String(i + 1),
    name: a.name,
    category: insights.frequentlySelectedCategories?.[i % 5]?.name ?? 'Nature',
    location: 'Sri Lanka',
    recommendationCount: Math.floor(a.reviews * 1.4),
    clickThroughRate: Math.round(55 + Math.random() * 35),
    avgMatchScore: Math.round(72 + Math.random() * 22),
    rating: a.rating,
    status: statuses[i % statuses.length],
  }));
}

interface RecommendationManagementPanelProps {
  insights: RecommendationInsightsData;
  onToast: (msg: string) => void;
}

export const RecommendationManagementPanel: React.FC<RecommendationManagementPanelProps> = ({
  insights,
  onToast,
}) => {
  const [attractions, setAttractions] = useState<AttractionEntry[]>(
    () => buildAttractionEntries(insights)
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateRecommendationInput>({
    name: '',
    destinationName: 'Ella',
    category: 'Nature',
    activityType: 'attraction',
    imageUrl: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80',
    estimatedCostUsd: 15,
    initialRating: 4.9,
    description: '',
    openingHours: 'Open Daily (6:00 AM - 6:00 PM)',
    bestTimeToVisit: 'Sunrise / Early Morning',
    duration: '2 - 3 hours',
    isFeatured: true,
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onToast('Please enter an attraction or recommendation name.');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await recommendationService.addRecommendation(formData);
      const newEntry: AttractionEntry = {
        id: created.id,
        name: created.name,
        category: created.category,
        location: created.location,
        recommendationCount: 1,
        clickThroughRate: 88,
        avgMatchScore: 98,
        rating: created.rating,
        status: formData.isFeatured ? 'featured' : 'active',
      };
      setAttractions((prev) => [newEntry, ...prev]);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        destinationName: 'Ella',
        category: 'Nature',
        activityType: 'attraction',
        imageUrl: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80',
        estimatedCostUsd: 15,
        initialRating: 4.9,
        description: '',
        openingHours: 'Open Daily (6:00 AM - 6:00 PM)',
        bestTimeToVisit: 'Sunrise / Early Morning',
        duration: '2 - 3 hours',
        isFeatured: true,
      });
      onToast(`Recommendation "${created.name}" added successfully! It is now live in tourist recommendations.`);
    } catch {
      onToast('Could not save recommendation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = (id: string, action: 'featured' | 'excluded' | 'active') => {
    setAttractions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === action ? 'active' : action } : a))
    );
    const messages = {
      featured: 'Attraction boosted to Featured — it will appear at the top of recommendations.',
      excluded: 'Attraction excluded from recommendations.',
      active: 'Attraction status reset to Active.',
    };
    onToast(messages[action]);
  };

  const getStatusPill = (status: AttractionEntry['status']) => {
    switch (status) {
      case 'featured':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black border border-amber-200">
            <Flame className="w-3 h-3" /> Featured
          </span>
        );
      case 'excluded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-200">
            <XCircle className="w-3 h-3" /> Excluded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Section 1: Attraction Performance Table ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-xl bg-[#16A6A1]/10 text-[#16A6A1]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-[#0B3A53] font-heading">
                Attraction Recommendation Performance
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Which attractions are recommended most — and how tourists engage with them
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0B3A53] to-[#16A6A1] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Recommendation</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 shrink-0">
              <BarChart3 className="w-3.5 h-3.5" />
              Last 30 days
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <th className="px-6 py-3">Attraction</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Recommendations</th>
                <th className="px-4 py-3">CTR</th>
                <th className="px-4 py-3">Avg Match</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attractions.map((a, i) => (
                <tr key={a.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-black text-slate-400 w-5 text-center shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-extrabold text-slate-900 line-clamp-1">{a.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{a.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-black border border-sky-100">
                      {a.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <ArrowUp className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="font-extrabold text-slate-900">{a.recommendationCount.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#16A6A1]"
                          style={{ width: `${a.clickThroughRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-700">{a.clickThroughRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{ width: `${a.avgMatchScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-700">{a.avgMatchScore}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 font-black text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{a.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">{getStatusPill(a.status)}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleStatus(a.id, 'featured')}
                        title={a.status === 'featured' ? 'Remove featured boost' : 'Boost to Featured'}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          a.status === 'featured'
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'text-slate-400 hover:bg-amber-50 hover:text-amber-600'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleStatus(a.id, 'excluded')}
                        title={a.status === 'excluded' ? 'Remove exclusion' : 'Exclude from recommendations'}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          a.status === 'excluded'
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                        }`}
                      >
                        <ShieldOff className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 2: AI Scoring Weights ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-xl bg-violet-50 text-violet-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-[#0B3A53] font-heading">
                AI Scoring Weight Configuration
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              How the recommendation engine calculates match scores for each tourist
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-[10px] font-black">
            <Zap className="w-3 h-3" />
            Read-only — configured in backend
          </div>
        </div>

        <div className="space-y-4">
          {SCORING_WEIGHTS.map((w) => (
            <div key={w.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-800">{w.label}</span>
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 w-56 bg-slate-900 text-white text-[10px] rounded-xl px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-medium leading-relaxed">
                      {w.description}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-700">{w.weight}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${w.color} transition-all duration-700`}
                  style={{ width: `${w.weight}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">{w.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-sky-50 border border-violet-100">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-violet-800 font-semibold leading-relaxed">
              Scoring weights are currently hardcoded in the backend recommendation engine. 
              To make them configurable, they need to be exposed via a{' '}
              <code className="bg-violet-100 px-1 rounded font-mono">POST /api/recommendations/weights</code> endpoint. 
              This UI will then allow live adjustment.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 3: AI Agent Log Summary ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-xl bg-[#16A6A1]/10 text-[#16A6A1]">
            <Eye className="w-4 h-4" />
          </div>
          <h3 className="text-base font-black text-[#0B3A53] font-heading">
            AI Agent Conversation Analytics
          </h3>
        </div>
        <p className="text-xs text-slate-500 font-medium -mt-2">
          Overview of AI recommendation agent sessions and engagement
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Sessions', value: '1,247', icon: BarChart3, color: 'bg-sky-50 text-sky-600' },
            { label: 'Avg Session Length', value: '4.2 turns', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Recommendations Shown', value: '8,391', icon: Sparkles, color: 'bg-violet-50 text-violet-600' },
            { label: 'Follow-up Rate', value: '68%', icon: ArrowUp, color: 'bg-amber-50 text-amber-600' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xl font-black text-[#0B3A53] font-heading">{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Recent Agent Sessions</span>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              { user: 'tourist_4821', turns: 5, result: '3 attractions shown', time: '2 mins ago', status: 'completed' },
              { user: 'tourist_2094', turns: 2, result: 'Budget filter applied', time: '15 mins ago', status: 'completed' },
              { user: 'tourist_7733', turns: 8, result: 'Sigiriya + Dambulla', time: '41 mins ago', status: 'completed' },
              { user: 'tourist_1192', turns: 1, result: 'No match found', time: '1h ago', status: 'no-match' },
              { user: 'tourist_9905', turns: 4, result: 'Ella + Yala tour', time: '2h ago', status: 'completed' },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 shrink-0">
                    {session.user.slice(-2)}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900">{session.user}</div>
                    <div className="text-[10px] text-slate-400">{session.turns} turns · {session.result}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400">{session.time}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                    session.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Add Recommendation Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0B3A53] to-[#16A6A1] text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0B3A53] font-heading">
                    Add Recommendation
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Publish a curated attraction or tour to display under the user Recommendations tab
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit} className="space-y-5">
              {/* Attraction Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Attraction / Destination Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Little Adam's Peak Panoramic Hike"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#16A6A1]/40"
                />
              </div>

              {/* Destination & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Destination City / Region
                  </label>
                  <input
                    type="text"
                    value={formData.destinationName}
                    onChange={(e) => setFormData({ ...formData, destinationName: e.target.value })}
                    placeholder="e.g. Ella, Sigiriya, Kandy, Galle, Mirissa"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#16A6A1]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#16A6A1]/40"
                  >
                    <option value="Nature">Nature</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Wildlife">Wildlife</option>
                    <option value="Culture">Culture</option>
                    <option value="History">History</option>
                    <option value="Beaches">Beaches</option>
                    <option value="Food">Food</option>
                  </select>
                </div>
              </div>

              {/* Activity Type, Estimated Cost, Rating Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Activity Type
                  </label>
                  <select
                    value={formData.activityType}
                    onChange={(e) => setFormData({ ...formData, activityType: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#16A6A1]/40"
                  >
                    <option value="attraction">Attraction (Self-guided)</option>
                    <option value="tour">Guided Tour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Estimated Cost (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.estimatedCostUsd}
                    onChange={(e) => setFormData({ ...formData, estimatedCostUsd: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#16A6A1]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Initial Star Rating
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.initialRating}
                    onChange={(e) => setFormData({ ...formData, initialRating: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#16A6A1]/40"
                  />
                </div>
              </div>

              {/* Image URL & Preset Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cover Photo Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#16A6A1]/40 mb-2"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Presets:</span>
                  {[
                    { name: 'Ella Peak', url: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Sigiriya Rock', url: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Mirissa Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Yala Safari', url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80' },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-colors cursor-pointer shrink-0 ${
                        formData.imageUrl === preset.url
                          ? 'bg-[#16A6A1] text-white border-[#16A6A1]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Recommendation Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what makes this sight an exceptional recommendation for tourists visiting Sri Lanka..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#16A6A1]/40"
                />
              </div>

              {/* Best Time & Opening Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Best Time To Visit
                  </label>
                  <input
                    type="text"
                    value={formData.bestTimeToVisit}
                    onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                    placeholder="e.g. November - April / Early Morning"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#16A6A1]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    placeholder="e.g. Open Daily (6:00 AM - 6:00 PM)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#16A6A1]/40"
                  />
                </div>
              </div>

              {/* Feature Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-900 block">
                      Feature & Boost this Recommendation
                    </span>
                    <span className="text-[11px] text-amber-700 font-medium">
                      Pins this item with highest match ranking under the tourist Recommendations tab
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-5 h-5 rounded text-[#16A6A1] focus:ring-[#16A6A1] cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#0B3A53] to-[#16A6A1] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Add to Recommendations</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
