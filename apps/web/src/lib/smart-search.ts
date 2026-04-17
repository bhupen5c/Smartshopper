/**
 * Smart search: when the user types a vague/category-level query like
 * "hair products" or "something for dinner", we probe with follow-up
 * options to narrow down what they actually want.
 *
 * Flow:
 *  1. User types query → fuzzyMatch against products
 *  2. If good product matches → show them directly (existing flow)
 *  3. If no/weak matches → check against intent categories
 *  4. If intent matches → show probing options (subcategories)
 *  5. User picks subcategory → show matching products
 */

import { CATALOGUE_PRODUCTS, type CatalogueProduct } from './catalogue';

// ─── Intent Category Tree ───

export interface ProbeOption {
  label: string;
  /** Keywords that map back to specific products in the catalogue */
  productKeywords: string[];
  emoji: string;
}

export interface IntentCategory {
  /** Trigger keywords — if the user's query contains any of these, we match */
  triggers: string[];
  /** What to ask the user */
  question: string;
  /** Options to show */
  options: ProbeOption[];
}

export const INTENT_CATEGORIES: IntentCategory[] = [
  {
    triggers: ['hair', 'shampoo', 'conditioner', 'hair care', 'hair product'],
    question: 'What kind of hair product are you looking for?',
    options: [
      { label: 'Shampoo', productKeywords: ['shampoo'], emoji: '🧴' },
      { label: 'Conditioner', productKeywords: ['conditioner'], emoji: '💆' },
      { label: 'Hair Dye / Colour', productKeywords: ['hair dye', 'hair colour', 'hair color'], emoji: '🎨' },
      { label: 'Styling Products', productKeywords: ['hair gel', 'hair spray', 'mousse', 'styling'], emoji: '💇' },
    ],
  },
  {
    triggers: ['skin', 'skin care', 'skincare', 'moisturiser', 'face', 'facial'],
    question: 'What kind of skin care product?',
    options: [
      { label: 'Moisturiser', productKeywords: ['moisturiser', 'moisturizer'], emoji: '🧴' },
      { label: 'Sunscreen', productKeywords: ['sunscreen', 'spf'], emoji: '☀️' },
      { label: 'Face Wash / Cleanser', productKeywords: ['face wash', 'cleanser'], emoji: '🫧' },
      { label: 'Body Lotion', productKeywords: ['body lotion', 'body cream'], emoji: '🤲' },
    ],
  },
  {
    triggers: ['clean', 'cleaning', 'household', 'cleaner'],
    question: 'What do you need to clean?',
    options: [
      { label: 'Laundry', productKeywords: ['laundry', 'omo', 'washing'], emoji: '👕' },
      { label: 'Dishes', productKeywords: ['dish', 'finish', 'dishwasher'], emoji: '🍽️' },
      { label: 'Bathroom / Toilet', productKeywords: ['toilet', 'bathroom', 'bleach'], emoji: '🚽' },
      { label: 'Kitchen / Surface', productKeywords: ['spray', 'wipe', 'surface', 'kitchen'], emoji: '🧹' },
    ],
  },
  {
    triggers: ['baby', 'infant', 'nappy', 'nappies', 'diaper'],
    question: 'What baby product are you after?',
    options: [
      { label: 'Nappies', productKeywords: ['nappies', 'huggies', 'nappy'], emoji: '👶' },
      { label: 'Baby Wipes', productKeywords: ['wipes', 'baby wipes'], emoji: '🧻' },
      { label: 'Baby Food / Formula', productKeywords: ['baby food', 'formula', 'baby cereal'], emoji: '🍼' },
      { label: 'Baby Wash / Care', productKeywords: ['baby wash', 'baby shampoo', 'baby cream'], emoji: '🛁' },
    ],
  },
  {
    triggers: ['snack', 'snacks', 'munchies', 'something to eat', 'hungry'],
    question: 'What kind of snack are you in the mood for?',
    options: [
      { label: 'Chips & Crisps', productKeywords: ['chips', 'crisps', 'smith'], emoji: '🍟' },
      { label: 'Biscuits & Cookies', productKeywords: ['biscuit', 'cookie', 'tim tam', 'arnott'], emoji: '🍪' },
      { label: 'Chocolate', productKeywords: ['chocolate', 'cadbury', 'lindt'], emoji: '🍫' },
      { label: 'Nuts & Trail Mix', productKeywords: ['nuts', 'trail mix', 'almond'], emoji: '🥜' },
    ],
  },
  {
    triggers: ['drink', 'drinks', 'beverage', 'thirsty', 'something to drink'],
    question: 'What kind of drink?',
    options: [
      { label: 'Soft Drinks', productKeywords: ['cola', 'pepsi', 'lemonade', 'soft drink'], emoji: '🥤' },
      { label: 'Water', productKeywords: ['water', 'mount franklin'], emoji: '💧' },
      { label: 'Coffee & Tea', productKeywords: ['coffee', 'tea', 'nescafe', 'twinings'], emoji: '☕' },
      { label: 'Juice', productKeywords: ['juice', 'orange juice'], emoji: '🧃' },
      { label: 'Milk & Plant Milk', productKeywords: ['milk', 'soy milk', 'oat milk', 'almond milk'], emoji: '🥛' },
    ],
  },
  {
    triggers: ['dinner', 'meal', 'cook', 'cooking', 'tonight', 'recipe', 'what to make'],
    question: 'What are you thinking of making?',
    options: [
      { label: 'Pasta Night', productKeywords: ['pasta', 'spaghetti', 'sauce'], emoji: '🍝' },
      { label: 'Stir Fry', productKeywords: ['chicken', 'rice', 'soy sauce', 'noodle'], emoji: '🥘' },
      { label: 'Burgers / BBQ', productKeywords: ['mince', 'beef', 'bread', 'cheese'], emoji: '🍔' },
      { label: 'Simple & Quick', productKeywords: ['egg', 'bread', 'cheese', 'butter'], emoji: '🥚' },
    ],
  },
  {
    triggers: ['breakfast', 'morning', 'cereal', 'brekkie'],
    question: 'What kind of breakfast?',
    options: [
      { label: 'Cereal', productKeywords: ['weet-bix', 'cereal', 'oats'], emoji: '🥣' },
      { label: 'Toast & Spreads', productKeywords: ['bread', 'vegemite', 'peanut butter', 'butter'], emoji: '🍞' },
      { label: 'Eggs & Protein', productKeywords: ['egg', 'bacon'], emoji: '🍳' },
      { label: 'Yoghurt & Fruit', productKeywords: ['yoghurt', 'yogurt', 'banana', 'apple'], emoji: '🫐' },
    ],
  },
  {
    triggers: ['health', 'healthy', 'diet', 'weight', 'low cal', 'low carb'],
    question: 'What healthy option are you after?',
    options: [
      { label: 'Fresh Fruit', productKeywords: ['banana', 'apple', 'avocado'], emoji: '🍎' },
      { label: 'Yoghurt', productKeywords: ['yoghurt', 'yogurt', 'chobani'], emoji: '🥛' },
      { label: 'Nuts & Seeds', productKeywords: ['nuts', 'almond', 'seeds'], emoji: '🌻' },
      { label: 'Rice & Grains', productKeywords: ['rice', 'oats', 'quinoa'], emoji: '🌾' },
    ],
  },
  {
    triggers: ['pet', 'cat', 'dog', 'pet food'],
    question: 'For which pet?',
    options: [
      { label: 'Dog Food', productKeywords: ['dog food', 'dog treat'], emoji: '🐕' },
      { label: 'Cat Food', productKeywords: ['cat food', 'whiskas'], emoji: '🐈' },
      { label: 'Pet Treats', productKeywords: ['pet treat', 'dog treat', 'cat treat'], emoji: '🦴' },
    ],
  },
  {
    triggers: ['tooth', 'teeth', 'dental', 'oral', 'toothpaste', 'toothbrush'],
    question: 'What dental product?',
    options: [
      { label: 'Toothpaste', productKeywords: ['toothpaste', 'colgate'], emoji: '🪥' },
      { label: 'Toothbrush', productKeywords: ['toothbrush'], emoji: '🦷' },
      { label: 'Mouthwash', productKeywords: ['mouthwash', 'listerine'], emoji: '💧' },
    ],
  },
  {
    triggers: ['tissue', 'paper', 'toilet paper', 'tissues', 'paper towel'],
    question: 'Which paper product?',
    options: [
      { label: 'Toilet Paper', productKeywords: ['toilet tissue', 'toilet paper', 'kleenex'], emoji: '🧻' },
      { label: 'Paper Towel', productKeywords: ['paper towel'], emoji: '🗞️' },
      { label: 'Facial Tissues', productKeywords: ['facial tissue', 'tissues'], emoji: '🤧' },
    ],
  },
];

