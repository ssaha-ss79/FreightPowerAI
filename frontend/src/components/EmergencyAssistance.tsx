import React, { useState } from 'react';
import { apiRequest } from '../utils/api';

interface EmergencyContact {
  name: string;
  phone: string;
  type: 'company' | 'emergency' | 'roadside';
}

const EmergencyAssistance: React.FC = () => {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyType, setEmergencyType] = useState('');
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [emergencyLog, setEmergencyLog] = useState<any[]>([]);

  React.useEffect(() => {
    getCurrentLocation();
    loadEmergencyLog();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocation({ lat: 39.8283, lon: -98.5795 }); // Default location
        }
      );
    }
  };

  const loadEmergencyLog = () => {
    // Simulate emergency log for demo
    setEmergencyLog([
      {
        id: '1',
        type: 'roadside_assistance',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'resolved',
        description: 'Tire blowout on I-75, roadside assistance dispatched'
      }
    ]);
  };

  const triggerEmergency = async (type: string) => {
    if (!location) {
      alert('Location not available');
      return;
    }

    try {
      setLoading(true);
      setEmergencyActive(true);
      setEmergencyType(type);

      // Speak emergency alert
      if ('speechSynthesis' in window) {
        const message = type === 'medical' 
          ? 'Medical emergency activated. Contacting emergency services.'
          : type === 'accident'
          ? 'Accident emergency activated. Dispatching assistance.'
          : 'Emergency assistance activated. Help is on the way.';
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.2;
        speechSynthesis.speak(utterance);
      }

      // Send emergency trigger to backend
      const response = await apiRequest('/api/v1/emergency/trigger', {
        method: 'POST',
        body: JSON.stringify({
          driver_id: 'current_driver',
          emergency_type: type,
          current_location: location,
          vehicle_data: {
            fuel: 68,
            speed: 0,
            engine_status: 'idle'
          }
        })
      });

      console.log('Emergency triggered:', response);
      
      // Simulate emergency response
      setTimeout(() => {
        setEmergencyActive(false);
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance('Emergency services have been notified. Help is on the way.');
          speechSynthesis.speak(utterance);
        }
      }, 5000);

    } catch (error) {
      console.error('Failed to trigger emergency:', error);
      setEmergencyActive(false);
    } finally {
      setLoading(false);
    }
  };

  const cancelEmergency = () => {
    setEmergencyActive(false);
    setEmergencyType('');
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Emergency cancelled');
      speechSynthesis.speak(utterance);
    }
  };

  const emergencyTypes = [
    {
      id: 'medical',
      name: 'Medical Emergency',
      icon: '🚑',
      description: 'Medical assistance needed',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      id: 'accident',
      name: 'Vehicle Accident',
      icon: '🚗',
      description: 'Vehicle accident or collision',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'breakdown',
      name: 'Vehicle Breakdown',
      icon: '🔧',
      description: 'Mechanical issues or breakdown',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 'security',
      name: 'Security Issue',
      icon: '🛡️',
      description: 'Security threat or suspicious activity',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const emergencyContacts: EmergencyContact[] = [
    { name: 'Emergency Services', phone: '911', type: 'emergency' },
    { name: 'Company Dispatch', phone: '1-800-FREIGHT', type: 'company' },
    { name: 'Roadside Assistance', phone: '1-800-ROADSIDE', type: 'roadside' },
    { name: 'Insurance Hotline', phone: '1-800-INSURANCE', type: 'company' }
  ];

  const callContact = (contact: EmergencyContact) => {
    // In a real app, this would initiate a phone call
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Calling ${contact.name}`);
      speechSynthesis.speak(utterance);
    }
    window.open(`tel:${contact.phone}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Emergency Assistance</h2>
          <p className="text-blue-300">Quick access to emergency services and support</p>
        </div>
        {location && (
          <div className="text-sm text-gray-400">
            📍 Location: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
          </div>
        )}
      </div>

      {/* Emergency Active Banner */}
      {emergencyActive && (
        <div className="bg-red-500/30 border border-red-500/60 rounded-xl p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">🚨</span>
              <div>
                <h3 className="text-red-200 text-xl font-bold">EMERGENCY ACTIVE</h3>
                <p className="text-red-300">
                  {emergencyType.replace('_', ' ').toUpperCase()} - Help is on the way
                </p>
              </div>
            </div>
            <button
              onClick={cancelEmergency}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Emergency Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {emergencyTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => triggerEmergency(type.id)}
            disabled={loading || emergencyActive}
            className={`${type.color} disabled:bg-gray-600 text-white p-6 rounded-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100`}
          >
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{type.icon}</span>
              <div className="text-left">
                <h3 className="text-xl font-bold">{type.name}</h3>
                <p className="text-sm opacity-90">{type.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Emergency Contacts */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
        <h3 className="text-xl font-bold text-white mb-4">Emergency Contacts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyContacts.map((contact, index) => (
            <ContactCard
              key={index}
              contact={contact}
              onCall={() => callContact(contact)}
            />
          ))}
        </div>
      </div>

      {/* Safety Tips */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
        <h3 className="text-xl font-bold text-white mb-4">Safety Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <div className="space-y-2">
            <h4 className="font-medium text-white">Vehicle Breakdown:</h4>
            <ul className="text-sm space-y-1">
              <li>• Pull over safely to the right shoulder</li>
              <li>• Turn on hazard lights</li>
              <li>• Exit vehicle away from traffic</li>
              <li>• Stay visible and alert</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-white">Medical Emergency:</h4>
            <ul className="text-sm space-y-1">
              <li>• Call 911 immediately</li>
              <li>• Provide clear location details</li>
              <li>• Stay calm and follow dispatcher instructions</li>
              <li>• Do not move if injured</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Emergency Log */}
      {emergencyLog.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
          <h3 className="text-xl font-bold text-white mb-4">Recent Emergency Log</h3>
          <div className="space-y-3">
            {emergencyLog.map((log) => (
              <div key={log.id} className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium capitalize">
                      {log.type.replace('_', ' ')}
                    </div>
                    <div className="text-gray-300 text-sm">{log.description}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm px-2 py-1 rounded ${
                      log.status === 'resolved' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {log.status}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Contact Card Component
const ContactCard: React.FC<{
  contact: EmergencyContact;
  onCall: () => void;
}> = ({ contact, onCall }) => {
  const getContactIcon = (type: string) => {
    switch (type) {
      case 'emergency': return '🚨';
      case 'company': return '🏢';
      case 'roadside': return '🚗';
      default: return '📞';
    }
  };

  const getContactColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'border-red-500/40 hover:border-red-500/60';
      case 'company': return 'border-blue-500/40 hover:border-blue-500/60';
      case 'roadside': return 'border-orange-500/40 hover:border-orange-500/60';
      default: return 'border-gray-500/40 hover:border-gray-500/60';
    }
  };

  return (
    <button
      onClick={onCall}
      className={`bg-slate-700/50 rounded-lg p-4 border ${getContactColor(contact.type)} transition-all duration-200 hover:bg-slate-600/50 text-left w-full`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{getContactIcon(contact.type)}</span>
        <div>
          <div className="text-white font-medium">{contact.name}</div>
          <div className="text-blue-300 text-sm">{contact.phone}</div>
        </div>
      </div>
    </button>
  );
};

export default EmergencyAssistance;
