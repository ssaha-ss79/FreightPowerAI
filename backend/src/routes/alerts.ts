import express from 'express';
import * as alertsController from '../controllers/alertsController';

const alertsRouter = express.Router();


// Public endpoint for dashboard alerts
alertsRouter.get('/', (req, res) => {
  res.json([
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
  ]);
});

alertsRouter.get('/weather', alertsController.getWeatherAlerts);
alertsRouter.get('/traffic', alertsController.getTrafficAlerts);

export default alertsRouter;
