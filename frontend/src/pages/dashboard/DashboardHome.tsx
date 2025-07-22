import React from 'react';

const DashboardHome: React.FC<{ role: string }> = ({ role }) => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Welcome to your {role === 'driver' ? 'Driver' : 'Dispatcher'} Dashboard</h1>
    <p>Select a feature from the navigation bar.</p>
  </div>
);

export default DashboardHome;
