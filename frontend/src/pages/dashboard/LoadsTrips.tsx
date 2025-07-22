import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';

interface Load {
  id: string;
  origin: string;
  destination: string;
  status: string;
}

const LoadsTrips: React.FC = () => {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiRequest('/api/v1/loads')
      .then(data => setLoads(data.loads || []))
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
            <div><span className="font-semibold">Origin:</span> {load.origin}</div>
            <div><span className="font-semibold">Destination:</span> {load.destination}</div>
            <div><span className="font-semibold">Status:</span> {load.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoadsTrips;