// ─── Intent Matching ───

export interface IntentMatch {
  category: IntentCategory;
  /** 0-1 confidence based on how many trigger words matched */
  confidence: number;
}

/**
 * Check if a query matches an intent category rather than a specific product.
 * Returns the best matching category, or null if the query is specific enough
 * to go straight to product results.
 */
export function matchIntent(query: string): IntentMatch | null {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 3) return null;

  const words = q.split(/\s+/);
  let bestMatch: IntentMatch | null = null;

  for (const cat of INTENT_CATEGORIES) {
    let matchCount = 0;
    for (const trigger of cat.triggers) {
      if (q.includes(trigger)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      const confidence = matchCount / cat.triggers.length;
      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = { category: cat, confidence };
      }
    }
  }

  return bestMatch;
}

/**
 * Given a probing option's keywords, find matching products in the catalogue.
 */
export function findProductsByKeywords(keywords: string[]): CatalogueProduct[] {
  const matches: CatalogueProduct[] = [];

  for (const product of CATALOGUE_PRODUCTS) {
    const name = product.name.toLowerCase();
    const brand = product.brand.toLowerCase();
    const category = product.category.toLowerCase();

    for (const kw of keywords) {
      const k = kw.toLowerCase();
      if (name.includes(k) || brand.includes(k) || category.includes(k)) {
        matches.push(product);
        break;
      }
    }
  }

  return matches;
}
