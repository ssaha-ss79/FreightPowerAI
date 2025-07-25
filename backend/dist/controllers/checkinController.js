"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropoff = exports.checkout = exports.checkin = void 0;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Check-in/Check-out Service
const checkin = async (req, res) => {
    try {
        const { driver_id, trip_id, location, timestamp, yard_details } = req.body;
        console.log('[CHECKIN] checkin called:', { driver_id, trip_id, location });
        if (!driver_id || !location || !timestamp) {
            return res.status(400).json({ error: 'Missing required fields: driver_id, location, timestamp' });
        }
        const enhancedLocation = {
            ...location,
            yard_name: yard_details?.yard_name || 'Unknown Yard',
            gate_number: yard_details?.gate_number || 'N/A',
            check_in_time: timestamp
        };
        const log = await prisma.checkinCheckoutLog.create({
            data: {
                driver_id,
                trip_id,
                type: 'yard_checkin',
                location: JSON.stringify(enhancedLocation),
                timestamp,
            },
        });
        console.log('[CHECKIN] Check-in recorded successfully');
        res.status(201).json({
            status: 'success',
            log_id: log.id,
            message: 'Check-in completed successfully',
            location: enhancedLocation
        });
    }
    catch (err) {
        console.error('[CHECKIN] Error recording check-in:', err);
        res.status(500).json({
            error: 'Failed to record check-in',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
exports.checkin = checkin;
const checkout = async (req, res) => {
    try {
        const { driver_id, trip_id, location, timestamp, checkout_details } = req.body;
        console.log('[CHECKOUT] checkout called:', { driver_id, trip_id, location });
        if (!driver_id || !location || !timestamp) {
            return res.status(400).json({ error: 'Missing required fields: driver_id, location, timestamp' });
        }
        const enhancedLocation = {
            ...location,
            yard_name: checkout_details?.yard_name || 'Unknown Yard',
            gate_number: checkout_details?.gate_number || 'N/A',
            check_out_time: timestamp,
            duration_minutes: checkout_details?.duration_minutes || 0
        };
        const log = await prisma.checkinCheckoutLog.create({
            data: {
                driver_id,
                trip_id,
                type: 'yard_checkout',
                location: JSON.stringify(enhancedLocation),
                timestamp,
            },
        });
        console.log('[CHECKOUT] Check-out recorded successfully');
        res.status(201).json({
            status: 'success',
            log_id: log.id,
            message: 'Check-out completed successfully',
            location: enhancedLocation
        });
    }
    catch (err) {
        console.error('[CHECKOUT] Error recording check-out:', err);
        res.status(500).json({
            error: 'Failed to record check-out',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
exports.checkout = checkout;
const dropoff = async (req, res) => {
    try {
        const { driver_id, trip_id, location, timestamp, load_details } = req.body;
        console.log('[DROPOFF] dropoff called:', { driver_id, trip_id, location });
        if (!driver_id || !location || !timestamp) {
            return res.status(400).json({ error: 'Missing required fields: driver_id, location, timestamp' });
        }
        const enhancedLocation = {
            ...location,
            delivery_address: load_details?.delivery_address || 'Unknown Address',
            recipient_name: load_details?.recipient_name || 'Unknown Recipient',
            delivery_time: timestamp,
            signature_received: load_details?.signature_received || false,
            damage_report: load_details?.damage_report || 'none'
        };
        const log = await prisma.checkinCheckoutLog.create({
            data: {
                driver_id,
                trip_id,
                type: 'load_dropoff',
                location: JSON.stringify(enhancedLocation),
                timestamp,
            },
        });
        // Update trip status if provided
        if (trip_id) {
            await prisma.trip.update({
                where: { id: trip_id },
                data: {
                    status: 'delivered',
                    actual_arrival_time: timestamp
                }
            });
        }
        console.log('[DROPOFF] Drop-off recorded successfully');
        res.status(201).json({
            status: 'success',
            log_id: log.id,
            message: 'Load drop-off completed successfully',
            location: enhancedLocation,
            trip_updated: !!trip_id
        });
    }
    catch (err) {
        console.error('[DROPOFF] Error recording drop-off:', err);
        res.status(500).json({
            error: 'Failed to record drop-off',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
exports.dropoff = dropoff;
