'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { lookupPostcode } from './postcodes';

// ─── Types ───

export interface ShopItem {
  id: string;
  query: string;
  productId: string | null;
  productName: string | null;
  /**
   * If set, this list item is "any product of this type" — e.g. "any
   * halloumi", "any shampoo". The results page will build offers for
   * every branded product with this genericType at every retailer, and
   * the optimizer picks the cheapest.
   */
  genericType?: string;
  quantity: number;
}

export interface ShopPreferences {
  maxStores: number;
  maxTravelKm: number;
  fuelCostPerKm: number;
  timeValuePerHour: number;
  noCarAvailable: boolean;
  loyaltyMemberships: string[];
  activeSubscriptions: string[];
}

export interface ShopState {
  postcode: string;
  suburb: string;
  origin: { lat: number; lng: number } | null;
  preferences: ShopPreferences;
  items: ShopItem[];
}

interface ShopContextValue extends ShopState {
  setPostcode: (postcode: string) => void;
  addItem: (item: Omit<ShopItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearList: () => void;
  setPreferences: (prefs: Partial<ShopPreferences>) => void;
  hydrated: boolean;
}

// ─── Defaults ───

const DEFAULT_PREFS: ShopPreferences = {
  maxStores: 2,
  maxTravelKm: 10,
  fuelCostPerKm: 0.88,
  timeValuePerHour: 25,
  noCarAvailable: false,
  loyaltyMemberships: [],
  activeSubscriptions: [],
};

const DEFAULT_STATE: ShopState = {
  postcode: '',
  suburb: '',
  origin: null,
  preferences: DEFAULT_PREFS,
  items: [],
};

const STORAGE_KEY = 'smartshopper_shop';

// ─── Context ───

const ShopContext = createContext<ShopContextValue | null>(null);

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
}

// ─── Provider ───

function genId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2, 10);
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ShopState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const skipPersist = useRef(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ShopState>;
        setState((prev) => ({
          ...prev,
          ...parsed,
          preferences: { ...DEFAULT_PREFS, ...parsed.preferences },
        }));
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
    skipPersist.current = false;
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    if (skipPersist.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // quota exceeded — ignore
    }
  }, [state]);

  const setPostcode = useCallback((postcode: string) => {
    const entry = lookupPostcode(postcode);
    setState((prev) => ({
      ...prev,
      postcode,
      suburb: entry?.suburb ?? '',
      origin: entry ? { lat: entry.lat, lng: entry.lng } : null,
    }));
  }, []);

  const addItem = useCallback((item: Omit<ShopItem, 'id'>) => {
    setState((prev) => ({
      ...prev,
      items: [...prev.items, { ...item, id: genId() }],
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i)),
    }));
  }, []);

  const clearList = useCallback(() => {
    setState((prev) => ({ ...prev, items: [] }));
  }, []);

  const setPreferences = useCallback((prefs: Partial<ShopPreferences>) => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...prefs },
    }));
  }, []);

  return (
    <ShopContext.Provider
      value={{
        ...state,
        setPostcode,
        addItem,
        removeItem,
        updateQuantity,
        clearList,
        setPreferences,
        hydrated,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}
