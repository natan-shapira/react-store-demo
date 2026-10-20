import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from './useCartStore';
import type { CartItem } from '../types';

const createItem = (id: number, quantity: number): CartItem => ({
    id,
    title: `Product ${id}`,
    price: 10,
    description: '',
    category: 'test',
    image: '',
    quantity,
});

const getItems = () => useCartStore.getState().items;

describe('useCartStore', () => {
    beforeEach(() => {
        useCartStore.setState({ items: {} });
    });

    describe('addItem', () => {
        it('should add a new product with the given quantity', () => {
            useCartStore.getState().addItem(createItem(1, 3));

            expect(getItems()).toEqual({ 1: createItem(1, 3) });
        });

        it('should add the quantity to an existing product instead of duplicating it', () => {
            useCartStore.getState().addItem(createItem(1, 2));
            useCartStore.getState().addItem(createItem(1, 3));

            expect(Object.keys(getItems())).toEqual(['1']);
            expect(getItems()[1].quantity).toBe(5);
        });

        it('should not change other products in the cart', () => {
            useCartStore.setState({ items: { 2: createItem(2, 4) } });

            useCartStore.getState().addItem(createItem(1, 1));

            expect(getItems()[2]).toEqual(createItem(2, 4));
        });

        it('should return a new items object (immutable update)', () => {
            const existing = createItem(1, 2);
            useCartStore.setState({ items: { 1: existing } });
            const itemsBefore = getItems();

            useCartStore.getState().addItem(createItem(1, 3));

            expect(getItems()).not.toBe(itemsBefore);
            expect(getItems()[1]).not.toBe(existing);
            expect(existing.quantity).toBe(2);
        });
    });

    describe('removeItem', () => {
        it('should remove the product from the cart', () => {
            useCartStore.setState({ items: { 1: createItem(1, 1), 2: createItem(2, 1) } });

            useCartStore.getState().removeItem(1);

            expect(getItems()).toEqual({ 2: createItem(2, 1) });
        });

        it('should do nothing when the product is not in the cart', () => {
            useCartStore.setState({ items: { 1: createItem(1, 1) } });

            useCartStore.getState().removeItem(99);

            expect(getItems()).toEqual({ 1: createItem(1, 1) });
        });
    });

    describe('updateQuantity', () => {
        beforeEach(() => {
            useCartStore.setState({ items: { 1: createItem(1, 2) } });
        });

        it('should set the quantity of an existing product', () => {
            useCartStore.getState().updateQuantity(1, 7);

            expect(getItems()[1].quantity).toBe(7);
        });

        it('should remove the product when the quantity is 0', () => {
            useCartStore.getState().updateQuantity(1, 0);

            expect(getItems()).toEqual({});
        });

        it('should remove the product when the quantity is negative', () => {
            useCartStore.getState().updateQuantity(1, -1);

            expect(getItems()).toEqual({});
        });

        it('should do nothing when the product is not in the cart', () => {
            useCartStore.getState().updateQuantity(99, 5);

            expect(getItems()).toEqual({ 1: createItem(1, 2) });
        });
    });

    describe('clearCart', () => {
        it('should remove all products', () => {
            useCartStore.setState({ items: { 1: createItem(1, 1), 2: createItem(2, 3) } });

            useCartStore.getState().clearCart();

            expect(getItems()).toEqual({});
        });
    });

    describe('persistence', () => {
        it('should save the items to localStorage under "cart-storage"', () => {
            useCartStore.getState().addItem(createItem(1, 2));

            const persisted = JSON.parse(localStorage.getItem('cart-storage')!);
            expect(persisted.state.items).toEqual({ 1: createItem(1, 2) });
        });
    });
});
