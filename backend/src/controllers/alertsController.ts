import { Request, Response } from 'express';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const getWeatherAlerts = async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });
    // TODO: Integrate with real weather API
    res.json([
      { type: 'rain', description: 'Heavy rain expected', severity: 'medium' },
      { type: 'wind', description: 'Strong winds', severity: 'high' },
    ]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get weather alerts', details: (err as any).message });
  }
};

const getTrafficAlerts = async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });
    // TODO: Integrate with real traffic API
    res.json([
      { type: 'accident', description: 'Accident on I-80', severity: 'high', impact_on_eta_minutes: 15 },
      { type: 'construction', description: 'Road work on Main St', severity: 'medium', impact_on_eta_minutes: 5 },
    ]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get traffic alerts', details: (err as any).message });
  }
};

// Create a new alert (fuel, weather, traffic, etc.)
const createAlert = async (req: Request, res: Response) => {
  try {
    const { type, description, location, severity, triggered_at, driver_id, trip_id, status } = req.body;
    if (!type || !description || !location || !severity || !triggered_at || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const alert = await prisma.alert.create({
      data: { type, description, location, severity, triggered_at, driver_id, trip_id, status },
    });
    res.status(201).json({ alert });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create alert', details: (err as any).message });
  }
};

export { getWeatherAlerts, getTrafficAlerts, createAlert };
