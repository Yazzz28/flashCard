const STORAGE_KEY = "revealedCards";
const ANIMATION_DELAY = 500;

class AppState {
    constructor() {
        this.questionsData = {};
        this.currentFormation = "all";
        this.currentCategory = "all";
        this.revealedCards = new Set();
        this.questionCounter = 1;
    }

    reset() {
        this.revealedCards.clear();
        this.questionCounter = 1;
    }

    setFormation(formation) {
        this.currentFormation = formation;
        this.currentCategory = "all";
    }

    setCategory(category) {
        this.currentCategory = category;
    }
}

class StorageService {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn("Erreur lors de la sauvegarde:", error);
            return false;
        }
    }

    static load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn("Erreur lors du chargement:", error);
            return null;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn("Erreur lors de la suppression:", error);
            return false;
        }
    }

    static exportProgress() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) {
                alert("Aucune progression à exporter");
                return;
            }

            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `flashcards-progress-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert("Progression exportée avec succès !");
        } catch (error) {
            console.error("Erreur lors de l'export:", error);
            alert("Erreur lors de l'export de la progression");
        }
    }

    static importProgress(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
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
            console.error("Erreur lors du chargement des données:", error);
            return {
                CDA: {
                    frontend: [
                        {
                            question: "Erreur de chargement",
                            answer: "Une erreur s'est produite lors du chargement des données.",
                        },
                    ],
                },
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
        const modalTitle = document.getElementById("modalTitle");
        const modalSubtitle = document.getElementById("modalSubtitle");
        const modalActions = document.getElementById("modalActions");
        const modalIcon = document.getElementById("modalIcon");

        if (!modalOverlay || !modalMessage) {
            return;
        }

        // Réinitialiser la modal au format par défaut
        modalIcon.textContent = "❓";
        modalTitle.textContent = "Confirmation";
        modalSubtitle.textContent = "Veuillez confirmer votre action";
        modalMessage.textContent = message;
        modalActions.innerHTML = `
            <button class="modal-btn modal-btn-secondary" onclick="closeModal()">
                Annuler
            </button>
            <button class="modal-btn modal-btn-primary" onclick="confirmModal()">
                Confirmer
            </button>
        `;

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
            <button class="unreveale-card-btn" title="Masquer la réponse">
                <span class="unreveale-icon">🔒</span>
            </button>
            <div class="question">
                <div class="question-icon">Q${this.appState
                    .questionCounter++}</div>
                <div class="question-text">${question}</div>
            </div>
            <div class="answer">${answer}</div>
            <div class="reveal-hint">
                <span class="click-icon">👆</span>
                Cliquez pour révéler la réponse
            </div>
        `;

        // Gestionnaire pour révéler la carte
        card.addEventListener("click", (e) => {
            // Ne pas révéler si on clique sur le bouton de masquage
            if (!e.target.closest(".unreveale-card-btn")) {
                this.reveal(card);
            }
        });

        // Gestionnaire pour masquer à nouveau la réponse
        const unrevealeBtn = card.querySelector(".unreveale-card-btn");
        unrevealeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.unrevealeCard(card);
        });

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
        const revealedCardIds = Array.from(this.appState.revealedCards).map(
            (card) => ({
                formation: card.dataset.formation,
                category: card.dataset.category,
                questionText: card.querySelector(".question-text").textContent,
            }),
        );

        this.storageService.save(STORAGE_KEY, revealedCardIds);
    }

    loadRevealedCards() {
        const savedCards = this.storageService.load(STORAGE_KEY);
        if (!savedCards) return;

        savedCards.forEach((cardData) => {
            const card = this.findCardByData(
                cardData.formation,
                cardData.category,
                cardData.questionText,
            );
            if (card) {
                const answerDiv = card.querySelector(".answer");
                answerDiv.classList.add("visible");
                card.classList.add("revealed");
                this.appState.revealedCards.add(card);
            }
        });
    }

    findCardByData(formation, category, questionText) {
        const cards = document.querySelectorAll(".card");
        return Array.from(cards).find((card) => {
            return (
                card.dataset.formation === formation &&
                card.dataset.category === category &&
                card.querySelector(".question-text").textContent ===
                    questionText
            );
        });
    }

    resetRevealedCards() {
        this.appState.revealedCards.clear();
        this.storageService.remove(STORAGE_KEY);
    }

    unrevealeCard(card) {
        const answerDiv = card.querySelector(".answer");

        // Masquer la réponse
        answerDiv.classList.remove("visible");
        card.classList.remove("revealed");

        // Retirer de la liste des cartes révélées
        this.appState.revealedCards.delete(card);
        this.saveRevealedCards();

        // Mettre à jour les stats
        if (window.app && window.app.uiService) {
            window.app.uiService.updateStats();
        }
    }
}

