/**
 * Display metadata for the retailer codes we support. Codes match those
 * produced by overpass.ts identifyRetailer().
 */

export const RETAILER_NAMES: Record<string, string> = {
  coles: 'Coles',
  woolworths: 'Woolworths',
  aldi: 'ALDI',
  iga: 'IGA',
  seven_eleven: '7-Eleven',
  nightowl: 'NightOwl',
  foodworks: 'FoodWorks',
  friendly_grocer: 'Friendly Grocer',
  drakes: 'Drakes',
  harris_farm: 'Harris Farm',
  costco: 'Costco',
};

export const RETAILER_COLORS: Record<string, string> = {
  coles: 'bg-red-50 text-red-600',
  woolworths: 'bg-green-50 text-green-600',
  aldi: 'bg-blue-50 text-blue-600',
  iga: 'bg-orange-50 text-orange-600',
  seven_eleven: 'bg-emerald-50 text-emerald-600',
  nightowl: 'bg-purple-50 text-purple-600',
  foodworks: 'bg-amber-50 text-amber-600',
  friendly_grocer: 'bg-rose-50 text-rose-600',
  drakes: 'bg-indigo-50 text-indigo-600',
  harris_farm: 'bg-lime-50 text-lime-600',
  costco: 'bg-sky-50 text-sky-600',
};

export const RETAILER_MARKER_COLORS: Record<string, string> = {
  coles: '#dc2626',
  woolworths: '#16a34a',
  aldi: '#2563eb',
  iga: '#ea580c',
  seven_eleven: '#10b981',
  nightowl: '#9333ea',
  foodworks: '#d97706',
  friendly_grocer: '#e11d48',
  drakes: '#4f46e5',
  harris_farm: '#65a30d',
  costco: '#0284c7',
};

/**
 * Fallback typical hours, used when OSM doesn't have an opening_hours tag
 * for a particular store. Marked "typically" so users know it's a hint.
 */
export const RETAILER_FALLBACK_HOURS: Record<string, string> = {
  coles: 'Typically 6am–10pm',
  woolworths: 'Typically 6am–10pm (Sun 8am–9pm)',
  aldi: 'Typically 8:30am–7pm (Sun 11am–5pm)',
  iga: 'Typically 7am–9pm',
  seven_eleven: 'Typically 24/7',
  nightowl: 'Typically 24/7',
  foodworks: 'Typically 7am–9pm',
  friendly_grocer: 'Typically 7am–9pm',
  drakes: 'Typically 7am–9pm',
  harris_farm: 'Typically 7am–9pm',
  costco: 'Typically 10am–8:30pm',
};

/**
 * Convert a raw OSM opening_hours value into something a bit more
 * readable. OSM uses a compact grammar (e.g. "Mo-Fr 06:00-22:00; Sa-Su
 * 07:00-22:00") — we just clean up the separators rather than parse it
 * fully. Returns null if input is empty.
 */
export function formatOpeningHours(raw: string | undefined): string | null {
  if (!raw) return null;
  return raw
    .replace(/;\s*/g, ' · ')
    .replace(/,\s*/g, ', ')
    .replace(/Mo/g, 'Mon')
    .replace(/Tu/g, 'Tue')
    .replace(/We/g, 'Wed')
    .replace(/Th/g, 'Thu')
    .replace(/Fr/g, 'Fri')
    .replace(/Sa/g, 'Sat')
    .replace(/Su/g, 'Sun')
    .trim();
}
