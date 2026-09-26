import { useState } from 'react';
import { useDestinations } from '../hooks/useDestinations';
import AttractionCard from '../components/AttractionCard';
import { createAttraction } from '../api/destinationApi';

export default function DestinationManagement() {
  const { destinations, loading, error, addDestination, removeDestination } = useDestinations();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    } catch (err) {
      alert('Failed to create destination');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Destination Management</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-8 space-y-4">
        <h2 className="text-xl font-semibold">Add New Destination</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Adding...' : 'Add Destination'}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4">All Destinations</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {!loading && destinations.length === 0 && <p className="text-gray-500">No destinations yet.</p>}

      <div className="space-y-3">
        {destinations.map((d) => (
  <div key={d.id} className="bg-white shadow rounded-lg p-4">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-lg">{d.name}</h3>
        <p className="text-gray-600">{d.city}, {d.country}</p>
        {d.description && <p className="text-gray-500 text-sm mt-1">{d.description}</p>}
      </div>
      <button onClick={() => removeDestination(d.id)} className="text-red-500 hover:text-red-700 text-sm">
        Delete
      </button>
    </div>

    <div className="mt-3 space-y-2">
      {d.attractions?.map((a) => <AttractionCard key={a.id} attraction={a} />)}
    </div>

    <button
      onClick={async () => {
        const name = prompt('Attraction name?');
        const category = prompt('Category? (e.g. Museum, Park)');
        if (!name || !category) return;
        await createAttraction({ destinationId: d.id, name, category });
        refresh();
      }}
      className="mt-2 text-sm text-blue-600 hover:underline"
    >
      + Add Attraction
    </button>
  </div>
))}
      </div>
    </div>
  );
}