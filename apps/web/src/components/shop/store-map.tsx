'use client';

import { useEffect, useState } from 'react';
import { MapPin, Clock, Navigation, Loader2, MapIcon } from 'lucide-react';
import { fetchNearbyStores, type RealStore } from '@/lib/overpass';
import { motion, AnimatePresence } from 'framer-motion';

const RETAILER_COLORS: Record<string, { bg: string; marker: string; text: string }> = {
  coles: { bg: 'bg-red-50', marker: '#dc2626', text: 'text-red-600' },
  woolworths: { bg: 'bg-green-50', marker: '#16a34a', text: 'text-green-600' },
  aldi: { bg: 'bg-blue-50', marker: '#2563eb', text: 'text-blue-600' },
  iga: { bg: 'bg-orange-50', marker: '#ea580c', text: 'text-orange-600' },
};

const RETAILER_NAMES: Record<string, string> = {
  coles: 'Coles',
  woolworths: 'Woolworths',
  aldi: 'ALDI',
  iga: 'IGA',
};

interface StoreMapProps {
  lat: number;
  lng: number;
  /** Only show stores for these retailer codes (from the plan) */
  highlightRetailers?: string[];
}

export function StoreMap({ lat, lng, highlightRetailers }: StoreMapProps) {
  const [stores, setStores] = useState<RealStore[]>([]);
  const [loading, setLoading] = useState(true);
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
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchNearbyStores(lat, lng, 10000)
      .then((result) => {
        if (!cancelled) {
          // Filter to highlighted retailers if specified, deduplicate by name
          let filtered = highlightRetailers
            ? result.filter((s) => highlightRetailers.includes(s.retailerCode))
            : result;

          // Deduplicate: keep one per unique name
          const seen = new Set<string>();
          filtered = filtered.filter((s) => {
            const key = `${s.name}-${s.lat.toFixed(4)}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          setStores(filtered);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [lat, lng, highlightRetailers]);

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
              <div>
                <div className="font-medium text-gray-900 text-sm">{selectedStore.name}</div>
                {selectedStore.address && (
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {selectedStore.address}
                  </div>
                )}
                {selectedStore.openingHours && (
                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {selectedStore.openingHours}
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
        {Array.from(grouped.entries()).map(([retailerCode, retailerStores]) => (
          <div key={retailerCode} className="px-5 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RETAILER_COLORS[retailerCode]?.bg ?? 'bg-gray-100'} ${RETAILER_COLORS[retailerCode]?.text ?? 'text-gray-600'}`}>
                {RETAILER_NAMES[retailerCode] ?? retailerCode}
              </span>
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
                  <div className="font-medium text-gray-700">{store.name}</div>
                  {store.address && (
                    <div className="text-gray-400 mt-0.5">{store.address}</div>
                  )}
                  {store.openingHours && (
                    <div className="text-gray-400 mt-0.5">{store.openingHours}</div>
                  )}
                </button>
              ))}
              {retailerStores.length > 3 && (
                <p className="text-xs text-gray-400 px-3">+{retailerStores.length - 3} more</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
