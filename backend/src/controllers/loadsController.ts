import { Request, Response } from 'express';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const getAvailableLoads = async (req: Request, res: Response) => {
  try {
    // Optional: filter by proximity, type, etc.
    const { status = 'available', lat, lon, radius } = req.query;
    let loads;
    if (lat && lon && radius) {
      // TODO: implement geospatial filtering
      loads = await prisma.load.findMany({ where: { status: String(status) } });
    } else {
      loads = await prisma.load.findMany({ where: { status: String(status) } });
    }
    res.json(loads);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch loads', 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
};

const bookLoad = async (req: Request, res: Response) => {
  try {
    const { load_id } = req.params;
    const { driver_id } = req.body;
    if (!driver_id) return res.status(400).json({ error: 'driver_id required' });
    const load = await prisma.load.findUnique({ where: { id: load_id } });
    if (!load) return res.status(404).json({ error: 'Load not found' });
    if (load.status !== 'available') return res.status(409).json({ error: 'Load not available' });
    const updated = await prisma.load.update({
      where: { id: load_id },
      data: { status: 'booked', booked_by_driver_id: driver_id, booked_at: new Date().toISOString() }
    });
    res.json({ status: 'success', load: updated });
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to book load', 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
};

const cancelLoad = async (req: Request, res: Response) => {
  try {
    const { load_id } = req.params;
    const { driver_id } = req.body;
    if (!driver_id) return res.status(400).json({ error: 'driver_id required' });
    const load = await prisma.load.findUnique({ where: { id: load_id } });
    if (!load) return res.status(404).json({ error: 'Load not found' });
    if (load.status !== 'booked' || load.booked_by_driver_id !== driver_id) {
      return res.status(409).json({ error: 'Load not booked by this driver' });
    }
    const updated = await prisma.load.update({
      where: { id: load_id },
      data: { status: 'available', booked_by_driver_id: null, booked_at: null }
    });
    res.json({ status: 'success', load: updated });
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to cancel load', 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
};

export { getAvailableLoads, bookLoad, cancelLoad };
