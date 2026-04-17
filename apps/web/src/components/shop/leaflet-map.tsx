'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import type { RealStore } from '@/lib/overpass';

const RETAILER_MARKER_COLORS: Record<string, string> = {
  coles: '#dc2626',
  woolworths: '#16a34a',
  aldi: '#2563eb',
  iga: '#ea580c',
};

function createMarkerIcon(color: string, isSelected: boolean) {
  const size = isSelected ? 14 : 10;
  const border = isSelected ? 3 : 2;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${border}px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);${isSelected ? 'transform:scale(1.3);' : ''}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const homeIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);">
    <div style="width:6px;height:6px;border-radius:50%;background:white;margin:2px auto;"></div>
  </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function FitBounds({ stores, lat, lng }: { stores: RealStore[]; lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (stores.length === 0) return;
    const points: L.LatLngExpression[] = [
      [lat, lng],
      ...stores.slice(0, 12).map((s) => [s.lat, s.lng] as L.LatLngExpression),
    ];
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
  }, [map, stores, lat, lng]);
  return null;
}

interface LeafletMapProps {
  stores: RealStore[];
  lat: number;
  lng: number;
  selected: RealStore | null;
  onSelect: (s: RealStore | null) => void;
}

export function LeafletMap({ stores, lat, lng, selected, onSelect }: LeafletMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User location */}
      <Marker position={[lat, lng]} icon={homeIcon}>
        <Popup>Your location</Popup>
      </Marker>
      <Circle
        center={[lat, lng]}
        radius={200}
        pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1, weight: 1 }}
      />

      {/* Store markers */}
      {stores.map((store) => {
        const color = RETAILER_MARKER_COLORS[store.retailerCode] ?? '#6b7280';
        const isSelected = selected?.id === store.id;
        return (
          <Marker
            key={store.id}
            position={[store.lat, store.lng]}
            icon={createMarkerIcon(color, isSelected)}
            eventHandlers={{
              click: () => onSelect(isSelected ? null : store),
            }}
          >
            <Popup>
              <div className="text-xs">
                <strong>{store.name}</strong>
                {store.address && <div className="text-gray-500">{store.address}</div>}
                {store.openingHours && <div className="text-gray-400">{store.openingHours}</div>}
              </div>
            </Popup>
          </Marker>
        );
      })}

      <FitBounds stores={stores} lat={lat} lng={lng} />
    </MapContainer>
  );
}
