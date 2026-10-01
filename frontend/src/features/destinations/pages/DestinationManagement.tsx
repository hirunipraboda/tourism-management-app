import { useState } from 'react';
import { useDestinations } from '../hooks/useDestinations';
import AttractionCard from '../components/AttractionCard';
import AttractionAiArchitect from '../components/AttractionAiArchitect';
import { createAttraction } from '../api/destinationApi';

export default function DestinationManagement() {
  const { destinations, loading, error, addDestination, removeDestination, refresh } = useDestinations();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedAiDestinationId, setExpandedAiDestinationId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !country || !city) return;
    setSubmitting(true);
    try {
      await addDestination({ name, country, city, description });
      setName('');
      setCountry('');
      setCity('');
      setDescription('');
    } catch {
      alert('Failed to create destination');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Destination Attractions Management</h1>
          <p className="text-slate-500 text-sm">
            Powered by ASP.NET Core & Python LangGraph AI Service Workflow
          </p>
        </div>
      </div>

      {/* Add New Destination Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow border border-slate-200 rounded-2xl p-6 mb-8 space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Add New Destination</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name (e.g. Paris, Tokyo, Kandy)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md"
        >
          {submitting ? 'Adding Destination...' : '+ Add Destination'}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4 text-slate-800">Destinations & Attractions</h2>
      {loading && <p className="text-slate-500">Loading destinations...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {!loading && destinations.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
          No destinations yet. Add a destination above to start curating attractions with AI!
        </div>
      )}

      <div className="space-y-6">
        {destinations.map((d) => {
          const showAi = expandedAiDestinationId === d.id;
          return (
            <div key={d.id} className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl text-slate-900">{d.name}</h3>
                  <p className="text-slate-500 text-sm font-medium">{d.city}, {d.country}</p>
                  {d.description && <p className="text-slate-600 text-sm mt-1">{d.description}</p>}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setExpandedAiDestinationId(showAi ? null : d.id)}
                    className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow hover:brightness-110 transition-all flex items-center space-x-1"
                  >
                    <span>✨ {showAi ? 'Hide AI Architect' : 'Curate with AI'}</span>
                  </button>
                  <button
                    onClick={() => removeDestination(d.id)}
                    className="text-slate-400 hover:text-red-600 text-xs transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* AI Architect Component (Expandable) */}
              {showAi && (
                <AttractionAiArchitect
                  destination={d}
                  onAttractionsSaved={() => {
                    refresh();
                  }}
                />
              )}

              {/* Existing Attractions List */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Saved Attractions ({d.attractions?.length || 0})
                  </h4>
                  <button
                    onClick={async () => {
                      const name = prompt('Attraction name?');
                      const category = prompt('Category? (e.g. Museum, Park)');
                      if (!name || !category) return;
                      await createAttraction({ destinationId: d.id, name, category });
                      refresh();
                    }}
                    className="text-xs text-indigo-600 hover:underline font-semibold"
                  >
                    + Add Manual Attraction
                  </button>
                </div>

                {d.attractions && d.attractions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {d.attractions.map((a) => (
                      <AttractionCard key={a.id} attraction={a} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No attractions added yet.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}