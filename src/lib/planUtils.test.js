import { describe, it, expect } from 'vitest';
import { isProUser, canAddProduct, FREE_LIMITS } from './planUtils';

describe('planUtils', () => {
    describe('isProUser', () => {
        it('should return true if profile plan is pro', () => {
            expect(isProUser({ plan: 'pro' })).toBe(true);
        });

        it('should return false if profile plan is free', () => {
            expect(isProUser({ plan: 'free' })).toBe(false);
        });

        it('should return false if profile is null', () => {
            expect(isProUser(null)).toBe(false);
        });
    });

    describe('canAddProduct', () => {
        it('should return true for pro users regardless of count', () => {
            const proProfile = { plan: 'pro' };
            expect(canAddProduct(proProfile, 0)).toBe(true);
            expect(canAddProduct(proProfile, 1000)).toBe(true);
        });

        it('should return true for free users if below limit', () => {
            const freeProfile = { plan: 'free' };
            expect(canAddProduct(freeProfile, FREE_LIMITS.products - 1)).toBe(true);
        });

        it('should return false for free users if at or above limit', () => {
            const freeProfile = { plan: 'free' };
            expect(canAddProduct(freeProfile, FREE_LIMITS.products)).toBe(false);
            expect(canAddProduct(freeProfile, FREE_LIMITS.products + 1)).toBe(false);
        });
    });
});
