import { AppState } from "./core/AppState.js";
import { StorageService } from "./services/StorageService.js";
import { DataService } from "./services/DataService.js";
import { ModalService } from "./services/ModalService.js";
import { CardService } from "./components/cards/CardService.js";
import { UIService } from "./components/ui/UIService.js";
import { FilterService } from "./components/filters/FilterService.js";
import { RenderService } from "./components/render/RenderService.js";
import { QCMService } from "./components/qcm/QCMService.js";

export class WildCardsApp {
    constructor() {
        this.appState = new AppState();
        this.appState.currentMode = 'flashcards'; // 'flashcards' or 'qcm'
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
        this.qcmService = new QCMService(this.appState, this.storageService);
    }

    async initialize() {
        try {
            this.appState.questionsData =
                await this.dataService.loadQuestionsData();
            this.renderService.renderCards();
            this.initializeEventListeners();
            this.initializeQCMEventListeners();
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

    // ========== QCM Mode Methods ==========

    initializeQCMEventListeners() {
        const qcmModeBtn = document.getElementById("qcmModeBtn");
        qcmModeBtn?.addEventListener("click", () => {
            this.switchToQCMMode();
        });

        const flashcardModeBtn = document.getElementById("flashcardModeBtn");
        flashcardModeBtn?.addEventListener("click", () => {
            this.switchToFlashcardMode();
        });
    }

    switchToQCMMode() {
        this.appState.currentMode = 'qcm';
        this.updateModeUI();
        this.showQCMSetup();
    }

    switchToFlashcardMode() {
        this.appState.currentMode = 'flashcards';
        this.updateModeUI();
        this.renderService.renderCards();
    }

    updateModeUI() {
        const flashcardContainer = document.getElementById("flashcardContainer");
        const qcmContainer = document.getElementById("qcmContainer");
        const qcmModeBtn = document.getElementById("qcmModeBtn");
        const flashcardModeBtn = document.getElementById("flashcardModeBtn");

        if (this.appState.currentMode === 'qcm') {
            flashcardContainer?.classList.add('u-hidden');
            qcmContainer?.classList.remove('u-hidden');
            qcmModeBtn?.classList.add('active');
            flashcardModeBtn?.classList.remove('active');
        } else {
            flashcardContainer?.classList.remove('u-hidden');
            qcmContainer?.classList.add('u-hidden');
            qcmModeBtn?.classList.remove('active');
            flashcardModeBtn?.classList.add('active');
        }
    }

    async showQCMSetup() {
        const qcmContainer = document.getElementById("qcmContainer");
        if (!qcmContainer) return;

        // Charger les données QCM d'abord
        await this.qcmService.loadQCMData();

        this.renderQCMSetup();
    }

    renderQCMSetup() {
        const qcmContainer = document.getElementById("qcmContainer");
        if (!qcmContainer) return;

        const availableQuestions = this.qcmService.getAllFilteredQCMQuestions();
        const maxQuestions = Math.min(availableQuestions.length, 50);
        const availableCategories = this.getAvailableCategoriesForQCM();

        qcmContainer.innerHTML = `
            <div class="qcm-setup">
                <div class="qcm-setup-card">
                    <h2>🎯 Mode QCM</h2>
                    <p>Testez vos connaissances avec un quiz !</p>

                    <!-- Sélecteur de formation -->
                    <div class="qcm-filter-section">
                        <h3 style="color: var(--text-primary); margin-bottom: 1rem; font-size: 1rem;">
                            🎓 Formation
                        </h3>
                        <div class="qcm-formations-buttons">
                            <button class="qcm-formation-btn ${this.appState.currentFormation === 'all' ? 'active' : ''}" data-formation="all">
                                <span>📚</span> Toutes
                            </button>
                            <button class="qcm-formation-btn ${this.appState.currentFormation === 'CDA' ? 'active' : ''}" data-formation="CDA">
                                <span>💻</span> CDA
                            </button>
                            <button class="qcm-formation-btn ${this.appState.currentFormation === 'DWWM' ? 'active' : ''}" data-formation="DWWM">
                                <span>🌐</span> DWWM
                            </button>
                        </div>
                    </div>

                    <!-- Sélecteur de catégorie -->
                    <div class="qcm-filter-section">
                        <h3 style="color: var(--text-primary); margin-bottom: 1rem; font-size: 1rem;">
                            📂 Catégorie
                        </h3>
                        <div class="qcm-categories-buttons">
                            ${this.generateQCMCategoryButtons(availableCategories)}
                        </div>
                    </div>

                    <!-- Nombre de questions -->
                    <div class="qcm-setup-options">
                        <div class="qcm-setup-option">
                            <label for="qcm-num-questions">Nombre de questions :</label>
                            <select id="qcm-num-questions">
                                <option value="5">5 questions</option>
                                <option value="10" selected>10 questions</option>
                                <option value="15">15 questions</option>
                                <option value="20">20 questions</option>
                                ${maxQuestions > 20 ? `<option value="${maxQuestions}">${maxQuestions} questions (max)</option>` : ''}
                            </select>
                        </div>
                    </div>

                    <p id="qcm-available-count" style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 1rem;">
                        <strong style="color: var(--primary);">${availableQuestions.length}</strong> questions disponibles
                    </p>

                    <button class="btn-primary" id="start-qcm-btn" style="width: 100%; padding: 1rem; margin-top: 1rem;" ${availableQuestions.length === 0 ? 'disabled' : ''}>
                        🚀 Démarrer le QCM
                    </button>
                </div>
            </div>
        `;

        // Ajouter les écouteurs d'événements pour les filtres
        this.initializeQCMFilters();

        const startBtn = document.getElementById("start-qcm-btn");
        startBtn?.addEventListener("click", () => {
            const numQuestions = parseInt(document.getElementById("qcm-num-questions").value);
            this.startQCM(numQuestions);
        });
    }

    getAvailableCategoriesForQCM() {
        const categories = new Set();
        const { currentFormation } = this.appState;
        const qcmData = this.qcmService.qcmData;

        if (!qcmData) return [];

        for (const [formation, formationCategories] of Object.entries(qcmData)) {
            if (currentFormation !== 'all' && formation !== currentFormation) {
                continue;
            }

            for (const category of Object.keys(formationCategories)) {
                categories.add(category);
            }
        }

        return Array.from(categories);
    }

    generateQCMCategoryButtons(availableCategories) {
        const categoryIcons = {
            all: '📚',
            frontend: '🖥️',
            backend: '⚙️',
            database: '🗄️',
            devops: '🚀',
            architecture: '🏗️',
            tests: '🧪',
            security: '🔒',
            design: '🎨',
            project: '📋',
            tools: '🛠️',
            fullstack: '🌟',
            modern_practices: '✨'
        };

        const categoryLabels = {
            all: 'Toutes',
            frontend: 'Frontend',
            backend: 'Backend',
            database: 'Base de données',
            devops: 'DevOps',
            architecture: 'Architecture',
            tests: 'Tests',
            security: 'Sécurité',
            design: 'Conception',
            project: 'Gestion de projet',
            tools: 'Outils',
            fullstack: 'Fullstack',
            modern_practices: 'Pratiques modernes'
        };

        let buttons = `
            <button class="qcm-category-btn ${this.appState.currentCategory === 'all' ? 'active' : ''}" data-category="all">
                <span>${categoryIcons.all}</span> ${categoryLabels.all}
            </button>
        `;

        availableCategories.forEach(category => {
            if (category !== 'all') {
                buttons += `
                    <button class="qcm-category-btn ${this.appState.currentCategory === category ? 'active' : ''}" data-category="${category}">
                        <span>${categoryIcons[category] || '📁'}</span> ${categoryLabels[category] || category}
                    </button>
                `;
            }
        });

        return buttons;
    }

    initializeQCMFilters() {
        // Formation buttons
        document.querySelectorAll('.qcm-formation-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const formation = btn.dataset.formation;
                this.appState.currentFormation = formation;
                this.appState.currentCategory = 'all'; // Reset catégorie
                this.renderQCMSetup(); // Re-render pour mettre à jour
            });
        });

