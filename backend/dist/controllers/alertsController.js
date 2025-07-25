"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAlert = exports.getTrafficAlerts = exports.getWeatherAlerts = void 0;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Weather & Traffic Service Implementation
const getWeatherAlerts = async (req, res) => {
    try {
        const { latitude, longitude, route } = req.query;
        console.log('[WEATHER] getWeatherAlerts called:', { latitude, longitude, route });
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'latitude and longitude required' });
        }
        // Simulate weather alerts (in real implementation, integrate with OpenWeatherMap API)
        const weatherAlerts = [
            {
                id: 'weather_1',
                type: 'rain',
                description: 'Heavy rain expected in next 2 hours. Reduce speed and maintain safe distance.',
                location: `${latitude}, ${longitude}`,
                severity: 'medium',
                timestamp: new Date().toISOString(),
                weather_conditions: {
                    current_temp_celsius: 22,
                    humidity_percent: 85,
                    wind_speed_kmh: 25,
                    precipitation_probability: 90,
                    visibility_km: 2
                },
                advisory: 'Drive slowly and turn on headlights'
            },
            {
                id: 'weather_2',
                type: 'wind',
                description: 'Strong crosswinds expected on highway sections. Exercise caution.',
                location: `${latitude}, ${longitude}`,
                severity: 'high',
                timestamp: new Date(Date.now() - 300000).toISOString(),
                weather_conditions: {
                    current_temp_celsius: 25,
                    humidity_percent: 60,
                    wind_speed_kmh: 45,
                    precipitation_probability: 10,
                    visibility_km: 10
                },
                advisory: 'Maintain firm grip on steering wheel'
            },
            {
                id: 'weather_3',
                type: 'fog',
                description: 'Dense fog conditions expected early morning. Consider delayed departure.',
                location: `${latitude}, ${longitude}`,
                severity: 'high',
                timestamp: new Date(Date.now() + 21600000).toISOString(), // 6 hours ahead
                weather_conditions: {
                    current_temp_celsius: 12,
                    humidity_percent: 95,
                    wind_speed_kmh: 5,
                    precipitation_probability: 20,
                    visibility_km: 0.5
                },
                advisory: 'Use fog lights and reduce speed significantly'
            }
        ];
        console.log('[WEATHER] Weather alerts retrieved');
        res.json({
            status: 'success',
            weather_alerts: weatherAlerts,
            location: { latitude, longitude },
            route: route || null
        });
    }
    catch (err) {
        console.error('[WEATHER] Error getting weather alerts:', err);
        res.status(500).json({
            error: 'Failed to get weather alerts',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
exports.getWeatherAlerts = getWeatherAlerts;
const getTrafficAlerts = async (req, res) => {
    try {
        const { latitude, longitude, route } = req.query;
        console.log('[TRAFFIC] getTrafficAlerts called:', { latitude, longitude, route });
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'latitude and longitude required' });
        }
        // Simulate traffic alerts (in real implementation, integrate with TomTom/HERE Traffic API)
        const trafficAlerts = [
            {
                id: 'traffic_1',
                type: 'accident',
                description: 'Multi-vehicle accident on NH-4 eastbound. Right lane blocked.',
                location: `NH-4 near ${latitude}, ${longitude}`,
                severity: 'high',
                timestamp: new Date().toISOString(),
                impact_on_eta_minutes: 25,
                affected_area: {
                    start_km: 145,
                    end_km: 148,
                    lanes_affected: 2,
                    total_lanes: 4
                },
                alternative_route_available: true,
                estimated_clearance_time: new Date(Date.now() + 3600000).toISOString() // 1 hour
            },
            {
                id: 'traffic_2',
                type: 'construction',
                description: 'Road construction work ongoing. Speed limit reduced to 40 km/h.',
                location: `Highway 101 near ${latitude}, ${longitude}`,
                severity: 'medium',
                timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
                impact_on_eta_minutes: 15,
                affected_area: {
                    start_km: 89,
                    end_km: 95,
                    lanes_affected: 1,
                    total_lanes: 3
                },
                alternative_route_available: false,
                estimated_clearance_time: new Date(Date.now() + 7200000).toISOString() // 2 hours
            },
            {
                id: 'traffic_3',
                type: 'heavy_traffic',
                description: 'Heavy traffic congestion during rush hour. Expect delays.',
                location: `City Center near ${latitude}, ${longitude}`,
                severity: 'medium',
                timestamp: new Date().toISOString(),
                impact_on_eta_minutes: 20,
                affected_area: {
                    start_km: 12,
                    end_km: 18,
                    lanes_affected: 3,
                    total_lanes: 3
                },
                alternative_route_available: true,
                estimated_clearance_time: new Date(Date.now() + 5400000).toISOString() // 1.5 hours
            }
        ];
        console.log('[TRAFFIC] Traffic alerts retrieved');
        res.json({
            status: 'success',
            traffic_alerts: trafficAlerts,
            location: { latitude, longitude },
            route: route || null
        });
    }
    catch (err) {
        console.error('[TRAFFIC] Error getting traffic alerts:', err);
        res.status(500).json({
            error: 'Failed to get traffic alerts',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
exports.getTrafficAlerts = getTrafficAlerts;
// Create a new alert (fuel, weather, traffic, etc.)
const createAlert = async (req, res) => {
    try {
        const { type, description, location, severity, triggered_at, driver_id, trip_id, status } = req.body;
        if (!type || !description || !location || !severity || !triggered_at || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const alert = await prisma.alert.create({
            data: { type, description, location, severity, triggered_at, driver_id, trip_id, status },
        });
        res.status(201).json({ alert });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create alert', details: err.message });
    }
};
exports.createAlert = createAlert;
