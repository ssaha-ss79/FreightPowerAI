import { Request, Response } from 'express';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const triggerEmergency = async (req: Request, res: Response) => {
  try {
    const { driver_id, location, vehicle_data, status, notes } = req.body;
    if (!driver_id || !location || !vehicle_data || !status) {
      return res.status(400).json({ error: 'driver_id, location, vehicle_data, and status required' });
    }
    const log = await prisma.emergencyLog.create({
      data: {
        driver_id,
        timestamp: new Date().toISOString(),
        location,
        vehicle_data_snapshot: vehicle_data,
        status,
        notes,
      },
    });
    res.status(201).json({ status: 'emergency_triggered', log_id: log.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger emergency', details: (err as any).message });
  }
};

export { triggerEmergency };
