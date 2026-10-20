import '@testing-library/jest-dom/vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '../../stores/useAuthStore';

const AuthPageStub = () => {
    const navigate = useNavigate();
    return (
        <div>
            <h1>Auth Page</h1>
            <button onClick={() => navigate(-1)}>Back</button>
        </div>
    );
};

const renderRoutes = (entries = ['/cart'], initialIndex = entries.length - 1) => {
    const user = userEvent.setup();
    render(
        <MemoryRouter initialEntries={entries} initialIndex={initialIndex}>
            <Routes>
                <Route path="/start" element={<h1>Start Page</h1>} />
                <Route path="/auth" element={<AuthPageStub />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/cart" element={<h1>Cart Page</h1>} />
                </Route>
            </Routes>
        </MemoryRouter>
    );
    return { user };
};

describe('ProtectedRoute', () => {
    beforeEach(() => {
        useAuthStore.setState({ token: null, user: null });
    });

    it('should render the protected page when there is a token', () => {
        useAuthStore.setState({ token: 'test-token' });
        renderRoutes();

        expect(screen.getByRole('heading', { name: 'Cart Page' })).toBeInTheDocument();
    });

    it('should redirect to /auth when there is no token', () => {
        renderRoutes();

        expect(screen.getByRole('heading', { name: 'Auth Page' })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Cart Page' })).not.toBeInTheDocument();
    });

    it('should replace the history entry so Back does not return to the protected page', async () => {
        const { user } = renderRoutes(['/start', '/cart']);

        await user.click(screen.getByRole('button', { name: 'Back' }));

        expect(screen.getByRole('heading', { name: 'Start Page' })).toBeInTheDocument();
    });

    it('should redirect to /auth when the user logs out while on a protected page', () => {
        useAuthStore.setState({ token: 'test-token' });
        renderRoutes();

        act(() => useAuthStore.getState().logout());

        expect(screen.getByRole('heading', { name: 'Auth Page' })).toBeInTheDocument();
    });
});
