import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from './useAuthStore';
import { useCartStore } from './useCartStore';
import { fetchAuthUser, loginUser } from '../api/auth';
import type { SignupData, User } from '../types';

vi.mock('../api/auth', () => ({
    loginUser: vi.fn(),
    fetchAuthUser: vi.fn(),
}));

const storedUser: User = {
    id: 1,
    username: 'emilys',
    email: 'emily@example.com',
    firstName: 'Emily',
    lastName: 'Johnson',
};

const authUser = { ...storedUser, token: 'test-token' };
const credentials = { username: 'emilys', password: 'emilyspass' };

const signupData: SignupData = {
    username: 'johndoe',
    password: 'Password123',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
};

const loggedIn = (user: Partial<User> = {}) =>
    useAuthStore.setState({ token: 'test-token', user: { ...storedUser, ...user } });

describe('useAuthStore', () => {

    beforeEach(() => {
        vi.mocked(loginUser).mockReset();
        vi.mocked(fetchAuthUser).mockReset();
        useCartStore.setState({ items: {} });
        useAuthStore.setState({
            user: null,
            token: null,
            isLoading: false,
            error: null,
        })
    })


    describe('login', () => {
        it('should return true on success', async () => {
            vi.mocked(loginUser).mockResolvedValue(authUser);

            const success = await useAuthStore.getState().login(credentials);

            expect(success).toBe(true);
            expect(loginUser).toHaveBeenCalledWith(credentials);
        });

        it('should set the token and user on success', async () => {
            vi.mocked(loginUser).mockResolvedValue(authUser);

            await useAuthStore.getState().login(credentials);

            expect(useAuthStore.getState().user).toEqual(storedUser);
            expect(useAuthStore.getState().token).toBe(authUser.token);
            expect(useAuthStore.getState().error).toBeNull();
        });

        it('should return false and set error state on failure', async () => {
            const errorMessage = 'Invalid credentials';
            vi.mocked(loginUser).mockRejectedValue(new Error(errorMessage));

            const success = await useAuthStore.getState().login({ username: 'notemilys', password: 'notemilyspass' });
            expect(success).toBe(false);
            expect(loginUser).toHaveBeenCalledWith({ username: 'notemilys', password: 'notemilyspass' })
            expect(useAuthStore.getState().error).toBe(errorMessage);
            expect(useAuthStore.getState().user).toBeNull();
            expect(useAuthStore.getState().token).toBeNull()
        })

        it('should use a default error message when the error has none', async () => {
            vi.mocked(loginUser).mockRejectedValue(new Error(''));

            await useAuthStore.getState().login(credentials);

            expect(useAuthStore.getState().error).toBe('Login failed');
        });

        it('should set isLoading while the request is in progress', async () => {
            let resolveLogin!: (user: typeof authUser) => void;
            vi.mocked(loginUser).mockReturnValue(new Promise((resolve) => (resolveLogin = resolve)));

            const loginPromise = useAuthStore.getState().login(credentials);
            expect(useAuthStore.getState().isLoading).toBe(true);

            resolveLogin(authUser);
            await loginPromise;
            expect(useAuthStore.getState().isLoading).toBe(false);
        });

        it('should reset isLoading when the request fails', async () => {
            vi.mocked(loginUser).mockRejectedValue(new Error('Invalid credentials'));

            await useAuthStore.getState().login(credentials);

            expect(useAuthStore.getState().isLoading).toBe(false);
        });

        it('should clear a previous error when a new login starts', async () => {
            useAuthStore.setState({ error: 'Previous error' });
            vi.mocked(loginUser).mockReturnValue(new Promise(() => {}));

            void useAuthStore.getState().login(credentials);

            expect(useAuthStore.getState().error).toBeNull();
        });
    });

    describe('signup', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should set the user after the simulated delay', async () => {
            vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
            const signupPromise = useAuthStore.getState().signup(signupData);

            await vi.advanceTimersByTimeAsync(1999);
            expect(useAuthStore.getState().user).toBeNull();

            await vi.advanceTimersByTimeAsync(1);
            await signupPromise;

            expect(useAuthStore.getState().user).toEqual({
                id: Date.parse('2026-01-01T00:00:00Z') + 2000,
                username: 'johndoe',
                email: 'john@example.com',
                firstName: 'John',
                lastName: 'Doe',
            });
        });

        it('should not store the password', async () => {
            const signupPromise = useAuthStore.getState().signup(signupData);
            await vi.runAllTimersAsync();
            await signupPromise;

            expect(useAuthStore.getState().user).not.toHaveProperty('password');
        });

        it('should keep the token null (no real signup endpoint)', async () => {
            const signupPromise = useAuthStore.getState().signup(signupData);
            await vi.runAllTimersAsync();
            await signupPromise;

            expect(useAuthStore.getState().token).toBeNull();
        });

        it('should set isLoading during the delay', async () => {
            const signupPromise = useAuthStore.getState().signup(signupData);
            expect(useAuthStore.getState().isLoading).toBe(true);

            await vi.runAllTimersAsync();
            await signupPromise;
            expect(useAuthStore.getState().isLoading).toBe(false);
        });

        it('should return true on success', async () => {
            const signupPromise = useAuthStore.getState().signup(signupData);
            await vi.runAllTimersAsync();

            await expect(signupPromise).resolves.toBe(true);
        });
    });

    describe('updateUser', () => {
        it('should set the image when the id matches the current user', () => {
            loggedIn();

            useAuthStore.getState().updateUser(storedUser.id, 'data:image/jpeg;base64,abc');

            expect(useAuthStore.getState().user).toEqual({ ...storedUser, image: 'data:image/jpeg;base64,abc' });
        });

        it('should not change the user when the id does not match', () => {
            loggedIn();
            const userBefore = useAuthStore.getState().user;

            useAuthStore.getState().updateUser(999, 'data:image/jpeg;base64,abc');

            expect(useAuthStore.getState().user).toBe(userBefore);
        });

        it('should do nothing when there is no user', () => {
            useAuthStore.getState().updateUser(storedUser.id, 'data:image/jpeg;base64,abc');

            expect(useAuthStore.getState().user).toBeNull();
        });
    });

    describe('logout', () => {
        it('should clear the token, user and error', () => {
            loggedIn();
            useAuthStore.setState({ error: 'Some error' });

            useAuthStore.getState().logout();

            const { token, user, error } = useAuthStore.getState();
            expect({ token, user, error }).toEqual({ token: null, user: null, error: null });
        });

        it('should clear the cart', () => {
            loggedIn();
            useCartStore.getState().addItem({
                id: 1,
                title: 'Product',
                price: 10,
                description: '',
                category: 'test',
                image: '',
                quantity: 2,
            });

            useAuthStore.getState().logout();

            expect(useCartStore.getState().items).toEqual({});
        });
    });

    describe('clearError', () => {
        it('should reset the error to null', () => {
            useAuthStore.setState({ error: 'Some error' });

            useAuthStore.getState().clearError();

            expect(useAuthStore.getState().error).toBeNull();
        });
    });

    describe('checkAuth', () => {
        it('should not call the API when there is no token', async () => {
            await useAuthStore.getState().checkAuth();

            expect(fetchAuthUser).not.toHaveBeenCalled();
            expect(useAuthStore.getState().isLoading).toBe(false);
        });

        it('should update the user from the API on success', async () => {
            loggedIn();
            vi.mocked(fetchAuthUser).mockResolvedValue({ ...storedUser, firstName: 'Emma' });

            await useAuthStore.getState().checkAuth();

            expect(useAuthStore.getState().user).toEqual({ ...storedUser, firstName: 'Emma' });
            expect(useAuthStore.getState().token).toBe('test-token');
        });

        it('should keep the existing image when the user id is the same', async () => {
            loggedIn({ image: 'data:image/jpeg;base64,abc' });
            vi.mocked(fetchAuthUser).mockResolvedValue({ ...storedUser });

            await useAuthStore.getState().checkAuth();

            expect(useAuthStore.getState().user?.image).toBe('data:image/jpeg;base64,abc');
        });

        it('should not keep the image when the user id is different', async () => {
            loggedIn({ image: 'data:image/jpeg;base64,abc' });
            vi.mocked(fetchAuthUser).mockResolvedValue({ ...storedUser, id: 2 });

            await useAuthStore.getState().checkAuth();

            expect(useAuthStore.getState().user).toEqual({ ...storedUser, id: 2 });
        });

        it('should log out and set the error when the request fails', async () => {
            loggedIn();
            vi.mocked(fetchAuthUser).mockRejectedValue(new Error('Failed to fetch authenticated user'));

            await useAuthStore.getState().checkAuth();

            const { token, user, error } = useAuthStore.getState();
            expect({ token, user, error }).toEqual({
                token: null,
                user: null,
                error: 'Failed to fetch authenticated user',
            });
        });

        it('should set isLoading while the request is in progress', async () => {
            loggedIn();
            let resolveUser!: (user: User) => void;
            vi.mocked(fetchAuthUser).mockReturnValue(new Promise((resolve) => (resolveUser = resolve)));

            const checkPromise = useAuthStore.getState().checkAuth();
            expect(useAuthStore.getState().isLoading).toBe(true);

            resolveUser(storedUser);
            await checkPromise;
        });

        it.each([
            { outcome: 'succeeds', mock: () => vi.mocked(fetchAuthUser).mockResolvedValue(storedUser) },
            { outcome: 'fails', mock: () => vi.mocked(fetchAuthUser).mockRejectedValue(new Error('Unauthorized')) },
        ])('should reset isLoading when the request $outcome', async ({ mock }) => {
            loggedIn();
            mock();

            await useAuthStore.getState().checkAuth();

            expect(useAuthStore.getState().isLoading).toBe(false);
        });
    });

    describe('persistence', () => {
        const getPersistedState = () => JSON.parse(localStorage.getItem('auth-storage')!).state;

        it('should save only the token and user to localStorage', () => {
            loggedIn();

            expect(getPersistedState()).toEqual({ token: 'test-token', user: storedUser });
        });

        it('should not save isLoading or error', () => {
            useAuthStore.setState({ isLoading: true, error: 'Some error' });

            const persisted = getPersistedState();
            expect(persisted).not.toHaveProperty('isLoading');
            expect(persisted).not.toHaveProperty('error');
        });
    });
});
