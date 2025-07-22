import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

interface Load {
  id: string;
  origin_location: string;
  destination_location: string;
  payload_description: string;
  payout_amount: number;
  status: string;
  created_at: string;
}

const LoadManagement: React.FC = () => {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('available');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    loadAvailableLoads();
  }, [filter]);

  const loadAvailableLoads = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/v1/loads?status=${filter}`);
      setLoads(data);
    } catch (error) {
      console.error('Failed to load loads:', error);
    } finally {
      setLoading(false);
    }
  };

  const bookLoad = async (loadId: string) => {
    try {
      await apiRequest(`/api/v1/loads/${loadId}/book`, {
        method: 'POST',
        body: JSON.stringify({ driver_id: 'current_driver' })
      });
      
      // Refresh loads
      loadAvailableLoads();
      
      // Speak confirmation
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Load booked successfully!');
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Failed to book load:', error);
    }
  };

  const cancelLoad = async (loadId: string) => {
    try {
      await apiRequest(`/api/v1/loads/${loadId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ driver_id: 'current_driver' })
      });
      
      loadAvailableLoads();
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Load cancelled successfully!');
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Failed to cancel load:', error);
    }
  };

  const filteredLoads = loads.filter(load => 
    !searchLocation || 
    load.origin_location.toLowerCase().includes(searchLocation.toLowerCase()) ||
    load.destination_location.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Load Management</h2>
          <p className="text-blue-300">Find and manage your cargo loads</p>
        </div>
        <button
          onClick={loadAvailableLoads}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Filter by Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="available">Available Loads</option>
              <option value="booked">My Booked Loads</option>
              <option value="in_transit">In Transit</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">Search Location</label>
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Enter city or state..."
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Load Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading available loads...</p>
          </div>
        ) : filteredLoads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No loads found matching your criteria</p>
          </div>
        ) : (
          filteredLoads.map((load) => (
            <LoadCard
              key={load.id}
              load={load}
              onBook={() => bookLoad(load.id)}
              onCancel={() => cancelLoad(load.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Load Card Component
const LoadCard: React.FC<{
  load: Load;
  onBook: () => void;
  onCancel: () => void;
}> = ({ load, onBook, onCancel }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400 bg-green-400/10';
      case 'booked': return 'text-blue-400 bg-blue-400/10';
      case 'in_transit': return 'text-orange-400 bg-orange-400/10';
      case 'completed': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-bold text-white">Load #{load.id.slice(-8)}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(load.status)}`}>
              {load.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-gray-300 mb-4">{load.payload_description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">${load.payout_amount.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Payout</div>
        </div>
      </div>

      {/* Route Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div>
            <div className="text-sm text-gray-400">Pickup</div>
            <div className="text-white font-medium">{load.origin_location}</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div>
            <div className="text-sm text-gray-400">Delivery</div>
            <div className="text-white font-medium">{load.destination_location}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Posted: {new Date(load.created_at).toLocaleDateString()}
        </div>
        <div className="flex space-x-3">
          {load.status === 'available' && (
            <button
              onClick={onBook}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              📦 Book Load
            </button>
          )}
          {load.status === 'booked' && (
            <>
              <button
                onClick={onCancel}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                ❌ Cancel
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                🗺️ Navigate
              </button>
            </>
          )}
          <button className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors font-medium">
            ℹ️ Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadManagement;
