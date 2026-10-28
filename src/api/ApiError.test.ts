import { describe, it, expect } from 'vitest';
import { ApiError } from './ApiError';

describe('ApiError', () => {
  it('should correctly set message, status and name', () => {
    const error = new ApiError('Not Found', 404);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('Not Found');
    expect(error.status).toBe(404);
    expect(error.name).toBe('ApiError');
  });
});