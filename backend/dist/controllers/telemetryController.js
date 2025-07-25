"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearestStation = exports.getFuelStatus = void 0;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getFuelStatus = async (req, res) => {
    try {
        const { vehicle_id } = req.params;
        if (!vehicle_id)
            return res.status(400).json({ error: 'vehicle_id required' });
        // Get latest telemetry log for vehicle
        const log = await prisma.vehicleTelemetryLog.findFirst({
            where: { vehicle_id },
            orderBy: { timestamp: 'desc' },
        });
        if (!log)
            return res.status(404).json({ error: 'No telemetry logs found for vehicle' });
        res.json({
            fuel_level_percent: log.fuel_level_percent,
            last_updated_at: log.timestamp,
            odometer_km: log.odometer_km,
            location: { lat: log.latitude, lon: log.longitude },
            speed_kph: log.speed_kph,
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get fuel status', details: err.message });
    }
};
exports.getFuelStatus = getFuelStatus;
const getNearestStation = async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon)
            return res.status(400).json({ error: 'lat and lon required' });
        // TODO: Integrate with real fuel station API
        res.json([
            {
                name: 'Fuel Station 1',
                address: '123 Main St',
                distance_km: 2.5,
                latitude: Number(lat) + 0.01,
                longitude: Number(lon) + 0.01,
            },
            {
                name: 'Fuel Station 2',
                address: '456 Oak Ave',
                distance_km: 4.2,
                latitude: Number(lat) - 0.01,
                longitude: Number(lon) - 0.01,
            },
        ]);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get nearest station', details: err.message });
    }
};
exports.getNearestStation = getNearestStation;
