import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Pagination from './Pagination';

const renderPagination = ({ page = 0, totalPages = 3, disabled = false } = {}) => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} disabled={disabled} />);
    return { user, onPageChange };
};

describe('Pagination', () => {
    describe('Rendering', () => {
        it('should render nothing when there is only one page', () => {
            renderPagination({ totalPages: 1 });

            expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
        });

        it('should render nothing when there are no pages', () => {
            renderPagination({ totalPages: 0 });

            expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
        });

        it('should render a button for each page, numbered from 1', () => {
            renderPagination({ totalPages: 3 });

            expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: '4' })).not.toBeInTheDocument();
        });

        it('should mark the current page with aria-current="page"', () => {
            renderPagination({ page: 1 });

            expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
            expect(screen.getByRole('button', { name: '1' })).not.toHaveAttribute('aria-current');
        });
    });

    describe('Navigation', () => {
        it('should call onPageChange with the page index when a page is clicked', async () => {
            const { user, onPageChange } = renderPagination();

            await user.click(screen.getByRole('button', { name: '3' }));

            expect(onPageChange).toHaveBeenCalledWith(2);
        });

        it('should call onPageChange with page - 1 when Previous is clicked', async () => {
            const { user, onPageChange } = renderPagination({ page: 2 });

            await user.click(screen.getByRole('button', { name: 'Previous' }));

            expect(onPageChange).toHaveBeenCalledWith(1);
        });

        it('should call onPageChange with page + 1 when Next is clicked', async () => {
            const { user, onPageChange } = renderPagination({ page: 0 });

            await user.click(screen.getByRole('button', { name: 'Next' }));

            expect(onPageChange).toHaveBeenCalledWith(1);
        });
    });

    describe('Disabled state', () => {
        it('should disable Previous on the first page', () => {
            renderPagination({ page: 0 });

            expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
            expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
        });

        it('should disable Next on the last page', () => {
            renderPagination({ page: 2, totalPages: 3 });

            expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
            expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
        });

        it('should disable all buttons when disabled is true', () => {
            renderPagination({ page: 1, disabled: true });

            screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
        });
    });
});
