/**
 * Application principale WildCards
 * Système de fiches de révision pour CDA et DWWM
 */

import {
    STORAGE_KEYS,
    ANIMATION_DELAYS,
    CATEGORY_BUTTONS,
    DEFAULT_CONFIG
} from './modules/config.js';

import { StorageUtils } from './modules/utils.js';

/**
 * État global de l'application
 */

class AppState {
    constructor() {
        this.questionsData = {};
        this.currentFormation = DEFAULT_CONFIG.FORMATION;
        this.currentCategory = DEFAULT_CONFIG.CATEGORY;
        this.revealedCards = new Set();
        this.questionCounter = DEFAULT_CONFIG.QUESTION_COUNTER_START;
    }

    reset() {
        this.revealedCards.clear();
        this.questionCounter = DEFAULT_CONFIG.QUESTION_COUNTER_START;
    }

    setFormation(formation) {
        this.currentFormation = formation;
        this.currentCategory = DEFAULT_CONFIG.CATEGORY;
    }

    setCategory(category) {
        this.currentCategory = category;
    }
}

/**
 * Service de stockage - Alias vers StorageUtils pour compatibilité
 */
class StorageService {
    static save(key, data) {
        return StorageUtils.save(key, data);
    }

    static load(key) {
        return StorageUtils.load(key);
    }

    static remove(key) {
        return StorageUtils.remove(key);
    }
}

class DataService {
    static async loadQuestionsData() {
        try {
            const response = await fetch('../assets/data/data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            return {
                CDA: {
                    frontend: [
                        {
                            question: 'Erreur de chargement',
                            answer: 'Une erreur s\'est produite lors du chargement des données.'
                        }
                    ]
                }
            };
        }
    }
}

// ===== MODAL SERVICE =====
class ModalService {
    constructor() {
        this.confirmCallback = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        window.closeModal = () => this.close();
        window.confirmModal = () => this.confirm();
    }

    show(message, onConfirm) {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalMessage = document.getElementById('modalMessage');

        if (!modalOverlay || !modalMessage) {
            return;
        }

        modalMessage.textContent = message;
        modalOverlay.classList.add('modal--show');
        modalOverlay.showModal();
        this.confirmCallback = onConfirm;
        
        // Focus on the first button for better accessibility
        const firstButton = modalOverlay.querySelector('.modal__btn');
        firstButton?.focus();
    }

    close() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('modal--show');
            modalOverlay.close();
        }

        if (this.confirmCallback) {
            this.confirmCallback(false);
            this.confirmCallback = null;
        }
    }

    confirm() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('modal--show');
            modalOverlay.close();
        }

        if (this.confirmCallback) {
            this.confirmCallback(true);
            this.confirmCallback = null;
        }
    }
}

class CardService {
    constructor(appState, storageService) {
        this.appState = appState;
        this.storageService = storageService;
    }

