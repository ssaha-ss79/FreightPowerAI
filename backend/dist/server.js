"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const cors = require('cors');
const http = require('http');
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const loads_1 = __importDefault(require("./routes/loads"));
const trips_1 = __importDefault(require("./routes/trips"));
const telemetry_1 = __importDefault(require("./routes/telemetry"));
const alerts_1 = __importDefault(require("./routes/alerts"));
const checkin_1 = __importDefault(require("./routes/checkin"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const documents_1 = __importDefault(require("./routes/documents"));
const dispatch_1 = __importDefault(require("./routes/dispatch"));
const emergency_1 = __importDefault(require("./routes/emergency"));
const route_1 = __importDefault(require("./routes/route"));
const fuel_1 = __importDefault(require("./routes/fuel"));
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
app.get('/health', (req, res) => res.json({ status: 'ok' }));
// Auth routes (public)
app.use('/auth', auth_1.default);
// User routes (public registration only)
app.use('/users', users_1.default);
// Protect all routes below this middleware
app.use(authenticateToken);
// Other user routes (protected)
// ...existing code...
// Loads routes
app.use('/api/v1/loads', loads_1.default);
// Route navigation routes
app.use('/api/v1/route', route_1.default);
// Fuel monitoring routes  
app.use('/api/v1/fuel', fuel_1.default);
// Trips routes
app.use('/api/v1/trips', trips_1.default);
// Telemetry routes
app.use('/api/v1/telemetry', telemetry_1.default);
// Alerts routes
app.use('/api/v1/alerts', alerts_1.default);
// Check-in/out routes
app.use('/api/v1/checkin', checkin_1.default);
// Notifications routes
app.use('/api/v1/notifications', notifications_1.default);
// Documents routes
app.use('/api/v1/documents', documents_1.default);
// Dispatch routes
app.use('/api/v1/dispatch', dispatch_1.default);
// Emergency routes
app.use('/api/v1/emergency', emergency_1.default);
// Centralized error handler
app.use(errorHandler);
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
