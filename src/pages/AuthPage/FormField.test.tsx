import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FormField from './FormField';

const renderField = (error?: string) =>
    render(
        <FormField
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            disabled
            error={error}
        />
    );

const getInput = () => screen.getByLabelText('Email');

describe('FormField', () => {
    it('should connect the label to the input', () => {
        renderField();

        expect(getInput().tagName).toBe('INPUT');
    });

    it('should use the name as the input id and name', () => {
        renderField();

        expect(getInput()).toHaveAttribute('id', 'email');
        expect(getInput()).toHaveAttribute('name', 'email');
    });

    it('should pass other props (type, autoComplete, disabled) to the input', () => {
        renderField();

        expect(getInput()).toHaveAttribute('type', 'email');
        expect(getInput()).toHaveAttribute('autocomplete', 'email');
        expect(getInput()).toBeDisabled();
    });

    describe('Without an error', () => {
        it('should set aria-invalid to false', () => {
            renderField();

            expect(getInput()).toHaveAttribute('aria-invalid', 'false');
        });

        it('should not render an error message', () => {
            renderField();

            expect(getInput()).not.toHaveAttribute('aria-describedby');
            expect(document.getElementById('email-error')).toBeNull();
        });

        it('should use the default border style', () => {
            renderField();

            expect(getInput()).toHaveClass('border-gray-200');
            expect(getInput()).not.toHaveClass('border-red-500');
        });
    });

    describe('With an error', () => {
        it('should set aria-invalid to true', () => {
            renderField('Invalid email address');

            expect(getInput()).toHaveAttribute('aria-invalid', 'true');
        });

        it('should show the error message', () => {
            renderField('Invalid email address');

            expect(screen.getByText('Invalid email address')).toBeInTheDocument();
        });

        it('should connect the error message with aria-describedby', () => {
            renderField('Invalid email address');

            expect(getInput()).toHaveAttribute('aria-describedby', 'email-error');
            expect(getInput()).toHaveAccessibleDescription('Invalid email address');
        });

        it('should use the red border style only', () => {
            renderField('Invalid email address');

            expect(getInput()).toHaveClass('border-red-500');
            expect(getInput()).not.toHaveClass('border-gray-200');
        });
    });
});