    create(question, answer, formation, category) {
        const card = document.createElement('article');
        card.className = 'card flashcard';
        card.dataset.formation = formation;
        card.dataset.category = category;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-expanded', 'false');
        card.setAttribute('aria-label', `Question ${this.appState.questionCounter}: ${question.substring(0, 100)}...`);

        card.innerHTML = `
            <div class="card__question">
                <div class="card__question-icon" aria-hidden="true">Q${this.appState.questionCounter++}</div>
                <div class="card__question-text">${question}</div>
            </div>
            <div class="card__answer" aria-hidden="true">${answer}</div>
            <div class="card__hint">
                <span class="card__hint-icon" aria-hidden="true">👆</span>
                Cliquez pour révéler la réponse
            </div>
        `;

        card.addEventListener('click', () => this.reveal(card));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.reveal(card);
            }
        });
        return card;
    }

    reveal(card) {
        const answerDiv = card.querySelector('.card__answer');
        if (!answerDiv.classList.contains('card__answer--visible')) {
            answerDiv.classList.add('card__answer--visible');
            answerDiv.setAttribute('aria-hidden', 'false');
            card.classList.add('card--revealed');
            card.setAttribute('aria-expanded', 'true');
            this.appState.revealedCards.add(card);
            this.saveRevealedCards();
        }
    }

    saveRevealedCards() {
        const revealedCardIds = Array.from(this.appState.revealedCards).map((card) => ({
            formation: card.dataset.formation,
            category: card.dataset.category,
            questionText: card.querySelector('.card__question-text').textContent
        }));

        this.storageService.save(STORAGE_KEYS.REVEALED_CARDS, revealedCardIds);
    }

    loadRevealedCards() {
        const savedCards = this.storageService.load(STORAGE_KEYS.REVEALED_CARDS);
        if (!savedCards) return;

        savedCards.forEach((cardData) => {
            const card = this.findCardByData(
                cardData.formation,
                cardData.category,
                cardData.questionText
            );
            if (card) {
                const answerDiv = card.querySelector('.card__answer');
                answerDiv.classList.add('card__answer--visible');
                answerDiv.setAttribute('aria-hidden', 'false');
                card.classList.add('card--revealed');
                card.setAttribute('aria-expanded', 'true');
                this.appState.revealedCards.add(card);
            }
        });
    }

    findCardByData(formation, category, questionText) {
        const cards = document.querySelectorAll('.card');
        return Array.from(cards).find((card) => {
            return (
                card.dataset.formation === formation &&
                card.dataset.category === category &&
                card.querySelector('.card__question-text').textContent === questionText
            );
        });
    }

    resetRevealedCards() {
        this.appState.revealedCards.clear();
        this.storageService.remove(STORAGE_KEYS.REVEALED_CARDS);
    }
}

class UIService {
    constructor(appState) {
        this.appState = appState;
    }

    updateStats() {
        const totalCards = document.querySelectorAll('.card').length;
        const revealedCount = document.querySelectorAll('.card.card--revealed').length;
        const percentage = totalCards > 0 ? (revealedCount / totalCards) * 100 : 0;

        const totalCountEl = document.getElementById('totalCount');
        const revealedCountEl = document.getElementById('revealedCount');
        const progressBarEl = document.getElementById('progressBar');

        if (totalCountEl) totalCountEl.textContent = totalCards;
        if (revealedCountEl) revealedCountEl.textContent = revealedCount;
        if (progressBarEl) {
            progressBarEl.value = percentage;
            progressBarEl.setAttribute('aria-valuenow', Math.round(percentage));
        }
    }

    showLoadingState(container) {
        container.innerHTML = '<div class="loading" aria-label="Chargement des fiches en cours"><div class="loading__spinner" aria-hidden="true"></div><span class="sr-only">Chargement des fiches de révision...</span></div>';
    }

    showErrorState(
        container,
        message = '❌ Aucune donnée disponible. Vérifiez le fichier data.json'
    ) {
        container.innerHTML = `<div class="error">${message}</div>`;
    }

    clearContainer(container) {
        container.innerHTML = '';
    }

    updateActiveButton(selector, activeSelector, pressedState = true) {
        document.querySelectorAll(selector).forEach((btn) => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        const activeBtn = document.querySelector(activeSelector);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.setAttribute('aria-pressed', pressedState.toString());
        }
    }
}

class FilterService {
    constructor(appState) {
        this.appState = appState;
        this.categoryButtons = CATEGORY_BUTTONS;
    }

    getAvailableCategories() {
        const availableCategories = new Set();

        if (this.appState.currentFormation === 'all') {
            Object.values(this.appState.questionsData).forEach((formation) => {
                Object.keys(formation).forEach((category) => {
                    availableCategories.add(category);
                });
            });
        } else if (this.appState.questionsData[this.appState.currentFormation]) {
            Object.keys(this.appState.questionsData[this.appState.currentFormation]).forEach(
                (category) => {
                    availableCategories.add(category);
                }
            );
        }

        return availableCategories;
    }

