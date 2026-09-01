import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { MapView } from './MapView';
import { locationProvider } from '../../lib/locationProvider';
import { LiveGpsPoint } from '../../types';
import { Navigation, Building2, User, Clock, Compass, Maximize2, AlertCircle } from 'lucide-react';

interface LiveLocationMapProps {
  hospital: {
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
  };
  palLocation: LiveGpsPoint | null;
  palName?: string;
  patientName?: string;
  className?: string;
  height?: string;
  onRefresh?: () => void;
}

export const LiveLocationMap: React.FC<LiveLocationMapProps> = ({
  hospital,
  palLocation,
  palName = 'Assigned PAL Companion',
  patientName,
  className = 'w-full rounded-3xl overflow-hidden shadow-md border border-gray-200',
  height = 'h-72 sm:h-96',
}) => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const hospitalMarkerRef = useRef<maplibregl.Marker | null>(null);
  const palMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [etaFormatted, setEtaFormatted] = useState<string | null>(null);
  const [stalenessMinutes, setStalenessMinutes] = useState<number>(0);

  const handleMapReady = (map: maplibregl.Map) => {
    mapRef.current = map;
    renderMarkers(map);
    fitMapBounds(map);
  };

  const renderMarkers = (map: maplibregl.Map) => {
    // 1. Hospital Marker
    if (hospitalMarkerRef.current) {
      hospitalMarkerRef.current.remove();
      hospitalMarkerRef.current = null;
    }

    if (hospital.latitude && hospital.longitude) {
      const hospEl = document.createElement('div');
      hospEl.className = 'flex flex-col items-center cursor-pointer';
      hospEl.innerHTML = `
        <div class="w-10 h-10 rounded-2xl bg-[#1F3449] text-white flex items-center justify-center shadow-xl border-2 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E85D75" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 6v12"></path>
            <path d="M6 12h12"></path>
          </svg>
        </div>
        <div class="w-2.5 h-2.5 bg-[#1F3449] rotate-45 -mt-1 shadow-md border-r border-b border-white"></div>
      `;

      const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div class="p-2 text-xs">
          <div class="font-bold text-[#1F3449]">${hospital.name}</div>
          <div class="text-gray-500 text-[11px]">${hospital.address || 'Hospital Campus'}</div>
          <div class="text-[#E85D75] font-black uppercase text-[10px] mt-1">Arrival Destination</div>
        </div>
      `);

      hospitalMarkerRef.current = new maplibregl.Marker({ element: hospEl, anchor: 'bottom' })
        .setLngLat([hospital.longitude, hospital.latitude])
        .setPopup(popup)
        .addTo(map);
    }

    // 2. PAL Live Location Marker
    if (palMarkerRef.current) {
      palMarkerRef.current.remove();
      palMarkerRef.current = null;
    }

    if (palLocation && palLocation.latitude && palLocation.longitude) {
      const palEl = document.createElement('div');
      palEl.className = 'relative flex items-center justify-center cursor-pointer';
      palEl.innerHTML = `
        <div class="absolute w-12 h-12 rounded-full bg-[#48A6A5]/20 animate-ping"></div>
        <div class="w-10 h-10 rounded-full bg-[#48A6A5] text-white flex items-center justify-center shadow-xl border-2 border-white relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 20, closeButton: false }).setHTML(`
        <div class="p-2 text-xs">
          <div class="font-bold text-[#1F3449]">${palName}</div>
          <div class="text-emerald-700 font-bold text-[11px]">En Route / Live GPS</div>
          ${palLocation.accuracyMeters ? `<div class="text-gray-400 text-[10px]">Accuracy: ±${palLocation.accuracyMeters}m</div>` : ''}
        </div>
      `);

      palMarkerRef.current = new maplibregl.Marker({ element: palEl, anchor: 'center' })
        .setLngLat([palLocation.longitude, palLocation.latitude])
        .setPopup(popup)
        .addTo(map);
    }
  };

  const fitMapBounds = (map: maplibregl.Map) => {
    if (!map) return;

    if (
      palLocation &&
      palLocation.latitude &&
      palLocation.longitude &&
      hospital.latitude &&
      hospital.longitude
    ) {
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([hospital.longitude, hospital.latitude]);
      bounds.extend([palLocation.longitude, palLocation.latitude]);
      map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 1000 });
    } else if (hospital.latitude && hospital.longitude) {
      map.flyTo({
        center: [hospital.longitude, hospital.latitude],
        zoom: 15,
        duration: 800,
      });
    }
  };

  // Update distance, ETA, and staleness calculations
  useEffect(() => {
    if (palLocation && hospital.latitude && hospital.longitude) {
      const dist = locationProvider.calculateDistance(
        palLocation.latitude,
        palLocation.longitude,
        hospital.latitude,
        hospital.longitude
      );
      setDistanceMeters(dist);

      const eta = locationProvider.estimateWalkingEta(dist);
      setEtaFormatted(eta.formatted);

      if (palLocation.recordedAt) {
        const diffMs = Date.now() - new Date(palLocation.recordedAt).getTime();
        setStalenessMinutes(Math.floor(diffMs / 60000));
      }
    } else {
      setDistanceMeters(null);
      setEtaFormatted(null);
    }

    if (mapRef.current) {
      renderMarkers(mapRef.current);
    }
  }, [palLocation?.latitude, palLocation?.longitude, palLocation?.recordedAt, hospital.latitude, hospital.longitude]);

  return (
    <div className={`relative ${className}`}>
      <MapView
        center={[hospital.longitude || -73.9741, hospital.latitude || 40.7421]}
        zoom={14}
        className={`w-full ${height}`}
        onMapReady={handleMapReady}
      />

      {/* Floating Status & ETA Overlay */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-sm bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-lg space-y-2.5 z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                palLocation && stalenessMinutes <= 2
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-xs font-black text-[#1F3449] uppercase tracking-wider">
              {palLocation && stalenessMinutes <= 2
                ? 'LIVE PAL GPS ACTIVE'
                : palLocation
                ? `Last updated ${stalenessMinutes}m ago`
                : 'Waiting for PAL GPS signal...'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => mapRef.current && fitMapBounds(mapRef.current)}
            title="Auto-Fit Destination & PAL"
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-xs text-gray-700 space-y-1">
          <div className="flex items-center gap-2 font-bold text-[#1F3449]">
            <User className="w-3.5 h-3.5 text-[#48A6A5] shrink-0" />
            <span className="truncate">{palName}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Building2 className="w-3.5 h-3.5 text-[#E85D75] shrink-0" />
            <span className="truncate">{hospital.name}</span>
          </div>
        </div>

        {distanceMeters !== null && (
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Distance</span>
              <span className="font-bold text-[#1F3449]">
                {distanceMeters < 1000
                  ? `${Math.round(distanceMeters)} m`
                  : `${(distanceMeters / 1609.34).toFixed(2)} mi`}
              </span>
            </div>
            {etaFormatted && (
              <div className="text-right">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Est. Arrival</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{etaFormatted}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {!palLocation && (
          <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>PAL will activate GPS tracking upon starting the escort visit.</span>
          </div>
        )}
      </div>
    </div>
  );
};
