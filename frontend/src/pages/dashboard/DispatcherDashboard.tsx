import React from 'react';

import Layout from '../../components/Layout';
import VoiceAssistant from '../../components/VoiceAssistant';
import VehicleMap from '../../components/VehicleMap';
import DispatcherLoadsTrips from './DispatcherLoadsTrips';
import DocumentUpload from '../../components/DocumentUpload';
import DocumentsList from './DocumentsList';
import Notifications from '../../components/Notifications';
import CheckInOut from '../../components/CheckInOut';
import EmergencyTrigger from '../../components/EmergencyTrigger';
import DispatchMessaging from '../../components/DispatchMessaging';

const DispatcherDashboard: React.FC = () => {
  return (
    <Layout role="dispatcher">
      <h2 className="text-2xl font-bold mb-4">Dispatcher Dashboard</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>View/manage all loads and trips</li>
        <li>Dispatch messages to drivers</li>
        <li>Monitor vehicle/driver status</li>
        <li>Upload/view documents</li>
        <li>Send/receive notifications and alerts</li>
        <li>Real-time fleet map</li>
        <li>Voice assistant</li>
      </ul>
      <DispatcherLoadsTrips />
      <VehicleMap position={[40.7128, -74.006]} label="Fleet Center" />
      <DocumentUpload />
      <DocumentsList />
      <Notifications />
      <CheckInOut />
      <EmergencyTrigger />
      <DispatchMessaging />
      <VoiceAssistant />
    </Layout>
  );
};

export default DispatcherDashboard;
