import React, { useState, useEffect } from 'react';

interface Alert {
  id: string;
  type: 'fuel_low' | 'weather' | 'traffic' | 'emergency' | 'dispatch' | 'system';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggered_at: string;
  status: 'active' | 'dismissed' | 'resolved';
  location?: string;
}

interface AlertsDisplayProps {
  alerts: Alert[];
}

const AlertsDisplay: React.FC<AlertsDisplayProps> = ({ alerts: initialAlerts }) => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts || []);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Simulate real-time alerts for demo
    const demoAlerts: Alert[] = [
      {
        id: '1',
        type: 'fuel_low',
        title: 'Low Fuel Warning',
        description: 'Fuel level is at 23%. Consider refueling soon.',
        severity: 'medium',
        triggered_at: new Date().toISOString(),
        status: 'active',
        location: 'Current Location'
      },
      {
        id: '2',
        type: 'traffic',
        title: 'Traffic Delay',
        description: 'Heavy traffic ahead on I-35. ETA increased by 20 minutes.',
        severity: 'low',
        triggered_at: new Date(Date.now() - 300000).toISOString(),
        status: 'active',
        location: 'I-35 North'
      },
      {
        id: '3',
        type: 'weather',
        title: 'Weather Alert',
        description: 'Heavy rain expected in 2 hours on your route.',
        severity: 'medium',
        triggered_at: new Date(Date.now() - 600000).toISOString(),
        status: 'active',
        location: 'Route to Dallas'
      }
    ];

    if (initialAlerts?.length === 0) {
      setAlerts(demoAlerts);
    }
  }, [initialAlerts]);

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high');

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'fuel_low': return '⛽';
      case 'weather': return '🌧️';
      case 'traffic': return '🚧';
      case 'emergency': return '🚨';
      case 'dispatch': return '📞';
      default: return 'ℹ️';
    }
  };

  const getAlertColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 border-red-500/50 text-red-200';
      case 'high': return 'bg-orange-500/20 border-orange-500/50 text-orange-200';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200';
      case 'low': return 'bg-blue-500/20 border-blue-500/50 text-blue-200';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-200';
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'dismissed' as const }
        : alert
    ));
  };

  const dismissAllAlerts = () => {
    setAlerts(alerts.map(alert => ({ ...alert, status: 'dismissed' as const })));
  };

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-500/30 border border-red-500/60 rounded-xl p-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🚨</span>
            <div>
              <div className="text-red-200 font-bold">
                {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
              </div>
              <div className="text-red-300 text-sm">
                {criticalAlerts[0].description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Summary */}
      <div 
        className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-blue-500/20 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl">🔔</span>
            <div>
              <div className="text-white font-medium">
                {activeAlerts.length} Active Alert{activeAlerts.length > 1 ? 's' : ''}
              </div>
              <div className="text-gray-400 text-sm">
                {criticalAlerts.length > 0 && `${criticalAlerts.length} critical`}
                {criticalAlerts.length > 0 && activeAlerts.length - criticalAlerts.length > 0 && ', '}
                {activeAlerts.length - criticalAlerts.length > 0 && `${activeAlerts.length - criticalAlerts.length} other`}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {activeAlerts.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissAllAlerts();
                }}
                className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded transition-colors"
              >
                Dismiss All
              </button>
            )}
            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              ⌄
            </span>
          </div>
        </div>

        {/* Expanded Alerts List */}
        {isExpanded && (
          <div className="border-t border-gray-600 p-4 space-y-3">
            {activeAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDismiss={() => dismissAlert(alert.id)}
                getAlertIcon={getAlertIcon}
                getAlertColor={getAlertColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Alert Card
const AlertCard: React.FC<{
  alert: Alert;
  onDismiss: () => void;
  getAlertIcon: (type: Alert['type']) => string;
  getAlertColor: (severity: Alert['severity']) => string;
}> = ({ alert, onDismiss, getAlertIcon, getAlertColor }) => {
  const timeAgo = (date: string) => {
    const now = new Date();
    const alertTime = new Date(date);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return alertTime.toLocaleDateString();
  };

  return (
    <div className={`rounded-lg p-3 border ${getAlertColor(alert.severity)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-lg">{getAlertIcon(alert.type)}</span>
          <div className="flex-1">
            <div className="font-medium">{alert.title}</div>
            <div className="text-sm opacity-90 mt-1">{alert.description}</div>
            <div className="flex items-center space-x-3 mt-2 text-xs opacity-75">
              <span>{timeAgo(alert.triggered_at)}</span>
              {alert.location && <span>📍 {alert.location}</span>}
            </div>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-white transition-colors p-1"
          title="Dismiss alert"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AlertsDisplay;
