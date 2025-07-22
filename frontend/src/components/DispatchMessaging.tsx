import React, { useState, useEffect } from 'react';
import { getSocket } from '../utils/socket';

interface DispatchMessagingProps {
  onSend?: (message: string) => void;
}

const DispatchMessaging: React.FC<DispatchMessagingProps> = ({ onSend }) => {

  const [message, setMessage] = useState('');
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    socket.on('dispatch', (msg: string) => {
      setSentMessages(prev => [...prev, msg]);
    });
    return () => {
      socket.off('dispatch');
    };
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    const socket = getSocket();
    socket.emit('dispatch', message);
    if (onSend) onSend(message);
    setMessage('');
    setLoading(false);
  };

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-md mb-6">
      <h3 className="font-bold mb-2">Dispatch Messaging</h3>
      <div className="flex mb-2">
        <input
          type="text"
          className="flex-1 border px-3 py-2 rounded mr-2"
          placeholder="Type message to driver..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          disabled={loading}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleSend}
          disabled={loading || !message.trim()}
        >
          Send
        </button>
      </div>
      <div>
        <h4 className="font-semibold mb-1 text-sm">Sent Messages</h4>
        <ul className="text-xs text-gray-700">
          {sentMessages.map((msg, idx) => (
            <li key={idx} className="mb-1">{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DispatchMessaging;
