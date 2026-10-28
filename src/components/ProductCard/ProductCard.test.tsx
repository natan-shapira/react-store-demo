import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import ProductCard from './ProductCard';
import ModalWrapper from '../ModalWrapper/ModalWrapper';
import { useCartStore } from '../../stores/useCartStore';
import { useModalStore } from '../../stores/useModalStore';
import type { Product } from '../../types';

const product: Product = {
    id: 3,
    title: 'Wireless Headphones',
    price: 99.99,
    description: 'Noise cancelling headphones',
    category: 'electronics',
    image: 'headphones.jpg',
};

const renderCard = () => {
    const user = userEvent.setup();
    render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route path="/" element={<><ProductCard product={product} /><ModalWrapper /></>} />
                <Route path="/products/:id" element={<h1>Product Details</h1>} />
            </Routes>
        </MemoryRouter>
    );
    return { user };
};

const isHiddenFromScreenReaders = (element: HTMLElement) => element.closest('[aria-hidden="true"]') !== null;

const getQuantity = () => screen.getByLabelText('Decrease quantity').nextElementSibling;
const getAddButton = () => screen.getByRole('button', { name: /add (more )?to cart/i });

describe('ProductCard', () => {
    beforeEach(() => {
        useCartStore.setState({ items: {} });
        useModalStore.setState({ content: null });
    });

    describe('Display', () => {
        it('should show the image, title, description, category and price', () => {
            renderCard();

            expect(screen.getByAltText('Wireless Headphones')).toHaveAttribute('src', 'headphones.jpg');
            expect(screen.getByRole('heading', { name: 'Wireless Headphones' })).toBeInTheDocument();
            expect(screen.getByText('Noise cancelling headphones')).toBeInTheDocument();
            expect(screen.getByText('electronics')).toBeInTheDocument();
            expect(screen.getByText('$99.99')).toBeInTheDocument();
        });

        it('should keep the category readable by screen readers', () => {
            renderCard();

            expect(isHiddenFromScreenReaders(screen.getByText('electronics'))).toBe(false);
        });
    });

    describe('Accessibility', () => {
        it('should expose a single accessible link to the product page', () => {
            renderCard();

            expect(screen.getAllByRole('link', { name: 'Wireless Headphones' })).toHaveLength(1);
        });

        it('should keep the image link out of the tab order', () => {
            renderCard();

            expect(screen.getByAltText('Wireless Headphones').closest('a')).toHaveAttribute('tabindex', '-1');
        });
    });

    describe('Navigation', () => {
        it('should navigate to the product page when the image is clicked', async () => {
            const { user } = renderCard();

            await user.click(screen.getByAltText('Wireless Headphones'));

            expect(screen.getByRole('heading', { name: 'Product Details' })).toBeInTheDocument();
        });

        it('should navigate to the product page when the title is clicked', async () => {
            const { user } = renderCard();

            const title = screen.getByRole('heading', { name: 'Wireless Headphones' });
            await user.click(within(title).getByRole('link'));

            expect(screen.getByRole('heading', { name: 'Product Details' })).toBeInTheDocument();
        });
    });

    describe('Quick view', () => {
        it('should open the modal with the product details', async () => {
            const { user } = renderCard();

            await user.click(screen.getByRole('button', { name: 'Quick view' }));

            expect(screen.getByRole('heading', { level: 2, name: 'Wireless Headphones' })).toBeInTheDocument();
            expect(screen.getByText('Unit price')).toBeInTheDocument();
        });

        it('should not navigate to the product page', async () => {
            const { user } = renderCard();

            await user.click(screen.getByRole('button', { name: 'Quick view' }));

            expect(screen.queryByRole('heading', { name: 'Product Details' })).not.toBeInTheDocument();
        });
    });

    describe('Quantity selector', () => {
        it('should start at 1', () => {
            renderCard();

            expect(getQuantity()).toHaveTextContent('1');
        });

        it('should increase the quantity', async () => {
            const { user } = renderCard();

            await user.click(screen.getByLabelText('Increase quantity'));

            expect(getQuantity()).toHaveTextContent('2');
        });

        it('should decrease the quantity', async () => {
            const { user } = renderCard();

            await user.click(screen.getByLabelText('Increase quantity'));
            await user.click(screen.getByLabelText('Increase quantity'));
            await user.click(screen.getByLabelText('Decrease quantity'));

            expect(getQuantity()).toHaveTextContent('2');
        });

        it('should not go below 1', async () => {
            const { user } = renderCard();

            await user.click(screen.getByLabelText('Decrease quantity'));

            expect(getQuantity()).toHaveTextContent('1');
        });
    });

    describe('Add to cart', () => {
        it('should add the product with the selected quantity', async () => {
            const { user } = renderCard();

            await user.click(screen.getByLabelText('Increase quantity'));
            await user.click(screen.getByLabelText('Increase quantity'));
            await user.click(getAddButton());

            expect(useCartStore.getState().items[3]).toEqual({ ...product, quantity: 3 });
        });

        it('should reset the quantity to 1 after adding', async () => {
            const { user } = renderCard();

            await user.click(screen.getByLabelText('Increase quantity'));
            await user.click(getAddButton());

            expect(getQuantity()).toHaveTextContent('1');
        });

        it('should show "Add to cart" when the product is not in the cart', () => {
            renderCard();

            expect(getAddButton()).toHaveTextContent('Add to cart');
        });
    });

    describe('Already in cart', () => {
        beforeEach(() => {
            useCartStore.setState({ items: { 3: { ...product, quantity: 4 } } });
        });

        it('should show the quantity already in the cart', () => {
            renderCard();

            expect(screen.getByText('4 in cart')).toBeInTheDocument();
        });

        it('should keep the in-cart badge visible to screen readers', () => {
            renderCard();

            expect(isHiddenFromScreenReaders(screen.getByText('4 in cart'))).toBe(false);
        });

        it('should show "Add more to cart"', () => {
            renderCard();

            expect(getAddButton()).toHaveTextContent('Add more to cart');
        });

        it('should not show the in-cart badge when the product is not in the cart', () => {
            useCartStore.setState({ items: {} });
            renderCard();

            expect(screen.queryByText(/in cart/)).not.toBeInTheDocument();
        });
    });
});