    generateCategoryButtons(onCategoryClick) {
        const categoriesContainer = document.querySelector('.categories');
        if (!categoriesContainer) return;

        const availableCategories = this.getAvailableCategories();
        categoriesContainer.innerHTML = '';

        this.categoryButtons.forEach(({ key, icon, label }) => {
            if (key === 'all' || availableCategories.has(key)) {
                const button = document.createElement('button');
                button.className = `categories__btn ${this.appState.currentCategory === key ? 'categories__btn--active' : ''}`;
                button.dataset.category = key;
                button.type = 'button';
                button.setAttribute('aria-pressed', this.appState.currentCategory === key ? 'true' : 'false');
                button.setAttribute('aria-label', `Filtrer par catégorie ${label}`);
                button.innerHTML = `<span aria-hidden="true">${icon}</span> ${label}`;
                button.addEventListener('click', () => onCategoryClick(key));
                categoriesContainer.appendChild(button);
            }
        });
    }

    searchCards(searchTerm) {
        const cards = document.querySelectorAll('.card');
        const term = searchTerm.toLowerCase();

        cards.forEach((card) => {
            const question =
                card.querySelector('.card__question .card__question-text')?.textContent.toLowerCase() || '';
            const answer = card.querySelector('.card__answer')?.textContent.toLowerCase() || '';

            if (question.includes(term) || answer.includes(term)) {
                card.classList.remove('hidden');
                card.removeAttribute('aria-hidden');
            } else {
                card.classList.add('hidden');
                card.setAttribute('aria-hidden', 'true');
            }
        });
    }
}

class RenderService {
    constructor(appState, cardService, uiService, filterService) {
        this.appState = appState;
        this.cardService = cardService;
        this.uiService = uiService;
        this.filterService = filterService;
    }

    renderCards() {
        const container = document.getElementById('cardsContainer');
        if (!container) return;

        this.uiService.showLoadingState(container);

        setTimeout(() => {
            this.uiService.clearContainer(container);
            this.appState.questionCounter = 1;

            if (
                !this.appState.questionsData ||
                Object.keys(this.appState.questionsData).length === 0
            ) {
                this.uiService.showErrorState(container);
                return;
            }

            this.renderFilteredCards(container);
            this.filterService.generateCategoryButtons((category) =>
                this.filterByCategory(category)
            );
            this.cardService.loadRevealedCards();
            this.uiService.updateStats();
        }, ANIMATION_DELAYS.LOADING);
    }

    renderFilteredCards(container) {
        Object.entries(this.appState.questionsData).forEach(([formation, categories]) => {
            if (this.shouldIncludeFormation(formation)) {
                this.renderFormationCards(container, formation, categories);
            }
        });
    }

    shouldIncludeFormation(formation) {
        return (
            this.appState.currentFormation === 'all' || this.appState.currentFormation === formation
        );
    }

    renderFormationCards(container, formation, categories) {
        Object.entries(categories).forEach(([category, questions]) => {
            if (this.shouldIncludeCategory(category)) {
                this.renderCategoryCards(container, formation, category, questions);
            }
        });
    }

    shouldIncludeCategory(category) {
        return (
            this.appState.currentCategory === 'all' || this.appState.currentCategory === category
        );
    }

    renderCategoryCards(container, formation, category, questions) {
        questions.forEach((item) => {
            const question = item.question || `Question de ${category}`;
            const answer = item.answer || 'Réponse non disponible';
            const card = this.cardService.create(question, answer, formation, category);
            container.appendChild(card);
        });
    }

    filterByCategory(category) {
        this.appState.setCategory(category);
        this.uiService.updateActiveButton('.categories__btn', `[data-category="${category}"]`);
        this.renderCards();
    }

    filterByFormation(formation) {
        this.appState.setFormation(formation);
        this.uiService.updateActiveButton('.formations__btn', `[data-formation="${formation}"]`);
        this.renderCards();
    }
}

class WildCardsApp {
    constructor() {
        this.appState = new AppState();
        this.storageService = StorageService;
        this.dataService = DataService;
        this.modalService = new ModalService();
        this.cardService = new CardService(this.appState, this.storageService);
        this.uiService = new UIService(this.appState);
        this.filterService = new FilterService(this.appState);
        this.renderService = new RenderService(
            this.appState,
            this.cardService,
            this.uiService,
            this.filterService
        );
    }