class UIService {
    constructor(appState) {
        this.appState = appState;
    }

    updateStats() {
        const totalCards = document.querySelectorAll(".card").length;
        const revealedCount =
            document.querySelectorAll(".card.revealed").length;
        const percentage =
            totalCards > 0 ? (revealedCount / totalCards) * 100 : 0;

        const totalCountEl = document.getElementById("totalCount");
        const revealedCountEl = document.getElementById("revealedCount");
        const progressFillEl = document.getElementById("progressFill");

        if (totalCountEl) totalCountEl.textContent = totalCards;
        if (revealedCountEl) revealedCountEl.textContent = revealedCount;
        if (progressFillEl) progressFillEl.style.width = `${percentage}%`;
    }

    showLoadingState(container) {
        container.innerHTML =
            '<div class="loading"><div class="spinner"></div></div>';
    }

    showErrorState(
        container,
        message = "❌ Aucune donnée disponible. Vérifiez le fichier data.json",
    ) {
        container.innerHTML = `<div class="error-message">${message}</div>`;
    }

    clearContainer(container) {
        container.innerHTML = "";
    }

    updateActiveButton(selector, activeSelector) {
        document
            .querySelectorAll(selector)
            .forEach((btn) => btn.classList.remove("active"));
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
            {
                key: "modern_practices",
                icon: "✨",
                label: "Pratiques modernes",
            },
        ];
    }

    getAvailableCategories() {
        const availableCategories = new Set();

        if (this.appState.currentFormation === "all") {
            Object.values(this.appState.questionsData).forEach((formation) => {
                Object.keys(formation).forEach((category) => {
                    availableCategories.add(category);
                });
            });
        } else if (
            this.appState.questionsData[this.appState.currentFormation]
        ) {
            Object.keys(
                this.appState.questionsData[this.appState.currentFormation],
            ).forEach((category) => {
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
                button.className = `category-btn ${
                    this.appState.currentCategory === key ? "active" : ""
                }`;
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

        cards.forEach((card) => {
            const question =
                card
                    .querySelector(".question .question-text")
                    ?.textContent.toLowerCase() || "";
            const answer =
                card.querySelector(".answer")?.textContent.toLowerCase() || "";

            if (question.includes(term) || answer.includes(term)) {
                card.classList.remove("hidden");
            } else {
                card.classList.add("hidden");
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

            if (
                !this.appState.questionsData ||
                Object.keys(this.appState.questionsData).length === 0
            ) {
                this.uiService.showErrorState(container);
                return;
            }

            this.renderFilteredCards(container);
            this.filterService.generateCategoryButtons((category) =>
                this.filterByCategory(category),
            );
            this.cardService.loadRevealedCards();
            this.uiService.updateStats();
        }, ANIMATION_DELAY);
    }

    renderFilteredCards(container) {
        Object.entries(this.appState.questionsData).forEach(
            ([formation, categories]) => {
                if (this.shouldIncludeFormation(formation)) {
                    this.renderFormationCards(container, formation, categories);
                }
            },
        );
    }

    shouldIncludeFormation(formation) {
        return (
            this.appState.currentFormation === "all" ||
            this.appState.currentFormation === formation
        );
    }

    renderFormationCards(container, formation, categories) {
        Object.entries(categories).forEach(([category, questions]) => {
            if (this.shouldIncludeCategory(category)) {
                this.renderCategoryCards(
                    container,
                    formation,
                    category,
                    questions,
                );
            }
        });
    }

    shouldIncludeCategory(category) {
        return (
            this.appState.currentCategory === "all" ||
            this.appState.currentCategory === category
        );
    }

    renderCategoryCards(container, formation, category, questions) {
        questions.forEach((item) => {
            const question = item.question || `Question de ${category}`;
            const answer = item.answer || "Réponse non disponible";
            const card = this.cardService.create(
                question,
                answer,
                formation,
                category,
            );
            container.appendChild(card);
        });
    }

    filterByCategory(category) {
        this.appState.setCategory(category);
        this.uiService.updateActiveButton(
            ".category-btn",
            `[data-category="${category}"]`,
        );
        this.renderCards();
    }

    filterByFormation(formation) {
        this.appState.setFormation(formation);
        this.uiService.updateActiveButton(
            ".formation-btn",
            `[data-formation="${formation}"]`,
        );
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
            this.filterService,
        );
    }

    async initialize() {
        try {
            this.appState.questionsData =
                await this.dataService.loadQuestionsData();
            this.renderService.renderCards();
            this.initializeEventListeners();
        } catch (error) {
            this.uiService.showErrorState(
                container,
                "Erreur lors du chargement des données",
            );
            console.error("Erreur d'initialisation:", error);
        }
    }

    initializeEventListeners() {
        this.initializeFormationButtons();
        this.initializeSearchBox();
        this.initializeResetButton();
        this.initializeFabButton();
        this.initializeRandomButton();
        this.initializeExportButton();
        this.initializeImportButton();
        this.initializeThemeToggle();
        this.initializeCardScrolling();
    }

    initializeFormationButtons() {
        document.querySelectorAll(".formation-btn").forEach((btn) => {
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

    initializeRandomButton() {
        const randomBtn = document.getElementById("randomBtn");
        randomBtn?.addEventListener("click", () => {
            this.drawRandomCard();
        });
    }

    initializeExportButton() {
        const exportBtn = document.getElementById("exportBtn");
        exportBtn?.addEventListener("click", () => {
            this.storageService.exportProgress();
        });
    }

    initializeImportButton() {
        const importBtn = document.getElementById("importBtn");
        const importFile = document.getElementById("importFile");

        importBtn?.addEventListener("click", () => {
            importFile?.click();
        });

        importFile?.addEventListener("change", async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
                await this.storageService.importProgress(file);
                alert("Progression importée avec succès !");
                window.location.reload();
            } catch (error) {
                console.error("Erreur lors de l'import:", error);
                alert("Erreur : fichier JSON invalide");
            }
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
            if (
                e.target.classList.contains("card") ||
                e.target.closest(".card")
            ) {
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
            },
        );
    }

    revealAllVisible() {
        const visibleCards = document.querySelectorAll(
            ".card:not(.u-hidden):not(.revealed)",
        );
        if (visibleCards.length === 0) return;

        this.modalService.show(
            `Révéler toutes les ${visibleCards.length} cartes visibles ?`,
            (confirmed) => {
                if (confirmed) {
                    visibleCards.forEach((card) => {
                        setTimeout(() => {
                            this.cardService.reveal(card);
                            this.uiService.updateStats();
                        }, Math.random() * 1000);
                    });
                }
            },
        );
    }

    toggleTheme() {
        const currentTheme =
            document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", newTheme);
        document.body.style.transition =
            "background-color 0.3s ease, color 0.3s ease";

        setTimeout(() => {
            document.body.style.transition = "";
        }, 300);
    }

    drawRandomCard() {
        const visibleCards = document.querySelectorAll(".card:not(.hidden)");
        if (visibleCards.length === 0) {
            this.modalService.show("Aucune carte disponible pour le tirage au sort.", () => {});
            return;
        }

        const randomIndex = Math.floor(Math.random() * visibleCards.length);
        const randomCard = visibleCards[randomIndex];

        const questionText = randomCard.querySelector(".question-text").textContent;
        const answerText = randomCard.querySelector(".answer").textContent;

        this.showRandomCardModal(questionText, answerText, randomCard);
    }

    showRandomCardModal(question, answer, originalCard) {
        const modalOverlay = document.getElementById("modalOverlay");
        const modalTitle = document.getElementById("modalTitle");
        const modalSubtitle = document.getElementById("modalSubtitle");
        const modalMessage = document.getElementById("modalMessage");
        const modalActions = document.getElementById("modalActions");
        const modalIcon = document.getElementById("modalIcon");

        if (!modalOverlay) return;

        modalIcon.textContent = "🎲";
        modalTitle.textContent = "Carte tirée au sort";
        modalSubtitle.textContent = "Essayez de répondre avant de révéler la réponse";
        modalMessage.innerHTML = `<div class="random-card-question"><strong>Question :</strong><br>${question}</div>`;

        modalActions.innerHTML = `
            <button class="modal-btn modal-btn-secondary" onclick="closeModal()">
                Fermer
            </button>
            <button class="modal-btn modal-btn-primary" id="revealAnswerBtn">
                Révéler la réponse
            </button>
        `;

        modalOverlay.classList.add("show");

        const revealBtn = document.getElementById("revealAnswerBtn");
        revealBtn?.addEventListener("click", () => {
            modalMessage.innerHTML = `
                <div class="random-card-question"><strong>Question :</strong><br>${question}</div>
                <div class="random-card-answer"><strong>Réponse :</strong><br>${answer}</div>
            `;
            revealBtn.textContent = "Marquer comme révélée";
            revealBtn.onclick = () => {
                this.cardService.reveal(originalCard);
                this.uiService.updateStats();
                originalCard.scrollIntoView({ behavior: "smooth", block: "center" });
                this.modalService.close();
            };
        });
    }

}

document.addEventListener("DOMContentLoaded", async () => {
    const app = new WildCardsApp();
    window.app = app;
    await app.initialize();
});

if (typeof module !== "undefined" && module.exports) {
    module.exports = { WildCardsApp, AppState, StorageService, DataService };
}
