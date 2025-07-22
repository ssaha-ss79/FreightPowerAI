import { Request, Response } from 'express';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const checkin = async (req: Request, res: Response) => {
  try {
    const { driver_id, trip_id, location, timestamp } = req.body;
    if (!driver_id || !location || !timestamp) {
      return res.status(400).json({ error: 'driver_id, location, and timestamp required' });
    }
    const log = await prisma.checkinCheckoutLog.create({
      data: {
        driver_id,
        trip_id,
        type: 'yard_checkin',
        location,
        timestamp,
      },
    });
    res.status(201).json({ status: 'success', log_id: log.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record check-in', details: (err as any).message });
  }
};

const checkout = async (req: Request, res: Response) => {
  try {
    const { driver_id, trip_id, location, timestamp } = req.body;
    if (!driver_id || !location || !timestamp) {
      return res.status(400).json({ error: 'driver_id, location, and timestamp required' });
    }
    const log = await prisma.checkinCheckoutLog.create({
      data: {
        driver_id,
        trip_id,
        type: 'yard_checkout',
        location,
        timestamp,
      },
    });
    res.status(201).json({ status: 'success', log_id: log.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record check-out', details: (err as any).message });
  }
};

const dropoff = async (req: Request, res: Response) => {
  try {
    const { driver_id, trip_id, location, timestamp } = req.body;
    if (!driver_id || !location || !timestamp) {
      return res.status(400).json({ error: 'driver_id, location, and timestamp required' });
    }
    const log = await prisma.checkinCheckoutLog.create({
      data: {
        driver_id,
        trip_id,
        type: 'load_dropoff',
        location,
        timestamp,
      },
    });
    res.status(201).json({ status: 'success', log_id: log.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record drop-off', details: (err as any).message });
  }
};

export { checkin, checkout, dropoff };
