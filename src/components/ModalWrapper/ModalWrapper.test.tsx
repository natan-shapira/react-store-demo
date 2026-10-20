import '@testing-library/jest-dom/vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import ModalWrapper from './ModalWrapper';
import { useModalStore } from '../../stores/useModalStore';

const openModal = () => act(() => useModalStore.getState().openModal(<p>Modal body</p>));

const renderModal = () => {
    const user = userEvent.setup();
    const { container } = render(<ModalWrapper />);
    return { user, getBackdrop: () => container.firstElementChild as HTMLElement };
};

describe('ModalWrapper', () => {
    beforeEach(() => {
        useModalStore.setState({ content: null });
    });

    it('should render nothing when there is no content', () => {
        const { getBackdrop } = renderModal();

        expect(getBackdrop()).toBeNull();
    });

    it('should render the content from the modal store', () => {
        renderModal();
        openModal();

        expect(screen.getByText('Modal body')).toBeInTheDocument();
    });

    it('should close when the backdrop is clicked', async () => {
        const { user, getBackdrop } = renderModal();
        openModal();

        await user.click(getBackdrop());

        expect(useModalStore.getState().content).toBeNull();
        expect(screen.queryByText('Modal body')).not.toBeInTheDocument();
    });

    it('should not close when the modal content is clicked', async () => {
        const { user } = renderModal();
        openModal();

        await user.click(screen.getByText('Modal body'));

        expect(screen.getByText('Modal body')).toBeInTheDocument();
    });

    it('should close when the close button is clicked', async () => {
        const { user } = renderModal();
        openModal();

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(screen.queryByText('Modal body')).not.toBeInTheDocument();
    });
});
