import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CategoriesNavbar from './CategoriesNavbar';
import { useCategories } from '../../api/products';
import type { Category } from '../../types';

vi.mock('../../api/products', () => ({ useCategories: vi.fn() }));

const categories: Category[] = [
    { slug: 'beauty', name: 'Beauty', url: '' },
    { slug: 'mens-shirts', name: 'Mens Shirts', url: '' },
];

const mockCategories = (data: Category[] | undefined) =>
    vi.mocked(useCategories).mockReturnValue({ data } as unknown as ReturnType<typeof useCategories>);

const renderNavbar = (selectedCategory: string | null = null) => {
    const onSelectCategory = vi.fn();
    const user = userEvent.setup();
    render(<CategoriesNavbar selectedCategory={selectedCategory} onSelectCategory={onSelectCategory} />);
    return { user, onSelectCategory };
};

describe('CategoriesNavbar', () => {
    beforeEach(() => {
        mockCategories(categories);
    });

    it('should render an "All" button', () => {
        renderNavbar();

        expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    });

    it('should render a button for each category name', () => {
        renderNavbar();

        expect(screen.getByRole('button', { name: 'Beauty' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Mens Shirts' })).toBeInTheDocument();
    });

    it('should render only "All" while the categories are loading', () => {
        mockCategories(undefined);
        renderNavbar();

        expect(screen.getAllByRole('button')).toHaveLength(1);
        expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    });

    it('should highlight "All" when no category is selected', () => {
        renderNavbar(null);

        expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'Beauty' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('should highlight the selected category', () => {
        renderNavbar('beauty');

        expect(screen.getByRole('button', { name: 'Beauty' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
        expect(screen.getByRole('button', { name: 'Mens Shirts' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('should call onSelectCategory with null when "All" is clicked', async () => {
        const { user, onSelectCategory } = renderNavbar('beauty');

        await user.click(screen.getByRole('button', { name: 'All' }));

        expect(onSelectCategory).toHaveBeenCalledWith(null);
    });

    it('should call onSelectCategory with the category slug when a category is clicked', async () => {
        const { user, onSelectCategory } = renderNavbar();

        await user.click(screen.getByRole('button', { name: 'Mens Shirts' }));

        expect(onSelectCategory).toHaveBeenCalledWith('mens-shirts');
    });
});
