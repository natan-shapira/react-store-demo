import { act, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthPage from './AuthPage';
import { useAuthStore } from '../../stores/useAuthStore';

const validSignup = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    username: 'johndoe',
    password: 'Password123',
    confirmPassword: 'Password123',
};

const signupLabels = {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm password',
};

const renderAuthPage = () => {
    render(
        <MemoryRouter initialEntries={['/auth']}>
            <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
            </Routes>
        </MemoryRouter>
    );
    return userEvent.setup({ delay: null });
};

const switchToSignup = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Sign up' }));

const fillSignupForm = async (user: UserEvent, values: Partial<typeof validSignup> = {}) => {
    const data = { ...validSignup, ...values };
    for (const [field, label] of Object.entries(signupLabels)) {
        const value = data[field as keyof typeof data];
        if (value) await user.type(screen.getByLabelText(label), value);
    }
};

describe('AuthPage', () => {
    const login = vi.fn();
    const signup = vi.fn();

    beforeEach(() => {
        login.mockReset().mockResolvedValue(true);
        signup.mockReset().mockResolvedValue(true);
        useAuthStore.setState({ login, signup, isLoading: false, error: null });
    });

    describe('Sign in', () => {
        it('should render the sign in form by default', () => {
            renderAuthPage();

            expect(screen.getByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
            expect(screen.getByLabelText('Username')).toBeInTheDocument();
            expect(screen.getByLabelText('Password')).toBeInTheDocument();
            expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('Confirm password')).not.toBeInTheDocument();
        });

        it('should show a general error and not call login when fields are empty', async () => {
            const user = renderAuthPage();

            await user.click(screen.getByRole('button', { name: 'Sign in' }));

            expect(screen.getByRole('alert')).toHaveTextContent('Please fill in all fields');
            expect(login).not.toHaveBeenCalled();
        });

        it('should clear the general error when the user starts typing', async () => {
            const user = renderAuthPage();

            await user.click(screen.getByRole('button', { name: 'Sign in' }));
            await user.type(screen.getByLabelText('Username'), 'e');

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('should call login with a trimmed username and the password as typed', async () => {
            const user = renderAuthPage();

            await user.type(screen.getByLabelText('Username'), '  emilys  ');
            await user.type(screen.getByLabelText('Password'), ' emilyspass ');
            await user.click(screen.getByRole('button', { name: 'Sign in' }));

            expect(login).toHaveBeenCalledWith({ username: 'emilys', password: ' emilyspass ' });
        });

        it('should navigate to the home page after a successful login', async () => {
            const user = renderAuthPage();

            await user.type(screen.getByLabelText('Username'), 'emilys');
            await user.type(screen.getByLabelText('Password'), 'emilyspass');
            await user.click(screen.getByRole('button', { name: 'Sign in' }));

            expect(screen.getByTestId('home-page')).toBeInTheDocument();
        });

        it('should stay on the page and show the store error when login fails', async () => {
            login.mockImplementation(async () => {
                useAuthStore.setState({ error: 'Invalid credentials' });
                return false;
            });
            const user = renderAuthPage();

            await user.type(screen.getByLabelText('Username'), 'emilys');
            await user.type(screen.getByLabelText('Password'), 'wrong');
            await user.click(screen.getByRole('button', { name: 'Sign in' }));

            expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
            expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
        });
    });

    describe('Switching modes', () => {
        it('should show the signup fields after switching to sign up', async () => {
            const user = renderAuthPage();

            await switchToSignup(user);

            expect(screen.getByRole('heading', { name: 'Create an Account' })).toBeInTheDocument();
            for (const label of Object.values(signupLabels)) {
                expect(screen.getByLabelText(label)).toBeInTheDocument();
            }
        });

        it('should hide the signup fields after switching back to sign in', async () => {
            const user = renderAuthPage();

            await switchToSignup(user);
            await user.click(screen.getByRole('button', { name: 'Sign in' }));

            expect(screen.getByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
            expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('Confirm password')).not.toBeInTheDocument();
        });

        it('should clear the form errors when switching', async () => {
            const user = renderAuthPage();

            await user.click(screen.getByRole('button', { name: 'Sign in' }));
            await switchToSignup(user);

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('should clear the store error when switching', async () => {
            useAuthStore.setState({ error: 'Invalid credentials' });
            const user = renderAuthPage();

            expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
            await switchToSignup(user);

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(useAuthStore.getState().error).toBeNull();
        });

        it('should reset the typed values when switching', async () => {
            const user = renderAuthPage();

            await user.type(screen.getByLabelText('Username'), 'emilys');
            await switchToSignup(user);

            expect(screen.getByLabelText('Username')).toHaveValue('');
        });
    });

    describe('Sign up', () => {
        it('should show field errors and not call signup when the form is empty', async () => {
            const user = renderAuthPage();

            await switchToSignup(user);
            await user.click(screen.getByRole('button', { name: 'Sign up' }));

            for (const label of Object.values(signupLabels)) {
                expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'true');
            }
            expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Email is required');
            expect(signup).not.toHaveBeenCalled();
        });

        it('should show a mismatch error when the passwords differ', async () => {
            const user = renderAuthPage();

            await switchToSignup(user);
            await fillSignupForm(user, { confirmPassword: 'Different123' });
            await user.click(screen.getByRole('button', { name: 'Sign up' }));

            expect(screen.getByLabelText('Confirm password')).toHaveAccessibleDescription('Passwords do not match');
            expect(signup).not.toHaveBeenCalled();
        });

        it('should clear only the error of the field being edited', async () => {
            const user = renderAuthPage();

            await switchToSignup(user);
            await user.click(screen.getByRole('button', { name: 'Sign up' }));
            await user.type(screen.getByLabelText('First name'), 'J');

            expect(screen.getByLabelText('First name')).toHaveAttribute('aria-invalid', 'false');
            expect(screen.getByLabelText('Last name')).toHaveAttribute('aria-invalid', 'true');
        });

        it('should clear the mismatch error when the password is edited', async () => {
            const user = renderAuthPage();

            await switchToSignup(user);
            await fillSignupForm(user, { confirmPassword: 'Different123' });
            await user.click(screen.getByRole('button', { name: 'Sign up' }));
            await user.type(screen.getByLabelText('Password'), '4');

            expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
        });

        it('should call signup with trimmed data and without confirmPassword', async () => {
            const user = renderAuthPage();

            await switchToSignup(user);
            await fillSignupForm(user, { firstName: ' John ', email: ' john@example.com ', username: ' johndoe ' });
            await user.click(screen.getByRole('button', { name: 'Sign up' }));

            expect(signup).toHaveBeenCalledWith({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                username: 'johndoe',
                password: 'Password123',
            });
        });

        it('should navigate to the home page after a successful signup', async () => {
            const user = renderAuthPage();

            await switchToSignup(user);
            await fillSignupForm(user);
            await user.click(screen.getByRole('button', { name: 'Sign up' }));

            expect(screen.getByTestId('home-page')).toBeInTheDocument();
        });
    });

    describe('Loading state', () => {
        it('should disable the sign in form while loading', () => {
            useAuthStore.setState({ isLoading: true });
            renderAuthPage();

            expect(screen.getByLabelText('Username')).toBeDisabled();
            expect(screen.getByLabelText('Password')).toBeDisabled();
            expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
            expect(screen.getByRole('button', { name: 'Sign up' })).toBeDisabled();
        });

        it('should disable the sign up form while loading', async () => {
            const user = renderAuthPage();

            await switchToSignup(user);
            act(() => useAuthStore.setState({ isLoading: true }));

            for (const label of Object.values(signupLabels)) {
                expect(screen.getByLabelText(label)).toBeDisabled();
            }
            expect(screen.getByRole('button', { name: 'Creating account...' })).toBeDisabled();
            expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
        });
    });
});
