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
  /**
   * Generic type — products with the same genericType are interchangeable.
   * When a user searches generically ("haloumi", "milk"), all products with
   * the matching genericType become candidate offers, and the optimizer
   * picks the cheapest across all brands and retailers.
   */
  genericType?: string;
  /** Extra search keywords — alternate spellings, common names, etc. */
  aliases?: readonly string[];
}

export const CATALOGUE_PRODUCTS: CatalogueProduct[] = [
  // Dairy
  { id: 'p01', name: 'Pauls Full Cream Milk', brand: 'Pauls', category: 'Dairy', size: '2L', genericType: 'milk_2l', aliases: ['milk', 'full cream milk', 'whole milk'] },
  { id: 'p02', name: 'Devondale Cheddar Cheese', brand: 'Devondale', category: 'Dairy', size: '500g', genericType: 'tasty_cheese_500g', aliases: ['cheese', 'tasty cheese', 'cheddar', 'cheese block'] },
  { id: 'p03', name: 'Chobani Greek Yoghurt', brand: 'Chobani', category: 'Dairy', size: '907g', genericType: 'greek_yoghurt', aliases: ['yoghurt', 'yogurt', 'greek yogurt'] },
  { id: 'p04', name: 'Western Star Butter', brand: 'Western Star', category: 'Dairy', size: '250g', genericType: 'butter_250g', aliases: ['butter'] },
  // Bakery
  { id: 'p05', name: 'Tip Top Bread White', brand: 'Tip Top', category: 'Bakery', size: '700g', genericType: 'white_bread', aliases: ['bread', 'white bread', 'loaf'] },
  { id: 'p06', name: 'Helgas Wholemeal Bread', brand: 'Helgas', category: 'Bakery', size: '750g', genericType: 'wholemeal_bread', aliases: ['bread', 'wholemeal', 'whole grain bread', 'brown bread'] },
  // Breakfast
  { id: 'p07', name: 'Weet-Bix Original', brand: 'Sanitarium', category: 'Breakfast', size: '1.2kg', genericType: 'cereal', aliases: ['cereal', 'weetbix', 'weet bix', 'breakfast cereal'] },
  { id: 'p08', name: "Uncle Tobys Oats Quick", brand: "Uncle Tobys", category: 'Breakfast', size: '1kg', genericType: 'rolled_oats', aliases: ['oats', 'porridge', 'rolled oats'] },
  // Biscuits & Snacks
  { id: 'p09', name: "Arnott's Tim Tam Original", brand: "Arnott's", category: 'Biscuits', size: '200g', genericType: 'tim_tams', aliases: ['tim tam', 'tim tams', 'biscuits', 'chocolate biscuits'] },
  { id: 'p10', name: "Arnott's Shapes BBQ", brand: "Arnott's", category: 'Snacks', size: '175g', aliases: ['shapes', 'savoury biscuits'] },
  { id: 'p11', name: "Smith's Original Chips", brand: "Smith's", category: 'Snacks', size: '170g', genericType: 'chips_potato', aliases: ['chips', 'crisps', 'potato chips'] },
  // Chocolate
  { id: 'p12', name: 'Cadbury Dairy Milk Block', brand: 'Cadbury', category: 'Chocolate', size: '180g', genericType: 'chocolate_block', aliases: ['chocolate', 'chocolate block', 'dairy milk'] },
  { id: 'p13', name: 'Lindt Excellence 70% Cocoa', brand: 'Lindt', category: 'Chocolate', size: '100g', aliases: ['dark chocolate', 'chocolate'] },
  // Drinks
  { id: 'p14', name: 'Coca-Cola Classic', brand: 'Coca-Cola', category: 'Drinks', size: '2L', genericType: 'cola_2l', aliases: ['coke', 'coca cola', 'cola', 'soft drink'] },
  { id: 'p15', name: 'Pepsi Max', brand: 'Pepsi', category: 'Drinks', size: '2L', aliases: ['pepsi', 'cola', 'soft drink'] },
  { id: 'p16', name: 'Mount Franklin Water', brand: 'Mount Franklin', category: 'Drinks', size: '6x500ml', genericType: 'bottled_water', aliases: ['water', 'bottled water', 'spring water'] },
  // Pantry
  { id: 'p17', name: 'Barilla Spaghetti', brand: 'Barilla', category: 'Pantry', size: '500g', genericType: 'pasta', aliases: ['pasta', 'spaghetti', 'noodles'] },
  { id: 'p18', name: 'Leggo\'s Pasta Sauce Bolognese', brand: 'Leggo\'s', category: 'Pantry', size: '500g', genericType: 'pasta_sauce', aliases: ['pasta sauce', 'bolognese sauce', 'tomato sauce'] },
  { id: 'p19', name: 'SunRice Medium Grain Rice', brand: 'SunRice', category: 'Pantry', size: '5kg', aliases: ['rice', 'medium grain rice'] },
  { id: 'p20', name: 'MasterFoods Vegemite', brand: 'MasterFoods', category: 'Pantry', size: '380g', aliases: ['vegemite', 'spread'] },
  { id: 'p21', name: 'Bega Peanut Butter Smooth', brand: 'Bega', category: 'Pantry', size: '470g', genericType: 'peanut_butter', aliases: ['peanut butter', 'pb'] },
  { id: 'p22', name: "CSR White Sugar", brand: 'CSR', category: 'Pantry', size: '2kg', genericType: 'white_sugar', aliases: ['sugar', 'white sugar'] },
  // Meat & Protein
  { id: 'p23', name: 'Chicken Breast Fillets', brand: 'Store Brand', category: 'Meat', size: '1kg', genericType: 'chicken_breast', aliases: ['chicken', 'chicken breast', 'chicken fillet'] },
  { id: 'p24', name: 'Beef Mince Premium', brand: 'Store Brand', category: 'Meat', size: '500g', genericType: 'beef_mince', aliases: ['mince', 'beef mince', 'ground beef'] },
  { id: 'p25', name: 'John West Tuna in Springwater', brand: 'John West', category: 'Pantry', size: '95g', genericType: 'canned_tuna', aliases: ['tuna', 'canned tuna', 'tinned tuna'] },
  // Frozen
  { id: 'p26', name: 'McCain Super Fries', brand: 'McCain', category: 'Frozen', size: '1kg', aliases: ['frozen chips', 'fries', 'frozen fries'] },
  { id: 'p27', name: "Streets Magnum Classic 4pk", brand: 'Streets', category: 'Frozen', size: '4pk', aliases: ['ice cream', 'magnum'] },
  // Cleaning
  { id: 'p28', name: 'Finish Powerball Dishwasher Tabs', brand: 'Finish', category: 'Cleaning', size: '56pk', aliases: ['dishwasher tabs', 'dishwasher', 'finish'] },
  { id: 'p29', name: 'OMO Laundry Liquid', brand: 'OMO', category: 'Cleaning', size: '2L', genericType: 'laundry_detergent', aliases: ['laundry detergent', 'washing liquid', 'laundry liquid'] },
  { id: 'p30', name: 'Kleenex Toilet Tissue', brand: 'Kleenex', category: 'Household', size: '24pk', genericType: 'toilet_paper', aliases: ['toilet paper', 'toilet tissue', 'tp', 'bog roll'] },
  // Produce
  { id: 'p31', name: 'Bananas', brand: 'Fresh', category: 'Produce', size: '1kg', aliases: ['banana', 'bananas'] },
  { id: 'p32', name: 'Avocados', brand: 'Fresh', category: 'Produce', size: 'each', aliases: ['avocado', 'avo'] },
  { id: 'p33', name: 'Royal Gala Apples', brand: 'Fresh', category: 'Produce', size: '1kg', aliases: ['apples', 'apple'] },
  // Baby & Personal
  { id: 'p34', name: 'Huggies Nappies Crawler', brand: 'Huggies', category: 'Baby', size: '72pk', aliases: ['nappies', 'diapers', 'huggies'] },
  { id: 'p35', name: 'Colgate Total Toothpaste', brand: 'Colgate', category: 'Personal', size: '200g', genericType: 'toothpaste', aliases: ['toothpaste'] },
  // Coffee
  { id: 'p36', name: 'Nescafe Blend 43', brand: 'Nescafe', category: 'Drinks', size: '500g', genericType: 'instant_coffee', aliases: ['coffee', 'instant coffee'] },
  { id: 'p37', name: 'Bonsoy Soy Milk', brand: 'Bonsoy', category: 'Dairy', size: '1L', aliases: ['soy milk', 'plant milk'] },
  // Eggs
  { id: 'p38', name: 'Cage Free Eggs', brand: 'Store Brand', category: 'Dairy', size: '12pk', genericType: 'eggs_dozen', aliases: ['eggs', 'cage free eggs', 'free range eggs'] },
  // Olive Oil
  { id: 'p39', name: 'Cobram Estate Extra Virgin Olive Oil', brand: 'Cobram', category: 'Pantry', size: '750ml', aliases: ['olive oil', 'evoo'] },
  // Tea
  { id: 'p40', name: 'Twinings English Breakfast Tea', brand: 'Twinings', category: 'Drinks', size: '100 bags', genericType: 'black_tea', aliases: ['tea', 'tea bags', 'black tea'] },
  // Hair Care
  { id: 'p41', name: 'Pantene Shampoo Daily Moisture', brand: 'Pantene', category: 'Hair Care', size: '350ml', genericType: 'shampoo', aliases: ['shampoo', 'hair wash'] },
  { id: 'p42', name: 'Pantene Conditioner Daily Moisture', brand: 'Pantene', category: 'Hair Care', size: '350ml', genericType: 'conditioner', aliases: ['conditioner'] },
  { id: 'p43', name: 'Head & Shoulders Anti-Dandruff Shampoo', brand: 'Head & Shoulders', category: 'Hair Care', size: '400ml', genericType: 'shampoo', aliases: ['shampoo', 'anti-dandruff shampoo'] },
  { id: 'p44', name: 'Garnier Fructis Shampoo', brand: 'Garnier', category: 'Hair Care', size: '315ml', genericType: 'shampoo', aliases: ['shampoo'] },
  { id: 'p45', name: 'TRESemmé Hair Spray Extra Hold', brand: 'TRESemmé', category: 'Hair Care', size: '360g', aliases: ['hair spray', 'hairspray'] },
  { id: 'p46', name: "L'Oréal Excellence Hair Colour", brand: "L'Oréal", category: 'Hair Care', size: '1pk', aliases: ['hair dye', 'hair colour', 'hair color'] },
  // Skin Care
  { id: 'p47', name: 'Cetaphil Moisturising Lotion', brand: 'Cetaphil', category: 'Skin Care', size: '500ml', genericType: 'moisturiser', aliases: ['moisturiser', 'moisturizer', 'lotion'] },
  { id: 'p48', name: 'Cancer Council Sunscreen SPF50+', brand: 'Cancer Council', category: 'Skin Care', size: '200ml', genericType: 'sunscreen', aliases: ['sunscreen', 'sunblock', 'spf'] },
  { id: 'p49', name: 'Dove Beauty Bar Soap', brand: 'Dove', category: 'Personal', size: '4pk', genericType: 'bar_soap', aliases: ['soap', 'bar soap'] },
  // More Personal Care
  { id: 'p50', name: 'Rexona Antiperspirant Roll-On', brand: 'Rexona', category: 'Personal', size: '50ml', genericType: 'deodorant', aliases: ['deodorant', 'antiperspirant', 'roll on'] },
  { id: 'p51', name: 'Listerine Mouthwash Cool Mint', brand: 'Listerine', category: 'Personal', size: '500ml', aliases: ['mouthwash'] },
  // More Pantry
  { id: 'p52', name: 'Wattle Valley Soy Sauce', brand: 'Kikkoman', category: 'Pantry', size: '250ml', aliases: ['soy sauce'] },
  { id: 'p53', name: 'Continental Cup-a-Soup Chicken', brand: 'Continental', category: 'Pantry', size: '4pk', aliases: ['soup', 'cup a soup'] },
  // More Frozen
  { id: 'p54', name: 'Birds Eye Fish Fingers', brand: 'Birds Eye', category: 'Frozen', size: '24pk', aliases: ['fish fingers', 'fish'] },
  // Paper & Household
  { id: 'p55', name: 'Viva Paper Towel', brand: 'Viva', category: 'Household', size: '2pk', genericType: 'paper_towel', aliases: ['paper towel', 'kitchen towel'] },
  // Pet
  { id: 'p56', name: 'Whiskas Cat Food Tuna', brand: 'Whiskas', category: 'Pet', size: '400g', aliases: ['cat food'] },
  { id: 'p57', name: 'Pedigree Dog Food Chicken', brand: 'Pedigree', category: 'Pet', size: '700g', aliases: ['dog food'] },
  // Baby
  { id: 'p58', name: 'Huggies Baby Wipes', brand: 'Huggies', category: 'Baby', size: '80pk', aliases: ['baby wipes', 'wipes'] },
  // ─── Generic-type variants added so "haloumi", "milk", "shampoo", etc.
  //     have multiple brands to compare across retailers.
  // Halloumi cheese
  { id: 'p60', name: 'Lemnos Halloumi Cheese', brand: 'Lemnos', category: 'Dairy', size: '180g', genericType: 'halloumi', aliases: ['haloumi', 'halloumi', 'halloumy', 'cypriot cheese'] },
  { id: 'p61', name: 'Dodoni Halloumi', brand: 'Dodoni', category: 'Dairy', size: '225g', genericType: 'halloumi', aliases: ['haloumi', 'halloumi', 'halloumy'] },
  { id: 'p62', name: 'Woolworths Halloumi', brand: 'Woolworths Select', category: 'Dairy', size: '180g', genericType: 'halloumi', aliases: ['haloumi', 'halloumi'] },
  { id: 'p63', name: 'Coles Halloumi', brand: 'Coles', category: 'Dairy', size: '180g', genericType: 'halloumi', aliases: ['haloumi', 'halloumi'] },
  // Tasty cheese block — extra brands
  { id: 'p64', name: 'Bega Tasty Cheese Block', brand: 'Bega', category: 'Dairy', size: '500g', genericType: 'tasty_cheese_500g', aliases: ['cheese', 'tasty cheese', 'cheddar'] },
  { id: 'p65', name: 'Coles Tasty Cheese', brand: 'Coles', category: 'Dairy', size: '500g', genericType: 'tasty_cheese_500g', aliases: ['cheese', 'tasty cheese'] },
  // Milk 2L — extra brands
  { id: 'p66', name: 'Coles Full Cream Milk', brand: 'Coles', category: 'Dairy', size: '2L', genericType: 'milk_2l', aliases: ['milk', 'full cream milk'] },
  { id: 'p67', name: 'Woolworths Full Cream Milk', brand: 'Woolworths', category: 'Dairy', size: '2L', genericType: 'milk_2l', aliases: ['milk', 'full cream milk'] },
  { id: 'p68', name: 'Dairy Farmers Full Cream Milk', brand: 'Dairy Farmers', category: 'Dairy', size: '2L', genericType: 'milk_2l', aliases: ['milk', 'full cream milk'] },
  // Basmati rice 1kg
  { id: 'p69', name: 'SunRice Basmati Rice', brand: 'SunRice', category: 'Pantry', size: '1kg', genericType: 'basmati_rice', aliases: ['rice', 'basmati', 'basmati rice'] },
  { id: 'p70', name: 'Coles Basmati Rice', brand: 'Coles', category: 'Pantry', size: '1kg', genericType: 'basmati_rice', aliases: ['rice', 'basmati'] },
  { id: 'p71', name: 'Woolworths Basmati Rice', brand: 'Woolworths', category: 'Pantry', size: '1kg', genericType: 'basmati_rice', aliases: ['rice', 'basmati'] },
  // Peanut butter — extra brand
  { id: 'p72', name: 'Kraft Peanut Butter Smooth', brand: 'Kraft', category: 'Pantry', size: '375g', genericType: 'peanut_butter', aliases: ['peanut butter', 'pb'] },
  // Toilet paper — extra brand
  { id: 'p73', name: 'Quilton Toilet Tissue', brand: 'Quilton', category: 'Household', size: '24pk', genericType: 'toilet_paper', aliases: ['toilet paper', 'toilet tissue'] },
  // Toothpaste — extra brand
  { id: 'p74', name: 'Sensodyne Daily Care Toothpaste', brand: 'Sensodyne', category: 'Personal', size: '110g', genericType: 'toothpaste', aliases: ['toothpaste', 'sensitive toothpaste'] },
];

