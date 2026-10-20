import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { useCategories, useProduct, useProductsList } from './api/products';
import { useAuthStore } from './stores/useAuthStore';
import { useCartStore } from './stores/useCartStore';
import type { CartItem, Product } from './types';

vi.mock('./api/products', () => ({
    PRODUCTS_PER_PAGE: 15,
    useCategories: vi.fn(),
    useProductsList: vi.fn(),
    useProduct: vi.fn(),
}));

const product: Product = {
    id: 5,
    title: 'Wireless Headphones',
    price: 20,
    description: 'Noise cancelling headphones',
    category: 'electronics',
    image: 'headphones.jpg',
};

const cartItem: CartItem = { ...product, quantity: 1 };

// App renders its own BrowserRouter, so the start page is set through the real history
const renderAt = (path: string, state?: unknown) => {
    window.history.replaceState(state ? { usr: state, key: 'test', idx: 0 } : null, '', path);
    render(<App />);
};

const logIn = () =>
    useAuthStore.setState({
        token: 'test-token',
        user: { id: 1, username: 'emilys', email: 'e@x.com', firstName: 'Emily', lastName: 'Johnson' },
    });

describe('App', () => {
    const checkAuth = vi.fn();

    beforeEach(() => {
        checkAuth.mockReset();
        useAuthStore.setState({ token: null, user: null, isLoading: false, error: null, checkAuth });
        useCartStore.setState({ items: {} });

        vi.mocked(useCategories).mockReturnValue({ data: [] } as unknown as ReturnType<typeof useCategories>);
        vi.mocked(useProductsList).mockReturnValue({
            data: { products: [product], total: 1 },
            isLoading: false,
            isPlaceholderData: false,
            error: null,
        } as unknown as ReturnType<typeof useProductsList>);
        vi.mocked(useProduct).mockReturnValue({
            data: product,
            isLoading: false,
            error: null,
        } as unknown as ReturnType<typeof useProduct>);
    });

    describe('Routing', () => {
        it('should show the auth page at /auth', () => {
            renderAt('/auth');

            expect(screen.getByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
        });

        it.each(['/', '/products/5', '/cart', '/checkout'])(
            'should redirect a guest from %s to /auth',
            (path) => {
                renderAt(path);

                expect(screen.getByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
                expect(window.location.pathname).toBe('/auth');
            }
        );

        it('should show the home page at / for a logged in user', () => {
            logIn();
            renderAt('/');

            expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Wireless Headphones' })).toBeInTheDocument();
        });

        it('should show the product page at /products/:id', () => {
            logIn();
            renderAt('/products/5');

            expect(useProduct).toHaveBeenCalledWith('5');
            expect(screen.getByRole('heading', { level: 1, name: 'Wireless Headphones' })).toBeInTheDocument();
        });

        it('should show the cart page at /cart', () => {
            logIn();
            renderAt('/cart');

            expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument();
        });

        it('should show the checkout page at /checkout', () => {
            logIn();
            useCartStore.setState({ items: { 5: cartItem } });
            renderAt('/checkout', { selectedItemIds: [5] });

            expect(screen.getByRole('heading', { name: 'Checkout' })).toBeInTheDocument();
        });

        it.each(['/auth', '/', '/cart'])('should render the navbar on %s', (path) => {
            logIn();
            renderAt(path);

            expect(screen.getByRole('link', { name: 'ReactShop' })).toBeInTheDocument();
        });

        it.todo('should show the not found page for an unknown path');
        it.todo('should show the not found page to a guest without redirecting to /auth');
        it.todo('should show the not found page for an unknown nested path (e.g. /products/5/extra)');
    });

    describe('Authentication check', () => {
        it('should call checkAuth on startup when there is a token', () => {
            logIn();
            renderAt('/');

            expect(checkAuth).toHaveBeenCalledTimes(1);
        });

        it('should not call checkAuth when there is no token', () => {
            renderAt('/auth');

            expect(checkAuth).not.toHaveBeenCalled();
        });
    });
});
