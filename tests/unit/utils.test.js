import { StorageUtils } from '../../src/modules/utils.js';

describe('StorageUtils', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('save', () => {
        it('should handle circular references', () => {
            const circularData = {};
            circularData.self = circularData;

            const result = StorageUtils.save('circular', circularData);

            expect(result).toBe(false);
        });
    });

    describe('isAvailable', () => {
        it('should return true when localStorage is available', () => {
            const result = StorageUtils.isAvailable();

            expect(result).toBe(true);
        });
    });
});
