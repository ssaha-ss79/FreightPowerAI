"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rerouteTrip = exports.getRouteStatus = exports.planRoute = void 0;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const planRoute = async (req, res) => {
    try {
        const { origin, destination, driver_preferences, driver_id, load_id } = req.body;
        if (!origin || !destination || !driver_id || !load_id) {
            return res.status(400).json({ error: 'origin, destination, driver_id, and load_id required' });
        }
        // TODO: Integrate with mapping API for real route/ETA
        const fakePolyline = 'encoded_polyline_string';
        const fakeETA = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        const trip = await prisma.trip.create({
            data: {
                driver_id,
                load_id,
                start_time: new Date().toISOString(),
                end_time: null,
                current_location: JSON.stringify(origin),
                route_polyline: fakePolyline,
                estimated_arrival_time: fakeETA,
                status: 'active',
                created_at: new Date().toISOString(),
            },
        });
        res.json({ trip_id: trip.id, route_polyline: trip.route_polyline, eta: trip.estimated_arrival_time });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to plan route', details: err.message });
    }
};
exports.planRoute = planRoute;
const getRouteStatus = async (req, res) => {
    try {
        const { trip_id } = req.params;
        const trip = await prisma.trip.findUnique({ where: { id: trip_id } });
        if (!trip)
            return res.status(404).json({ error: 'Trip not found' });
        // TODO: Calculate distance_remaining, next_turn_instruction
        res.json({
            current_location: JSON.parse(trip.current_location),
            eta: trip.estimated_arrival_time,
            distance_remaining: 100, // stub
            next_turn_instruction: 'Turn right in 500m', // stub
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get route status', details: err.message });
    }
};
exports.getRouteStatus = getRouteStatus;
const rerouteTrip = async (req, res) => {
    try {
        const { trip_id } = req.params;
        const { current_location, reason } = req.body;
        const trip = await prisma.trip.findUnique({ where: { id: trip_id } });
        if (!trip)
            return res.status(404).json({ error: 'Trip not found' });
        // TODO: Integrate with mapping API for new route/ETA
        const newPolyline = 'new_encoded_polyline';
        const newETA = new Date(Date.now() + 90 * 60 * 1000).toISOString();
        const updated = await prisma.trip.update({
            where: { id: trip_id },
            data: {
                route_polyline: newPolyline,
                estimated_arrival_time: newETA,
                current_location: JSON.stringify(current_location),
                status: 'rerouted',
            },
        });
        res.json({ new_route_polyline: updated.route_polyline, new_eta: updated.estimated_arrival_time });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to reroute trip', details: err.message });
    }
};
exports.rerouteTrip = rerouteTrip;
