import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWithAuth } from './fetchWithAuth';
import { useAuthStore } from '../stores/useAuthStore';

const URL = 'https://dummyjson.com/test';

const mockFetch = (status = 200) => {
    const response = new Response(null, { status });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response);
    return response;
};

const getRequestHeaders = () => vi.mocked(fetch).mock.calls[0][1]?.headers as Headers;

describe('fetchWithAuth', () => {
    const logout = vi.fn();

    beforeEach(() => {
        logout.mockReset();
        useAuthStore.setState({ token: null, logout });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should add the Authorization header when there is a token', async () => {
        useAuthStore.setState({ token: 'test-token' });
        mockFetch();

        await fetchWithAuth(URL);

        expect(getRequestHeaders().get('Authorization')).toBe('Bearer test-token');
    });

    it('should not add the Authorization header when there is no token', async () => {
        mockFetch();

        await fetchWithAuth(URL);

        expect(getRequestHeaders().has('Authorization')).toBe(false);
    });

    it('should keep headers that were passed in the options', async () => {
        useAuthStore.setState({ token: 'test-token' });
        mockFetch();

        await fetchWithAuth(URL, { headers: { 'Content-Type': 'application/json' } });

        expect(getRequestHeaders().get('Content-Type')).toBe('application/json');
        expect(getRequestHeaders().get('Authorization')).toBe('Bearer test-token');
    });

    it('should pass the other options (method, body) to fetch', async () => {
        mockFetch();

        await fetchWithAuth(URL, { method: 'POST', body: '{"a":1}' });

        expect(fetch).toHaveBeenCalledWith(URL, expect.objectContaining({ method: 'POST', body: '{"a":1}' }));
    });

    it('should return the response as is', async () => {
        const response = mockFetch(201);

        await expect(fetchWithAuth(URL)).resolves.toBe(response);
    });

    it('should log the user out when the response status is 401', async () => {
        mockFetch(401);

        await fetchWithAuth(URL);

        expect(logout).toHaveBeenCalledTimes(1);
    });

    it.each([400, 403, 404, 500])('should not log the user out on status %i', async (status) => {
        mockFetch(status);

        await fetchWithAuth(URL);

        expect(logout).not.toHaveBeenCalled();
    });
});
