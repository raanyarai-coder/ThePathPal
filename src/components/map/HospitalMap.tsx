import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { MapView } from './MapView';
import { Building2, MapPin } from 'lucide-react';

interface HospitalMapProps {
  latitude: number;
  longitude: number;
  hospitalName: string;
  hospitalAddress?: string;
  className?: string;
  height?: string;
  zoom?: number;
  showCard?: boolean;
}

export const HospitalMap: React.FC<HospitalMapProps> = ({
  latitude,
  longitude,
  hospitalName,
  hospitalAddress,
  className = 'w-full rounded-2xl overflow-hidden shadow-sm',
  height = 'h-52 sm:h-64',
  zoom = 15,
  showCard = true,
}) => {
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const handleMapReady = (map: maplibregl.Map) => {
    mapRef.current = map;
    updateMarker(map);
  };

  const updateMarker = (map: maplibregl.Map) => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) return;

    // Create custom hospital pin element
    const el = document.createElement('div');
    el.className = 'relative cursor-pointer group flex flex-col items-center';
    el.innerHTML = `
      <div class="w-9 h-9 rounded-2xl bg-[#E85D75] text-white flex items-center justify-center shadow-lg border-2 border-white transform transition-transform group-hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 6v12"></path>
          <path d="M6 12h12"></path>
        </svg>
      </div>
      <div class="w-2.5 h-2.5 bg-[#E85D75] rotate-45 -mt-1 shadow-md border-r border-b border-white"></div>
    `;

    const popupHtml = `
      <div class="p-2 text-xs font-sans">
        <div class="font-bold text-[#1F3449] text-sm">${hospitalName}</div>
        ${hospitalAddress ? `<div class="text-gray-600 text-[11px] mt-0.5">${hospitalAddress}</div>` : ''}
        <div class="text-[10px] text-[#E85D75] font-black uppercase mt-1 tracking-wider">Designated Campus Meeting Point</div>
      </div>
    `;

    const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(popupHtml);

    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([longitude, latitude])
      .setPopup(popup)
      .addTo(map);

    markerRef.current = marker;
  };

  useEffect(() => {
    if (mapRef.current) {
      updateMarker(mapRef.current);
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: zoom || 15,
        essential: true,
      });
    }
  }, [latitude, longitude, hospitalName, hospitalAddress]);

  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-xs text-gray-500 ${height}`}>
        <Building2 className="w-6 h-6 text-gray-400 mb-1" />
        <span>Select a hospital to preview campus map location</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <MapView
        center={[longitude, latitude]}
        zoom={zoom}
        className={`w-full ${height}`}
        onMapReady={handleMapReady}
      />

      {showCard && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-gray-200 shadow-md flex items-start gap-3 z-10">
          <div className="w-8 h-8 rounded-xl bg-[#E85D75]/10 text-[#E85D75] flex items-center justify-center shrink-0 mt-0.5">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-xs min-w-0 flex-1">
            <div className="font-bold text-[#1F3449] truncate">{hospitalName}</div>
            {hospitalAddress && <div className="text-gray-500 text-[11px] truncate">{hospitalAddress}</div>}
          </div>
        </div>
      )}
    </div>
  );
};
