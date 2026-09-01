import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapStyle } from './mapConfig';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface MapViewProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  className?: string;
  onMapReady?: (map: maplibregl.Map) => void;
  children?: React.ReactNode;
  interactive?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  center = [-73.9741, 40.7421], // Default: NYC
  zoom = 14,
  className = 'w-full h-64 rounded-2xl overflow-hidden',
  onMapReady,
  children,
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let map: maplibregl.Map | null = null;

    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getMapStyle(),
        center: [center[0], center[1]],
        zoom,
        interactive,
        attributionControl: {},
      });

      mapInstanceRef.current = map;

      // Add navigation controls
      if (interactive) {
        map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
        map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'imperial' }), 'bottom-left');
      }

      map.on('load', () => {
        setIsLoaded(true);
        setMapError(null);
        if (map && onMapReady) {
          onMapReady(map);
        }
      });

      map.on('error', (e) => {
        // Only trigger critical UI error if the style or tiles fail completely
        if (e.error && !isLoaded) {
          console.warn('[MapLibre] Map load event note:', e.error.message || e);
        }
      });
    } catch (err: any) {
      console.error('[MapLibre] Initialization error:', err);
      setMapError('Map temporarily unavailable.');
    }

    // Responsive container resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.resize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when props change
  useEffect(() => {
    if (mapInstanceRef.current && isLoaded && center) {
      mapInstanceRef.current.flyTo({
        center,
        zoom: zoom || 14,
        essential: true,
        duration: 800,
      });
    }
  }, [center[0], center[1], zoom, isLoaded]);

  return (
    <div className={`relative border border-gray-200 bg-gray-100 ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {mapError && (
        <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center p-4 text-center text-xs text-gray-600 gap-2 z-10">
          <AlertCircle className="w-6 h-6 text-amber-500" />
          <div className="font-bold text-gray-800">Map temporarily unavailable</div>
          <div className="text-gray-500 max-w-xs">{mapError}</div>
        </div>
      )}

      {children}
    </div>
  );
};
