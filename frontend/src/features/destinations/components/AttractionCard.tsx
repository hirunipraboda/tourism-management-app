import type { Attraction } from '../api/destinationApi';

export default function AttractionCard({ attraction }: { attraction: Attraction }) {
  return (
    <div className="border rounded p-3 bg-gray-50">
      <div className="flex justify-between">
        <h4 className="font-medium">{attraction.name}</h4>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{attraction.category}</span>
      </div>
      {attraction.openingHours && <p className="text-sm text-gray-500">Hours: {attraction.openingHours}</p>}
      {attraction.entryFee != null && <p className="text-sm text-gray-500">Entry: ${attraction.entryFee}</p>}
    </div>
  );
}