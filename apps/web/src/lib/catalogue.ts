/**
 * Static product catalogue for MVP. ~40 common AU grocery items with
 * realistic prices at multiple retailers + store locations for metro areas.
 *
 * Every offer conforms to OptimiserOffer from @smartshopper/core.
 */

import type { OptimiserOffer } from '@smartshopper/core/basket';

// ─── Canonical Products ───

export interface CatalogueProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  size: string;
}

export const CATALOGUE_PRODUCTS: CatalogueProduct[] = [
  // Dairy
  { id: 'p01', name: 'Pauls Full Cream Milk', brand: 'Pauls', category: 'Dairy', size: '2L' },
  { id: 'p02', name: 'Devondale Cheddar Cheese', brand: 'Devondale', category: 'Dairy', size: '500g' },
  { id: 'p03', name: 'Chobani Greek Yoghurt', brand: 'Chobani', category: 'Dairy', size: '907g' },
  { id: 'p04', name: 'Western Star Butter', brand: 'Western Star', category: 'Dairy', size: '250g' },
  // Bakery
  { id: 'p05', name: 'Tip Top Bread White', brand: 'Tip Top', category: 'Bakery', size: '700g' },
  { id: 'p06', name: 'Helgas Wholemeal Bread', brand: 'Helgas', category: 'Bakery', size: '750g' },
  // Breakfast
  { id: 'p07', name: 'Weet-Bix Original', brand: 'Sanitarium', category: 'Breakfast', size: '1.2kg' },
  { id: 'p08', name: "Uncle Tobys Oats Quick", brand: "Uncle Tobys", category: 'Breakfast', size: '1kg' },
  // Biscuits & Snacks
  { id: 'p09', name: "Arnott's Tim Tam Original", brand: "Arnott's", category: 'Biscuits', size: '200g' },
  { id: 'p10', name: "Arnott's Shapes BBQ", brand: "Arnott's", category: 'Snacks', size: '175g' },
  { id: 'p11', name: "Smith's Original Chips", brand: "Smith's", category: 'Snacks', size: '170g' },
  // Chocolate
  { id: 'p12', name: 'Cadbury Dairy Milk Block', brand: 'Cadbury', category: 'Chocolate', size: '180g' },
  { id: 'p13', name: 'Lindt Excellence 70% Cocoa', brand: 'Lindt', category: 'Chocolate', size: '100g' },
  // Drinks
  { id: 'p14', name: 'Coca-Cola Classic', brand: 'Coca-Cola', category: 'Drinks', size: '2L' },
  { id: 'p15', name: 'Pepsi Max', brand: 'Pepsi', category: 'Drinks', size: '2L' },
  { id: 'p16', name: 'Mount Franklin Water', brand: 'Mount Franklin', category: 'Drinks', size: '6x500ml' },
  // Pantry
  { id: 'p17', name: 'Barilla Spaghetti', brand: 'Barilla', category: 'Pantry', size: '500g' },
  { id: 'p18', name: 'Leggo\'s Pasta Sauce Bolognese', brand: 'Leggo\'s', category: 'Pantry', size: '500g' },
  { id: 'p19', name: 'SunRice Medium Grain Rice', brand: 'SunRice', category: 'Pantry', size: '5kg' },
  { id: 'p20', name: 'MasterFoods Vegemite', brand: 'MasterFoods', category: 'Pantry', size: '380g' },
  { id: 'p21', name: 'Bega Peanut Butter Smooth', brand: 'Bega', category: 'Pantry', size: '470g' },
  { id: 'p22', name: "CSR White Sugar", brand: 'CSR', category: 'Pantry', size: '2kg' },
  // Meat & Protein
  { id: 'p23', name: 'Chicken Breast Fillets', brand: 'Store Brand', category: 'Meat', size: '1kg' },
  { id: 'p24', name: 'Beef Mince Premium', brand: 'Store Brand', category: 'Meat', size: '500g' },
  { id: 'p25', name: 'John West Tuna in Springwater', brand: 'John West', category: 'Pantry', size: '95g' },
  // Frozen
  { id: 'p26', name: 'McCain Super Fries', brand: 'McCain', category: 'Frozen', size: '1kg' },
  { id: 'p27', name: "Streets Magnum Classic 4pk", brand: 'Streets', category: 'Frozen', size: '4pk' },
  // Cleaning
  { id: 'p28', name: 'Finish Powerball Dishwasher Tabs', brand: 'Finish', category: 'Cleaning', size: '56pk' },
  { id: 'p29', name: 'OMO Laundry Liquid', brand: 'OMO', category: 'Cleaning', size: '2L' },
  { id: 'p30', name: 'Kleenex Toilet Tissue', brand: 'Kleenex', category: 'Household', size: '24pk' },
  // Produce
  { id: 'p31', name: 'Bananas', brand: 'Fresh', category: 'Produce', size: '1kg' },
  { id: 'p32', name: 'Avocados', brand: 'Fresh', category: 'Produce', size: 'each' },
  { id: 'p33', name: 'Royal Gala Apples', brand: 'Fresh', category: 'Produce', size: '1kg' },
  // Baby & Personal
  { id: 'p34', name: 'Huggies Nappies Crawler', brand: 'Huggies', category: 'Baby', size: '72pk' },
  { id: 'p35', name: 'Colgate Total Toothpaste', brand: 'Colgate', category: 'Personal', size: '200g' },
  // Coffee
  { id: 'p36', name: 'Nescafe Blend 43', brand: 'Nescafe', category: 'Drinks', size: '500g' },
  { id: 'p37', name: 'Bonsoy Soy Milk', brand: 'Bonsoy', category: 'Dairy', size: '1L' },
  // Eggs
  { id: 'p38', name: 'Cage Free Eggs', brand: 'Store Brand', category: 'Dairy', size: '12pk' },
  // Olive Oil
  { id: 'p39', name: 'Cobram Estate Extra Virgin Olive Oil', brand: 'Cobram', category: 'Pantry', size: '750ml' },
  // Tea
  { id: 'p40', name: 'Twinings English Breakfast Tea', brand: 'Twinings', category: 'Drinks', size: '100 bags' },
];

