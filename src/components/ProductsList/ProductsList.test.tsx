import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductsList from './ProductsList';
import { useProductsList } from '../../api/products';
import type { Product } from '../../types';

vi.mock('../../api/products', () => ({
    PRODUCTS_PER_PAGE: 15,
    useProductsList: vi.fn(),
}));

const createProduct = (id: number): Product => ({
    id,
    title: `Product ${id}`,
    price: 10,
    description: '',
    category: 'test',
    image: '',
});

const products = [createProduct(1), createProduct(2)];

const mockQuery = (overrides: Record<string, unknown> = {}) =>
    vi.mocked(useProductsList).mockReturnValue({
        data: { products, total: 40 },
        isLoading: false,
        isPlaceholderData: false,
        error: null,
        ...overrides,
    } as unknown as ReturnType<typeof useProductsList>);

const listTree = (category: string | null) => (
    <MemoryRouter>
        <ProductsList category={category} />
    </MemoryRouter>
);

const renderList = (category: string | null = null) => {
    const user = userEvent.setup();
    const { rerender } = render(listTree(category));
    return { user, rerender: (next: string | null) => rerender(listTree(next)) };
};

const getPagination = () => screen.getByRole('navigation', { name: 'Pagination' });

describe('ProductsList', () => {
    beforeEach(() => {
        vi.mocked(useProductsList).mockReset();
        mockQuery();
        vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    });

    describe('Loading and errors', () => {
        it('should show a loading message while loading', () => {
            mockQuery({ isLoading: true, data: undefined });
            renderList();

            expect(screen.getByText('Loading products...')).toBeInTheDocument();
        });

        it('should show an error message when the request fails', () => {
            mockQuery({ error: new Error('Network error'), data: undefined });
            renderList();

            expect(screen.getByText('Failed to load data')).toBeInTheDocument();
        });
    });

    describe('Products', () => {
        it('should render a card for each product', () => {
            renderList();

            expect(screen.getAllByRole('listitem')).toHaveLength(2);
            expect(screen.getByRole('heading', { name: 'Product 1' })).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Product 2' })).toBeInTheDocument();
        });

        it('should request the products of the given category', () => {
            renderList('beauty');

            expect(useProductsList).toHaveBeenLastCalledWith('beauty', 0);
        });

        it('should dim the list while the next page is loading', () => {
            mockQuery({ isPlaceholderData: true });
            renderList();

            expect(screen.getByRole('list')).toHaveClass('opacity-50');
        });
    });

    describe('Pagination', () => {
        it('should calculate the number of pages from the total', () => {
            renderList();

            const pagination = getPagination();
            expect(within(pagination).getByRole('button', { name: '3' })).toBeInTheDocument();
            expect(within(pagination).queryByRole('button', { name: '4' })).not.toBeInTheDocument();
        });

        it('should request the next page when a page is selected', async () => {
            const { user } = renderList();

            await user.click(within(getPagination()).getByRole('button', { name: '2' }));

            expect(useProductsList).toHaveBeenLastCalledWith(null, 1);
        });

        it('should scroll to the top when the page changes', async () => {
            const { user } = renderList();

            await user.click(within(getPagination()).getByRole('button', { name: 'Next' }));

            expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
        });

        it('should disable the pagination while the next page is loading', () => {
            mockQuery({ isPlaceholderData: true });
            renderList();

            within(getPagination()).getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
        });

        it('should go back to the first page when the category changes', async () => {
            const { user, rerender } = renderList(null);
            await user.click(within(getPagination()).getByRole('button', { name: '3' }));
            expect(useProductsList).toHaveBeenLastCalledWith(null, 2);

            rerender('beauty');

            expect(useProductsList).toHaveBeenLastCalledWith('beauty', 0);
        });
    });
});
