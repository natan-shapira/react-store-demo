import { describe, expect, it } from "vitest";
import { validateSignin, validateSignup } from "./authValidators";
import type { SignupFormData } from "../types";

describe('Auth Validators', () => {
    describe('validateSignup', () => {
        const validData: SignupFormData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            username: 'johndoe',
            password: 'Password123',
            confirmPassword: 'Password123',
        };

        it('should return no errors for valid signup data', () => {
            const errors = validateSignup(validData);
            expect(Object.keys(errors)).toHaveLength(0);
        });

        it('should require not null fields', () => {
            const errors = validateSignup({
                firstName: null as unknown as string,
                lastName: null as unknown as string,
                email: null as unknown as string,
                username: null as unknown as string,
                password: null as unknown as string,
                confirmPassword: null as unknown as string,
            });
            expect(errors.firstName).toBeDefined();
            expect(errors.lastName).toBeDefined();
            expect(errors.email).toBeDefined();
            expect(errors.username).toBeDefined();
            expect(errors.password).toBeDefined();
            expect(errors.confirmPassword).toBeDefined();
        });

        it('should require all mandatory fields', () => {
            const errors = validateSignup({
                firstName: '',
                lastName: '',
                email: '',
                username: '',
                password: '',
                confirmPassword: '',
            });

            expect(errors.firstName).toBeDefined();
            expect(errors.lastName).toBeDefined();
            expect(errors.email).toBeDefined();
            expect(errors.username).toBeDefined();
            expect(errors.password).toBeDefined();
            expect(errors.confirmPassword).toBeDefined();
        });

        it('should never return a general error', () => {
            const errors = validateSignup({ ...validData, username: '', password: '' });
            expect(errors.general).toBeUndefined();
        });

        it.each(['firstName', 'lastName', 'username'] as const)(
            'should report only the %s error when only %s is missing',
            (field) => {
                const errors = validateSignup({ ...validData, [field]: '' });
                expect(Object.keys(errors)).toEqual([field]);
            }
        );

        describe('Email validation', () => {
            const invalidEmails = [
                { email: 'invalid-email', description: 'missing an @ sign' },
                { email: 'john@example', description: 'missing a domain extension' },
                { email: '@example.com', description: 'missing a local part' },
                { email: 'john@.com', description: 'missing a domain name' },
                { email: 'john doe@example.com', description: 'containing a space' },
                { email: 'john@@example.com', description: 'containing two @ signs' },
            ];

            const validEmails = [
                { email: 'john.doe@example.com', description: 'containing a dot' },
                { email: 'john+shop@mail.example.co.il', description: 'containing a plus sign and a subdomain' },
                { email: 'J@E.IO', description: 'in uppercase' },
            ];

            it('should require an email', () => {
                const errors = validateSignup({ ...validData, email: '' });
                expect(errors.email).toBe('Email is required');
            });

            it.each(invalidEmails)('should reject an email $description ($email)', ({ email }) => {
                const errors = validateSignup({ ...validData, email });
                expect(errors).toEqual({ email: 'Invalid email address' });
            });

            it.each(validEmails)('should accept an email $description ($email)', ({ email }) => {
                const errors = validateSignup({ ...validData, email });
                expect(errors.email).toBeUndefined();
            });
        });

        describe('Password validation', () => {
            const invalidPasswords = [
                { password: 'Pass123', description: 'shorter than 8 characters' },
                { password: 'PASSWORD123', description: 'missing a lowercase letter' },
                { password: 'password123', description: 'missing an uppercase letter' },
                { password: 'PasswordABC', description: 'missing a number' },
            ];

            const validPasswords = [
                { password: 'Passw0rd', description: 'of exactly 8 characters' },
                { password: 'P@ssw0rd!', description: 'containing special characters' },
                { password: 'My Pass 1', description: 'containing spaces' },
                { password: 'Aa1' + 'x'.repeat(61), description: 'of 64 characters' },
            ];

            it('should require a password', () => {
                const errors = validateSignup({ ...validData, password: '', confirmPassword: '' });
                expect(errors.password).toBe('Password is required');
            });

            it.each(invalidPasswords)('should reject a password $description ($password)', ({ password }) => {
                const errors = validateSignup({ ...validData, password, confirmPassword: password });
                expect(errors).toEqual({
                    password: 'Password must be at least 8 characters and include uppercase, lowercase and a number',
                });
            });

            it.each(validPasswords)('should accept a password $description ($password)', ({ password }) => {
                const errors = validateSignup({ ...validData, password, confirmPassword: password });
                expect(errors.password).toBeUndefined();
            });
        });

        describe('Confirm password validation', () => {
            it('should require confirmPassword to match password', () => {
                const errors = validateSignup({ ...validData, confirmPassword: 'DifferentPassword123' });
                expect(errors.confirmPassword).toBeDefined();
            });

            it('should distinguish a missing confirmation from a mismatch', () => {
                const missing = validateSignup({ ...validData, confirmPassword: '' });
                const mismatch = validateSignup({ ...validData, confirmPassword: 'Password1234' });

                expect(missing.confirmPassword).toBe('Please confirm your password');
                expect(mismatch.confirmPassword).toBe('Passwords do not match');
            });

            it('should be case sensitive', () => {
                const errors = validateSignup({ ...validData, confirmPassword: 'password123' });
                expect(errors.confirmPassword).toBe('Passwords do not match');
            });

            it('should not ignore surrounding spaces', () => {
                const errors = validateSignup({ ...validData, confirmPassword: 'Password123 ' });
                expect(errors.confirmPassword).toBe('Passwords do not match');
            });

            it('should not report a mismatch when a weak password is confirmed correctly', () => {
                const errors = validateSignup({ ...validData, password: 'weak', confirmPassword: 'weak' });

                expect(errors.password).toBeDefined();
                expect(errors.confirmPassword).toBeUndefined();
            });
        });
    });

    describe('validateSignin', () => {
        it('should return no errors when username and password are provided', () => {
            expect(validateSignin({ username: 'emilys', password: 'emilyspass' })).toEqual({});
        });

        it.each([
            { username: '', password: 'emilyspass', description: 'username is missing' },
            { username: 'emilys', password: '', description: 'password is missing' },
            { username: '', password: '', description: 'both fields are missing' },
        ])('should return a general error when $description', ({ username, password }) => {
            expect(validateSignin({ username, password })).toEqual({
                general: 'Please fill in all fields',
            });
        });

        it('should not apply the signup password rules to existing users', () => {
            const errors = validateSignin({ username: 'emilys', password: 'short' });
            expect(errors).toEqual({});
        });
    });
});
