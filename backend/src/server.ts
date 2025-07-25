require('dotenv').config();
import mapsRoutes from './routes/maps';
import { Request, Response, NextFunction } from 'express';
const express = require('express');
const cors = require('cors');
const http = require('http');
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import loadsRoutes from './routes/loads';
import tripsRoutes from './routes/trips';
import telemetryRoutes from './routes/telemetry';
import alertsRoutes from './routes/alerts';
import checkinRoutes from './routes/checkin';
import notificationsRoutes from './routes/notifications';
import documentsRoutes from './routes/documents';
import dispatchRoutes from './routes/dispatch';
import emergencyRoutes from './routes/emergency';
import routeRoutes from './routes/route';
import fuelRoutes from './routes/fuel';
const { authenticateToken } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./websocket/socket');

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
initSocket(server);

app.use(cors());
app.use(express.json());

// Health check (public)
app.get('/health', (req: Request, res: Response) => res.json({ status: 'ok' }));
// Google Maps proxy routes (public)
app.use('/api/maps', mapsRoutes);

// Health check (public)
app.get('/health', (req: Request, res: Response) => res.json({ status: 'ok' }));

// Auth routes (public)
app.use('/auth', authRoutes);
// User routes (public registration only)
app.use('/users', userRoutes);

// Protect all routes below this middleware
app.use(authenticateToken);

// Other user routes (protected)
// ...existing code...
// Loads routes
app.use('/api/v1/loads', loadsRoutes);
// Route navigation routes
app.use('/api/v1/route', routeRoutes);
// Fuel monitoring routes  
app.use('/api/v1/fuel', fuelRoutes);
// Trips routes
app.use('/api/v1/trips', tripsRoutes);
// Telemetry routes
app.use('/api/v1/telemetry', telemetryRoutes);
// Alerts routes
app.use('/api/v1/alerts', alertsRoutes);
// Check-in/out routes
app.use('/api/v1/checkin', checkinRoutes);
// Notifications routes
app.use('/api/v1/notifications', notificationsRoutes);
// Documents routes
app.use('/api/v1/documents', documentsRoutes);
// Dispatch routes
app.use('/api/v1/dispatch', dispatchRoutes);
// Emergency routes
app.use('/api/v1/emergency', emergencyRoutes);

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
