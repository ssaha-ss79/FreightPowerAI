import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceAssistant from '../components/VoiceAssistant';
import LoadManagement from '../components/LoadManagement';
import NavigationView from '../components/NavigationView';
import FuelMonitoring from '../components/FuelMonitoring';
import AlertsDisplay from '../components/AlertsDisplay';
import DocumentUpload from '../components/DocumentUpload';
import DispatchCommunication from '../components/DispatchCommunication';
import EmergencyAssistance from '../components/EmergencyAssistance';
import { apiRequest } from '../utils/api';

const Dashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Load user data and initialize dashboard
    loadUserData();
    loadAlerts();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      const userData = await apiRequest('/users/profile');
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user data:', error);
      // If token is invalid, redirect to login
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const loadAlerts = async () => {
    try {
      const alertsData = await apiRequest('/api/v1/alerts');
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const handleVoiceCommand = (command: string) => {
    console.log('Voice command received:', command);
    // Parse voice commands and navigate to appropriate modules
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('load') || lowerCommand.includes('cargo')) {
      setActiveModule('loads');
    } else if (lowerCommand.includes('navigate') || lowerCommand.includes('route')) {
      setActiveModule('navigation');
    } else if (lowerCommand.includes('fuel') || lowerCommand.includes('gas')) {
      setActiveModule('fuel');
    } else if (lowerCommand.includes('document') || lowerCommand.includes('scan')) {
      setActiveModule('documents');
    } else if (lowerCommand.includes('dispatch') || lowerCommand.includes('message')) {
      setActiveModule('dispatch');
    } else if (lowerCommand.includes('emergency') || lowerCommand.includes('help')) {
      setActiveModule('emergency');
    }
  };

  const modules = [
    { id: 'overview', name: 'Overview', icon: '🏠' },
    { id: 'loads', name: 'Load Management', icon: '📦' },
    { id: 'navigation', name: 'Navigation', icon: '🗺️' },
    { id: 'fuel', name: 'Fuel Monitoring', icon: '⛽' },
    { id: 'documents', name: 'Documents', icon: '📄' },
    { id: 'dispatch', name: 'Dispatch', icon: '📞' },
    { id: 'emergency', name: 'Emergency', icon: '🚨' }
  ];

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'loads':
        return <LoadManagement />;
      case 'navigation':
        return <NavigationView />;
      case 'fuel':
        return <FuelMonitoring />;
      case 'documents':
        return <DocumentUpload />;
      case 'dispatch':
        return <DispatchCommunication />;
      case 'emergency':
        return <EmergencyAssistance />;
      default:
        return <DashboardOverview alerts={alerts} user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-sm border-b border-blue-500/20 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Axel</h1>
                  <p className="text-blue-300 text-sm">Voice-Driven Smart Logistics Assistant</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Voice Assistant Toggle */}
              <button
                onClick={() => setIsVoiceActive(!isVoiceActive)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isVoiceActive 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isVoiceActive ? '🎤' : '🎙️'}
              </button>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-white font-medium">{user?.name || 'Driver'}</p>
                  <p className="text-blue-300 text-sm capitalize">{user?.role || 'driver'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Logout"
                >
                  🚪
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-blue-500/20">
          <nav className="p-4 space-y-2">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeModule === module.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <span className="text-xl">{module.icon}</span>
                <span className="font-medium">{module.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Alerts Display */}
          <AlertsDisplay alerts={alerts} />
          
          {/* Active Module Content */}
          <div className="mt-6">
            {renderActiveModule()}
          </div>
        </main>
      </div>

      {/* Voice Assistant Component */}
      <VoiceAssistant 
        onCommand={handleVoiceCommand}
        onToggle={setIsVoiceActive}
      />
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview: React.FC<{ alerts: any[], user: any }> = ({ alerts, user }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Driver'}!</h2>
        <p className="text-blue-100">Ready to optimize your logistics operations with Axel?</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="📦"
          title="Active Loads"
          value="3"
          change="+2 from yesterday"
          color="blue"
        />
        <StatCard
          icon="🗺️"
          title="Miles Today"
          value="287"
          change="42% of daily goal"
          color="green"
        />
        <StatCard
          icon="⛽"
          title="Fuel Level"
          value="68%"
          change="~280 miles remaining"
          color="orange"
        />
        <StatCard
          icon="⏱️"
          title="Next Delivery"
          value="2.5hrs"
          change="On schedule"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton icon="📦" label="Find Loads" />
          <QuickActionButton icon="🗺️" label="Start Navigation" />
          <QuickActionButton icon="📄" label="Scan Document" />
          <QuickActionButton icon="📞" label="Contact Dispatch" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <ActivityItem
            icon="✅"
            text="Load #L2024-001 delivered successfully"
            time="2 hours ago"
            type="success"
          />
          <ActivityItem
            icon="🗺️"
            text="Route updated due to traffic conditions"
            time="4 hours ago"
            type="info"
          />
          <ActivityItem
            icon="📄"
            text="Bill of Lading uploaded for Load #L2024-002"
            time="6 hours ago"
            type="neutral"
          />
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
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} rounded-xl p-6 text-white`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <div className="text-right">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm opacity-90">{title}</div>
        </div>
      </div>
      <div className="text-sm opacity-80">{change}</div>
    </div>
  );
};

const QuickActionButton: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <button className="flex flex-col items-center space-y-2 p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-200 border border-blue-500/20 hover:border-blue-400/40">
    <span className="text-2xl">{icon}</span>
    <span className="text-white text-sm font-medium">{label}</span>
  </button>
);

const ActivityItem: React.FC<{
  icon: string;
  text: string;
  time: string;
  type: 'success' | 'info' | 'neutral';
}> = ({ icon, text, time, type }) => {
  const typeClasses = {
    success: 'border-green-500/20 bg-green-500/10',
    info: 'border-blue-500/20 bg-blue-500/10',
    neutral: 'border-gray-500/20 bg-gray-500/10'
  };

  return (
    <div className={`flex items-center space-x-4 p-3 rounded-lg border ${typeClasses[type]}`}>
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <p className="text-white text-sm">{text}</p>
        <p className="text-gray-400 text-xs">{time}</p>
      </div>
    </div>
  );
};

export default Dashboard;
