import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CartItemRow from './CartItemRow';
import type { CartItem } from '../../types';

const item: CartItem = {
    id: 7,
    title: 'Coffee Mug',
    price: 12.5,
    description: 'Ceramic mug',
    category: 'kitchen',
    image: 'mug.jpg',
    quantity: 2,
};

const handlers = {
    onToggleSelect: vi.fn(),
    onIncrease: vi.fn(),
    onDecrease: vi.fn(),
    onRemove: vi.fn(),
};

const renderRow = (selected = true) => {
    const user = userEvent.setup();
    render(
        <MemoryRouter>
            <ul>
                <CartItemRow item={item} selected={selected} {...handlers} />
            </ul>
        </MemoryRouter>
    );
    return { user };
};

describe('CartItemRow', () => {
    beforeEach(() => {
        Object.values(handlers).forEach((handler) => handler.mockReset());
    });

    describe('Display', () => {
        it('should show the title, category, image and unit price', () => {
            renderRow();

            expect(screen.getByText('Coffee Mug')).toBeInTheDocument();
            expect(screen.getByText('kitchen')).toBeInTheDocument();
            expect(screen.getByRole('img', { name: 'Coffee Mug' })).toHaveAttribute('src', 'mug.jpg');
            expect(screen.getByText('$12.50 each')).toBeInTheDocument();
        });

        it('should show the quantity', () => {
            renderRow();

            expect(screen.getByLabelText('Decrease quantity').nextElementSibling).toHaveTextContent('2');
        });

        it('should show the line total (price × quantity)', () => {
            renderRow();

            expect(screen.getByText('$25.00')).toBeInTheDocument();
        });

        it('should link the image and title to the product page', () => {
            renderRow();

            const links = screen.getAllByRole('link', { name: 'Coffee Mug' });
            expect(links).toHaveLength(2);
            links.forEach((link) => expect(link).toHaveAttribute('href', '/products/7'));
        });
    });

    describe('Selection', () => {
        it('should check the checkbox when selected', () => {
            renderRow(true);

            expect(screen.getByRole('checkbox', { name: 'Select Coffee Mug' })).toBeChecked();
        });

        it('should uncheck the checkbox when not selected', () => {
            renderRow(false);

            expect(screen.getByRole('checkbox', { name: 'Select Coffee Mug' })).not.toBeChecked();
        });

        it('should call onToggleSelect with the item id when the checkbox is clicked', async () => {
            const { user } = renderRow();

            await user.click(screen.getByRole('checkbox', { name: 'Select Coffee Mug' }));

            expect(handlers.onToggleSelect).toHaveBeenCalledWith(7);
        });

        it('should dim the row when not selected', () => {
            renderRow(false);

            expect(screen.getByRole('listitem')).toHaveClass('opacity-60');
        });

        it('should not dim the row when selected', () => {
            renderRow(true);

            expect(screen.getByRole('listitem')).not.toHaveClass('opacity-60');
        });
    });

    describe('Actions', () => {
        it.each([
            { label: 'Increase quantity', handler: 'onIncrease' },
            { label: 'Decrease quantity', handler: 'onDecrease' },
            { label: 'Remove from cart', handler: 'onRemove' },
        ] as const)('should call $handler with the item id when "$label" is clicked', async ({ label, handler }) => {
            const { user } = renderRow();

            await user.click(screen.getByRole('button', { name: label }));

            expect(handlers[handler]).toHaveBeenCalledWith(7);
        });
    });
});
