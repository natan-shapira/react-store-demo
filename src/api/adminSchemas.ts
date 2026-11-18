import { z } from "zod";
import { ORDER_STATUSES } from "./adminTypes";
import { dummyProductSchema } from "./schemas";

export { ORDER_STATUSES };
export type { OrderStatus, OrderStatusCount, SalesPoint, SampleOrder } from "./adminTypes";

// Zod schemas for the data only the admin area reads. They live apart from schemas.ts because
// that file is part of the bundle every user downloads; this one is imported only by admin code.
// Importing shared pieces from schemas.ts is fine, the opposite direction is not.

// DummyJSON has no orders, so the admin area treats each cart as an order (GET /carts).
// A cart has no date and no status, so charts over time or by status still need sample data.

const money = z.number().nonnegative();

// One line of a cart: the product as it was added, with its quantity and line totals
export const dummyCartProductSchema = dummyProductSchema
  .pick({ id: true, title: true, price: true, thumbnail: true })
  .extend({
    quantity: z.number().int().positive(),
    total: money,
    discountPercentage: z.number().min(0).max(100),
    discountedTotal: money,
  });

export const dummyCartSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  products: z.array(dummyCartProductSchema),
  total: money,
  discountedTotal: money,
  // Number of different products, and the sum of their quantities
  totalProducts: z.number().int().nonnegative(),
  totalQuantity: z.number().int().nonnegative(),
});

// GET /carts is paginated like /products; ?limit=0 returns every cart
export const dummyCartsResponseSchema = z.object({
  carts: z.array(dummyCartSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
});

export type DummyCart = z.infer<typeof dummyCartSchema>;
export type DummyCartsResponse = z.infer<typeof dummyCartsResponseSchema>;

// The product fields the admin charts read (GET /products?select=...): one response feeds the
// products-by-category, stock and ratings charts
export const productStatSchema = dummyProductSchema
  .pick({ id: true, title: true, category: true, price: true })
  .extend({
    stock: z.number().int().nonnegative(),
    rating: z.number().min(0).max(5),
  });

export const productStatsResponseSchema = z.object({
  products: z.array(productStatSchema),
  total: z.number().int().nonnegative(),
});

// The user fields the admin charts read (GET /users?select=role,gender,age). Role and gender are
// plain strings, so a new value on the server shows up as one more group instead of failing.
export const userStatSchema = z.object({
  id: z.number().int(),
  role: z.string(),
  gender: z.string(),
  age: z.number().int().nonnegative(),
});

export const userStatsResponseSchema = z.object({
  users: z.array(userStatSchema),
  total: z.number().int().nonnegative(),
});

export type ProductStat = z.infer<typeof productStatSchema>;
export type UserStat = z.infer<typeof userStatSchema>;

// Sales per month. DummyJSON has no such endpoint, so this is the shape the project's own server
// is expected to return; the sample data in adminSampleData.ts is checked against it in tests.
export const salesPointSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  revenue: money,
  orders: z.number().int().nonnegative(),
});

export const salesOverTimeSchema = z.array(salesPointSchema);

export const orderStatusSchema = z.enum(ORDER_STATUSES);

// Number of orders in each status. Also a server-only shape: a DummyJSON cart has no status.
export const orderStatusCountSchema = z.object({
  status: orderStatusSchema,
  count: z.number().int().nonnegative(),
});

export const orderStatusesSchema = z.array(orderStatusCountSchema);

// One order with a date and a status. DummyJSON carts have neither, so Over time, date-range
// filters and the orders table use this shape (sample data now, the project's server later).
export const sampleOrderSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/),
  status: orderStatusSchema,
  itemCount: z.number().int().positive(),
  total: money,
  discountedTotal: money,
});

export const sampleOrdersSchema = z.array(sampleOrderSchema);
