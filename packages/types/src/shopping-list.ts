import { z } from 'zod';

export const ShoppingListItem = z.object({
  id: z.string().uuid(),
  /** Free-text entry as the user typed it. */
  query: z.string().min(1).max(200),
  /** Resolved canonical product, if any. */
  productId: z.string().uuid().nullable(),
  quantity: z.number().positive().default(1),
  notes: z.string().max(500).nullable().default(null),
  addedAt: z.string().datetime(),
});
export type ShoppingListItem = z.infer<typeof ShoppingListItem>;

export const ShoppingList = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(80).default('My shopping list'),
  items: z.array(ShoppingListItem).default([]),
  sharedWithUserIds: z.array(z.string().uuid()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ShoppingList = z.infer<typeof ShoppingList>;