// ─── Store info derived from real OSM data ───
// `buildOffers` accepts a list of real stores (loaded from Overpass via
// `/api/stores`) and picks the closest one per retailer for distance
// calculations. No more hash-based fake locations.

export interface StoreInfo {
  storeId: string;
  retailerCode: string;
  storeName: string;
  distanceLabel: string;
  /** Opening hours from OSM `opening_hours` tag (raw); may be undefined. */
  hours?: string;
  address?: string;
  lat: number;
  lng: number;
  isConvenience?: boolean;
}

/** Minimum subset of a real store needed to build offers. */
export interface RealStoreLike {
  id: number;
  retailerCode: string;
  isConvenience: boolean;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  openingHours?: string;
  distanceKm?: number;
}

/**
 * Pick the closest real store per retailer code that we have prices for.
 * Returns one StoreInfo per retailer that has at least one nearby OSM hit.
 * Convenience-format outlets are skipped for full-basket offers; they are
 * surfaced separately for top-up shopping.
 */
function pickNearestPerRetailer(
  origin: { lat: number; lng: number },
  realStores: readonly RealStoreLike[],
): StoreInfo[] {
  const byRetailer = new Map<string, RealStoreLike>();
  for (const s of realStores) {
    // For the main basket optimiser we only want full-size supermarkets —
    // a 7-Eleven won't carry a 5kg rice bag. Convenience hits still show
    // on the map for context but don't participate in offer ranking.
    if (s.isConvenience) continue;
    const existing = byRetailer.get(s.retailerCode);
    const d = s.distanceKm ?? haversineKm(origin, s);
    if (!existing || d < (existing.distanceKm ?? haversineKm(origin, existing))) {
      byRetailer.set(s.retailerCode, { ...s, distanceKm: d });
    }
  }

  return Array.from(byRetailer.values()).map((s) => ({
    storeId: `osm-${s.id}`,
    retailerCode: s.retailerCode,
    storeName: s.name,
    distanceLabel: `${(s.distanceKm ?? 0).toFixed(1)} km from you`,
    hours: s.openingHours,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    isConvenience: false,
  }));
}

