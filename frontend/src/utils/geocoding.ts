// Geocoding and places utilities using backend proxy

export interface LatLng {
  lat: number;
  lng: number;
}

interface GeocodingResult {
  formatted_address: string;
  geometry: {
    location: LatLng;
  };
  place_id: string;
}

interface NearbyPlace {
  name: string;
  formatted_address: string;
  geometry: {
    location: LatLng;
  };
  rating?: number;
  distance?: number;
}

// Mock geocoding function - replace with actual Google Maps API call
export const geocodeAddress = async (address: string): Promise<LatLng | null> => {
  try {
    // Use backend proxy for geocoding
    const response = await fetch(`/api/maps/geocode?address=${encodeURIComponent(address)}`);
    const data = await response.json();
    if (data.status === 'OK' && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Mock function to find nearby places - replace with Google Places API
export const findNearbyPlaces = async (
  location: LatLng,
  type: 'gas_station' | 'truck_stop' | 'restaurant' | 'warehouse',
  radius: number = 5000
): Promise<NearbyPlace[]> => {
  try {
    // Use backend proxy for places
    const response = await fetch(`/api/maps/places?location=${location.lat},${location.lng}&type=${type}&radius=${radius}`);
    const data = await response.json();
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results.map((place: any) => ({
        name: place.name,
        formatted_address: place.vicinity,
        geometry: { location: place.geometry.location },
        rating: place.rating,
        distance: calculateDistance(location, place.geometry.location)
      }));
    }
    return [];
  } catch (error) {
    console.error('Places search error:', error);
    return [];
  }
}

// Google Places Autocomplete for destination input
export const getPlaceSuggestions = async (input: string): Promise<any[]> => {
  try {
    // Use backend proxy for autocomplete
    const response = await fetch(`/api/maps/autocomplete?input=${encodeURIComponent(input)}`);
    const data = await response.json();
    if (data.status === 'OK' && data.predictions.length > 0) {
      return data.predictions;
    }
    return [];
  } catch (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
};

// Calculate distance between two points
export const calculateDistance = (point1: LatLng, point2: LatLng): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * (Math.PI / 180);
  const dLng = (point2.lng - point1.lng) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * (Math.PI / 180)) * Math.cos(point2.lat * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
