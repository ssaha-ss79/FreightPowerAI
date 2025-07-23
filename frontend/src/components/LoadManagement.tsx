import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

// Custom hook to force re-render on localStorage changes (user_id/role), with polling fallback
function useLocalStorage(keys: string[]) {
  const [, setVersion] = useState(0);
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (keys.includes(e.key || '')) setVersion(v => v + 1);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [keys]);
  // Also force re-render on mount in case localStorage was set in this tab
  useEffect(() => { setVersion(v => v + 1); }, []);
  // Polling fallback for same-tab localStorage changes
  useEffect(() => {
    let prevVals = keys.map(k => localStorage.getItem(k));
    const interval = setInterval(() => {
      const currVals = keys.map(k => localStorage.getItem(k));
      if (currVals.some((v, i) => v !== prevVals[i])) {
        setVersion(v => v + 1);
        prevVals = currVals;
      }
    }, 500);
    return () => clearInterval(interval);
  }, [keys]);
}

interface Load {
  id: string;
  origin_location: string;
  destination_location: string;
  payload_description: string;
  payout_amount: number;
  status: string;
  created_at: string;
  booked_by_driver_id?: string | null;
  booked_at?: string | null;
}

const LoadManagement: React.FC = () => {
  // Force re-render when user_id or role changes
  useLocalStorage(['user_id', 'role']);
  // Debug: log user_id and role on every render
  const userId = localStorage.getItem('user_id') || '';
  const userRole = localStorage.getItem('role') || '';
  console.log('[LoadManagement] Render: user_id =', userId, ', role =', userRole);
  console.log('[LoadManagement] Add Load button visible check:', userRole === 'dispatcher' || userRole === 'admin', '(dispatcher check:', userRole === 'dispatcher', ', admin check:', userRole === 'admin', ')');
  const handleAddLoad = async () => {
    console.log('[LoadManagement] handleAddLoad: user_id =', userId, ', role =', userRole);
    try {
      if (!newLoad.origin_location || !newLoad.destination_location || !newLoad.payload_description || !newLoad.payout_amount) {
        alert('Please fill in all fields');
        return;
      }
      await apiRequest('/api/v1/loads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLoad,
          payout_amount: parseFloat(newLoad.payout_amount),
        }),
      });
      setShowAddModal(false);
      setNewLoad({ origin_location: '', destination_location: '', payload_description: '', payout_amount: '' });
      loadAvailableLoads();
      alert('Load added successfully!');
    } catch (error) {
      console.error('Failed to add load:', error);
      alert('Failed to add load. Please try again.');
    }
  };
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('available');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newLoad, setNewLoad] = useState({
    origin_location: '',
    destination_location: '',
    payload_description: '',
    payout_amount: '',
  });


  useEffect(() => {
    loadAvailableLoads();
  }, [filter]);

  const loadAvailableLoads = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/v1/loads/available?status=${filter}`);
      setLoads(data);
    } catch (error) {
      console.error('Failed to load loads:', error);
    } finally {
      setLoading(false);
    }
  };

  const bookLoad = async (loadId: string) => {
    const userId = localStorage.getItem('user_id') || '';
    console.log('[LoadManagement] bookLoad: user_id =', userId);
    try {
      if (!userId) {
        console.warn('[LoadManagement] bookLoad: user_id missing after login!');
        alert('User ID not found. Please log in again.');
        return;
      }
      await apiRequest(`/api/v1/loads/${loadId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: userId })
      });
      loadAvailableLoads();
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Load booked successfully!');
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Failed to book load:', error);
      if (error instanceof Error && error.message.includes('Driver not found')) {
        alert('Driver record not found. Please contact support or re-register as a driver.');
      } else {
        alert('Failed to book load. Please try again.');
      }
    }
  };

  const cancelLoad = async (loadId: string) => {
    const userId = localStorage.getItem('user_id') || '';
    console.log('[LoadManagement] cancelLoad: user_id =', userId);
    try {
      if (!userId) {
        console.warn('[LoadManagement] cancelLoad: user_id missing after login!');
        alert('User ID not found. Please log in again.');
        return;
      }
      await apiRequest(`/api/v1/loads/${loadId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: userId })
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
              onDetails={() => setSelectedLoad(load)}
            />
          ))
        )}
      </div>

      {/* Load Details Modal */}
      {selectedLoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setSelectedLoad(null)}>
              ✖️
            </button>
            <h2 className="text-2xl font-bold mb-4">Load Details</h2>
            <div className="mb-2"><b>ID:</b> {selectedLoad.id}</div>
            <div className="mb-2"><b>Origin:</b> {selectedLoad.origin_location}</div>
            <div className="mb-2"><b>Destination:</b> {selectedLoad.destination_location}</div>
            <div className="mb-2"><b>Description:</b> {selectedLoad.payload_description}</div>
            <div className="mb-2"><b>Payout:</b> ₹{(selectedLoad.payout_amount * 83).toLocaleString('en-IN')}</div>
            <div className="mb-2"><b>Status:</b> {selectedLoad.status}</div>
            <div className="mb-2"><b>Created At:</b> {new Date(selectedLoad.created_at).toLocaleString()}</div>
            {selectedLoad.booked_by_driver_id && (
              <div className="mb-2"><b>Booked By:</b> {selectedLoad.booked_by_driver_id}</div>
            )}
            {selectedLoad.booked_at && (
              <div className="mb-2"><b>Booked At:</b> {new Date(selectedLoad.booked_at).toLocaleString()}</div>
            )}
          </div>
        </div>
      )}

      {/* Add Load Button (role-based) */}
      {(userRole === 'dispatcher' || userRole === 'admin') && (
        <div className="flex justify-end">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium mb-2"
            onClick={() => {
              console.log('[LoadManagement] Add Load button clicked: user_id =', userId, ', role =', userRole);
              setShowAddModal(true);
            }}
          >
            ➕ Add Load
          </button>
        </div>
      )}
      {/* Add Load Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowAddModal(false)}>
              ✖️
            </button>
            <h2 className="text-2xl font-bold mb-4">Add New Load</h2>
            <div className="mb-2">
              <label className="block font-medium mb-1">Origin</label>
              <input className="w-full border px-2 py-1 rounded" value={newLoad.origin_location} onChange={e => setNewLoad({ ...newLoad, origin_location: e.target.value })} />
            </div>
            <div className="mb-2">
              <label className="block font-medium mb-1">Destination</label>
              <input className="w-full border px-2 py-1 rounded" value={newLoad.destination_location} onChange={e => setNewLoad({ ...newLoad, destination_location: e.target.value })} />
            </div>
            <div className="mb-2">
              <label className="block font-medium mb-1">Description</label>
              <input className="w-full border px-2 py-1 rounded" value={newLoad.payload_description} onChange={e => setNewLoad({ ...newLoad, payload_description: e.target.value })} />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Payout Amount</label>
              <input type="number" className="w-full border px-2 py-1 rounded" value={newLoad.payout_amount} onChange={e => setNewLoad({ ...newLoad, payout_amount: e.target.value })} />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium" onClick={handleAddLoad}>
              Add Load
            </button>
          </div>
        </div>
      )}
    </div>
  );
      {/* Removed duplicate Add Load button/modal at the end */}
};

// Load Card Component
const LoadCard: React.FC<{
  load: Load;
  onBook: () => void;
  onCancel: () => void;
  onDetails: () => void;
}> = ({ load, onBook, onCancel, onDetails }) => {
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
          <div className="text-2xl font-bold text-green-400">₹{(load.payout_amount * 83).toLocaleString('en-IN')}</div>
          <div className="text-xs text-gray-400">(Approx. ₹1 = $0.012)</div>
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
          <button className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors font-medium" onClick={onDetails}>
            ℹ️ Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadManagement;
