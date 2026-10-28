import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Navbar from './Navbar';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCartStore } from '../../stores/useCartStore';
import { compressImage } from '../../utils/compressImage';
import type { CartItem, User } from '../../types';

vi.mock('../../utils/compressImage', () => ({ compressImage: vi.fn() }));

const createItem = (id: number, quantity: number): CartItem => ({
    id,
    title: `Product ${id}`,
    price: 10,
    description: '',
    category: 'test',
    image: '',
    quantity,
});

const cartItems: Record<number, CartItem> = {
    1: createItem(1, 2),
    2: createItem(2, 1),
    3: createItem(3, 3),
};
const cartQuantity = Object.values(cartItems).reduce((sum, { quantity }) => sum + quantity, 0);

const loggedInUser: User = {
    id: 1,
    username: 'emilys',
    email: 'emily@example.com',
    firstName: 'Emily',
    lastName: 'Johnson',
};

const renderNavbar = (path = '/') => {
    const user = userEvent.setup();
    render(
        <MemoryRouter initialEntries={[path]}>
            <Navbar />
        </MemoryRouter>
    );
    return { user };
};

const getFileInput = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;
const imageFile = () => new File(['image'], 'avatar.png', { type: 'image/png' });

describe('Navbar', () => {
    beforeEach(() => {
        useCartStore.setState({ items: structuredClone(cartItems) });
        useAuthStore.setState({ token: null, user: null });
        vi.mocked(compressImage).mockReset();
    });

    describe('Navigation links', () => {
        it('should link the logo, Home and Cart to their pages', () => {
            renderNavbar();

            expect(screen.getByRole('link', { name: 'ReactShop' })).toHaveAttribute('href', '/');
            expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
            expect(screen.getByRole('link', { name: /^Cart/ })).toHaveAttribute('href', '/cart');
        });

        it('should mark the link of the current page as active', () => {
            renderNavbar('/cart');

            expect(screen.getByRole('link', { name: /^Cart/ })).toHaveAttribute('aria-current', 'page');
            expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
        });
    });

    describe('Cart badge', () => {
        it('should show the total quantity of all items in the cart', () => {
            renderNavbar();

            const badge = screen.getByLabelText(`${cartQuantity} items in cart`);
            expect(badge).toHaveTextContent(String(cartQuantity));
            expect(screen.getByRole('link', { name: /^Cart/ })).toContainElement(badge);
        });

        it('should use a singular label for a single item', () => {
            useCartStore.setState({ items: { 1: createItem(1, 1) } });
            renderNavbar();

            expect(screen.getByLabelText('1 item in cart')).toHaveTextContent('1');
        });

        it('should not show the badge when the cart is empty', () => {
            useCartStore.setState({ items: {} });
            renderNavbar();

            expect(screen.queryByLabelText(/in cart/)).not.toBeInTheDocument();
        });

        it('should update when items are added to the cart', () => {
            renderNavbar();

            act(() => useCartStore.getState().addItem(createItem(4, 4)));

            expect(screen.getByLabelText(`${cartQuantity + 4} items in cart`)).toBeInTheDocument();
        });

        it('should update when an item is removed from the cart', () => {
            renderNavbar();

            act(() => useCartStore.getState().removeItem(3));

            expect(screen.getByLabelText(`${cartQuantity - cartItems[3].quantity} items in cart`)).toBeInTheDocument();
        });
    });

    describe('Guest user', () => {
        it('should show the sign in link', () => {
            renderNavbar();

            expect(screen.getByRole('link', { name: 'Sign in / Sign up' })).toHaveAttribute('href', '/auth');
        });

        it('should not show the user actions', () => {
            renderNavbar();

            expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();
            expect(screen.queryByTitle('Click to change profile picture')).not.toBeInTheDocument();
        });
    });

    describe('Logged in user', () => {
        beforeEach(() => {
            useAuthStore.setState({ token: 'token', user: { ...loggedInUser } });
        });

        it('should hide the sign in link', () => {
            renderNavbar();

            expect(screen.queryByRole('link', { name: 'Sign in / Sign up' })).not.toBeInTheDocument();
        });

        it('should show the first letter of the first name when there is no image', () => {
            renderNavbar();

            expect(screen.getByTitle('Click to change profile picture')).toHaveTextContent('E');
        });

        it('should fall back to the first letter of the username', () => {
            useAuthStore.setState({ user: { ...loggedInUser, firstName: '', username: 'michaelw' } });
            renderNavbar();

            expect(screen.getByTitle('Click to change profile picture')).toHaveTextContent('m');
        });

        it('should show the profile image when the user has one', () => {
            useAuthStore.setState({ user: { ...loggedInUser, image: 'data:image/jpeg;base64,abc' } });
            renderNavbar();

            expect(screen.getByRole('img', { name: 'Profile' })).toHaveAttribute('src', 'data:image/jpeg;base64,abc');
        });

        it('should log the user out when clicking logout', async () => {
            const { user } = renderNavbar();

            await user.click(screen.getByRole('button', { name: 'Logout' }));

            expect(useAuthStore.getState().user).toBeNull();
            expect(screen.getByRole('link', { name: 'Sign in / Sign up' })).toBeInTheDocument();
        });
    });

    describe('Profile image upload', () => {
        beforeEach(() => {
            useAuthStore.setState({ token: 'token', user: { ...loggedInUser } });
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should compress the selected file and show it as the profile image', async () => {
            vi.mocked(compressImage).mockResolvedValue('data:image/jpeg;base64,compressed');
            const { user } = renderNavbar();
            const file = imageFile();

            await user.upload(getFileInput(), file);

            expect(compressImage).toHaveBeenCalledWith(file);
            expect(useAuthStore.getState().user?.image).toBe('data:image/jpeg;base64,compressed');
            expect(screen.getByRole('img', { name: 'Profile' })).toHaveAttribute('src', 'data:image/jpeg;base64,compressed');
        });

        it('should reset the file input so the same file can be selected again', async () => {
            vi.mocked(compressImage).mockResolvedValue('data:image/jpeg;base64,compressed');
            const { user } = renderNavbar();

            await user.upload(getFileInput(), imageFile());

            expect(getFileInput()).toHaveValue('');
        });

        it('should show an error and keep the current image when the file cannot be loaded', async () => {
            vi.mocked(compressImage).mockRejectedValue(new Error('Invalid image'));
            const { user } = renderNavbar();

            await user.upload(getFileInput(), imageFile());

            expect(await screen.findByText(/could not load this image/i)).toBeInTheDocument();
            expect(useAuthStore.getState().user?.image).toBeUndefined();
        });

        it('should hide the error after 5 seconds', async () => {
            vi.useFakeTimers({ shouldAdvanceTime: true });
            vi.mocked(compressImage).mockRejectedValue(new Error('Invalid image'));
            renderNavbar();
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

            await user.upload(getFileInput(), imageFile());
            expect(await screen.findByText(/could not load this image/i)).toBeInTheDocument();

            act(() => vi.advanceTimersByTime(5000));

            expect(screen.queryByText(/could not load this image/i)).not.toBeInTheDocument();
        });
    });
});
