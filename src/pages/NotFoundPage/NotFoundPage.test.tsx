import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import NotFoundPage from './NotFoundPage';
import userEvent from '@testing-library/user-event';

const wrongUrl = '/wrong'
const renderNotFoundPage = (options = { hasHistory: true }) => {
    const user = userEvent.setup();
    const entries = options.hasHistory ? ['/testPage', wrongUrl] : [wrongUrl];
    const index = options.hasHistory ? 1 : 0;
    render(
        <MemoryRouter initialEntries={entries} initialIndex={index}>
            <Routes>
                <Route path={wrongUrl} element={<NotFoundPage />} />
                <Route path='/testPage' element={<div data-testid="test-page">Test Page</div>} />
                <Route path='/' element={<div data-testid="home-page">Home Page</div>} />
            </Routes>
        </MemoryRouter>
    )
    return { user };
}

describe('NotFoundPage', () => {
    describe('Display', () => {
        it('should show the "Page not found" heading and the 404 code', () => {
            renderNotFoundPage({hasHistory: false})
            expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
            expect(screen.getByText(/404/)).toBeInTheDocument();
        });
        it('should show the path that was not found', () => {
            renderNotFoundPage({hasHistory: false});
            expect(screen.getByText(wrongUrl)).toBeInTheDocument();
        });
        it('should set the document title to "Page not found | ReactShop"', () => {
            renderNotFoundPage({ hasHistory: false });
            expect(document.title).toBe('Page not found | ReactShop');
        });
    });

    describe('Back to home', () => {
        it('should link to the home page', () => {
            renderNotFoundPage({ hasHistory: false });
            const homeLink = screen.getByRole('link', { name: /back to home/i });
            expect(homeLink).toHaveAttribute('href', '/');
        });
        it('should navigate to the home page when clicked', async () => {
            const {user} = renderNotFoundPage({ hasHistory: false });
            const homeLink = screen.getByRole('link', { name: /back to home/i });
            await user.click(homeLink)
            expect(screen.getByTestId('home-page')).toBeInTheDocument();
        });
    });

    describe('Go back', () => {
        
        it('should show the "Go back" button when there is a previous page in the history', () => {
            renderNotFoundPage();
            expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
        });
        
        it('should hide the "Go back" button when the page was opened directly', () => {
            renderNotFoundPage({ hasHistory: false });
            expect(screen.queryByRole('button', { name: /go back/i })).not.toBeInTheDocument();
        });
        
        it('should return to the previous page when "Go back" is clicked', async () => {
            const {user} = renderNotFoundPage()
            const goBackButton = screen.getByRole('button', { name: /go back/i });
            await user.click(goBackButton)
            expect(screen.getByTestId('test-page')).toBeInTheDocument();
        });
    });
});
