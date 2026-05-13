'use client';

import { useEffect, useState } from 'react';
import { MapPin, Clock, Navigation, Loader2, MapIcon, Phone, ExternalLink } from 'lucide-react';
import type { RealStore } from '@/lib/overpass';
import { motion, AnimatePresence } from 'framer-motion';
import { RETAILER_NAMES, RETAILER_COLORS, formatOpeningHours } from '@/lib/retailers';

interface StoreMapProps {
  lat: number;
  lng: number;
  /** Only show stores for these retailer codes (from the plan) */
  highlightRetailers?: string[];
  /** Already-fetched stores from shop-context. If provided, skip the inline fetch. */
  preloaded?: RealStore[];
}

export function StoreMap({ lat, lng, highlightRetailers, preloaded }: StoreMapProps) {
  const [stores, setStores] = useState<RealStore[]>(preloaded ?? []);
  const [loading, setLoading] = useState(!preloaded);
  const [error, setError] = useState(false);
  const [selectedStore, setSelectedStore] = useState<RealStore | null>(null);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{ stores: RealStore[]; lat: number; lng: number; selected: RealStore | null; onSelect: (s: RealStore | null) => void }> | null>(null);

  // Dynamic import of Leaflet (SSR-incompatible)
  useEffect(() => {
    import('./leaflet-map').then((mod) => {
      setMapComponent(() => mod.LeafletMap);
    });
  }, []);

  useEffect(() => {
    // If parent already provided stores (from shop-context cache), use those
    if (preloaded) {
      setStores(applyFilter(preloaded, highlightRetailers));
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);

    const rLat = Math.round(lat * 1000) / 1000;
    const rLng = Math.round(lng * 1000) / 1000;
    fetch(`/api/stores?lat=${rLat}&lng=${rLng}&radius=10000`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { stores?: RealStore[] }) => {
        if (cancelled) return;
        setStores(applyFilter(data.stores ?? [], highlightRetailers));
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [lat, lng, highlightRetailers, preloaded]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Loader2 className="h-6 w-6 text-emerald-500 mx-auto animate-spin mb-2" />
        <p className="text-sm text-gray-500">Finding real stores near you...</p>
        <p className="text-xs text-gray-400 mt-1">Powered by OpenStreetMap</p>
      </div>
    );
  }

  if (error || stores.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <MapIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">
          {error ? 'Could not load store locations' : 'No stores found nearby'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Store data from OpenStreetMap · coverage varies by area
        </p>
      </div>
    );
  }

  // Group stores by retailer
  const grouped = new Map<string, RealStore[]>();
  for (const s of stores) {
    const list = grouped.get(s.retailerCode) ?? [];
    list.push(s);
    grouped.set(s.retailerCode, list);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Navigation className="h-4 w-4 text-emerald-600" />
          Real stores near you
        </h3>
        <span className="text-xs text-gray-400">
          {stores.length} stores · OpenStreetMap
        </span>
      </div>

      {/* Map */}
      {MapComponent && (
        <div className="h-[300px] w-full">
          <MapComponent stores={stores} lat={lat} lng={lng} selected={selectedStore} onSelect={setSelectedStore} />
        </div>
      )}

      {/* Selected store detail */}
      <AnimatePresence>
        {selectedStore && (
          <motion.div
            className="px-5 py-3 bg-emerald-50 border-b border-emerald-100"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="font-medium text-gray-900 text-sm">{selectedStore.name}</div>
                {selectedStore.distanceKm != null && (
                  <div className="text-xs text-emerald-700">
                    {selectedStore.distanceKm.toFixed(1)} km from you
                  </div>
                )}
                {selectedStore.address && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedStore.address}
                  </div>
                )}
                {selectedStore.openingHours && (
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatOpeningHours(selectedStore.openingHours)}
                  </div>
                )}
                {selectedStore.phone && (
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <a href={`tel:${selectedStore.phone}`} className="hover:text-emerald-600">
                      {selectedStore.phone}
                    </a>
                  </div>
                )}
                {selectedStore.website && (
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    <a href={selectedStore.website} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 truncate">
                      Website
                    </a>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Store list by retailer */}
      <div className="divide-y divide-gray-100 max-h-[250px] overflow-y-auto">
        {Array.from(grouped.entries()).map(([retailerCode, retailerStores]) => {
          const isConvenience = retailerStores.every((s) => s.isConvenience);
          return (
            <div key={retailerCode} className="px-5 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RETAILER_COLORS[retailerCode] ?? 'bg-gray-100 text-gray-600'}`}>
                  {RETAILER_NAMES[retailerCode] ?? retailerCode}
                </span>
                {isConvenience && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 uppercase tracking-wide">
                    Convenience
                  </span>
                )}
                <span className="text-xs text-gray-400">{retailerStores.length} store{retailerStores.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-1.5">
                {retailerStores.slice(0, 3).map((store) => (
                  <button
                    key={store.id}
                    onClick={() => setSelectedStore(store)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                      selectedStore?.id === store.id
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="font-medium text-gray-700 flex items-center justify-between">
                      <span className="truncate">{store.name}</span>
                      {store.distanceKm != null && (
                        <span className="text-gray-400 ml-2 shrink-0">{store.distanceKm.toFixed(1)} km</span>
                      )}
                    </div>
                    {store.address && (
                      <div className="text-gray-400 mt-0.5 truncate">{store.address}</div>
                    )}
                    {store.openingHours && (
                      <div className="text-gray-400 mt-0.5 truncate">{formatOpeningHours(store.openingHours)}</div>
                    )}
                  </button>
                ))}
                {retailerStores.length > 3 && (
                  <p className="text-xs text-gray-400 px-3">+{retailerStores.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function applyFilter(result: RealStore[], highlightRetailers?: string[]): RealStore[] {
  let filtered = highlightRetailers
    ? result.filter((s) => highlightRetailers.includes(s.retailerCode))
    : result;

  // Deduplicate: keep one per unique (name, ~rounded coords) — OSM often has
  // both a node and a way for the same building.
  const seen = new Set<string>();
  filtered = filtered.filter((s) => {
    const key = `${s.name}-${s.lat.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return filtered;
}
