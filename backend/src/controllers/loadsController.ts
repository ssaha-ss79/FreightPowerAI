import { Request, Response } from 'express';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAvailableLoads = async (req: Request, res: Response) => {
  try {
    const { status = 'available', lat, lon, radius } = req.query;
    console.log('[LOADS] getAvailableLoads called with status:', status);
    
    let loads;
    if (lat && lon && radius) {
      // TODO: implement geospatial filtering
      loads = await prisma.load.findMany({ where: { status: String(status) } });
    } else {
      loads = await prisma.load.findMany({ where: { status: String(status) } });
    }
    console.log('[LOADS] Found loads:', loads.length);
    res.json(loads);
  } catch (err) {
    console.error('[LOADS] Error fetching loads:', err);
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
    console.log('[LOADS] bookLoad called with load_id:', load_id, 'driver_id:', driver_id);
    
    if (!driver_id) return res.status(400).json({ error: 'driver_id required' });
    
    // Check if driver exists
    const driver = await prisma.driver.findUnique({ where: { id: driver_id } });
    if (!driver) {
      console.error('[LOADS] Driver not found:', driver_id);
      return res.status(404).json({ error: 'Driver not found. Please ensure you are registered as a driver.' });
    }
    
    const load = await prisma.load.findUnique({ where: { id: load_id } });
    if (!load) return res.status(404).json({ error: 'Load not found' });
    if (load.status !== 'available') return res.status(409).json({ error: 'Load not available' });
    
    const updated = await prisma.load.update({
      where: { id: load_id },
      data: { status: 'booked', booked_by_driver_id: driver_id, booked_at: new Date().toISOString() }
    });
    
    console.log('[LOADS] Load booked successfully:', updated.id);
    res.json({ status: 'success', load: updated });
  } catch (err) {
    console.error('[LOADS] Error booking load:', err);
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
    console.log('[LOADS] cancelLoad called with load_id:', load_id, 'driver_id:', driver_id);
    
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
    
    console.log('[LOADS] Load cancelled successfully:', updated.id);
    res.json({ status: 'success', load: updated });
  } catch (err) {
    console.error('[LOADS] Error cancelling load:', err);
    res.status(500).json({ 
      error: 'Failed to cancel load', 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
};

const addLoad = async (req: Request, res: Response) => {
  try {
    const { origin_location, destination_location, payload_description, payout_amount } = req.body;
    console.log('[LOADS] addLoad called with data:', req.body);
    
    if (!origin_location || !destination_location || !payload_description || !payout_amount) {
      return res.status(400).json({ error: 'All fields required: origin_location, destination_location, payload_description, payout_amount' });
    }
    
    const load = await prisma.load.create({
      data: {
        origin_location,
        destination_location,
        payload_description,
        payout_amount: parseFloat(payout_amount),
        status: 'available',
        created_at: new Date().toISOString()
      }
    });
    
    console.log('[LOADS] Load created successfully:', load.id);
    res.status(201).json({ status: 'success', load });
  } catch (err) {
    console.error('[LOADS] Error adding load:', err);
    res.status(500).json({ 
      error: 'Failed to add load', 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
};

export { getAvailableLoads, bookLoad, cancelLoad, addLoad };
