import {
    STORAGE_KEYS,
    ANIMATION_DELAYS,
    CATEGORY_BUTTONS,
    DEFAULT_CONFIG
} from '../../src/modules/config.js';

describe('Config Module', () => {
    describe('STORAGE_KEYS', () => {
        it('should have all required storage keys', () => {
            expect(STORAGE_KEYS).toHaveProperty('REVEALED_CARDS');
            expect(STORAGE_KEYS).toHaveProperty('THEME');
            expect(STORAGE_KEYS).toHaveProperty('CURRENT_FORMATION');
            expect(STORAGE_KEYS).toHaveProperty('CURRENT_CATEGORY');
        });

        it('should have string values for all keys', () => {
            Object.values(STORAGE_KEYS).forEach((key) => {
                expect(typeof key).toBe('string');
                expect(key.length).toBeGreaterThan(0);
            });
        });
    });

    describe('ANIMATION_DELAYS', () => {
        it('should have numeric values', () => {
            Object.values(ANIMATION_DELAYS).forEach((delay) => {
                expect(typeof delay).toBe('number');
                expect(delay).toBeGreaterThanOrEqual(0);
            });
        });

        it('should have reasonable delay values', () => {
            expect(ANIMATION_DELAYS.LOADING).toBeGreaterThanOrEqual(100);
            expect(ANIMATION_DELAYS.LOADING).toBeLessThanOrEqual(2000);
        });
    });

    describe('CATEGORY_BUTTONS', () => {
        it('should be an array of category objects', () => {
            expect(Array.isArray(CATEGORY_BUTTONS)).toBe(true);
            expect(CATEGORY_BUTTONS.length).toBeGreaterThan(0);
        });

        it('should have valid category structure', () => {
            CATEGORY_BUTTONS.forEach((category) => {
                expect(category).toHaveProperty('key');
                expect(category).toHaveProperty('icon');
                expect(category).toHaveProperty('label');

                expect(typeof category.key).toBe('string');
                expect(typeof category.icon).toBe('string');
                expect(typeof category.label).toBe('string');
            });
        });

        it('should include "all" category', () => {
            const allCategory = CATEGORY_BUTTONS.find((cat) => cat.key === 'all');
            expect(allCategory).toBeDefined();
            expect(allCategory.label).toBe('Toutes');
        });
    });

    describe('DEFAULT_CONFIG', () => {
        it('should have all required default values', () => {
            expect(DEFAULT_CONFIG).toHaveProperty('FORMATION');
            expect(DEFAULT_CONFIG).toHaveProperty('CATEGORY');
            expect(DEFAULT_CONFIG).toHaveProperty('QUESTION_COUNTER_START');
        });

        it('should have valid default values', () => {
            expect(typeof DEFAULT_CONFIG.FORMATION).toBe('string');
            expect(typeof DEFAULT_CONFIG.CATEGORY).toBe('string');
            expect(typeof DEFAULT_CONFIG.QUESTION_COUNTER_START).toBe('number');

            expect(DEFAULT_CONFIG.QUESTION_COUNTER_START).toBeGreaterThanOrEqual(1);
        });
    });
});
