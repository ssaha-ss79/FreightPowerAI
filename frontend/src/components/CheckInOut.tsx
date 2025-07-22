import React, { useState, useEffect } from 'react';
import { getSocket } from '../utils/socket';

const CheckInOut: React.FC = () => {

  const [status, setStatus] = useState<'checked-in' | 'checked-out' | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const socket = getSocket();
    socket.on('checkin', (data: { status: string; message: string }) => {
      setStatus(data.status as 'checked-in' | 'checked-out');
      setMessage(data.message);
    });
    return () => {
      socket.off('checkin');
    };
  }, []);

  const handleCheck = async (action: 'checkin' | 'checkout') => {
    setLoading(true);
    setMessage('');
    const socket = getSocket();
    socket.emit('checkin', { action });
    setTimeout(() => {
      setStatus(action === 'checkin' ? 'checked-in' : 'checked-out');
      setMessage(`Successfully ${action === 'checkin' ? 'checked in' : 'checked out'}.`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-md mb-6">
      <h3 className="font-bold mb-2">Check-In / Check-Out</h3>
      <div className="mb-2">Current status: <span className="font-semibold">{status || 'unknown'}</span></div>
      <div className="flex space-x-2 mb-2">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          onClick={() => handleCheck('checkin')}
          disabled={loading || status === 'checked-in'}
        >
          Check In
        </button>
        <button
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
          onClick={() => handleCheck('checkout')}
          disabled={loading || status === 'checked-out'}
        >
          Check Out
        </button>
      </div>
      {message && <div className="text-green-700 mb-2">{message}</div>}
    </div>
  );
};

export default CheckInOut;
