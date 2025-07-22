import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';

interface TelemetryLog {
  id: string;
  timestamp: string;
  fuel_level: number;
  speed: number;
  location: string;
}

const Telemetry: React.FC = () => {
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiRequest('/api/v1/fuel')
      .then(data => setLogs(data.logs || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-2xl mb-6">
      <h3 className="font-bold mb-2">Vehicle Telemetry</h3>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul>
        {logs.map(log => (
          <li key={log.id} className="mb-2 p-2 border rounded">
            <div><span className="font-semibold">Time:</span> {new Date(log.timestamp).toLocaleString()}</div>
            <div><span className="font-semibold">Fuel Level:</span> {log.fuel_level}%</div>
            <div><span className="font-semibold">Speed:</span> {log.speed} km/h</div>
            <div><span className="font-semibold">Location:</span> {log.location}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Telemetry;
