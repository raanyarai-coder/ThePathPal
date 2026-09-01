import type { StyleSpecification } from 'maplibre-gl';

/**
 * OpenStreetMap tile attribution required by OSM Tile Usage Policy.
 */
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

/**
 * Standard OpenStreetMap Raster Style Specification for MapLibre GL JS.
 * Used by default if no custom vector style URL is provided via VITE_MAP_STYLE_URL.
 */
export const DEFAULT_OSM_STYLE: StyleSpecification = {
  version: 8,
  name: 'PathPal OpenStreetMap Default',
  sources: {
    'osm-raster-tiles': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: OSM_ATTRIBUTION,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-raster-layer',
      type: 'raster',
      source: 'osm-raster-tiles',
      minzoom: 0,
      maxzoom: 19,
      paint: {
        'raster-opacity': 1.0,
      },
    },
  ],
};

/**
 * Resolves the active map style (custom vector URL or default OSM raster spec).
 */
export function getMapStyle(): string | StyleSpecification {
  const envStyleUrl = import.meta.env.VITE_MAP_STYLE_URL;
  if (envStyleUrl && typeof envStyleUrl === 'string' && envStyleUrl.trim()) {
    return envStyleUrl.trim();
  }
  return DEFAULT_OSM_STYLE;
}
