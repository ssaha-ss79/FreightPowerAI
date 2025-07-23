import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';

interface Load {
  id: string;
  origin_location: string;
  destination_location: string;
  payload_description: string;
  payout_amount: number;
  status: string;
  booked_by_driver_id?: string | null;
  booked_at?: string | null;
  created_at: string;
}

const LoadsTrips: React.FC = () => {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiRequest('/api/v1/loads/available')
      .then(data => setLoads(data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-2xl mb-6">
      <h3 className="font-bold mb-2">Assigned Loads & Trips</h3>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul>
        {loads.map(load => (
          <li key={load.id} className="mb-2 p-2 border rounded">
            <div><span className="font-semibold">Origin:</span> {load.origin_location}</div>
            <div><span className="font-semibold">Destination:</span> {load.destination_location}</div>
            <div><span className="font-semibold">Status:</span> {load.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoadsTrips;
