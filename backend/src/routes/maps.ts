import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Geocoding Proxy
router.get('/geocode', async (req, res) => {
  const address = String(req.query.address);
  if (!address) return res.status(400).json({ error: 'Missing address' });
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Google Maps API error', details: errorMsg });
  }
});


// const router = express.Router();
// const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Nearby Places Proxy
router.get('/places', async (req, res) => {
  const location = String(req.query.location);
  const type = String(req.query.type);
  const radius = req.query.radius ? String(req.query.radius) : '5000';
  if (!location || !type) return res.status(400).json({ error: 'Missing location or type' });
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Google Maps API error', details: errorMsg });
  }
});

// Autocomplete Proxy
router.get('/autocomplete', async (req, res) => {
  const input = String(req.query.input);
  if (!input) return res.status(400).json({ error: 'Missing input' });
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Google Maps API error', details: errorMsg });
  }
});

export default router;
