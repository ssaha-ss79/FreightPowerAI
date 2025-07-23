import { Request, Response } from 'express';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Emergency Assistance Service
const triggerEmergency = async (req: Request, res: Response) => {
  try {
    const { driver_id, location, vehicle_data, status, notes, emergency_type } = req.body;
    console.log('[EMERGENCY] triggerEmergency called:', { driver_id, emergency_type, location });
    
    if (!driver_id || !location || !vehicle_data || !status) {
      return res.status(400).json({ error: 'Missing required fields: driver_id, location, vehicle_data, status' });
    }
    
    // Enhance vehicle data snapshot with comprehensive information
    const enhancedVehicleData = {
      ...vehicle_data,
      emergency_triggered_at: new Date().toISOString(),
      gps_coordinates: location,
      emergency_type: emergency_type || 'general',
      vehicle_status: {
        fuel_level: vehicle_data.fuel_level || 'unknown',
        engine_status: vehicle_data.engine_status || 'unknown',
        tire_pressure: vehicle_data.tire_pressure || 'unknown',
        brake_status: vehicle_data.brake_status || 'unknown',
        temperature: vehicle_data.temperature || 'unknown'
      }
    };
    
    const log = await prisma.emergencyLog.create({
      data: {
        driver_id,
        timestamp: new Date().toISOString(),
        location: JSON.stringify(location),
        vehicle_data_snapshot: JSON.stringify(enhancedVehicleData),
        status,
        notes: notes || `Emergency triggered: ${emergency_type || 'general'}`,
      },
    });
    
    // Simulate emergency service notification (in real implementation, integrate with emergency APIs)
    const emergencyResponse = {
      emergency_id: log.id,
      status: 'emergency_triggered',
      response_team_notified: true,
      estimated_response_time_minutes: Math.floor(Math.random() * 20) + 15, // 15-35 minutes
      emergency_contact_numbers: [
        { service: 'Emergency Services', number: '911' },
        { service: 'Company Emergency Line', number: '+1-800-FREIGHT' },
        { service: 'Roadside Assistance', number: '+1-800-ROADHELP' }
      ],
      instructions: [
        'Stay with your vehicle if safe to do so',
        'Turn on hazard lights',
        'Set up emergency triangles if available',
        'Wait for emergency response team',
        'Keep communication device charged'
      ]
    };
    
    console.log('[EMERGENCY] Emergency triggered successfully');
    res.status(201).json({ 
      status: 'emergency_triggered', 
      log_id: log.id,
      emergency_response: emergencyResponse
    });
  } catch (err) {
    console.error('[EMERGENCY] Error triggering emergency:', err);
    res.status(500).json({ 
      error: 'Failed to trigger emergency', 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
};

const getEmergencyStatus = async (req: Request, res: Response) => {
  try {
    const { emergency_id } = req.params;
    console.log('[EMERGENCY] getEmergencyStatus called for ID:', emergency_id);
    
    if (!emergency_id) {
      return res.status(400).json({ error: 'Emergency ID required' });
    }
    
    const emergencyLog = await prisma.emergencyLog.findUnique({
      where: { id: emergency_id }
    });
    
    if (!emergencyLog) {
      return res.status(404).json({ error: 'Emergency log not found' });
    }
    
    const statusUpdate = {
      emergency_id,
      current_status: emergencyLog.status,
      timestamp: emergencyLog.timestamp,
      location: JSON.parse(emergencyLog.location),
      response_progress: {
        team_dispatched: true,
        estimated_arrival: new Date(Date.now() + 1200000).toISOString(), // 20 minutes
        current_eta_minutes: Math.floor(Math.random() * 15) + 10
      }
    };
    
    console.log('[EMERGENCY] Emergency status retrieved');
    res.json({ status: 'success', emergency_status: statusUpdate });
  } catch (err) {
    console.error('[EMERGENCY] Error getting emergency status:', err);
    res.status(500).json({ 
      error: 'Failed to get emergency status', 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
};

export { triggerEmergency, getEmergencyStatus };