// ─── Store Locations (3 per retailer across Sydney, Melbourne, Brisbane) ───

interface StoreInfo {
  storeId: string;
  retailerCode: string;
  suburb: string;
  lat: number;
  lng: number;
}

const STORES: StoreInfo[] = [
  // Coles
  { storeId: 'coles-bondi', retailerCode: 'coles', suburb: 'Bondi Junction', lat: -33.8930, lng: 151.2475 },
  { storeId: 'coles-melb', retailerCode: 'coles', suburb: 'Melbourne Central', lat: -37.8100, lng: 144.9625 },
  { storeId: 'coles-bris', retailerCode: 'coles', suburb: 'Brisbane CBD', lat: -27.4710, lng: 153.0234 },
  { storeId: 'coles-parr', retailerCode: 'coles', suburb: 'Parramatta', lat: -33.8166, lng: 151.0010 },
  { storeId: 'coles-adel', retailerCode: 'coles', suburb: 'Adelaide', lat: -34.9285, lng: 138.6007 },
  { storeId: 'coles-perth', retailerCode: 'coles', suburb: 'Perth', lat: -31.9505, lng: 115.8605 },
  // Woolworths
  { storeId: 'ww-bondi', retailerCode: 'woolworths', suburb: 'Bondi Junction', lat: -33.8925, lng: 151.2470 },
  { storeId: 'ww-melb', retailerCode: 'woolworths', suburb: 'QV Melbourne', lat: -37.8110, lng: 144.9660 },
  { storeId: 'ww-bris', retailerCode: 'woolworths', suburb: 'Queen St Mall', lat: -27.4700, lng: 153.0260 },
  { storeId: 'ww-chat', retailerCode: 'woolworths', suburb: 'Chatswood', lat: -33.7963, lng: 151.1832 },
  { storeId: 'ww-adel', retailerCode: 'woolworths', suburb: 'Adelaide', lat: -34.9245, lng: 138.6010 },
  { storeId: 'ww-perth', retailerCode: 'woolworths', suburb: 'Perth', lat: -31.9510, lng: 115.8610 },
  // ALDI
  { storeId: 'aldi-marr', retailerCode: 'aldi', suburb: 'Marrickville', lat: -33.9100, lng: 151.1554 },
  { storeId: 'aldi-brun', retailerCode: 'aldi', suburb: 'Brunswick', lat: -37.7665, lng: 144.9596 },
  { storeId: 'aldi-camp', retailerCode: 'aldi', suburb: 'Camp Hill', lat: -27.4908, lng: 153.0744 },
  { storeId: 'aldi-adel', retailerCode: 'aldi', suburb: 'Adelaide', lat: -34.9300, lng: 138.5950 },
  // IGA
  { storeId: 'iga-newt', retailerCode: 'iga', suburb: 'Newtown', lat: -33.8976, lng: 151.1795 },
  { storeId: 'iga-fitz', retailerCode: 'iga', suburb: 'Fitzroy', lat: -37.7989, lng: 144.9780 },
  { storeId: 'iga-fort', retailerCode: 'iga', suburb: 'Fortitude Valley', lat: -27.4560, lng: 153.0360 },
  { storeId: 'iga-frem', retailerCode: 'iga', suburb: 'Fremantle', lat: -32.0569, lng: 115.7439 },
  // Canberra / ACT
  { storeId: 'coles-bell', retailerCode: 'coles', suburb: 'Belconnen', lat: -35.2380, lng: 149.0660 },
  { storeId: 'ww-woden', retailerCode: 'woolworths', suburb: 'Woden', lat: -35.3460, lng: 149.0870 },
  { storeId: 'aldi-kipp', retailerCode: 'aldi', suburb: 'Kippax', lat: -35.2290, lng: 149.0320 },
  { storeId: 'iga-manuka', retailerCode: 'iga', suburb: 'Manuka', lat: -35.3180, lng: 149.1380 },
];