/** Most recent assignment of nearest store per retailer, for the results UI. */
let _lastStores: StoreInfo[] = [];

export function getNearestStores(): StoreInfo[] {
  return _lastStores;
}

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
  { productId: 'p05', retailerCode: 'aldi', price: 3.29, isTrueSpecial: false, memberOnly: false },
  { productId: 'p06', retailerCode: 'aldi', price: 4.49, isTrueSpecial: false, memberOnly: false },
  { productId: 'p08', retailerCode: 'aldi', price: 5.99, isTrueSpecial: false, memberOnly: false },
  // Biscuits & Snacks
  { productId: 'p09', retailerCode: 'coles', price: 2.75, isTrueSpecial: true, memberOnly: false },
  { productId: 'p09', retailerCode: 'woolworths', price: 3.65, isTrueSpecial: false, memberOnly: false },
  { productId: 'p09', retailerCode: 'aldi', price: 3.49, isTrueSpecial: false, memberOnly: false },
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
  // Hair Care
  { productId: 'p41', retailerCode: 'coles', price: 8.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p41', retailerCode: 'woolworths', price: 7.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p41', retailerCode: 'aldi', price: 4.99, isTrueSpecial: false, memberOnly: false },
  { productId: 'p42', retailerCode: 'coles', price: 8.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p42', retailerCode: 'woolworths', price: 7.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p43', retailerCode: 'coles', price: 10.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p43', retailerCode: 'woolworths', price: 12.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p44', retailerCode: 'coles', price: 6.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p44', retailerCode: 'woolworths', price: 5.50, isTrueSpecial: true, memberOnly: false },
  { productId: 'p45', retailerCode: 'coles', price: 7.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p45', retailerCode: 'woolworths', price: 7.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p46', retailerCode: 'coles', price: 16.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p46', retailerCode: 'woolworths', price: 14.00, isTrueSpecial: true, memberOnly: false },
  // Skin Care
  { productId: 'p47', retailerCode: 'coles', price: 14.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p47', retailerCode: 'woolworths', price: 12.50, isTrueSpecial: true, memberOnly: false },
  { productId: 'p48', retailerCode: 'coles', price: 11.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p48', retailerCode: 'woolworths', price: 10.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p49', retailerCode: 'coles', price: 6.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p49', retailerCode: 'woolworths', price: 7.50, isTrueSpecial: false, memberOnly: false },
  // Personal Care
  { productId: 'p50', retailerCode: 'coles', price: 5.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p50', retailerCode: 'woolworths', price: 4.50, isTrueSpecial: true, memberOnly: false },
  { productId: 'p51', retailerCode: 'coles', price: 8.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p51', retailerCode: 'woolworths', price: 7.00, isTrueSpecial: true, memberOnly: false },
  // More Pantry
  { productId: 'p52', retailerCode: 'coles', price: 3.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p52', retailerCode: 'woolworths', price: 3.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p52', retailerCode: 'aldi', price: 2.49, isTrueSpecial: false, memberOnly: false },
  { productId: 'p53', retailerCode: 'coles', price: 3.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p53', retailerCode: 'woolworths', price: 4.00, isTrueSpecial: false, memberOnly: false },
  // Frozen
  { productId: 'p54', retailerCode: 'coles', price: 6.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p54', retailerCode: 'woolworths', price: 5.50, isTrueSpecial: true, memberOnly: false },
  // Paper
  { productId: 'p55', retailerCode: 'coles', price: 4.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p55', retailerCode: 'woolworths', price: 4.00, isTrueSpecial: true, memberOnly: false },
  // Pet
  { productId: 'p56', retailerCode: 'coles', price: 2.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p56', retailerCode: 'woolworths', price: 2.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p57', retailerCode: 'coles', price: 3.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p57', retailerCode: 'woolworths', price: 3.00, isTrueSpecial: true, memberOnly: false },
  // Baby
  { productId: 'p58', retailerCode: 'coles', price: 5.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p58', retailerCode: 'woolworths', price: 4.50, isTrueSpecial: true, memberOnly: false },
  // ─── Generic-type variants ───
  // Halloumi (p60-p63)
  { productId: 'p60', retailerCode: 'coles', price: 7.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p60', retailerCode: 'woolworths', price: 6.50, isTrueSpecial: true, memberOnly: false },
  { productId: 'p60', retailerCode: 'aldi', price: 5.99, isTrueSpecial: false, memberOnly: false },
  { productId: 'p61', retailerCode: 'coles', price: 9.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p61', retailerCode: 'woolworths', price: 9.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p62', retailerCode: 'woolworths', price: 5.50, isTrueSpecial: true, memberOnly: false },
  { productId: 'p63', retailerCode: 'coles', price: 5.50, isTrueSpecial: true, memberOnly: false },
  // Tasty cheese block — extras (p64-p65)
  { productId: 'p64', retailerCode: 'coles', price: 9.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p64', retailerCode: 'woolworths', price: 8.50, isTrueSpecial: true, memberOnly: false },
  { productId: 'p64', retailerCode: 'iga', price: 9.80, isTrueSpecial: false, memberOnly: false },
  { productId: 'p65', retailerCode: 'coles', price: 6.50, isTrueSpecial: true, memberOnly: false },
  // Store-brand milk (p66-p68)
  { productId: 'p66', retailerCode: 'coles', price: 3.10, isTrueSpecial: false, memberOnly: false },
  { productId: 'p67', retailerCode: 'woolworths', price: 3.10, isTrueSpecial: false, memberOnly: false },
  { productId: 'p68', retailerCode: 'coles', price: 4.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p68', retailerCode: 'woolworths', price: 4.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p68', retailerCode: 'iga', price: 4.80, isTrueSpecial: false, memberOnly: false },
  // Basmati rice (p69-p71)
  { productId: 'p69', retailerCode: 'coles', price: 5.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p69', retailerCode: 'woolworths', price: 5.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p69', retailerCode: 'aldi', price: 4.49, isTrueSpecial: false, memberOnly: false },
  { productId: 'p70', retailerCode: 'coles', price: 3.80, isTrueSpecial: false, memberOnly: false },
  { productId: 'p71', retailerCode: 'woolworths', price: 3.80, isTrueSpecial: false, memberOnly: false },
  // Peanut butter extras (p72)
  { productId: 'p72', retailerCode: 'coles', price: 4.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p72', retailerCode: 'woolworths', price: 4.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p72', retailerCode: 'iga', price: 4.80, isTrueSpecial: false, memberOnly: false },
  // Quilton toilet tissue (p73)
  { productId: 'p73', retailerCode: 'coles', price: 14.00, isTrueSpecial: false, memberOnly: false },
  { productId: 'p73', retailerCode: 'woolworths', price: 13.00, isTrueSpecial: true, memberOnly: false },
  { productId: 'p73', retailerCode: 'iga', price: 14.50, isTrueSpecial: false, memberOnly: false },
  // Sensodyne toothpaste (p74)
  { productId: 'p74', retailerCode: 'coles', price: 8.50, isTrueSpecial: false, memberOnly: false },
  { productId: 'p74', retailerCode: 'woolworths', price: 7.50, isTrueSpecial: true, memberOnly: false },
];

// ─── Convenience-store prices (display-only) ───
// We don't have full baskets at servos / corner shops, but they do carry
// top-up items at a premium. Surfacing these prices lets users see what
// they'd pay at 7-Eleven / BP / Ampol if they grabbed the item there in
// a pinch. These are NOT fed into the optimiser — they only appear in
// the per-line price-comparison strip.

interface ConveniencePrice {
  productId: string;
  retailerCode: string;
  price: number;
}

const CONVENIENCE_PRICES: ConveniencePrice[] = [
  // Milk 2L — typical conv markup is ~50% on dairy
  { productId: 'p01', retailerCode: 'seven_eleven', price: 5.50 },
  { productId: 'p01', retailerCode: 'bp', price: 5.80 },
  { productId: 'p01', retailerCode: 'ampol', price: 5.80 },
  { productId: 'p01', retailerCode: 'otr', price: 5.20 },
  // Tip Top Bread 700g
  { productId: 'p05', retailerCode: 'seven_eleven', price: 5.50 },
  { productId: 'p05', retailerCode: 'bp', price: 5.80 },
  { productId: 'p05', retailerCode: 'otr', price: 5.20 },
  // Tim Tams 200g — conv stores typically charge full RRP
  { productId: 'p09', retailerCode: 'seven_eleven', price: 5.80 },
  { productId: 'p09', retailerCode: 'bp', price: 6.00 },
  { productId: 'p09', retailerCode: 'ampol', price: 6.00 },
  { productId: 'p09', retailerCode: 'nightowl', price: 5.50 },
  // Smith's chips 170g — common grab-and-go
  { productId: 'p11', retailerCode: 'seven_eleven', price: 5.20 },
  { productId: 'p11', retailerCode: 'bp', price: 5.50 },
  { productId: 'p11', retailerCode: 'ampol', price: 5.50 },
  { productId: 'p11', retailerCode: 'nightowl', price: 5.00 },
  { productId: 'p11', retailerCode: 'lucky_7', price: 4.80 },
  // Cadbury Dairy Milk Block 180g
  { productId: 'p12', retailerCode: 'seven_eleven', price: 5.50 },
  { productId: 'p12', retailerCode: 'bp', price: 5.80 },
  { productId: 'p12', retailerCode: 'ampol', price: 5.80 },
  { productId: 'p12', retailerCode: 'nightowl', price: 5.20 },
  // Coca-Cola 2L
  { productId: 'p14', retailerCode: 'seven_eleven', price: 4.20 },
  { productId: 'p14', retailerCode: 'bp', price: 4.50 },
  { productId: 'p14', retailerCode: 'ampol', price: 4.50 },
  { productId: 'p14', retailerCode: 'shell', price: 4.50 },
  { productId: 'p14', retailerCode: 'mobil', price: 4.50 },
  { productId: 'p14', retailerCode: 'otr', price: 4.00 },
  // Pepsi Max 2L
  { productId: 'p15', retailerCode: 'seven_eleven', price: 4.20 },
  { productId: 'p15', retailerCode: 'bp', price: 4.50 },
  // Mount Franklin Water 6pk — single-bottle conv pricing
  { productId: 'p16', retailerCode: 'seven_eleven', price: 7.50 },
  { productId: 'p16', retailerCode: 'bp', price: 7.80 },
  // Tuna can — convenience for lunch
  { productId: 'p25', retailerCode: 'seven_eleven', price: 3.50 },
  { productId: 'p25', retailerCode: 'bp', price: 3.80 },
  // Eggs 12pk
  { productId: 'p38', retailerCode: 'seven_eleven', price: 7.50 },
  { productId: 'p38', retailerCode: 'otr', price: 7.00 },
  // Instant coffee Nescafe — small jar conv style
  { productId: 'p36', retailerCode: 'seven_eleven', price: 24.00 },
  // Colgate toothpaste — toiletries pickup
  { productId: 'p35', retailerCode: 'seven_eleven', price: 8.50 },
  { productId: 'p35', retailerCode: 'bp', price: 8.80 },
];

export interface PriceQuote {
  productId: string;
  retailerCode: string;
  price: number;
  isTrueSpecial: boolean;
  memberOnly: boolean;
  isConvenience: boolean;
}

/**
 * Return every known price for a product — across supermarkets (from
 * PRICE_MATRIX) and convenience stores (from CONVENIENCE_PRICES).
 * Sorted cheapest-first. Used by the UI to render the "all prices"
 * strip under each line item.
 */
export function getAllPricesFor(productId: string): PriceQuote[] {
  const quotes: PriceQuote[] = [];
  for (const pe of PRICE_MATRIX) {
    if (pe.productId !== productId) continue;
    quotes.push({
      productId: pe.productId,
      retailerCode: pe.retailerCode,
      price: pe.price,
      isTrueSpecial: pe.isTrueSpecial,
      memberOnly: pe.memberOnly,
      isConvenience: false,
    });
  }
  for (const cp of CONVENIENCE_PRICES) {
    if (cp.productId !== productId) continue;
    quotes.push({
      productId: cp.productId,
      retailerCode: cp.retailerCode,
      price: cp.price,
      isTrueSpecial: false,
      memberOnly: false,
      isConvenience: true,
    });
  }
  return quotes.sort((a, b) => a.price - b.price);
}

// ─── Build Offers (matching OptimiserOffer shape) ───

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Build the full offer list for the optimizer.
 *
 * If `realStores` is provided we map each retailer to its closest real OSM
 * store and use that for the storeId/location/distance. Retailers with no
 * nearby OSM hit are excluded from the offer pool — we'd rather be honest
 * than fake a location.
 *
 * If `realStores` is empty (e.g. Overpass is unreachable), we fall back to
 * the user origin itself with `distanceKm = 0` so the optimiser still has
 * something to chew on — the UI flags this case as "estimated".
 */
export function buildOffers(
  origin: { lat: number; lng: number },
  realStores: readonly RealStoreLike[] = [],
): OptimiserOffer[] {
  const nearbyStores = pickNearestPerRetailer(origin, realStores);
  _lastStores = nearbyStores;
  const storeByRetailer = new Map<string, StoreInfo>();
  for (const s of nearbyStores) {
    storeByRetailer.set(s.retailerCode, s);
  }

  const haveRealData = nearbyStores.length > 0;

  return PRICE_MATRIX.flatMap((pe) => {
    const store = storeByRetailer.get(pe.retailerCode);
    const product = CATALOGUE_PRODUCTS.find((p) => p.id === pe.productId)!;

    // If we have real data and there's no store of this retailer nearby,
    // skip — be honest rather than fake a store.
    if (haveRealData && !store) return [];

    const dist = store ? haversineKm(origin, store) : 0;

    return [{
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
    }];
  });
}
