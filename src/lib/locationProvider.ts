import { HospitalLocation } from '../types';

export interface LocationProvider {
  searchHospitals(query: string, signal?: AbortSignal): Promise<HospitalLocation[]>;
  getPlaceDetails(placeId: string, signal?: AbortSignal): Promise<HospitalLocation | null>;
  reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<string | null>;
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
  estimateWalkingEta(distanceMeters: number): { minutes: number; formatted: string };
}

// In-memory LRU-like cache for geocoding queries
const searchCache = new Map<string, { timestamp: number; data: HospitalLocation[] }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

/**
 * Curated hospital catalog for instant response, high reliability, and fallback.
 */
const KNOWN_HEALTHCARE_CENTERS: HospitalLocation[] = [
  {
    name: 'NYU Langone Health - Tisch Hospital',
    address: '550 1st Avenue, New York, NY 10016',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    latitude: 40.7421,
    longitude: -73.9741,
    providerPlaceId: 'osm-node-nyu-langone',
    category: 'Hospital / Academic Medical Center',
  },
  {
    name: 'Mount Sinai Hospital',
    address: '1468 Madison Avenue, New York, NY 10029',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    latitude: 40.7903,
    longitude: -73.9528,
    providerPlaceId: 'osm-node-mount-sinai',
    category: 'Hospital / Regional Medical Center',
  },
  {
    name: 'NewYork-Presbyterian / Columbia University Irving Medical Center',
    address: '630 W 168th Street, New York, NY 10032',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    latitude: 40.8413,
    longitude: -73.9426,
    providerPlaceId: 'osm-node-nyp-columbia',
    category: 'Hospital / Tertiary Care Center',
  },
  {
    name: 'Memorial Sloan Kettering Cancer Center',
    address: '1275 York Avenue, New York, NY 10065',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    latitude: 40.7644,
    longitude: -73.9567,
    providerPlaceId: 'osm-node-mskcc',
    category: 'Hospital / Oncology Pavilion',
  },
  {
    name: 'Johns Hopkins Hospital',
    address: '1800 Orleans Street, Baltimore, MD 21287',
    city: 'Baltimore',
    state: 'MD',
    country: 'United States',
    latitude: 39.2974,
    longitude: -76.5928,
    providerPlaceId: 'osm-node-johns-hopkins',
    category: 'Hospital / Academic Medical Center',
  },
  {
    name: 'Massachusetts General Hospital',
    address: '55 Fruit Street, Boston, MA 02114',
    city: 'Boston',
    state: 'MA',
    country: 'United States',
    latitude: 42.3629,
    longitude: -71.0694,
    providerPlaceId: 'osm-node-mass-general',
    category: 'Hospital / Trauma Center',
  },
  {
    name: 'Stanford Health Care',
    address: '300 Pasteur Drive, Stanford, CA 94305',
    city: 'Stanford',
    state: 'CA',
    country: 'United States',
    latitude: 37.4348,
    longitude: -122.1764,
    providerPlaceId: 'osm-node-stanford-health',
    category: 'Hospital / Academic Medical Center',
  },
  {
    name: 'UCSF Medical Center at Mission Bay',
    address: '1855 4th Street, San Francisco, CA 94158',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    latitude: 37.7681,
    longitude: -122.3912,
    providerPlaceId: 'osm-node-ucsf-mission-bay',
    category: 'Hospital / Specialty Center',
  },
  {
    name: 'Cedars-Sinai Medical Center',
    address: '8700 Beverly Boulevard, Los Angeles, CA 90048',
    city: 'Los Angeles',
    state: 'CA',
    country: 'United States',
    latitude: 34.0754,
    longitude: -118.3804,
    providerPlaceId: 'osm-node-cedars-sinai',
    category: 'Hospital / Tertiary Care Center',
  },
  {
    name: 'Cleveland Clinic Main Campus',
    address: '9500 Euclid Avenue, Cleveland, OH 44195',
    city: 'Cleveland',
    state: 'OH',
    country: 'United States',
    latitude: 41.5033,
    longitude: -81.6214,
    providerPlaceId: 'osm-node-cleveland-clinic',
    category: 'Hospital / Academic Medical Center',
  },
  {
    name: 'Mayo Clinic Hospital - Saint Marys Campus',
    address: '1216 2nd Street SW, Rochester, MN 55902',
    city: 'Rochester',
    state: 'MN',
    country: 'United States',
    latitude: 44.0204,
    longitude: -92.4851,
    providerPlaceId: 'osm-node-mayo-clinic',
    category: 'Hospital / Academic Medical Center',
  },
  {
    name: 'Northwestern Memorial Hospital',
    address: '251 E Huron Street, Chicago, IL 60611',
    city: 'Chicago',
    state: 'IL',
    country: 'United States',
    latitude: 41.8954,
    longitude: -87.6206,
    providerPlaceId: 'osm-node-northwestern-memorial',
    category: 'Hospital / Academic Medical Center',
  },
  {
    name: 'Penn Medicine - Hospital of the University of Pennsylvania',
    address: '3400 Spruce Street, Philadelphia, PA 19104',
    city: 'Philadelphia',
    state: 'PA',
    country: 'United States',
    latitude: 39.9502,
    longitude: -75.1939,
    providerPlaceId: 'osm-node-penn-medicine',
    category: 'Hospital / Academic Medical Center',
  },
  {
    name: 'Houston Methodist Hospital',
    address: '6565 Fannin Street, Houston, TX 77030',
    city: 'Houston',
    state: 'TX',
    country: 'United States',
    latitude: 29.7118,
    longitude: -95.3995,
    providerPlaceId: 'osm-node-houston-methodist',
    category: 'Hospital / Texas Medical Center',
  },
  {
    name: 'Seattle Children’s Hospital',
    address: '4800 Sand Point Way NE, Seattle, WA 98105',
    city: 'Seattle',
    state: 'WA',
    country: 'United States',
    latitude: 47.6626,
    longitude: -122.2829,
    providerPlaceId: 'osm-node-seattle-childrens',
    category: 'Hospital / Pediatric Specialty',
  },
];