        // Category buttons
        document.querySelectorAll('.qcm-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                this.appState.currentCategory = category;
                this.renderQCMSetup(); // Re-render pour mettre à jour
            });
        });
    }

    async startQCM(numberOfQuestions) {
        try {
            await this.qcmService.generateQuiz(numberOfQuestions);
            this.renderCurrentQuestion();
        } catch (error) {
            alert(error.message);
        }
    }

    renderCurrentQuestion() {
        const qcmContainer = document.getElementById("qcmContainer");
        if (!qcmContainer) return;

        const question = this.qcmService.getCurrentQuestion();
        if (!question) return;

        const questionElement = this.qcmService.createQuestionElement(
            question,
            (questionId, selectedIndex) => this.handleAnswer(questionId, selectedIndex)
        );

        qcmContainer.innerHTML = '';
        qcmContainer.appendChild(questionElement);

        // Ajouter les écouteurs pour la navigation
        const prevBtn = document.getElementById("qcm-prev");
        const nextBtn = document.getElementById("qcm-next");

        prevBtn?.addEventListener("click", () => {
            this.qcmService.previousQuestion();
            this.renderCurrentQuestion();
        });

        nextBtn?.addEventListener("click", () => {
            if (this.qcmService.isQuizComplete() && this.qcmService.currentQuestionIndex === this.qcmService.currentQuiz.length - 1) {
                this.showQCMResults();
            } else {
                this.qcmService.nextQuestion();
                this.renderCurrentQuestion();
            }
        });
    }

    handleAnswer(questionId, selectedIndex) {
        const result = this.qcmService.answerQuestion(questionId, selectedIndex);
        if (result) {
            // Ré-afficher la question pour montrer le feedback
            this.renderCurrentQuestion();
        }
    }

    showQCMResults() {
        const qcmContainer = document.getElementById("qcmContainer");
        if (!qcmContainer) return;

        const resultsElement = this.qcmService.createResultsElement(
            () => this.showQCMSetup(),
            () => this.switchToFlashcardMode()
        );

        qcmContainer.innerHTML = '';
        qcmContainer.appendChild(resultsElement);
    }
}
