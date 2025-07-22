import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  role: string;
}

const Layout: React.FC<LayoutProps> = ({ children, role }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
        <div className="font-bold text-xl">FreightPowerAI</div>
        <div className="space-x-4">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          {role === 'driver' && <Link to="/dashboard/checkin" className="hover:underline">Check-In/Out</Link>}
          {role === 'driver' && <Link to="/dashboard/emergency" className="hover:underline">Emergency</Link>}
          {role === 'dispatcher' && <Link to="/dashboard/dispatch" className="hover:underline">Dispatch</Link>}
          <Link to="/dashboard/documents" className="hover:underline">Documents</Link>
          <Link to="/dashboard/notifications" className="hover:underline">Notifications</Link>
          <button className="ml-4 bg-red-500 px-3 py-1 rounded" onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>Logout</button>
        </div>
      </nav>
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  );
};

export default Layout;