// ─── Price Matrix (productId → retailer → price info) ───

interface PriceEntry {
  productId: string;
  retailerCode: string;
  price: number;
  isTrueSpecial: boolean;
  memberOnly: boolean;
}

// Realistic AU supermarket prices with some specials
const PRICE_MATRIX: PriceEntry[] = [
  // Dairy
  { productId: 'p01', retailerCode: 'coles', price: 3.60, isTrueSpecial: false, memberOnly: false },
  { productId: 'p01', retailerCode: 'woolworths', price: 3.60, isTrueSpecial: false, memberOnly: false },
  { productId: 'p01', retailerCode: 'aldi', price: 3.19, isTrueSpecial: false, memberOnly: false },
  { productId: 'p01', retailerCode: 'iga', price: 3.80, isTrueSpecial: false, memberOnly: false },
  { productId: 'p02', retailerCode: 'coles', price: 7.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p02', retailerCode: 'woolworths', price: 7.50, isTrueSpecial: true, memberOnly: false },
  { productId: 'p02', retailerCode: 'aldi', price: 5.99, isTrueSpecial: false, memberOnly: false },
  { productId: 'p03', retailerCode: 'coles', price: 8.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p03', retailerCode: 'woolworths', price: 7.50, isTrueSpecial: true, memberOnly: true },
  { productId: 'p04', retailerCode: 'coles', price: 5.50, isTrueSpecial: true, memberOnly: false },
  { productId: 'p04', retailerCode: 'woolworths', price: 6.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p04', retailerCode: 'aldi', price: 4.49, isTrueSpecial: false, memberOnly: false },
  // Bakery
  { productId: 'p05', retailerCode: 'coles', price: 3.80, isTrueSpecial: false, memberOnly: false },
  { productId: 'p05', retailerCode: 'woolworths', price: 3.80, isTrueSpecial: false, memberOnly: false },
  { productId: 'p05', retailerCode: 'iga', price: 4.20, isTrueSpecial: false, memberOnly: false },
  { productId: 'p06', retailerCode: 'coles', price: 5.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p06', retailerCode: 'woolworths', price: 5.00, isTrueSpecial: true, memberOnly: false },
  // Breakfast
  { productId: 'p07', retailerCode: 'coles', price: 5.20, isTrueSpecial: true, memberOnly: false },
  { productId: 'p07', retailerCode: 'woolworths', price: 9.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p07', retailerCode: 'aldi', price: 4.99, isTrueSpecial: false, memberOnly: false },
  { productId: 'p08', retailerCode: 'coles', price: 6.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p08', retailerCode: 'woolworths', price: 6.50, isTrueSpecial: false, memberOnly: false },
  // Biscuits & Snacks
  { productId: 'p09', retailerCode: 'coles', price: 2.75, isTrueSpecial: true, memberOnly: false },
  { productId: 'p09', retailerCode: 'woolworths', price: 3.65, isTrueSpecial: false, memberOnly: false },
  { productId: 'p09', retailerCode: 'iga', price: 5.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p10', retailerCode: 'coles', price: 2.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p10', retailerCode: 'woolworths', price: 2.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p11', retailerCode: 'coles', price: 3.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p11', retailerCode: 'woolworths', price: 2.85, isTrueSpecial: true, memberOnly: true },
  { productId: 'p11', retailerCode: 'aldi', price: 2.99, isTrueSpecial: false, memberOnly: false },
  // Chocolate
  { productId: 'p12', retailerCode: 'coles', price: 3.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p12', retailerCode: 'woolworths', price: 3.00, isTrueSpecial: true, memberOnly: true },
  { productId: 'p12', retailerCode: 'aldi', price: 3.99, isTrueSpecial: false, memberOnly: false },
  { productId: 'p13', retailerCode: 'coles', price: 5.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p13', retailerCode: 'woolworths', price: 4.50, isTrueSpecial: true, memberOnly: false },
  // Drinks
  { productId: 'p14', retailerCode: 'coles', price: 2.85, isTrueSpecial: false, memberOnly: false },
  { productId: 'p14', retailerCode: 'woolworths', price: 2.85, isTrueSpecial: false, memberOnly: false },
  { productId: 'p14', retailerCode: 'aldi', price: 2.65, isTrueSpecial: false, memberOnly: false },
  { productId: 'p15', retailerCode: 'coles', price: 2.50, isTrueSpecial: true, memberOnly: false },
  { productId: 'p15', retailerCode: 'woolworths', price: 2.85, isTrueSpecial: false, memberOnly: false },
  { productId: 'p16', retailerCode: 'coles', price: 5.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p16', retailerCode: 'woolworths', price: 4.50, isTrueSpecial: true, memberOnly: false },
  // Pantry
  { productId: 'p17', retailerCode: 'coles', price: 2.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p17', retailerCode: 'woolworths', price: 2.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p17', retailerCode: 'aldi', price: 1.69, isTrueSpecial: false, memberOnly: false },
  { productId: 'p18', retailerCode: 'coles', price: 3.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p18', retailerCode: 'woolworths', price: 4.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p19', retailerCode: 'coles', price: 12.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p19', retailerCode: 'woolworths', price: 11.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p19', retailerCode: 'aldi', price: 9.99, isTrueSpecial: false, memberOnly: false },
  { productId: 'p20', retailerCode: 'coles', price: 7.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p20', retailerCode: 'woolworths', price: 7.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p21', retailerCode: 'coles', price: 5.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p21', retailerCode: 'woolworths', price: 4.50, isTrueSpecial: true, memberOnly: false },
  { productId: 'p22', retailerCode: 'coles', price: 4.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p22', retailerCode: 'woolworths', price: 4.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p22', retailerCode: 'aldi', price: 3.29, isTrueSpecial: false, memberOnly: false },
  // Meat
  { productId: 'p23', retailerCode: 'coles', price: 12.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p23', retailerCode: 'woolworths', price: 11.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p23', retailerCode: 'aldi', price: 10.99, isTrueSpecial: false, memberOnly: false },
  { productId: 'p24', retailerCode: 'coles', price: 7.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p24', retailerCode: 'woolworths', price: 6.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p24', retailerCode: 'iga', price: 7.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p25', retailerCode: 'coles', price: 1.60, isTrueSpecial: true, memberOnly: false },
  { productId: 'p25', retailerCode: 'woolworths', price: 2.20, isTrueSpecial: false, memberOnly: false },
  // Frozen
  { productId: 'p26', retailerCode: 'coles', price: 4.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p26', retailerCode: 'woolworths', price: 4.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p26', retailerCode: 'aldi', price: 3.49, isTrueSpecial: false, memberOnly: false },
  { productId: 'p27', retailerCode: 'coles', price: 5.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p27', retailerCode: 'woolworths', price: 7.50, isTrueSpecial: false, memberOnly: false },
  // Cleaning
  { productId: 'p28', retailerCode: 'coles', price: 25.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p28', retailerCode: 'woolworths', price: 32.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p29', retailerCode: 'coles', price: 18.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p29', retailerCode: 'woolworths', price: 15.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p30', retailerCode: 'coles', price: 12.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p30', retailerCode: 'woolworths', price: 11.00, isTrueSpecial: true, memberOnly: false },
  // Produce
  { productId: 'p31', retailerCode: 'coles', price: 3.90, isTrueSpecial: false, memberOnly: false },
  { productId: 'p31', retailerCode: 'woolworths', price: 3.90, isTrueSpecial: false, memberOnly: false },
  { productId: 'p31', retailerCode: 'aldi', price: 3.49, isTrueSpecial: false, memberOnly: false },
  { productId: 'p32', retailerCode: 'coles', price: 2.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p32', retailerCode: 'woolworths', price: 2.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p33', retailerCode: 'coles', price: 5.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p33', retailerCode: 'woolworths', price: 4.90, isTrueSpecial: true, memberOnly: false },
  // Baby & Personal
  { productId: 'p34', retailerCode: 'coles', price: 35.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p34', retailerCode: 'woolworths', price: 42.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p35', retailerCode: 'coles', price: 6.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p35', retailerCode: 'woolworths', price: 5.00, isTrueSpecial: true, memberOnly: false },
  // Coffee & Beverages
  { productId: 'p36', retailerCode: 'coles', price: 20.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p36', retailerCode: 'woolworths', price: 18.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p37', retailerCode: 'coles', price: 4.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p37', retailerCode: 'woolworths', price: 4.50, isTrueSpecial: false, memberOnly: false },
  // Eggs
  { productId: 'p38', retailerCode: 'coles', price: 5.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p38', retailerCode: 'woolworths', price: 5.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p38', retailerCode: 'aldi', price: 4.89, isTrueSpecial: false, memberOnly: false },
  // Olive Oil
  { productId: 'p39', retailerCode: 'coles', price: 12.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p39', retailerCode: 'woolworths', price: 10.00, isTrueSpecial: true, memberOnly: false },
  // Tea
  { productId: 'p40', retailerCode: 'coles', price: 7.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p40', retailerCode: 'woolworths', price: 6.50, isTrueSpecial: true, memberOnly: false },
];

// ─── Build Offers (matching OptimiserOffer shape) ───

function nearestStore(retailerCode: string, origin: { lat: number; lng: number }): StoreInfo | undefined {
  const retailerStores = STORES.filter((s) => s.retailerCode === retailerCode);
  if (!retailerStores.length) return undefined;

  let best = retailerStores[0]!;
  let bestDist = distance(origin, best);
  for (let i = 1; i < retailerStores.length; i++) {
    const d = distance(origin, retailerStores[i]!);
    if (d < bestDist) {
      best = retailerStores[i]!;
      bestDist = d;
    }
  }
  return best;
}

function distance(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Build the full offer list for the optimizer, relative to a user's origin.
 * Each PriceEntry gets paired with the nearest store of that retailer.
 */
export function buildOffers(origin: { lat: number; lng: number }): OptimiserOffer[] {
  const storeCache = new Map<string, StoreInfo | undefined>();

  return PRICE_MATRIX.map((pe) => {
    if (!storeCache.has(pe.retailerCode)) {
      storeCache.set(pe.retailerCode, nearestStore(pe.retailerCode, origin));
    }
    const store = storeCache.get(pe.retailerCode);
    const product = CATALOGUE_PRODUCTS.find((p) => p.id === pe.productId)!;
    const dist = store ? distance(origin, store) : 0;

    return {
      retailerCode: pe.retailerCode,
      retailerProductId: `${pe.retailerCode}-${pe.productId}`,
      productId: pe.productId,
      productName: product.name,
      price: pe.price,
      storeId: store?.storeId ?? null,
      storeLocation: store ? { lat: store.lat, lng: store.lng } : null,
      distanceKm: Math.round(dist * 10) / 10,
      isTrueSpecial: pe.isTrueSpecial,
      memberOnly: pe.memberOnly,
      inStock: true,
    };
  });
}

export { STORES };
