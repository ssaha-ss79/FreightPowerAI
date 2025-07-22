import React, { useEffect, useState } from 'react';
import { getSocket } from '../utils/socket';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'alert' | 'emergency';
  timestamp: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Simulate fetching notifications from backend or WebSocket
  useEffect(() => {
    // Example: initial notifications
    setNotifications([
      { id: '1', message: 'Load assigned: #1234', type: 'info', timestamp: new Date().toISOString() },
      { id: '2', message: 'Emergency reported by Driver X', type: 'emergency', timestamp: new Date().toISOString() },
    ]);

    // WebSocket integration
    const socket = getSocket();
    socket.on('notification', (data: Notification) => {
      setNotifications(prev => [data, ...prev]);
    });
    return () => {
      socket.off('notification');
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-md mb-6">
      <h3 className="font-bold mb-2">Notifications</h3>
      <ul>
        {notifications.map(n => (
          <li key={n.id} className={`mb-2 p-2 rounded ${n.type === 'emergency' ? 'bg-red-100 text-red-700' : n.type === 'alert' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
            <div className="text-xs text-gray-500">{new Date(n.timestamp).toLocaleString()}</div>
            <div>{n.message}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
