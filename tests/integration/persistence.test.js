import { StorageUtils } from '../../src/modules/utils.js';
import { createMockDOM, createTestCard } from '../helpers/dom-helpers.js';

describe('Data Persistence Integration', () => {
    beforeEach(() => {
        createMockDOM();
        localStorage.clear();
    });

    describe('Revealed Cards Persistence', () => {
        it('should save revealed cards to localStorage', () => {
            const container = document.getElementById('cardsContainer');
            const card1 = createTestCard('Question 1', 'Answer 1');
            const card2 = createTestCard('Question 2', 'Answer 2');

            container.appendChild(card1);
            container.appendChild(card2);

            // Simuler la révélation d'une carte
            const answerDiv = card1.querySelector('.answer');
            answerDiv.classList.add('visible');
            card1.classList.add('revealed');

            // Données à sauvegarder
            const revealedCardData = {
                formation: card1.dataset.formation,
                category: card1.dataset.category,
                questionText: card1.querySelector('.question-text').textContent
            };

            StorageUtils.save('wildcards_revealed_cards', [revealedCardData]);

            const saved = StorageUtils.load('wildcards_revealed_cards');
            expect(saved).toHaveLength(1);
            expect(saved[0]).toEqual(revealedCardData);
        });

        it('should restore revealed cards from localStorage', () => {
            const container = document.getElementById('cardsContainer');
            const card = createTestCard('Test Question', 'Test Answer');
            container.appendChild(card);

            // Sauvegarder l'état révélé
            const revealedData = [
                {
                    formation: 'CDA',
                    category: 'frontend',
                    questionText: 'Test Question'
                }
            ];
            StorageUtils.save('wildcards_revealed_cards', revealedData);

            // Simuler le chargement
            const saved = StorageUtils.load('wildcards_revealed_cards');
            expect(saved).toEqual(revealedData);

            // Vérifier qu'on peut restaurer l'état
            const cardToRestore = Array.from(container.querySelectorAll('.card')).find((c) => {
                return (
                    c.dataset.formation === saved[0].formation &&
                    c.dataset.category === saved[0].category &&
                    c.querySelector('.question-text').textContent === saved[0].questionText
                );
            });

            expect(cardToRestore).toBeDefined();
        });
    });

    describe('Theme Persistence', () => {
        it('should save and load theme preference', () => {
            const theme = 'dark';
            StorageUtils.save('wildcards_theme', theme);

            const loadedTheme = StorageUtils.load('wildcards_theme');
            expect(loadedTheme).toBe(theme);
        });
    });

    describe('Formation and Category Persistence', () => {
        it('should save current formation selection', () => {
            const formation = 'CDA';
            StorageUtils.save('wildcards_current_formation', formation);

            const loaded = StorageUtils.load('wildcards_current_formation');
            expect(loaded).toBe(formation);
        });

        it('should save current category selection', () => {
            const category = 'frontend';
            StorageUtils.save('wildcards_current_category', category);

            const loaded = StorageUtils.load('wildcards_current_category');
            expect(loaded).toBe(category);
        });
    });

    describe('Data Migration and Compatibility', () => {
        it('should handle missing localStorage gracefully', () => {
            // Simuler localStorage indisponible
            const originalLocalStorage = global.localStorage;
            delete global.localStorage;

            const result = StorageUtils.load('any_key');
            expect(result).toBeNull();

            const saveResult = StorageUtils.save('any_key', {});
            expect(saveResult).toBe(false);

            global.localStorage = originalLocalStorage;
        });

        it('should handle corrupted localStorage data', () => {
            localStorage.setItem('wildcards_test', 'invalid json {');

            const result = StorageUtils.load('wildcards_test');
            expect(result).toBeNull();
        });

        it('should handle quota exceeded errors', () => {
            const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
            setItemSpy.mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });

            const result = StorageUtils.save('test', { large: 'data' });
            expect(result).toBe(false);

            setItemSpy.mockRestore();
        });
    });

    describe('Performance with Large Datasets', () => {
        it('should handle large number of revealed cards efficiently', () => {
            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                formation: 'CDA',
                category: 'frontend',
                questionText: `Question ${i}`
            }));

            const startTime = performance.now();
            const result = StorageUtils.save('large_dataset', largeDataset);
            const saveTime = performance.now() - startTime;

            expect(result).toBe(true);
            expect(saveTime).toBeLessThan(100); // Moins de 100ms

            const loadStartTime = performance.now();
            const loaded = StorageUtils.load('large_dataset');
            const loadTime = performance.now() - loadStartTime;

            expect(loaded).toHaveLength(1000);
            expect(loadTime).toBeLessThan(50); // Moins de 50ms
        });
    });
});
