# Overview

SmartShopper is an Australian grocery price-comparison web app: enter your
postcode, build a shopping list, and it finds the cheapest way to buy it
across 20+ supermarkets and convenience stores — factoring in real store
distances, travel/fuel cost, delivery fees, and loyalty pricing.

## Core flow

1. `/shop` — enter a postcode (→ lat/lng).
2. `/shop/list` — search the catalogue, build a list, set preferences
   (max stores, max travel, loyalty memberships).
3. `/shop/results` — the basket optimiser ranks purchase plans
   (single-retailer vs multi-retailer), shows a verdict card, per-line
   all-retailer price strips, and a real OpenStreetMap store map.

## Principles

- **No fake data.** Distances, store details, and prices are real or
  clearly labelled as estimates/demo. Half the git history is removing
  fabricated numbers — keep it that way.
- The basket optimiser (`packages/core`) is sealed: it consumes
  `OptimiserOffer[]`. The only swap-point for the price source is
  `buildOffers()` in `apps/web/src/lib/catalogue.ts`.
