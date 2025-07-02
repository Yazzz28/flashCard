/**
 * @jest-environment jsdom
 */

import { fireEvent, waitFor } from '@testing-library/dom';
import { WildCardsApp } from '../../src/script.js';
import sampleData from '../fixtures/sample-data.json';

// Mock fetch globalement
global.fetch = jest.fn();

// Mock pour les fonctions DOM manquantes
document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document
    }
});

describe('WildCards Application Integration', () => {
    let container;
    let app;

    beforeEach(() => {
        // Création d'un DOM minimal
        document.body.innerHTML = `
            <div class="container">
                <div id="cardsContainer"></div>
                <div class="formations">
                    <button class="formation-btn active" data-formation="all">Toutes</button>
                    <button class="formation-btn" data-formation="CDA">CDA</button>
                    <button class="formation-btn" data-formation="DWWM">DWWM</button>
                </div>
                <div class="categories"></div>
                <input type="text" id="searchBox" />
                <button id="resetBtn">Reset</button>
                <button id="fab">Reveal All</button>
                <div class="stats">
                    <span id="totalCount">0</span>
                    <span id="revealedCount">0</span>
                    <div id="progressFill"></div>
                </div>
                <div id="modalOverlay">
                    <div id="modalMessage"></div>
                    <button onclick="confirmModal()">Confirmer</button>
                    <button onclick="closeModal()">Annuler</button>
                </div>
                <button class="theme-toggle">🌙</button>
            </div>
        `;

        container = document.getElementById('cardsContainer');

        // Mock fetch pour retourner les données de test
        fetch.mockResolvedValue({
            ok: true,
            json: async () => sampleData
        });

        app = new WildCardsApp();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        fetch.mockClear();
        localStorage.clear();
    });

    describe('Application Initialization', () => {
        it('should initialize and load cards', async () => {
            await app.initialize();

            await waitFor(() => {
                expect(container.children.length).toBeGreaterThan(0);
            });

            // Vérifier que les cartes sont créées
            const cards = container.querySelectorAll('.card');
            expect(cards.length).toBeGreaterThan(0);
        });

        it('should handle data loading errors', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await app.initialize();

            await waitFor(() => {
                expect(container.innerHTML).toContain('Erreur');
            });
        });
    });

    describe('Card Interactions', () => {
        beforeEach(async () => {
            await app.initialize();
            await waitFor(() => {
                expect(container.children.length).toBeGreaterThan(0);
            });
        });

        it('should reveal card on click', async () => {
            const firstCard = container.querySelector('.card');
            expect(firstCard).toBeTruthy();

            fireEvent.click(firstCard);

            await waitFor(() => {
                expect(firstCard.classList.contains('revealed')).toBe(true);
            });

            const answer = firstCard.querySelector('.answer');
            expect(answer.classList.contains('visible')).toBe(true);
        });

        it('should update stats when cards are revealed', async () => {
            const cards = container.querySelectorAll('.card');
            const totalCount = document.getElementById('totalCount');
            const revealedCount = document.getElementById('revealedCount');

            // Révéler une carte
            fireEvent.click(cards[0]);

            await waitFor(() => {
                expect(revealedCount.textContent).toBe('1');
                expect(totalCount.textContent).toBe(cards.length.toString());
            });
        });
    });

    describe('Filtering', () => {
        beforeEach(async () => {
            await app.initialize();
            await waitFor(() => {
                expect(container.children.length).toBeGreaterThan(0);
            });
        });

        it('should filter cards by formation', async () => {
            const cdaButton = document.querySelector('[data-formation="CDA"]');

            fireEvent.click(cdaButton);

            await waitFor(() => {
                const cards = container.querySelectorAll('.card');
                cards.forEach((card) => {
                    expect(card.dataset.formation).toBe('CDA');
                });
            });
        });

        it('should show all cards when "all" formation is selected', async () => {
            const allButton = document.querySelector('[data-formation="all"]');

            fireEvent.click(allButton);

            await waitFor(() => {
                const cards = container.querySelectorAll('.card');
                expect(cards.length).toBeGreaterThan(0);

                // Vérifier qu'on a des cartes de différentes formations
                const formations = new Set();
                cards.forEach((card) => {
                    formations.add(card.dataset.formation);
                });
                expect(formations.size).toBeGreaterThan(1);
            });
        });
    });

    describe('Search Functionality', () => {
        beforeEach(async () => {
            await app.initialize();
            await waitFor(() => {
                expect(container.children.length).toBeGreaterThan(0);
            });
        });

        it('should filter cards by search term', async () => {
            const searchBox = document.getElementById('searchBox');

            fireEvent.input(searchBox, { target: { value: 'HTML' } });

            await waitFor(() => {
                const visibleCards = container.querySelectorAll('.card:not(.u-hidden)');
                const hiddenCards = container.querySelectorAll('.card.u-hidden');

                expect(visibleCards.length).toBeGreaterThan(0);
                expect(hiddenCards.length).toBeGreaterThan(0);

                // Vérifier que les cartes visibles contiennent le terme recherché
                visibleCards.forEach((card) => {
                    const questionText = card.querySelector('.question-text').textContent;
                    const answerText = card.querySelector('.answer').textContent;
                    expect(
                        questionText.toLowerCase().includes('html') ||
                            answerText.toLowerCase().includes('html')
                    ).toBe(true);
                });
            });
        });

        it('should show all cards when search is cleared', async () => {
            const searchBox = document.getElementById('searchBox');
            const totalCards = container.querySelectorAll('.card').length;

            // Effectuer une recherche
            fireEvent.input(searchBox, { target: { value: 'HTML' } });

            await waitFor(() => {
                const visibleCards = container.querySelectorAll('.card:not(.u-hidden)');
                expect(visibleCards.length).toBeLessThan(totalCards);
            });

            // Vider la recherche
            fireEvent.input(searchBox, { target: { value: '' } });

            await waitFor(() => {
                const visibleCards = container.querySelectorAll('.card:not(.u-hidden)');
                expect(visibleCards.length).toBe(totalCards);
            });
        });
    });

    describe('Reset Functionality', () => {
        beforeEach(async () => {
            await app.initialize();
            await waitFor(() => {
                expect(container.children.length).toBeGreaterThan(0);
            });
        });

        it('should reset revealed cards', async () => {
            const firstCard = container.querySelector('.card');
            const resetBtn = document.getElementById('resetBtn');

            // Révéler une carte
            fireEvent.click(firstCard);

            await waitFor(() => {
                expect(firstCard.classList.contains('revealed')).toBe(true);
            });

            // Mock pour la confirmation
            window.confirmModal = jest.fn();

            // Déclencher le reset
            fireEvent.click(resetBtn);

            // Simuler la confirmation
            if (app.modalService.confirmCallback) {
                app.modalService.confirmCallback(true);
            }

            await waitFor(() => {
                const revealedCards = container.querySelectorAll('.card.revealed');
                expect(revealedCards.length).toBe(0);
            });
        });
    });

    describe('Theme Toggle', () => {
        it('should toggle theme on button click', () => {
            const themeToggle = document.querySelector('.theme-toggle');
            const initialTheme = document.documentElement.getAttribute('data-theme');

            fireEvent.click(themeToggle);

            const newTheme = document.documentElement.getAttribute('data-theme');
            expect(newTheme).not.toBe(initialTheme);
        });
    });
});
