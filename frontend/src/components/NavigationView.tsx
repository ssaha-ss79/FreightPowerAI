import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { apiRequest } from '../utils/api';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Route {
  id: string;
  origin: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  waypoints: Array<{ lat: number; lon: number }>;
  distance: number;
  eta: string;
  traffic_alerts: Array<{ type: string; description: string; severity: string }>;
}

const NavigationView: React.FC = () => {
  const [route, setRoute] = useState<Route | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [nextInstruction, setNextInstruction] = useState('');
  const [weatherAlert, setWeatherAlert] = useState<string | null>(null);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a central location
          setCurrentLocation({ lat: 39.8283, lon: -98.5795 });
        }
      );
    }

    // Load active route if any
    loadActiveRoute();
  }, []);

  const loadActiveRoute = async () => {
    try {
      const routeData = await apiRequest('/api/v1/route/active');
      setRoute(routeData);
      setIsNavigating(true);
    } catch (error) {
      console.error('No active route found:', error);
    }
  };

  const startNavigation = async (destination: string) => {
    if (!currentLocation) {
      alert('Current location not available');
      return;
    }

    try {
      const routeData = await apiRequest('/api/v1/route/plan', {
        method: 'POST',
        body: JSON.stringify({
          origin: currentLocation,
          destination: { address: destination },
          driver_preferences: { avoid_tolls: false }
        })
      });

      setRoute(routeData);
      setIsNavigating(true);
      setNextInstruction('Navigate to your destination');

      // Voice feedback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Navigation started to ${destination}. ETA is ${routeData.eta}`);
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Failed to plan route:', error);
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setRoute(null);
    setNextInstruction('');
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Navigation stopped');
      speechSynthesis.speak(utterance);
    }
  };

  const reroute = async () => {
    if (!route || !currentLocation) return;

    try {
      const newRoute = await apiRequest(`/api/v1/route/reroute/${route.id}`, {
        method: 'POST',
        body: JSON.stringify({
          current_location: currentLocation,
          reason: 'traffic'
        })
      });

      setRoute({ ...route, ...newRoute });
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Route updated due to traffic conditions');
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Failed to reroute:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Navigation</h2>
          <p className="text-blue-300">Real-time navigation and route planning</p>
        </div>
        <div className="flex space-x-3">
          {isNavigating ? (
            <>
              <button
                onClick={reroute}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Reroute
              </button>
              <button
                onClick={stopNavigation}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ⏹️ Stop
              </button>
            </>
          ) : (
            <QuickDestinations onDestinationSelect={startNavigation} />
          )}
        </div>
      </div>

      {/* Navigation Status */}
      {isNavigating && route && (
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm opacity-90">Distance Remaining</div>
              <div className="text-2xl font-bold">{route.distance} mi</div>
            </div>
            <div>
              <div className="text-sm opacity-90">ETA</div>
              <div className="text-2xl font-bold">{route.eta}</div>
            </div>
            <div>
              <div className="text-sm opacity-90">Next Instruction</div>
              <div className="text-lg font-medium">{nextInstruction || 'Continue straight'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Weather Alert */}
      {weatherAlert && (
        <div className="bg-orange-500/20 border border-orange-500/40 rounded-xl p-4 text-orange-200">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{weatherAlert}</span>
          </div>
        </div>
      )}

      {/* Traffic Alerts */}
      {route?.traffic_alerts && route.traffic_alerts.length > 0 && (
        <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4">
          <h3 className="text-red-200 font-medium mb-2">Traffic Alerts</h3>
          <div className="space-y-2">
            {route.traffic_alerts.map((alert, index) => (
              <div key={index} className="flex items-center space-x-2 text-red-200">
                <span className="text-sm">🚧</span>
                <span className="text-sm">{alert.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-blue-500/20 overflow-hidden">
        <div className="h-96">
          {currentLocation ? (
            <MapContainer
              center={[currentLocation.lat, currentLocation.lon]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Current Location Marker */}
              <Marker position={[currentLocation.lat, currentLocation.lon]}>
                <Popup>Your Current Location</Popup>
              </Marker>

              {/* Route Markers and Polyline */}
              {route && (
                <>
                  <Marker position={[route.origin.lat, route.origin.lon]}>
                    <Popup>Starting Point</Popup>
                  </Marker>
                  <Marker position={[route.destination.lat, route.destination.lon]}>
                    <Popup>Destination</Popup>
                  </Marker>
                  {route.waypoints.length > 0 && (
                    <Polyline
                      positions={route.waypoints.map(wp => [wp.lat, wp.lon])}
                      color="blue"
                      weight={4}
                      opacity={0.7}
                    />
                  )}
                </>
              )}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Destination Input */}
      {!isNavigating && <DestinationInput onNavigate={startNavigation} />}
    </div>
  );
};

// Quick Destinations Component
const QuickDestinations: React.FC<{ onDestinationSelect: (destination: string) => void }> = ({ onDestinationSelect }) => {
  const quickDestinations = [
    'Nearest Truck Stop',
    'Nearest Gas Station',
    'Distribution Center',
    'Walmart DC'
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {quickDestinations.map((destination) => (
        <button
          key={destination}
          onClick={() => onDestinationSelect(destination)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
        >
          {destination}
        </button>
      ))}
    </div>
  );
};

// Destination Input Component
const DestinationInput: React.FC<{ onNavigate: (destination: string) => void }> = ({ onNavigate }) => {
  const [destination, setDestination] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim()) {
      onNavigate(destination.trim());
      setDestination('');
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
      <h3 className="text-xl font-bold text-white mb-4">Enter Destination</h3>
      <form onSubmit={handleSubmit} className="flex space-x-4">
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Enter address, city, or business name..."
          className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
        >
          🗺️ Navigate
        </button>
      </form>
    </div>
  );
};

export default NavigationView;
