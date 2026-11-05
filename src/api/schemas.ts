import { z } from "zod";
import { type Category, type User } from "../types";

// Schemas describe only the fields the app reads; z.object strips every other key

export const dummyProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
  description: z.string(),
  category: z.string(),
  thumbnail: z.string(),
});

export const dummyProductsResponseSchema = z.object({
  products: z.array(dummyProductSchema),
  total: z.number(),
});

const categorySchema = z.object({
  slug: z.string(),
  name: z.string(),
  url: z.string(),
}) satisfies z.ZodType<Category>;

export const categoriesSchema = z.array(categorySchema);

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  image: z.string().optional(),
}) satisfies z.ZodType<User>;

export const dummyLoginResponseSchema = userSchema.extend({
  accessToken: z.string(),
});

export type DummyProductItem = z.infer<typeof dummyProductSchema>;