    async initialize() {
        try {
            this.appState.questionsData = await this.dataService.loadQuestionsData();
            this.renderService.renderCards();
            this.initializeEventListeners();
        } catch (error) {
            const container = document.getElementById('cardsContainer');
            this.uiService.showErrorState(container, 'Erreur lors du chargement des données');
            console.error('Erreur d\'initialisation:', error);
        }
    }

    initializeEventListeners() {
        this.initializeFormationButtons();
        this.initializeSearchBox();
        this.initializeResetButton();
        this.initializeFabButton();
        this.initializeThemeToggle();
        this.initializeCardScrolling();
    }

    initializeFormationButtons() {
        document.querySelectorAll('.formations__btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.renderService.filterByFormation(btn.dataset.formation);
            });
        });
    }

    initializeSearchBox() {
        const searchBox = document.getElementById('searchBox');
        searchBox?.addEventListener('input', (e) => {
            this.filterService.searchCards(e.target.value);
            // Announce search results to screen readers
            const visibleCards = document.querySelectorAll('.card:not(.hidden)').length;
            this.announceToScreenReader(`${visibleCards} fiches trouvées`);
        });
    }

    initializeResetButton() {
        const resetBtn = document.getElementById('resetBtn');
        resetBtn?.addEventListener('click', () => {
            this.resetRevealedCards();
        });
    }

    initializeFabButton() {
        const fab = document.getElementById('fab');
        fab?.addEventListener('click', () => {
            this.revealAllVisible();
        });
    }

    initializeThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        const loadSavedTheme = () => {
            const savedTheme = this.storageService.load(STORAGE_KEYS.THEME) || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            themeToggle?.setAttribute('aria-pressed', savedTheme === 'dark' ? 'true' : 'false');
            const themeText = themeToggle?.querySelector('.sr-only');
            if (themeText) {
                themeText.textContent = savedTheme === 'dark' ? 'Mode clair' : 'Mode sombre';
            }
        };
        
        loadSavedTheme();
        
        themeToggle?.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    initializeCardScrolling() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('card') || e.target.closest('.card')) {
                setTimeout(() => {
                    const card = e.target.closest('.card');
                    if (card?.classList.contains('card--revealed')) {
                        card.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                }, 100);
            }
        });
    }

    resetRevealedCards() {
        this.modalService.show(
            'Êtes-vous sûr de vouloir réinitialiser toutes les cartes révélées ?',
            (confirmed) => {
                if (confirmed) {
                    this.cardService.resetRevealedCards();
                    this.renderService.renderCards();
                }
            }
        );
    }

    revealAllVisible() {
        const visibleCards = document.querySelectorAll('.card:not(.hidden):not(.card--revealed)');
        if (visibleCards.length === 0) {
            this.announceToScreenReader('Aucune carte à révéler');
            return;
        }

        this.modalService.show(
            `Révéler toutes les ${visibleCards.length} cartes visibles ?`,
            (confirmed) => {
                if (confirmed) {
                    let revealedCount = 0;
                    visibleCards.forEach((card) => {
                        setTimeout(() => {
                            this.cardService.reveal(card);
                            revealedCount++;
                            if (revealedCount === visibleCards.length) {
                                this.announceToScreenReader(`${revealedCount} cartes révélées`);
                            }
                            this.uiService.updateStats();
                        }, Math.random() * 1000);
                    });
                }
            }
        );
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        this.storageService.save(STORAGE_KEYS.THEME, newTheme);
        
        const themeToggle = document.querySelector('.theme-toggle');
        themeToggle?.setAttribute('aria-pressed', newTheme === 'dark' ? 'true' : 'false');
        
        const themeText = themeToggle?.querySelector('.sr-only');
        if (themeText) {
            themeText.textContent = newTheme === 'dark' ? 'Mode clair' : 'Mode sombre';
        }

        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = new WildCardsApp();
    await app.initialize();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WildCardsApp, AppState, StorageService, DataService };
}
