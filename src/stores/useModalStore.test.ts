import { createElement } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useModalStore } from './useModalStore';

const firstContent = createElement('p', null, 'First modal');
const secondContent = createElement('p', null, 'Second modal');

describe('useModalStore', () => {
    beforeEach(() => {
        useModalStore.setState(useModalStore.getInitialState(), true);
    });

    it('should start with no content', () => {
        expect(useModalStore.getInitialState().content).toBeNull();
    });

    it('should set the content when openModal is called', () => {
        useModalStore.getState().openModal(firstContent);

        expect(useModalStore.getState().content).toBe(firstContent);
    });

    it('should replace the content when openModal is called again', () => {
        useModalStore.getState().openModal(firstContent);
        useModalStore.getState().openModal(secondContent);

        expect(useModalStore.getState().content).toBe(secondContent);
    });

    it('should clear the content when closeModal is called', () => {
        useModalStore.getState().openModal(firstContent);

        useModalStore.getState().closeModal();

        expect(useModalStore.getState().content).toBeNull();
    });

    it('should keep the content null when closeModal is called on a closed modal', () => {
        useModalStore.getState().closeModal();

        expect(useModalStore.getState().content).toBeNull();
    });

    it('should accept plain text as content', () => {
        useModalStore.getState().openModal('Simple message');

        expect(useModalStore.getState().content).toBe('Simple message');
    });

    it('should notify subscribers when the content changes', () => {
        const contents: unknown[] = [];
        const unsubscribe = useModalStore.subscribe((state) => contents.push(state.content));

        useModalStore.getState().openModal(firstContent);
        useModalStore.getState().closeModal();
        unsubscribe();

        expect(contents).toEqual([firstContent, null]);
    });
});
