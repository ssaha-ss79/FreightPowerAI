import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

interface FuelData {
  fuel_level_percent: number;
  last_updated_at: string;
  estimated_range_miles: number;
}

interface FuelStation {
  name: string;
  address: string;
  distance_km: number;
  price_per_gallon?: number;
  amenities: string[];
}

const FuelMonitoring: React.FC = () => {
  const [fuelData, setFuelData] = useState<FuelData | null>(null);
  const [nearbyStations, setNearbyStations] = useState<FuelStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [fuelAlert, setFuelAlert] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    getCurrentLocation();
    loadFuelData();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setCurrentLocation(location);
          loadNearbyStations(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location (center of US)
          const defaultLocation = { lat: 39.8283, lon: -98.5795 };
          setCurrentLocation(defaultLocation);
          loadNearbyStations(defaultLocation);
        }
      );
    }
  };

  const loadFuelData = async () => {
    try {
      const data = await apiRequest('/api/v1/fuel/status/current_vehicle');
      setFuelData(data);
      
      // Check for low fuel alert
      if (data.fuel_level_percent < 25) {
        const alertMessage = `Low fuel alert: ${data.fuel_level_percent}% remaining (~${data.estimated_range_miles} miles)`;
        setFuelAlert(alertMessage);
        
        // Voice alert
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(alertMessage);
          speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('Failed to load fuel data:', error);
      // Simulated data for demo
      setFuelData({
        fuel_level_percent: 68,
        last_updated_at: new Date().toISOString(),
        estimated_range_miles: 280
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyStations = async (location: { lat: number; lon: number }) => {
    try {
      const stations = await apiRequest(`/api/v1/fuel/nearest-station?lat=${location.lat}&lon=${location.lon}`);
      setNearbyStations(stations);
    } catch (error) {
      console.error('Failed to load nearby stations:', error);
      // Simulated data for demo
      setNearbyStations([
        {
          name: 'Shell Travel Plaza',
          address: '123 Highway 75, Dallas, TX',
          distance_km: 2.5,
          price_per_gallon: 3.89,
          amenities: ['Restaurant', 'Shower', 'Parking', 'WiFi']
        },
        {
          name: 'Pilot Flying J',
          address: '456 Interstate 35, Dallas, TX',
          distance_km: 4.1,
          price_per_gallon: 3.92,
          amenities: ['Restaurant', 'Shower', 'Parking', 'Laundry']
        },
        {
          name: 'TA Travel Center',
          address: '789 Highway 20, Dallas, TX',
          distance_km: 6.8,
          price_per_gallon: 3.85,
          amenities: ['Restaurant', 'Shower', 'Parking', 'Store']
        }
      ]);
    }
  };

  const navigateToStation = (station: FuelStation) => {
    // Voice confirmation
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Navigating to ${station.name}`);
      speechSynthesis.speak(utterance);
    }
    
    // In a real app, this would trigger navigation
    console.log('Navigating to:', station);
  };

  const getFuelLevelColor = (percentage: number) => {
    if (percentage > 50) return 'text-green-400';
    if (percentage > 25) return 'text-orange-400';
    return 'text-red-400';
  };

  const getFuelLevelBg = (percentage: number) => {
    if (percentage > 50) return 'from-green-500 to-green-600';
    if (percentage > 25) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Fuel Monitoring</h2>
          <p className="text-blue-300">Track fuel levels and find stations</p>
        </div>
        <button
          onClick={loadFuelData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Fuel Alert */}
      {fuelAlert && (
        <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 text-red-200">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⛽</span>
            <span className="font-medium">{fuelAlert}</span>
          </div>
        </div>
      )}

      {/* Current Fuel Status */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading fuel data...</p>
        </div>
      ) : fuelData && (
        <div className={`bg-gradient-to-r ${getFuelLevelBg(fuelData.fuel_level_percent)} rounded-xl p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Current Fuel Level</h3>
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold">{fuelData.fuel_level_percent}%</div>
                <div>
                  <div className="text-lg">~{fuelData.estimated_range_miles} miles remaining</div>
                  <div className="text-sm opacity-90">
                    Last updated: {new Date(fuelData.last_updated_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-6xl">⛽</div>
          </div>
          
          {/* Fuel Level Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-white/80 transition-all duration-500"
              style={{ width: `${fuelData.fuel_level_percent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Fuel Efficiency Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon="📊"
          title="Avg MPG Today"
          value="6.8"
          change="+0.3 from yesterday"
          color="blue"
        />
        <StatCard
          icon="💰"
          title="Fuel Cost Today"
          value="$127"
          change="3 fill-ups"
          color="green"
        />
        <StatCard
          icon="🏃"
          title="Miles/Tank"
          value="420"
          change="Current tank"
          color="purple"
        />
      </div>

      {/* Nearby Fuel Stations */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
        <h3 className="text-xl font-bold text-white mb-4">Nearby Fuel Stations</h3>
        <div className="space-y-4">
          {nearbyStations.map((station, index) => (
            <FuelStationCard
              key={index}
              station={station}
              onNavigate={() => navigateToStation(station)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard: React.FC<{
  icon: string;
  title: string;
  value: string;
  change: string;
  color: string;
}> = ({ icon, title, value, change, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} rounded-xl p-4 text-white`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <div className="text-right">
          <div className="text-xl font-bold">{value}</div>
          <div className="text-sm opacity-90">{title}</div>
        </div>
      </div>
      <div className="text-sm opacity-80">{change}</div>
    </div>
  );
};

const FuelStationCard: React.FC<{
  station: FuelStation;
  onNavigate: () => void;
}> = ({ station, onNavigate }) => {
  return (
    <div className="bg-slate-700/50 rounded-lg p-4 border border-gray-600 hover:border-blue-500/40 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-white font-bold text-lg">{station.name}</h4>
          <p className="text-gray-300 text-sm mb-2">{station.address}</p>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-blue-300">
              📍 {station.distance_km.toFixed(1)} km away
            </span>
            {station.price_per_gallon && (
              <span className="text-green-300">
                💰 ${station.price_per_gallon}/gal
              </span>
            )}
          </div>
          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mt-3">
            {station.amenities.map((amenity, index) => (
              <span
                key={index}
                className="bg-blue-500/20 text-blue-200 px-2 py-1 rounded text-xs"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <button
            onClick={onNavigate}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            🗺️ Navigate
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
            ℹ️ Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default FuelMonitoring;
