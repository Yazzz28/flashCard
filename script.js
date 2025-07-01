const STORAGE_KEY = 'revealedCards';
const ANIMATION_DELAY = 500;

class AppState {
    constructor() {
        this.questionsData = {};
        this.currentFormation = 'all';
        this.currentCategory = 'all';
        this.revealedCards = new Set();
        this.questionCounter = 1;
    }

    reset() {
        this.revealedCards.clear();
        this.questionCounter = 1;
    }

    setFormation(formation) {
        this.currentFormation = formation;
        this.currentCategory = 'all';
    }

    setCategory(category) {
        this.currentCategory = category;
    }
}

class StorageService {
    static save(key, data) {
        try {
            sessionStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('Erreur lors de la sauvegarde:', error);
            return false;
        }
    }

    static load(key) {
        try {
            const data = sessionStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Erreur lors du chargement:', error);
            return null;
        }
    }

    static remove(key) {
        try {
            sessionStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Erreur lors de la suppression:', error);
            return false;
        }
    }
}

class DataService {
    static async loadQuestionsData() {
        try {
            const response = await fetch("data.json");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            return {
                CDA: {
                    frontend: [{
                        question: "Erreur de chargement",
                        answer: "Une erreur s'est produite lors du chargement des données.",
                    }]
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
        const modalOverlay = document.getElementById("modalOverlay");
        const modalMessage = document.getElementById("modalMessage");

        if (!modalOverlay || !modalMessage) {
            return;
        }

        modalMessage.textContent = message;
        modalOverlay.classList.add("show");
        this.confirmCallback = onConfirm;
    }

    close() {
        const modalOverlay = document.getElementById("modalOverlay");
        modalOverlay?.classList.remove("show");
        
        if (this.confirmCallback) {
            this.confirmCallback(false);
            this.confirmCallback = null;
        }
    }

    confirm() {
        const modalOverlay = document.getElementById("modalOverlay");
        modalOverlay?.classList.remove("show");
        
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
        const card = document.createElement("div");
        card.className = "card flashcard";
        card.dataset.formation = formation;
        card.dataset.category = category;

        card.innerHTML = `
            <div class="question">
                <div class="question-icon">Q${this.appState.questionCounter++}</div>
                <div class="question-text">${question}</div>
            </div>
            <div class="answer">${answer}</div>
            <div class="reveal-hint">
                <span class="click-icon">👆</span>
                Cliquez pour révéler la réponse
            </div>
        `;

        card.addEventListener("click", () => this.reveal(card));
        return card;
    }

    reveal(card) {
        const answerDiv = card.querySelector(".answer");
        if (!answerDiv.classList.contains("visible")) {
            answerDiv.classList.add("visible");
            card.classList.add("revealed");
            this.appState.revealedCards.add(card);
            this.saveRevealedCards();
        }
    }

    saveRevealedCards() {
        const revealedCardIds = Array.from(this.appState.revealedCards).map(card => ({
            formation: card.dataset.formation,
            category: card.dataset.category,
            questionText: card.querySelector('.question-text').textContent
        }));
        
        this.storageService.save(STORAGE_KEY, revealedCardIds);
    }

    loadRevealedCards() {
        const savedCards = this.storageService.load(STORAGE_KEY);
        if (!savedCards) return;

        savedCards.forEach(cardData => {
            const card = this.findCardByData(cardData.formation, cardData.category, cardData.questionText);
            if (card) {
                const answerDiv = card.querySelector('.answer');
                answerDiv.classList.add('visible');
                card.classList.add('revealed');
                this.appState.revealedCards.add(card);
            }
        });
    }

    findCardByData(formation, category, questionText) {
        const cards = document.querySelectorAll('.card');
        return Array.from(cards).find(card => {
            return card.dataset.formation === formation &&
                   card.dataset.category === category &&
                   card.querySelector('.question-text').textContent === questionText;
        });
    }

    resetRevealedCards() {
        this.appState.revealedCards.clear();
        this.storageService.remove(STORAGE_KEY);
    }
}

class UIService {
    constructor(appState) {
        this.appState = appState;
    }

    updateStats() {
        const totalCards = document.querySelectorAll(".card").length;
        const revealedCount = document.querySelectorAll(".card.revealed").length;
        const percentage = totalCards > 0 ? (revealedCount / totalCards) * 100 : 0;

        const totalCountEl = document.getElementById("totalCount");
        const revealedCountEl = document.getElementById("revealedCount");
        const progressFillEl = document.getElementById("progressFill");

        if (totalCountEl) totalCountEl.textContent = totalCards;
        if (revealedCountEl) revealedCountEl.textContent = revealedCount;
        if (progressFillEl) progressFillEl.style.width = `${percentage}%`;
    }

    showLoadingState(container) {
        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    }

    showErrorState(container, message = "❌ Aucune donnée disponible. Vérifiez le fichier data.json") {
        container.innerHTML = `<div class="error-message">${message}</div>`;
    }

    clearContainer(container) {
        container.innerHTML = "";
    }

    updateActiveButton(selector, activeSelector) {
        document.querySelectorAll(selector).forEach(btn => btn.classList.remove("active"));
        const activeBtn = document.querySelector(activeSelector);
        activeBtn?.classList.add("active");
    }
}

class FilterService {
    constructor(appState) {
        this.appState = appState;
        this.categoryButtons = [
            { key: "all", icon: "📚", label: "Toutes" },
            { key: "frontend", icon: "🖥️", label: "Frontend" },
            { key: "backend", icon: "⚙️", label: "Backend" },
            { key: "database", icon: "🗄️", label: "Base de données" },
            { key: "devops", icon: "🚀", label: "DevOps" },
            { key: "architecture", icon: "🏗️", label: "Architecture" },
            { key: "tests", icon: "🧪", label: "Tests" },
            { key: "security", icon: "🔒", label: "Sécurité" },
            { key: "design", icon: "🎨", label: "Conception" },
            { key: "project", icon: "📋", label: "Gestion de projet" },
            { key: "tools", icon: "🛠️", label: "Outils" },
            { key: "fullstack", icon: "🔄", label: "Fullstack" },
            { key: "modern_practices", icon: "✨", label: "Pratiques modernes" },
        ];
    }

    getAvailableCategories() {
        const availableCategories = new Set();

        if (this.appState.currentFormation === "all") {
            Object.values(this.appState.questionsData).forEach(formation => {
                Object.keys(formation).forEach(category => {
                    availableCategories.add(category);
                });
            });
        } else if (this.appState.questionsData[this.appState.currentFormation]) {
            Object.keys(this.appState.questionsData[this.appState.currentFormation]).forEach(category => {
                availableCategories.add(category);
            });
        }

        return availableCategories;
    }

    generateCategoryButtons(onCategoryClick) {
        const categoriesContainer = document.querySelector(".categories");
        if (!categoriesContainer) return;

        const availableCategories = this.getAvailableCategories();
        categoriesContainer.innerHTML = "";

        this.categoryButtons.forEach(({ key, icon, label }) => {
            if (key === "all" || availableCategories.has(key)) {
                const button = document.createElement("button");
                button.className = `category-btn ${this.appState.currentCategory === key ? "active" : ""}`;
                button.dataset.category = key;
                button.innerHTML = `<span>${icon}</span> ${label}`;
                button.addEventListener("click", () => onCategoryClick(key));
                categoriesContainer.appendChild(button);
            }
        });
    }

    searchCards(searchTerm) {
        const cards = document.querySelectorAll(".card");
        const term = searchTerm.toLowerCase();

        cards.forEach(card => {
            const question = card.querySelector(".question .question-text")?.textContent.toLowerCase() || "";
            const answer = card.querySelector(".answer")?.textContent.toLowerCase() || "";

            if (question.includes(term) || answer.includes(term)) {
                card.classList.remove("u-hidden");
            } else {
                card.classList.add("u-hidden");
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
        const container = document.getElementById("cardsContainer");
        if (!container) return;

        this.uiService.showLoadingState(container);

        setTimeout(() => {
            this.uiService.clearContainer(container);
            this.appState.questionCounter = 1;

            if (!this.appState.questionsData || Object.keys(this.appState.questionsData).length === 0) {
                this.uiService.showErrorState(container);
                return;
            }

            this.renderFilteredCards(container);
            this.filterService.generateCategoryButtons((category) => this.filterByCategory(category));
            this.cardService.loadRevealedCards();
            this.uiService.updateStats();
        }, ANIMATION_DELAY);
    }

    renderFilteredCards(container) {
        Object.entries(this.appState.questionsData).forEach(([formation, categories]) => {
            if (this.shouldIncludeFormation(formation)) {
                this.renderFormationCards(container, formation, categories);
            }
        });
    }

    shouldIncludeFormation(formation) {
        return this.appState.currentFormation === "all" || this.appState.currentFormation === formation;
    }

    renderFormationCards(container, formation, categories) {
        Object.entries(categories).forEach(([category, questions]) => {
            if (this.shouldIncludeCategory(category)) {
                this.renderCategoryCards(container, formation, category, questions);
            }
        });
    }

    shouldIncludeCategory(category) {
        return this.appState.currentCategory === "all" || this.appState.currentCategory === category;
    }

    renderCategoryCards(container, formation, category, questions) {
        questions.forEach(item => {
            const question = item.question || `Question de ${category}`;
            const answer = item.answer || "Réponse non disponible";
            const card = this.cardService.create(question, answer, formation, category);
            container.appendChild(card);
        });
    }

    filterByCategory(category) {
        this.appState.setCategory(category);
        this.uiService.updateActiveButton(".category-btn", `[data-category="${category}"]`);
        this.renderCards();
    }

    filterByFormation(formation) {
        this.appState.setFormation(formation);
        this.uiService.updateActiveButton(".formation-btn", `[data-formation="${formation}"]`);
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
        this.renderService = new RenderService(this.appState, this.cardService, this.uiService, this.filterService);
    }

    async initialize() {
        try {
            this.appState.questionsData = await this.dataService.loadQuestionsData();
            this.renderService.renderCards();
            this.initializeEventListeners();
        } catch (error) {
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
        document.querySelectorAll(".formation-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                this.renderService.filterByFormation(btn.dataset.formation);
            });
        });
    }

    initializeSearchBox() {
        const searchBox = document.getElementById("searchBox");
        searchBox?.addEventListener("input", (e) => {
            this.filterService.searchCards(e.target.value);
        });
    }

    initializeResetButton() {
        const resetBtn = document.getElementById("resetBtn");
        resetBtn?.addEventListener("click", () => {
            this.resetRevealedCards();
        });
    }

    initializeFabButton() {
        const fab = document.getElementById("fab");
        fab?.addEventListener("click", () => {
            this.revealAllVisible();
        });
    }

    initializeThemeToggle() {
        const themeToggle = document.querySelector(".theme-toggle");
        themeToggle?.addEventListener("click", () => {
            this.toggleTheme();
        });
    }

    initializeCardScrolling() {
        document.addEventListener("click", (e) => {
            if (e.target.classList.contains("card") || e.target.closest(".card")) {
                setTimeout(() => {
                    const card = e.target.closest(".card");
                    if (card?.classList.contains("revealed")) {
                        card.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                    }
                }, 100);
            }
        });
    }

    resetRevealedCards() {
        this.modalService.show(
            "Êtes-vous sûr de vouloir réinitialiser toutes les cartes révélées ?",
            (confirmed) => {
                if (confirmed) {
                    this.cardService.resetRevealedCards();
                    this.renderService.renderCards();
                }
            }
        );
    }

    revealAllVisible() {
        const visibleCards = document.querySelectorAll(".card:not(.u-hidden):not(.revealed)");
        if (visibleCards.length === 0) return;

        this.modalService.show(
            `Révéler toutes les ${visibleCards.length} cartes visibles ?`,
            (confirmed) => {
                if (confirmed) {
                    visibleCards.forEach(card => {
                        setTimeout(() => {
                            this.cardService.reveal(card);
                            this.uiService.updateStats();
                        }, Math.random() * 1000);
                    });
                }
            }
        );
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", newTheme);
        document.body.style.transition = "background-color 0.3s ease, color 0.3s ease";
        
        setTimeout(() => {
            document.body.style.transition = "";
        }, 300);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const app = new WildCardsApp();
    await app.initialize();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WildCardsApp, AppState, StorageService, DataService };
}
