import React from 'react';


import Layout from '../../components/Layout';
import VoiceAssistant from '../../components/VoiceAssistant';

import VehicleMap from '../../components/VehicleMap';
import LoadsTrips from './LoadsTrips';
import Telemetry from './Telemetry';
import DocumentUpload from '../../components/DocumentUpload';
import DocumentsList from './DocumentsList';
import Notifications from '../../components/Notifications';
import CheckInOut from '../../components/CheckInOut';
import EmergencyTrigger from '../../components/EmergencyTrigger';

const DriverDashboard: React.FC = () => {
  return (
    <Layout role="driver">
      <h2 className="text-2xl font-bold mb-4">Driver Dashboard</h2>
      <ul className="list-disc ml-6">
        <li>View assigned loads and trips</li>
        <li>Check-in/out</li>
        <li>Emergency trigger</li>
        <li>Upload/view documents</li>
        <li>Receive notifications and alerts</li>
        <li>Real-time vehicle/route map</li>
        <li>Voice assistant</li>
      </ul>
      <LoadsTrips />
      <VehicleMap position={[40.7128, -74.006]} label="Your Vehicle" />
      <Telemetry />
      <DocumentUpload />
      <DocumentsList />
      <Notifications />
      <CheckInOut />
      <EmergencyTrigger />
      <VoiceAssistant />
    </Layout>
  );
};

export default DriverDashboard;
