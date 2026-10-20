import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PRODUCTS_PER_PAGE, useCategories, useProduct, useProductsList } from './products';
import { fetchWithAuth } from './fetchWithAuth';

vi.mock('./fetchWithAuth', () => ({ fetchWithAuth: vi.fn() }));

const BASE_URL = 'https://dummyjson.com/products';

// The shape DummyJSON returns, including fields the app does not use
const createDummyProduct = (id: number) => ({
    id,
    title: `Product ${id}`,
    price: 10 * id,
    description: `Description ${id}`,
    category: 'beauty',
    thumbnail: `https://cdn.dummyjson.com/${id}/thumbnail.webp`,
    images: [`https://cdn.dummyjson.com/${id}/1.webp`],
    rating: 4.5,
    stock: 20,
});

const toProduct = (item: ReturnType<typeof createDummyProduct>) => ({
    id: item.id,
    title: item.title,
    price: item.price,
    description: item.description,
    category: item.category,
    image: item.thumbnail,
});

const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// A Response body can only be read once, so every call gets a new one
const respondWith = (body: unknown, status = 200) =>
    vi.mocked(fetchWithAuth).mockImplementation(async () => jsonResponse(body, status));

const createWrapper = () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('products API', () => {
    beforeEach(() => {
        vi.mocked(fetchWithAuth).mockReset();
    });

    describe('useProductsList', () => {
        const firstPage = { products: [createDummyProduct(1), createDummyProduct(2)], total: 40 };

        it('should request all products with limit and skip for the page', async () => {
            respondWith(firstPage);

            const { result } = renderHook(() => useProductsList(null, 2), { wrapper: createWrapper() });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(fetchWithAuth).toHaveBeenCalledWith(
                `${BASE_URL}?limit=${PRODUCTS_PER_PAGE}&skip=${2 * PRODUCTS_PER_PAGE}`
            );
        });

        it('should request the category endpoint when a category is selected', async () => {
            respondWith(firstPage);

            const { result } = renderHook(() => useProductsList('beauty', 0), { wrapper: createWrapper() });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(fetchWithAuth).toHaveBeenCalledWith(
                `${BASE_URL}/category/beauty?limit=${PRODUCTS_PER_PAGE}&skip=0`
            );
        });

        it('should map thumbnail to image', async () => {
            respondWith(firstPage);

            const { result } = renderHook(() => useProductsList(null, 0), { wrapper: createWrapper() });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data?.products).toEqual(firstPage.products.map(toProduct));
        });

        it('should return the total number of products', async () => {
            respondWith(firstPage);

            const { result } = renderHook(() => useProductsList(null, 0), { wrapper: createWrapper() });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data?.total).toBe(40);
        });

        it('should keep the previous page data while the next page loads', async () => {
            vi.mocked(fetchWithAuth)
                .mockImplementationOnce(async () => jsonResponse(firstPage))
                .mockImplementationOnce(() => new Promise(() => {}));

            const { result, rerender } = renderHook(({ page }) => useProductsList(null, page), {
                wrapper: createWrapper(),
                initialProps: { page: 0 },
            });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            rerender({ page: 1 });

            await waitFor(() => expect(result.current.isPlaceholderData).toBe(true));
            expect(result.current.data?.products).toEqual(firstPage.products.map(toProduct));
        });

        it('should report an error when the request fails', async () => {
            respondWith({ message: 'Internal server error' }, 500);

            const { result } = renderHook(() => useProductsList(null, 0), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(result.current.error?.message).toBe('Internal server error');
        });
    });

    describe('useProduct', () => {
        const product = createDummyProduct(5);

        it('should request the product by id', async () => {
            respondWith(product);

            const { result } = renderHook(() => useProduct('5'), { wrapper: createWrapper() });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(fetchWithAuth).toHaveBeenCalledWith(`${BASE_URL}/5`);
        });

        it('should map thumbnail to image', async () => {
            respondWith(product);

            const { result } = renderHook(() => useProduct('5'), { wrapper: createWrapper() });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data).toEqual(toProduct(product));
        });

        it('should report an error when the product does not exist', async () => {
            respondWith({ message: "Product with id '999' not found" }, 404);

            const { result } = renderHook(() => useProduct('999'), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(result.current.error?.message).toBe("Product with id '999' not found");
        });
    });

    describe('useCategories', () => {
        const categories = [
            { slug: 'beauty', name: 'Beauty', url: `${BASE_URL}/category/beauty` },
            { slug: 'laptops', name: 'Laptops', url: `${BASE_URL}/category/laptops` },
        ];

        it('should return the list of categories', async () => {
            respondWith(categories);

            const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(fetchWithAuth).toHaveBeenCalledWith(`${BASE_URL}/categories`);
            expect(result.current.data).toEqual(categories);
        });

        it('should report an error when the request fails', async () => {
            respondWith({ message: 'Internal server error' }, 500);

            const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(result.current.error?.message).toBe('Internal server error');
        });

        it('should use a default error message when the server sends none', async () => {
            respondWith({}, 500);

            const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(result.current.error?.message).toBe('Failed to load categories');
        });
    });
});
