import { Request, Response } from 'express';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fuel Monitoring Service
const getFuelStatus = async (req: Request, res: Response) => {
  try {
    const { vehicle_id } = req.params;
    console.log('[FUEL] getFuelStatus called for vehicle:', vehicle_id);
    
    if (!vehicle_id) {
      return res.status(400).json({ error: 'Vehicle ID required' });
    }
    
    // Get latest telemetry data for the vehicle
    const latestTelemetry = await prisma.vehicleTelemetryLog.findFirst({
      where: { vehicle_id },
      orderBy: { timestamp: 'desc' }
    });
    
    if (!latestTelemetry) {
      // Simulate fuel data if no telemetry exists
      const simulatedFuelData = {
        vehicle_id,
        fuel_level_percent: Math.floor(Math.random() * 80) + 20, // 20-100%
        estimated_range_km: Math.floor(Math.random() * 400) + 100,
        fuel_efficiency_kmpl: 12.5 + Math.random() * 5, // 12.5-17.5 km/l
        last_updated: new Date().toISOString(),
        fuel_warning: false
      };
      
      if (simulatedFuelData.fuel_level_percent < 25) {
        simulatedFuelData.fuel_warning = true;
      }
      
      return res.json({ status: 'success', fuel_status: simulatedFuelData });
    }
    
    const fuelStatus = {
      vehicle_id,
      fuel_level_percent: latestTelemetry.fuel_level_percent,
      estimated_range_km: Math.floor(latestTelemetry.fuel_level_percent * 8), // Rough calculation
      fuel_efficiency_kmpl: 12.5 + Math.random() * 5,
      last_updated: latestTelemetry.timestamp,
      fuel_warning: latestTelemetry.fuel_level_percent < 25,
      location: {
        latitude: latestTelemetry.latitude,
        longitude: latestTelemetry.longitude
      }
    };
    
    console.log('[FUEL] Fuel status retrieved');
    res.json({ status: 'success', fuel_status: fuelStatus });
  } catch (err) {
    console.error('[FUEL] Error getting fuel status:', err);
    res.status(500).json({ 
      error: 'Failed to get fuel status', 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
};

const findNearestFuelStation = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius_km = 50 } = req.query;
    console.log('[FUEL] findNearestFuelStation called:', { latitude, longitude, radius_km });
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }
    
    // Simulate fuel station data (in real implementation, use Google Places API or similar)
    const fuelStations = [
      {
        id: 'station_1',
        name: 'Indian Oil Petrol Pump',
        address: 'Highway 101, Sector 15, Chennai',
        distance_km: Math.random() * parseFloat(radius_km as string),
        fuel_types: ['Petrol', 'Diesel', 'CNG'],
        amenities: ['ATM', 'Restroom', 'Food Court'],
        operating_hours: '24/7',
        latitude: parseFloat(latitude as string) + (Math.random() - 0.5) * 0.1,
        longitude: parseFloat(longitude as string) + (Math.random() - 0.5) * 0.1,
        price_per_liter: {
          petrol: 102.50 + Math.random() * 5,
          diesel: 89.75 + Math.random() * 5
        }
      },
      {
        id: 'station_2',
        name: 'Bharat Petroleum',
        address: 'Main Road, Industrial Area, Chennai',
        distance_km: Math.random() * parseFloat(radius_km as string),
        fuel_types: ['Petrol', 'Diesel'],
        amenities: ['ATM', 'Restroom'],
        operating_hours: '6:00 AM - 10:00 PM',
        latitude: parseFloat(latitude as string) + (Math.random() - 0.5) * 0.1,
        longitude: parseFloat(longitude as string) + (Math.random() - 0.5) * 0.1,
        price_per_liter: {
          petrol: 102.50 + Math.random() * 5,
          diesel: 89.75 + Math.random() * 5
        }
      },
      {
        id: 'station_3',
        name: 'Hindustan Petroleum',
        address: 'Ring Road, Commercial Complex, Chennai',
        distance_km: Math.random() * parseFloat(radius_km as string),
        fuel_types: ['Petrol', 'Diesel', 'CNG'],
        amenities: ['ATM', 'Restroom', 'Car Wash'],
        operating_hours: '24/7',
        latitude: parseFloat(latitude as string) + (Math.random() - 0.5) * 0.1,
        longitude: parseFloat(longitude as string) + (Math.random() - 0.5) * 0.1,
        price_per_liter: {
          petrol: 102.50 + Math.random() * 5,
          diesel: 89.75 + Math.random() * 5
        }
      }
    ];
    
    // Sort by distance
    fuelStations.sort((a, b) => a.distance_km - b.distance_km);
    
    console.log('[FUEL] Found', fuelStations.length, 'fuel stations');
    res.json({ 
      status: 'success', 
      fuel_stations: fuelStations,
      search_params: { latitude, longitude, radius_km }
    });
  } catch (err) {
    console.error('[FUEL] Error finding fuel stations:', err);
    res.status(500).json({ 
      error: 'Failed to find fuel stations', 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
};

export { getFuelStatus, findNearestFuelStation };
