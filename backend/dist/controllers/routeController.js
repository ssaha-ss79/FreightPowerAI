"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rerouteTrip = exports.getRouteStatus = exports.planRoute = void 0;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Route Navigation Service
const planRoute = async (req, res) => {
    try {
        const { origin, destination, trip_id } = req.body;
        console.log('[ROUTE] planRoute called:', { origin, destination, trip_id });
        if (!origin || !destination) {
            return res.status(400).json({ error: 'Origin and destination required' });
        }
        // Simulate route planning (in real implementation, use Google Maps/Mapbox API)
        const routeData = {
            distance_km: Math.floor(Math.random() * 500) + 100,
            duration_minutes: Math.floor(Math.random() * 300) + 120,
            route_polyline: 'sample_polyline_data_' + Date.now(),
            waypoints: [origin, destination],
            traffic_conditions: 'moderate',
            estimated_fuel_cost: Math.floor(Math.random() * 5000) + 2000
        };
        // If trip_id provided, update the trip with route information
        if (trip_id) {
            await prisma.trip.update({
                where: { id: trip_id },
                data: {
                    route_polyline: routeData.route_polyline,
                    estimated_arrival_time: new Date(Date.now() + routeData.duration_minutes * 60000).toISOString()
                }
            });
        }
        console.log('[ROUTE] Route planned successfully');
        res.json({ status: 'success', route: routeData });
    }
    catch (err) {
        console.error('[ROUTE] Error planning route:', err);
        res.status(500).json({
            error: 'Failed to plan route',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
exports.planRoute = planRoute;
const getRouteStatus = async (req, res) => {
    try {
        const { trip_id } = req.query;
        console.log('[ROUTE] getRouteStatus called for trip:', trip_id);
        if (!trip_id) {
            return res.status(400).json({ error: 'trip_id query parameter required' });
        }
        const trip = await prisma.trip.findUnique({ where: { id: trip_id } });
        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }
        // Simulate current route status
        const routeStatus = {
            trip_id: trip_id,
            current_location: trip.current_location,
            estimated_arrival_time: trip.estimated_arrival_time,
            distance_remaining_km: Math.floor(Math.random() * 200) + 50,
            duration_remaining_minutes: Math.floor(Math.random() * 180) + 60,
            next_turn: 'Turn right in 2.5 km on Highway 101',
            traffic_delay_minutes: Math.floor(Math.random() * 30),
            status: trip.status
        };
        console.log('[ROUTE] Route status retrieved');
        res.json({ status: 'success', route_status: routeStatus });
    }
    catch (err) {
        console.error('[ROUTE] Error getting route status:', err);
        res.status(500).json({
            error: 'Failed to get route status',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
exports.getRouteStatus = getRouteStatus;
const rerouteTrip = async (req, res) => {
    try {
        const { trip_id, reason, avoid_tolls, avoid_highways } = req.body;
        console.log('[ROUTE] rerouteTrip called:', { trip_id, reason });
        if (!trip_id) {
            return res.status(400).json({ error: 'Trip ID required' });
        }
        const trip = await prisma.trip.findUnique({ where: { id: trip_id } });
        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }
        // Simulate rerouting (in real implementation, call mapping API with constraints)
        const newRoute = {
            route_polyline: 'rerouted_polyline_' + Date.now(),
            distance_km: Math.floor(Math.random() * 100) + 50,
            duration_minutes: Math.floor(Math.random() * 60) + 30,
            reason_for_reroute: reason || 'traffic_congestion',
            avoid_tolls: avoid_tolls || false,
            avoid_highways: avoid_highways || false,
            estimated_arrival_time: new Date(Date.now() + (Math.floor(Math.random() * 60) + 30) * 60000).toISOString()
        };
        // Update trip with new route
        await prisma.trip.update({
            where: { id: trip_id },
            data: {
                route_polyline: newRoute.route_polyline,
                estimated_arrival_time: newRoute.estimated_arrival_time
            }
        });
        console.log('[ROUTE] Trip rerouted successfully');
        res.json({ status: 'success', new_route: newRoute });
    }
    catch (err) {
        console.error('[ROUTE] Error rerouting trip:', err);
        res.status(500).json({
            error: 'Failed to reroute trip',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
exports.rerouteTrip = rerouteTrip;
