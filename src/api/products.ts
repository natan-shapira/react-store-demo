import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Category, Product } from "../types";
import { fetchWithAuth } from "./fetchWithAuth";

// מבנה הנתונים כפי שהוא מגיע מ-DummyJSON
interface DummyProductItem {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  thumbnail: string;
}

export interface ProductsPage {
  products: Product[];
  total: number;
}

export const PRODUCTS_PER_PAGE = 15;

const BASE_URL = "https://dummyjson.com/products";

const fetchJson = async (url: string, errorMessage: string) => {
  const response = await fetchWithAuth(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || errorMessage);
  }

  return data;
};

const fetchProducts = async (category: string | null, skip: number = 0): Promise<ProductsPage> => {
  const endpoint = category ? `${BASE_URL}/category/${category}` : BASE_URL;
  const url = `${endpoint}?limit=${PRODUCTS_PER_PAGE}&skip=${skip * PRODUCTS_PER_PAGE}`;
  const data = await fetchJson(url, "Failed to load products");
  return {
    products: data.products.map((item: DummyProductItem) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      description: item.description,
      category: item.category,
      image: item.thumbnail,
    })),
    total: data.total,
  };
};

const fetchProductById = async (id: string): Promise<Product> => {
  const data = await fetchJson(`${BASE_URL}/${id}`, "Failed to load product");
  return {
    id: data.id,
    title: data.title,
    price: data.price,
    description: data.description,
    category: data.category,
    image: data.thumbnail,
  };
};

const fetchCategories = async (): Promise<Category[]> => {
  return fetchJson(`${BASE_URL}/categories`, "Failed to load categories");
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
};

// פונקציה אחת מרכזית שמטפלת גם בשליפת כל המוצרים וגם בסינון לפי קטגוריה ו-Pagination
export const useProductsList = (category: string | null, skip: number = 0) => {
  return useQuery({
    queryKey: ['products', category, skip], 
    queryFn: () => fetchProducts(category, skip),
    placeholderData: keepPreviousData,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
  });
};