/**
 * OpenStreetMap Nominatim & Photon compatible location provider.
 */
class OsmLocationProvider implements LocationProvider {
  private customApiUrl: string;

  constructor() {
    this.customApiUrl = (import.meta.env.VITE_GEOCODING_API_URL || '').trim();
  }

  async searchHospitals(query: string, signal?: AbortSignal): Promise<HospitalLocation[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      return [];
    }

    const normalizedQuery = trimmed.toLowerCase();

    // Check cache
    const cached = searchCache.get(normalizedQuery);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    // 1. Local curated search for instant matches
    const localMatches = KNOWN_HEALTHCARE_CENTERS.filter(
      (h) =>
        h.name.toLowerCase().includes(normalizedQuery) ||
        h.address.toLowerCase().includes(normalizedQuery) ||
        h.city?.toLowerCase().includes(normalizedQuery) ||
        h.state?.toLowerCase().includes(normalizedQuery)
    );

    try {
      // 2. Query OSM Geocoding Provider
      let fetchedLocations: HospitalLocation[] = [];

      const searchTerms = trimmed.toLowerCase().includes('hospital') || trimmed.toLowerCase().includes('clinic') || trimmed.toLowerCase().includes('medical')
        ? trimmed
        : `${trimmed} hospital`;

      if (this.customApiUrl) {
        // Custom OSM provider endpoint (ensure proper endpoint format)
        const baseUrl = this.customApiUrl.replace(/\/+$/, '');
        const searchEndpoint = baseUrl.endsWith('/search') ? baseUrl : `${baseUrl}/search`;
        const endpoint = `${searchEndpoint}?format=json&q=${encodeURIComponent(
          searchTerms
        )}&addressdetails=1&limit=8&extratags=1`;

        const res = await fetch(endpoint, {
          signal,
          headers: {
            Accept: 'application/json',
            'User-Agent': 'PathPal-Hospital-Navigation/1.0',
          },
        });
        if (res.ok) {
          const data = await res.json();
          fetchedLocations = this.transformNominatimResults(data);
        }
      } else {
        // Query OpenStreetMap Nominatim with healthcare / hospital filter
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchTerms
        )}&addressdetails=1&limit=8&extratags=1`;

        const res = await fetch(nominatimUrl, {
          signal,
          headers: {
            Accept: 'application/json',
            'User-Agent': 'PathPal-Hospital-Navigation/1.0',
          },
        });

        if (res.ok) {
          const data = await res.json();
          fetchedLocations = this.transformNominatimResults(data);
        }
      }

      // Prioritize live search results first, then fill with unique local matches
      const combined = [...fetchedLocations];
      for (const loc of localMatches) {
        const isDuplicate = combined.some(
          (c) =>
            Math.abs(c.latitude - loc.latitude) < 0.001 &&
            Math.abs(c.longitude - loc.longitude) < 0.001
        );
        if (!isDuplicate) {
          combined.push(loc);
        }
      }

      const results = combined.slice(0, 8);
      searchCache.set(normalizedQuery, { timestamp: Date.now(), data: results });
      return results;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw err;
      }
      console.warn('[LocationProvider] OSM search fallback triggered:', err?.message);
      // Return local healthcare matches on network or rate-limit error
      return localMatches;
    }
  }

  private transformNominatimResults(data: any[]): HospitalLocation[] {
    if (!Array.isArray(data)) return [];

    return data
      .filter((item) => {
        const type = item.type || '';
        const category = item.category || item.class || '';
        const name = (item.display_name || '').toLowerCase();
        // Keep healthcare, hospital, clinic, doctors, emergency, health
        return (
          category === 'amenity' ||
          category === 'healthcare' ||
          type === 'hospital' ||
          type === 'clinic' ||
          type === 'doctors' ||
          name.includes('hospital') ||
          name.includes('medical') ||
          name.includes('clinic') ||
          name.includes('health') ||
          name.includes('center') ||
          name.includes('care')
        );
      })
      .map((item) => {
        const addr = item.address || {};
        const road = addr.road || addr.street || '';
        const houseNumber = addr.house_number || '';
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
        const state = addr.state || '';
        const country = addr.country || '';

        const streetLine = [houseNumber, road].filter(Boolean).join(' ');
        const cityState = [city, state].filter(Boolean).join(', ');
        const fullAddress = [streetLine, cityState, country].filter(Boolean).join(' - ') || item.display_name;

        // Clean up title name
        let cleanName = item.name;
        if (!cleanName && item.display_name) {
          cleanName = item.display_name.split(',')[0];
        }

        return {
          name: cleanName || 'Medical Facility',
          address: fullAddress,
          city,
          state,
          country,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          providerPlaceId: String(item.place_id || item.osm_id || `osm-${item.lat}-${item.lon}`),
          category: item.type ? `Healthcare (${item.type})` : 'Medical Campus',
          rawType: item.type,
        };
      });
  }

  async getPlaceDetails(placeId: string, signal?: AbortSignal): Promise<HospitalLocation | null> {
    const matchedLocal = KNOWN_HEALTHCARE_CENTERS.find((h) => h.providerPlaceId === placeId);
    if (matchedLocal) return matchedLocal;

    try {
      const url = `https://nominatim.openstreetmap.org/details?place_id=${encodeURIComponent(
        placeId
      )}&format=json&addressdetails=1`;
      const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        name: data.localname || data.names?.name || 'Healthcare Facility',
        address: data.extratags?.['addr:full'] || 'Hospital Campus',
        latitude: parseFloat(data.geometry?.coordinates?.[1] || data.lat),
        longitude: parseFloat(data.geometry?.coordinates?.[0] || data.lon),
        providerPlaceId: placeId,
        category: 'Hospital Facility',
      };
    } catch {
      return null;
    }
  }

  async reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<string | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
      if (!res.ok) return null;
      const data = await res.json();
      return data.display_name || null;
    } catch {
      return null;
    }
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  estimateWalkingEta(distanceMeters: number): { minutes: number; formatted: string } {
    // Average walking speed ~ 1.3 m/s (~3.0 mph)
    const totalSeconds = Math.max(30, Math.round(distanceMeters / 1.3));
    const minutes = Math.round(totalSeconds / 60);
    const formatted = minutes <= 1 ? '1 min walking' : `${minutes} mins walking`;
    return { minutes, formatted };
  }
}

// Export singleton instance
export const locationProvider: LocationProvider = new OsmLocationProvider();
