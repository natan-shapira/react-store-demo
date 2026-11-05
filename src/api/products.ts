import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type Category, type Product } from "../types";
import { fetchJson } from "./fetchJson";
import {
  categoriesSchema,
  dummyProductSchema,
  dummyProductsResponseSchema,
  type DummyProductItem,
} from "./schemas";

export interface ProductsPage {
  products: Product[];
  total: number;
}

export const PRODUCTS_PER_PAGE = 15;

const API_URL = `${import.meta.env.VITE_API_URL}/products`;

const toProduct = (item: DummyProductItem): Product => ({
  id: item.id,
  title: item.title,
  price: item.price,
  description: item.description,
  category: item.category,
  image: item.thumbnail,
});

const fetchProducts = async (category: string | null, skip: number = 0): Promise<ProductsPage> => {
  const endpoint = category ? `${API_URL}/category/${category}` : API_URL;
  const url = `${endpoint}?limit=${PRODUCTS_PER_PAGE}&skip=${skip * PRODUCTS_PER_PAGE}`;
  const data = await fetchJson(url, dummyProductsResponseSchema, "Failed to load products");
  return {
    products: data.products.map(toProduct),
    total: data.total,
  };
};

const fetchProductById = async (id: string): Promise<Product> => {
  const data = await fetchJson(`${API_URL}/${id}`, dummyProductSchema, "Failed to load product");
  return toProduct(data);
};

const fetchCategories = (): Promise<Category[]> =>
  fetchJson(`${API_URL}/categories`, categoriesSchema, "Failed to load categories");

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
};

export const useProductsList = (category: string | null, skip: number = 0) => {
  return useQuery({
    queryKey: ["products", category, skip],
    queryFn: () => fetchProducts(category, skip),
    placeholderData: keepPreviousData,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id),
  });
};
