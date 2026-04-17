import { z } from 'zod';
import { RetailerCode } from './retailer.js';

/** A geographic coordinate (WGS84). */
export const LatLng = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type LatLng = z.infer<typeof LatLng>;

/** A physical retailer location. */
export const Store = z.object({
  id: z.string().uuid(),
  retailerCode: RetailerCode,
  /** Retailer-internal store number. */
  externalId: z.string(),
  name: z.string(),
  addressLine1: z.string(),
  suburb: z.string(),
  state: z.enum(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']),
  postcode: z.string().regex(/^\d{4}$/),
  location: LatLng,
  phone: z.string().nullable().default(null),
  /** Services this store offers. */
  offersDelivery: z.boolean().default(false),
  offersClickAndCollect: z.boolean().default(true),
  offersDirectToBoot: z.boolean().default(false),
  /** Opening hours are stored per weekday (0=Sun..6=Sat). Null = closed. */
  openingHours: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        open: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
        close: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
      }),
    )
    .length(7),
});
export type Store = z.infer<typeof Store>;
