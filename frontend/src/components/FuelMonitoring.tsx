import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { findNearbyPlaces, calculateDistance } from '../utils/geocoding';

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
  coordinates?: { lat: number; lng: number };
  rating?: number;
}

const FuelMonitoring: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<FuelStation | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [fuelData, setFuelData] = useState<FuelData | null>(null);
  const [nearbyStations, setNearbyStations] = useState<FuelStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [fuelAlert, setFuelAlert] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    getCurrentLocation();
    loadFuelData();
    // Poll fuel data every 10 seconds
    const interval = setInterval(() => {
      loadFuelData();
    }, 10000);
    return () => clearInterval(interval);
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
      // Use Google Places API to find real nearby fuel stations
      const places = await findNearbyPlaces(
        { lat: location.lat, lng: location.lon },
        'gas_station',
        5000 // 5km radius
      );

      // Convert to FuelStation format
      const stations: FuelStation[] = places.map(place => ({
        name: place.name,
        address: place.formatted_address,
        distance_km: place.distance || calculateDistance(
          { lat: location.lat, lng: location.lon },
          place.geometry.location
        ),
        price_per_gallon: 3.45 + Math.random() * 0.50, // Mock price
        amenities: ['24/7', 'Restrooms', 'Snacks'], // Mock amenities
        coordinates: place.geometry.location,
        rating: place.rating
      }));

      // Sort by distance and take top 3
      stations.sort((a, b) => a.distance_km - b.distance_km);
      setNearbyStations(stations.slice(0, 3));

    } catch (error) {
      console.error('Failed to load nearby stations:', error);
      // Fallback to mock data
      setNearbyStations([
        {
          name: 'Shell Station',
          address: '123 Main St, Local City',
          distance_km: 2.3,
          price_per_gallon: 3.45,
          amenities: ['24/7', 'Restrooms', 'ATM'],
          coordinates: { lat: location.lat + 0.01, lng: location.lon + 0.01 },
          rating: 4.2
        },
        {
          name: 'BP Fuel Center',
          address: '456 Highway Blvd, Local City',
          distance_km: 3.1,
          price_per_gallon: 3.52,
          amenities: ['Diesel', 'Car Wash', 'Snacks'],
          coordinates: { lat: location.lat - 0.01, lng: location.lon - 0.01 },
          rating: 4.0
        },
        {
          name: 'Exxon Express',
          address: '789 State Route, Local City',
          distance_km: 4.7,
          price_per_gallon: 3.38,
          amenities: ['24/7', 'Restrooms', 'Coffee'],
          coordinates: { lat: location.lat + 0.02, lng: location.lon - 0.01 },
          rating: 3.9
        }
      ]);
    }
  };

  const handleNavigateToStation = (station: FuelStation) => {
    if (!station.coordinates) {
      alert('Station coordinates not available');
      return;
    }
    // Store navigation data for NavigationView
    localStorage.setItem('navigationData', JSON.stringify({
      trip: {
        id: 'fuel_' + Date.now(),
        destination: station.address,
        destinationCoords: station.coordinates,
        stationName: station.name
      },
      load: {
        destination_location: station.address,
        origin_location: currentLocation ? `${currentLocation.lat},${currentLocation.lon}` : 'Current Location'
      },
      isManualNavigation: true
    }));
    // Signal Dashboard to switch to navigation
    window.dispatchEvent(new CustomEvent('startNavigation'));
    // Voice feedback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Navigating to ${station.name}, ${station.distance_km.toFixed(1)} kilometers away`);
      speechSynthesis.speak(utterance);
    }
  };

  const navigateToStation = (station: FuelStation) => {
    handleNavigateToStation(station);
  };

  const openDetailsModal = (station: FuelStation) => {
    setSelectedStation(station);
    setShowDetails(true);
  };

  const closeDetailsModal = () => {
    setShowDetails(false);
    setSelectedStation(null);
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
    <div className="relative space-y-6">
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
          {(Array.isArray(nearbyStations) ? nearbyStations : []).map((station, index) => (
            <FuelStationCard
              key={index}
              station={station}
              onNavigate={() => navigateToStation(station)}
              onDetails={() => openDetailsModal(station)}
            />
          ))}
        </div>
      </div>

      {/* Details Modal (conditionally rendered inside parent div) */}
      {showDetails && selectedStation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-8 w-full max-w-md border border-blue-500/40 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
              onClick={closeDetailsModal}
            >✖️</button>
            <h3 className="text-2xl font-bold text-white mb-2">{selectedStation.name}</h3>
            <p className="text-gray-300 mb-2">{selectedStation.address}</p>
            <div className="flex items-center space-x-4 mb-2">
              <span className="text-blue-300">📍 {selectedStation.distance_km.toFixed(1)} km away</span>
              {selectedStation.price_per_gallon && (
                <span className="text-green-300">💰 ${selectedStation.price_per_gallon.toFixed(2)}/gal</span>
              )}
              {selectedStation.rating && (
                <span className="text-yellow-300">⭐ {selectedStation.rating.toFixed(1)}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {(Array.isArray(selectedStation.amenities) ? selectedStation.amenities : []).map((amenity, idx) => (
                <span key={idx} className="bg-blue-500/20 text-blue-200 px-2 py-1 rounded text-xs">{amenity}</span>
              ))}
            </div>
            {selectedStation.coordinates && (
              <div className="text-gray-400 text-xs mb-2">
                Lat: {selectedStation.coordinates.lat}, Lng: {selectedStation.coordinates.lng}
              </div>
            )}
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium w-full"
              onClick={() => { navigateToStation(selectedStation); closeDetailsModal(); }}
            >🗺️ Navigate Here</button>
          </div>
        </div>
      )}
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
  onDetails: () => void;
}> = ({ station, onNavigate, onDetails }) => {
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
                💰 ${station.price_per_gallon.toFixed(2)}/gal
              </span>
            )}
            {station.rating && (
              <span className="text-yellow-300">
                ⭐ {station.rating.toFixed(1)}
              </span>
            )}
          </div>
          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mt-3">
            {(Array.isArray(station.amenities) ? station.amenities : []).map((amenity, index) => (
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
          <button
            onClick={onDetails}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            ℹ️ Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default FuelMonitoring;
