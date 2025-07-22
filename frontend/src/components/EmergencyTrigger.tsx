import React, { useState, useEffect } from 'react';
import { getSocket } from '../utils/socket';

const EmergencyTrigger: React.FC = () => {

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const socket = getSocket();
    socket.on('emergency', (data: { message: string }) => {
      setMessage(data.message);
    });
    return () => {
      socket.off('emergency');
    };
  }, []);

  const handleTrigger = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    const socket = getSocket();
    socket.emit('emergency', { trigger: true });
    setTimeout(() => {
      setMessage('Emergency triggered! Help is on the way.');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-md mb-6">
      <h3 className="font-bold mb-2 text-red-700">Emergency</h3>
      <button
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        onClick={handleTrigger}
        disabled={loading}
      >
        Trigger Emergency
      </button>
      {message && <div className="text-red-700 mt-2">{message}</div>}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default EmergencyTrigger;
